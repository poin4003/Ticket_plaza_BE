// Import module for event controller
const Event = require('../models/Ticket')

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}


// Controller for ticket
const createTicket = async (req, res, next) => {

}

const getTickets = async (req, res, next) => {

}

module.exports = {
  getTickets,
  createTicket
}