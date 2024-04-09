// Import module for bill controller
const Bill = require('../models/Bill')
const Event = require('../models/Event')
const dayjs = require('dayjs')

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
  return bills
}

// Controller for bill
const createBill = async (req, res, next) => {
  const newBill = new Bill(req.body)

  await newBill.save()

  return sendRespone(res, { data: newBill }, "Tạo hóa đơn mới thành công!")
}

const getBills = async (req, res, next) => {
  let { page, limit, status, eventId, userId, 
    ticketId, startDate, endDate} = req.query

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit

  try {
    let billQuery = {}

    if (status) billQuery.status = status
    if (eventId) billQuery.eventId = eventId
    if (userId) billQuery.userId = userId
    if (ticketId) billQuery.ticketsId = { $in: ticketId }
    if (startDate && endDate) {
      startDate = dayjs(startDate).startOf('day').toDate()
      endDate = dayjs(endDate).endOf('day').toDate()

      billQuery.date = { $gte: startDate, $lte: endDate }
    }

    let bills = await Bill.find(billQuery).skip(skip).limit(limit)

    if (bills.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn!")

    bills = sortBillsByDateTime(bills)

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
  let { billId } = req.query

  try {
    let query = {}

    if (billId) query._id = billId

    const foundBill = await Bill.findOne(query)

    if (!foundBill) return sendRespone(res, { data: [] }, "Không thể tìm hóa đơn!")

    const foundEvent = await Event.findOne({ _id: foundBill.eventId })

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    const test = foundBill.totalPrice * (foundBill.discount / 100)
    console.log(test);
    // foundEvent.profit += (foundBill.totalPrice * (foundBill.discount / 100))
    // await foundEvent.save()
    foundBill.status = 1
    await foundBill.save()

    return sendRespone(res, { data: foundBill }, "Thanh toán thành công!")
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

module.exports = {
  getBills,
  createBill,
  paid,
  checkin
}