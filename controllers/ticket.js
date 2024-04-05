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
  
}

module.exports = {
  getTickets,
  createTicket
}