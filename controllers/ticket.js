// Import module for event controller
const Ticket = require('../models/Ticket')

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}


// Controller for ticket
const createTicket = async (req, res, next) => {      // Create new ticket
  const newTicket = new Ticket(req.body)

  await newTicket.save()

  return sendRespone(res, { data: newTicket }, "Tạo vé mới thành công!")
}

const getTickets = async (req, res, next) => {        // Get list ticket
  let { page, limit, status, eventId, ticketId, name, event } = req.query

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit

  try {
    let ticketQuery = {}

    if (eventId) ticketQuery.eventId = eventId
    if (ticketId) ticketQuery._id = ticketId 
    if (name) ticketQuery.name = { $regex: new RegExp(name, 'i') }
    if (status) ticketQuery.status = status
    
    let tickets = []
    if (event) {
      tickets = Ticket.find() 
    }


  } catch (error) {

  }
}

module.exports = {
  getTickets,
  createTicket
}