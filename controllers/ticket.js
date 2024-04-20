// Import module for event controller
const dayjs = require('dayjs')
const Ticket = require('../models/Ticket')
const Event = require('../models/Event')

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

// Sort events by date time
const sortTicketsByDateTime = (events) => {
  events.sort((a, b) => {
    const timeA = a.time ? a.time.split(':') : ['00', '00']
    const timeB = b.time ? b.time.split(':') : ['00', '00']

    const dateA = dayjs(a.releaseDate).startOf('day').add(parseInt(timeA[0]), 'hour').add(parseInt(timeA[1]), 'minute')
    const dateB = dayjs(b.releaseDate).startOf('day').add(parseInt(timeB[0]), 'hour').add(parseInt(timeB[1]), 'minute') 
    
    return dateA - dateB
  })
  events.reverse()

  return events
}

// Controller for ticket
const createTicket = async (req, res, next) => {      // Create new ticket
  const newTicket = new Ticket(req.body)

  await newTicket.save()

  return sendRespone(res, { data: newTicket }, "Tạo vé mới thành công!")
}

const getTickets = async (req, res, next) => {        // Get list ticket
  let { page, limit, status, eventId, 
    ticketId, name } = req.query

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit

  try {
    let ticketQuery = {}

    if (eventId) ticketQuery.eventId = eventId
    if (ticketId) ticketQuery._id = ticketId 
    if (name) ticketQuery.name = { $regex: new RegExp(name, 'i') }
    if (status) ticketQuery.status = status
    
    let tickets = await Ticket.find(ticketQuery).skip(skip).limit(limit)

    if (tickets.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")

    const totalTickets = await Ticket.countDocuments(ticketQuery)
    const totalPages = Math.ceil(totalTickets / limit)

    const pagination = {
      totalItems: totalTickets,
      currentPage: page,
      total: totalPages
    }

    tickets = sortTicketsByDateTime(tickets)

    return sendRespone(res, { data: tickets }, `${totalTickets} vé đã được tìm thấy`,
    201, pagination)

  } catch (error) {
    next(error)
  }
}

const updateTicket = async (req, res, next) => {
  const { ticketId } = req.query 

  try {
    const newTicket = req.value.body 
    
    const updateTicket = await Ticket.findByIdAndUpdate(ticketId, newTicket)

    if (!updateTicket) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")

    return sendRespone(res, { data: newTicket }, "Cập nhật thông tin vé thành công!")
  } catch (error) {
    next(error)
  }
}

const updateTicketTotalAmount = async (req, res, next) => {
  let { ticketId, amountToMinus } = req.query 

  try {
    let query = {}

    if (ticketId) query._id = ticketId

    const foundTicket = await Ticket.findOne(query)

    if (!foundTicket) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")
  
    const foundEvent = await Event.findOne(foundTicket.eventId)

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện chứa vé!")

    if (foundEvent.maxTicketPerBill > amountToMinus) {
      foundTicket.totalAmount -= amountToMinus
      await foundTicket.save()
    } else {
      return sendRespone(res, { data: [] }, "Số vé vượt mức quy định!")
    }

    return sendRespone(res, { data: foundTicket }, "Cập nhật số lượng vé thành công!")
  } catch (error) {
    next(error)
  }
}

const activateTicket = async (req, res, next) => {
  let { ticketId } = req.query

  try {
    let query = {}

    if (ticketId) query._id = ticketId

    const foundTicket = await Ticket.findOne(query)

    if (!foundTicket) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")

    foundTicket.status = 0
    await foundTicket.save()

    return sendRespone(res, { data: foundTicket }, "Mở khóa vé thành công!")
  } catch (error) {
    next(error)
  }
}

const deactivateTicket = async (req, res, next) => {
  let { ticketId } = req.query

  try {
    let query = {}

    if (ticketId) query._id = ticketId

    const foundTicket = await Ticket.findOne(query)

    if (!foundTicket) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")

    foundTicket.status = 1
    await foundTicket.save()

    return sendRespone(res, { data: foundTicket }, "Khóa vé thành công!")
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  updateTicketTotalAmount,
  activateTicket,
  deactivateTicket
}