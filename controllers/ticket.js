// Import module for event controller
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
const sortTicketsByDateTime = (tickets) => {
  tickets.sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    return dateA - dateB
  })
  tickets.reverse();
  return tickets
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

    ticket = sortTicketsByDateTime(tickets)

    return sendRespone(res, { data: tickets }, `${totalTickets} vé đã được tìm thấy`,
    201, pagination)

  } catch (error) {
    next(error)
  }
}

const updateTicket = async (req, res, next) => {
  const { ticketId } = req.query 

  try {
    const foundTicket = await Ticket.findById(ticketId)

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")

    const newTicket = req.value.body 
    
    const updateTicket = await Event.findByIdAndUpdate(ticketId, newTicket)

    return sendRespone(res, { data: newTicket }, "Cập nhật thông tin vé thành công!")
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getTickets,
  createTicket,
  updateTicket
}