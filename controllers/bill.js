// Import module for bill controller
const Bill = require('../models/Bill')
const Event = require('../models/Event')
const Ticket = require('../models/Ticket')
const User = require('../models/User')
const dayjs = require('dayjs')
const { CLIENT_ENDPOINT } = require('../configs')

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

// Sort bills by date time
const sortBillsByDateTime = (bills) => {
  bills.sort((a, b) => {
    const timeA = a.time ? a.time.split(':') : ['00', '00']
    const timeB = b.time ? b.time.split(':') : ['00', '00']

    const dateA = dayjs(a.date).startOf('day').add(parseInt(timeA[0]), 'hour').add(parseInt(timeA[1]), 'minute')
    const dateB = dayjs(b.date).startOf('day').add(parseInt(timeB[0]), 'hour').add(parseInt(timeB[1]), 'minute') 
    
    return dateA - dateB
  })
  return bills.reverse()
}

// Controller for bill
const createBill = async (req, res, next) => {
  const newBill = new Bill(req.body)
  const tickets = req.body.tickets

  try {
    for (const ticket of tickets) {
      const { ticketId, amount } = ticket

      const foundTicket = await Ticket.findById(ticketId)
      
      if (foundTicket.totalAmount >= amount && foundTicket.totalAmount !== 0) {
        
        foundTicket.totalAmount -= amount
        await foundTicket.save()
      } else {
        return sendRespone(res, { data: []}, "Số lượng vượt quá số vé trong kho!")
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
    ticketId, startDate, billId, endDate} = req.query

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
 
    bills = sortBillsByDateTime(bills)

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

    return sendRespone(res, { data: bills }, `${totalBills} hoá đơn đã được tìm thấy!`,
    201, pagination)
  } catch (error) {
    next(error)
  }
}

const paid = async (req, res, next) => {
  let { orderId, message, orderInfo } = req.query

  try {
    const splitOrderId = orderId.split(".")
    const billId = splitOrderId[1]

    let query = {}

    if (billId) query._id = billId

    const foundBill = await Bill.findOne(query)

    if (!foundBill) return sendRespone(res, { data: [] }, "Không thể tìm hóa đơn!")

    let ticketList = []

    let data = {
      data: [{
        data: []
      }],
      pagination: {},
      message: ""
    }

    for (const ticketBill of foundBill.tickets) {
      const ticket = await Ticket.findById(ticketBill.ticketId)
      if (ticket) {
        ticketList.push(ticket)
      }
    }

    if (message === 'Successful.') {
      if (foundBill.status === 0) {
        foundBill.status = 1
        foundBill.checkoutMethod = orderInfo
        await foundBill.save()
      } else {
        data = {
          data: [{
            data: []
          }],
          pagination: {},
          message: "Hóa đơn đã được thanh toán!"
        }

        res.redirect(`${CLIENT_ENDPOINT}?data=${encodeURIComponent(JSON.stringify(data))}`);
      }
    } else {
      for (const ticketToUpdate of ticketList) {
        for (const ticketBill of foundBill.tickets) {
          if (ticketToUpdate._id.equals(ticketBill.ticketId)) {
            await ticketToUpdate.save()
            break
          }
        }
      }
      await foundBill.deleteOne()

      data = {
        data: [{
          data: []
        }],
        pagination: {},
        message: "Thanh toán thất bại! Đơn thanh toán của bạn đã bị hủy!"
      }

      res.redirect(`${CLIENT_ENDPOINT}?data=${encodeURIComponent(JSON.stringify(data))}`);
    }

    data = {
      data: [{
        data: []
      }],
      pagination: {},
      message: "Thanh toán thành công!"
    }

    res.redirect(`${CLIENT_ENDPOINT}?data=${encodeURIComponent(JSON.stringify(data))}`);
  } catch (error) {
    next(error)
  }
}

const checkin = async (req, res, next) => {
  let { billId } = req.query 

  try {
    let query = {}

    if (billId) query._id = billId

    const foundBill = await Bill.findOne(query)

    if (!foundBill) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn!")

    if (foundBill.status === 0) {
      return sendRespone(res, { data: [] }, "Hóa đơn chưa được thanh toán!")
    } else { 
      foundBill.status = 2
      await foundBill.save()
    }

    return sendRespone(res, { data: foundBill }, "Checkin thành công!")
  } catch (error) {
    next(error)
  }
}

const getRevenueList = async (req, res, next) => {
  let { userId, status, startDate, endDate } = req.query 

  try {
    let billQuery = {}
    if (startDate && endDate) {
      startDate = dayjs(startDate).startOf('day').toDate()
      endDate = dayjs(endDate).endOf('day').toDate()

      billQuery.date = { $gte: startDate, $lte: endDate } 
    }

    const billList = await Bill.find(billQuery).select('_id eventId totalPrice discount')
    
    const eventQuery = {}
    if (status) eventQuery.status = status 
    if (userId) eventQuery.host = userId
    
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
  let { userId, status, startDate, endDate } = req.query 

  try {
    let billQuery = {}
    if (startDate && endDate) {
      startDate = dayjs(startDate).startOf('day').toDate()
      endDate = dayjs(endDate).endOf('day').toDate()

      billQuery.date = { $gte: startDate, $lte: endDate } 
    }

    const billList = await Bill.find(billQuery).select('_id eventId tickets totalPrice discount')

    const eventQuery = {}
    if (status) eventQuery.status = status 
    if (userId) eventQuery.host = userId 

    const eventList = await Event.find(eventQuery).select('_id name host type status views')
    
    let eventNameList = []
    let amountOfTicketList = []
  
    for (const event of eventList) {
      const totalAmount = 0
      const ticketList = await Ticket.find({ eventId: event._id })
      for (const ticket of ticketList) {
        const amountOfTicket = 0
        for (const bill of billList) {
          console.log(bill);
          for (const ticketInBill of bill.tickets)
            if (ticketInBill.ticketId.toString() === ticket._id.toString()) {
              amountOfTicket += ticketInBill.amount
              totalAmount += amountOfTicket
            }
          }
        }
      eventNameList.push(event.name)
      amountOfTicketList.push(totalAmount)
    }

    sendRespone(res, { eventNameList, amountOfTicketList }, "Tìm tên và số lượng vé tương ứng của sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getBills,
  getRevenueList,
  getTotalAmountTicketOfEventList,
  createBill,
  paid,
  checkin
}