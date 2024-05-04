// Import module for bill controller
const Bill = require('../models/Bill')
const Event = require('../models/Event')
const Ticket = require('../models/Ticket')
const User = require('../models/User')
const dayjs = require('dayjs')
const { CLIENT_ENDPOINT } = require('../configs')
const { sendRespone } = require('../utils/clientRespone')
const { sortBillsByDateTime } = require('../utils/sortList')
const { sendBill } = require('../utils/userRespone')
const { calculateTotalAmountForEvent, calculateTotalMoney, calculateMoneyToPaid } = require('../utils/calculate')

// Controller for bill
const createBill = async (req, res, next) => {
  const newBill = new Bill(req.body)
  const tickets = newBill.tickets

  try {
    for (const ticket of tickets) {
      const { ticketId, amount } = ticket

      const foundTicket = await Ticket.findById(ticketId)

      if (foundTicket.totalAmount >= amount && foundTicket.totalAmount !== 0) {

        foundTicket.totalAmount -= amount
        await foundTicket.save()
      } else {
        return sendRespone(res, { data: [] }, "Số lượng vượt quá số vé trong kho!")
      }
    }
    var theAmountPaid = (newBill.totalPrice - (newBill.totalPrice * (newBill.discount / 100)))
    await newBill.save()

    return sendRespone(res, { data: newBill, theAmountPaid: theAmountPaid }, "Tạo hóa đơn mới thành công!")
  } catch (error) {
    next(error)
  }
}

const getBills = async (req, res, next) => {
  let { page, limit, status, eventId, email,
    ticketId, startDate, billId, endDate } = req.query

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit

  try {
    let userQuery = {}
    if (email) userQuery.email = email

    const users = await User.findOne(userQuery).select('_id fullName email phone')

    let billQuery = {}

    if (email) billQuery.userId = users._id
    if (status) billQuery.status = status
    if (eventId) billQuery.eventId = eventId
    if (billId) billQuery._id = billId
    if (ticketId) billQuery.tickets = { $elemMatch: { ticketId: ticketId } }
    if (startDate && endDate) {
      startDate = dayjs(startDate).startOf('day').toDate()
      endDate = dayjs(endDate).endOf('day').toDate()

      billQuery.date = { $gte: startDate, $lte: endDate }
    }

    let bills = await Bill.find(billQuery).skip(skip).limit(limit).select('-tickets').populate({
      path: 'userId',
      select: '_id email'
    })

    if (bills.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn!")

    for (let i = 0; i < bills.length; i++) {
      const event = await Event.findById(bills[i].eventId).select('name')
      if (!event) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")
      bills[i] = {
        ...bills[i].toObject(),
        eventName: event.name,
        user: bills[i].userId
      }
      delete bills[i].eventId
      delete bills[i].userId
    }

    const totalBills = await Bill.countDocuments(billQuery)

    const totalPages = Math.ceil(totalBills / limit)

    const pagination = {
      totalItems: totalBills,
      currentPage: page,
      totalPages: totalPages
    }

    bills = sortBillsByDateTime(bills)
    
    return sendRespone(res, { data: bills }, `${totalBills} hoá đơn đã được tìm thấy!`,
      201, pagination)
  } catch (error) {
    next(error)
  }
}

const getBillDetail = async (req, res, next) => {
  let { billId } = req.query

  try {
    let bill = await Bill.findById(billId).populate({
      path: 'userId',
      select: '_id fullName email phone'
    })

    if (!bill) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn!")

    const event = await Event.findById(bill.eventId).select('name')
    if (!event) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện trong hóa đơn!")

    let tickets = [];
    for (const ticket of bill.tickets) {
      const ticketDetail = await Ticket.findById(ticket.ticketId);
      tickets.push({
        name: ticketDetail.name,
        amount: ticket.amount,
        price: ticket.price,
        totalMoneyOfTicket: ticket.amount * ticket.price,
        _id: ticket._id
      })
    }

    const totalMoney = calculateTotalMoney(tickets)
    const theMoneyHasToPaid = calculateMoneyToPaid(totalMoney, bill.discount)

    const billDetail = {
      _id: bill._id,
      date: bill.date,
      user: bill.userId,
      event: event.name,
      tickets: tickets,
      totalMoney: totalMoney,
      discount: bill.discount,
      theMoneyHasToPaid: theMoneyHasToPaid,
      checkoutMethod: bill.checkoutMethod,
      status: bill.status,
      __v: bill.__v
    }

    return sendRespone(res, { data: billDetail }, `Hoá đơn đã được tìm thấy!`)
  } catch (error) {
    next(error)
  }
}

const paid = async (req, res, next) => {
  let { orderId, message, orderInfo, extraData } = req.query;
  try {
    const splitOrderId = orderId.split(".");
    const billId = splitOrderId[1];

    const splitExtraDate = extraData.split("<splitText>");
    const subject = splitExtraDate[0];
    const text = splitExtraDate[1];

    const foundBill = await Bill.findById(billId).populate({ path: 'userId', select: '_id email' });

    if (!foundBill) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn!");

    let data = {
      data: [{
        data: []
      }],
      pagination: {},
      message: "Thanh toán thành công, hóa đơn kèm mã QR checkin sẽ được gửi tới email của bạn!"
    };

    if (message === 'Successful.') {
      if (foundBill.status === 0) {
        foundBill.status = 1;
        foundBill.checkoutMethod = orderInfo;
        await foundBill.save();
      } else {
        data = {
          data: [{
            data: []
          }],
          pagination: {},
          message: "Hóa đơn đã được thanh toán!"
        };
      }
    } else {
      for (const ticketBill of foundBill.tickets) {
        const ticket = await Ticket.findById(ticketBill.ticketId);
        if (ticket) {
          ticket.totalAmount += parseInt(ticketBill.amount)
          await ticket.save()
        }
      }

      await foundBill.deleteOne();

      data = {
        data: [{
          data: []
        }],
        pagination: {},
        message: "Thanh toán thất bại! Đơn thanh toán của bạn đã bị hủy!"
      };
    }

    res.redirect(`${CLIENT_ENDPOINT}/events?paymentMessage=${encodeURIComponent(JSON.stringify(data?.message))}`);

    if (message === 'Successful.') {
      let bill = await Bill.findById(billId).populate({
        path: 'userId',
        select: '_id fullName email phone'
      })

      if (!bill) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn!")

      const event = await Event.findById(bill.eventId).select('name date')
      if (!event) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện trong hóa đơn!")
      let tickets = [];
      for (const ticket of bill.tickets) {
        const ticketDetail = await Ticket.findById(ticket.ticketId);
        tickets.push({
          name: ticketDetail.name,
          amount: ticket.amount,
          price: ticket.price,
          totalMoneyOfTicket: ticket.amount * ticket.price,
          _id: ticket._id
        })
      }
      const totalMoney = calculateTotalMoney(tickets)
      const theMoneyHasToPaid = calculateMoneyToPaid(totalMoney, bill.discount)
      const billDetail = {
        _id: bill._id,
        date: bill.date,
        user: bill.userId,
        eventName: event.name,
        eventDate: event.date,
        tickets: tickets,
        totalMoney: totalMoney,
        discount: bill.discount,
        theMoneyHasToPaid: theMoneyHasToPaid,
        checkoutMethod: bill.checkoutMethod,
        status: bill.status,
        __v: bill.__v
      }
      sendBill(subject, text, billDetail);
    }
  } catch (error) {
    next(error);
  }
}

const checkin = async (req, res, next) => {
  let { billId } = req.query
  console.log(billId);
  try {
    let query = {}

    if (billId) query._id = billId

    const foundBill = await Bill.findOne(query)

    if (!foundBill) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn!")

    if (foundBill.status === 0) {
      return sendRespone(res, { data: [] }, "Hóa đơn chưa được thanh toán! Vui lòng thanh toán trước!")
    } else if (foundBill.status === 1) {
      foundBill.status = 2
      await foundBill.save()
    } else if (foundBill.status === 2) {
      return sendRespone(res, { data: [] }, "Hóa đơn đã được checkin! Bạn có thể tham gia sự kiện rồi!")
    }

    return sendRespone(res, { data: foundBill }, "Checkin thành công! Chúc bạn tham gia sự kiện vui vẻ!")
  } catch (error) {
    next(error)
  }
}

const getRevenueList = async (req, res, next) => {
  let { host, member, status, startDate, endDate } = req.query

  try {
    let billQuery = {}
    if (startDate && endDate) {
      startDate = dayjs(startDate).startOf('day').toDate()
      endDate = dayjs(endDate).endOf('day').toDate()

      billQuery.date = { $gte: startDate, $lte: endDate }
    }

    const billList = await Bill.find(billQuery).select('_id eventId totalPrice discount')

    const eventQuery = {}
    if (host || member) {
      eventQuery.$or = [
        { host },
        { members: { $in: [member] } }
      ]
    }
    if (status) eventQuery.status = status

    const eventList = await Event.find(eventQuery).select('_id name host type status views')

    let eventNameList = []
    let revenueList = []

    for (const event of eventList) {
      let totalRevenue = 0
      for (const bill of billList) {
        if (bill.eventId.toString() === event._id.toString()) {
          const netPrice = bill.totalPrice - (bill.totalPrice * (bill.discount / 100))
          totalRevenue += netPrice
        }
      }

      eventNameList.push(event.name)
      revenueList.push(totalRevenue)
    }

    sendRespone(res, { eventNameList, revenueList }, "Tìm tên và doanh thu sự kiện tương ứng thành công!")
  } catch (error) {
    next(error)
  }
}

const getTotalAmountTicketOfEventList = async (req, res, next) => {
  let { host, member, status, startDate, endDate } = req.query

  try {
    let billQuery = {}

    if (startDate && endDate) {
      startDate = dayjs(startDate).startOf('day').toDate()
      endDate = dayjs(endDate).endOf('day').toDate()

      billQuery.date = { $gte: startDate, $lte: endDate }
    }

    const billList = await Bill.find(billQuery).select('_id eventId tickets')

    const eventQuery = {}
    if (host || member) {
      eventQuery.$or = [
        { host },
        { members: { $in: [member] } }
      ]
    }
    if (status) eventQuery.status = status

    const eventList = await Event.find(eventQuery).select(
      '_id name host type status views'
    )

    let eventNameList = []
    let amountOfTicketList = []

    for (const event of eventList) {
      let totalAmountOfEvent = 0
      for (const bill of billList) {
        if (bill.eventId.toString() === event._id.toString()) {
          for (const ticket of bill.tickets) {
            totalAmountOfEvent += ticket.amount
          }
        }
      }
      eventNameList.push(event.name)
      amountOfTicketList.push(totalAmountOfEvent)
    }

    sendRespone(res, { eventNameList, amountOfTicketList }, "Tìm tên và số lượng vé tương ứng của sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const deleteBill = async (req, res, next) => {
  const { billId } = req.query

  try {
    const foundBill = await Bill.findById(billId)

    if (!foundBill) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn")

    if (foundBill.status === 0) {
      for (const ticketBill of foundBill.tickets) {
        const ticket = await Ticket.findById(ticketBill.ticketId)
        if (ticket) {
          ticket.totalAmount += parseInt(ticketBill.amount)
          await ticket.save()
        }
      }

      await foundBill.deleteOne()
    } else {
      return sendRespone(res, { data: [] }, "Không thể xóa hóa đơn đã thanh toán!")
    }

    sendRespone(res, { data: [] }, "Xóa hóa đơn thành công!")
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getBills,
  getRevenueList,
  getTotalAmountTicketOfEventList,
  getBillDetail,
  createBill,
  paid,
  checkin,
  deleteBill
}