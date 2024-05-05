// Import module for event controller
const dayjs = require('dayjs')
const Ticket = require('../models/Ticket')
const { sendRespone } = require('../utils/clientRespone')

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
    
    let tickets = await Ticket.find(ticketQuery).sort({ releaseDate: 'desc' }).skip(skip).limit(limit)

    if (tickets.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")

    const totalTickets = await Ticket.countDocuments(ticketQuery)
    const totalPages = Math.ceil(totalTickets / limit)

    const pagination = {
      totalItems: totalTickets,
      currentPage: page,
      total: totalPages
    }

    return sendRespone(res, { data: tickets }, `${totalTickets} vé đã được tìm thấy`,
    201, pagination)

  } catch (error) {
    next(error)
  }
}

const updateTicket = async (req, res, next) => {
  const { ticketId } = req.query 
  const newTicket = req.value.body 

  try { 
    const foundTicket = await Ticket.findById(ticketId)

    if (!foundTicket) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")

    foundTicket.set(newTicket)
    await foundTicket.save()

    return sendRespone(res, { data: foundTicket }, "Cập nhật thông tin vé thành công!")
  } catch (error) {
    next(error)
  }
}

const updateTicketTotalAmount = async (req, res, next) => {
  let { ticketId, amount } = req.query 

  try {
    const foundTicket = await Ticket.findById(ticketId).populate({ 
      path: 'eventId', select: '_id maxTicketPerBill'
    })

    if (!foundTicket) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")
    
    if (foundTicket.eventId.maxTicketPerBill >= parseInt(amount)) {
      foundTicket.totalAmount += parseInt(amount)
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
  const { ticketId } = req.query

  try {
    const foundTicket = await Ticket.findById(ticketId)

    if (!foundTicket) return sendRespone(res, { data: [] }, "Không thể tìm thấy vé!")

    foundTicket.status = 0
    await foundTicket.save()

    return sendRespone(res, { data: foundTicket }, "Mở khóa vé thành công!")
  } catch (error) {
    next(error)
  }
}

const deactivateTicket = async (req, res, next) => {
  const { ticketId } = req.query

  try {
    const foundTicket = await Ticket.findById(ticketId)

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