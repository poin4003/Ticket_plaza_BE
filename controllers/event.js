// Import module for event controller
const dayjs = require('dayjs')
const Event = require('../models/Event')
const EventType = require('../models/EventType')
const Ticket = require('../models/Ticket')
const Bill = require('../models/Bill')
const User = require('../models/User')
const { ticketPlazaEmailAccount } = require('../configs')     // Import environment value setup
const { transporter, sendRespone } = require('../utils/clientRespone')
const { checkAndUpdateEventStatus } = require('../utils/dataHandler')

// Controller for event
const createNewEvent = async (req, res, next) => {   // Create new Event
  const newEvent = new Event(req.body)

  await newEvent.save()

  return sendRespone(res, { data: newEvent }, "Tạo sự kiện mới thành công!") 
}

const getEvents = async (req, res, next) => {      // Get list event
  let { page, limit, status, eventId, name, host, 
    member, type, startDate, endDate, ticket } = req.query

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit

  try {
    let eventQuery = {}

    if (host || member) {
      eventQuery.$or = [
        { host },
        { members: { $in: [member] } }
      ]
    } 
    if (eventId) eventQuery._id = eventId 
    if (name) eventQuery.name = { $regex: new RegExp(name, 'i') }
    if (type) eventQuery.type = type
    if (status) eventQuery.status = status

    if (startDate && endDate) {
        startDate = dayjs(startDate).startOf('day').toDate();
        endDate = dayjs(endDate).endOf('day').toDate();
        
        eventQuery.date = { $gte: startDate, $lte: endDate };
    }

    let events = await Event.find(eventQuery).sort({ date: 'asc', view: 'asc' }).skip(skip).limit(limit)

    if (events.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    if (ticket && ticket == 'true') {
      const eventIds = events.map(event => event._id)
      let tickets = await Ticket.find({ eventId: { $in: eventIds } }).select("eventId _id price")

      events = events.map(event => {
        const eventWithTickets = { event };
        eventWithTickets.tickets = tickets.filter(ticket => ticket.eventId.toString() === event._id.toString());
        return eventWithTickets;
      })
    }

    checkAndUpdateEventStatus(events)

    const totalEvents = await Event.countDocuments(eventQuery)

    const totalPages = Math.ceil(totalEvents / limit)

    const pagination = {
      totalItems: totalEvents,
      currentPage: page,
      totalPages: totalPages
    }

    return sendRespone(res, { data: events }, `${totalEvents} sự kiện đã được tìm thấy!`,
    201, pagination)
  } catch (error) {
    next(error)
  }
}

const getEventDetail = async (req, res, next) => {
  let { eventId } = req.query 

  try {
    const event = await Event.findById(eventId)

    const tickets = await Ticket.find({ eventId: eventId })

    const eventType = await EventType.findOne({ typeId: event.type }).select('eventTypeName')

    const eventWithTickets = {
      ...event.toObject(),
      type: eventType.eventTypeName, 
      tickets: tickets
    }

    return sendRespone(res, { data: eventWithTickets }, "Tìm thấy chi tiết sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const getRevenue = async (req, res, next) => {      // Get revenue
  let { page, limit, status, startDate, endDate, sort } = req.query

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit;

  try {
    let eventQuery = {}
    if (status) eventQuery.status = status

    if (startDate && endDate) {
      startDate = dayjs(startDate).startOf('day').toDate();
      endDate = dayjs(endDate).endOf('day').toDate();

      eventQuery.date = { $gte: startDate, $lte: endDate };
    }

    let events = await Event.find(eventQuery).skip(skip).limit(limit)
    let eventNBP = await Event.find(eventQuery)  // events list not by pagination

    if (events.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    const totalEvents = await Event.countDocuments(eventQuery)

    const totalPages = Math.ceil(totalEvents / limit) 

    checkAndUpdateEventStatus(events)

    const pagination = {
      totalItems: totalEvents,
      currentPage: page,
      totalPages: totalPages
    }

    const totalProfitByPagination = events.reduce((acc, event) => acc + event.profit, 0)
    const totalProfit = eventNBP.reduce((acc, event) => acc + event.profit, 0)
    return sendRespone(res, { data: events, totalProfitByPagination, totalProfit},
    `${totalEvents} sự kiện đã được tìm thấy!`, 201, pagination)
  } catch (error) {
    next(error)
  }
}

const getViewList = async (req, res, next) => {
  let { host, member, status, startDate, endDate } = req.query 

  try {
    const eventQuery = {}
    if (host || member) {
      eventQuery.$or = [
        { host },
        { members: { $in: [member] } }
      ]
    } 
    if (status) eventQuery.status = status 

    if (startDate && endDate) {
      startDate = dayjs(startDate).startOf('day').startOf('day').toDate()
      endDate = dayjs(endDate).endOf('day').toDate()

      eventQuery.date = { $gte: startDate, $lte: endDate }
    }

    const eventList = await Event.find(eventQuery).sort({ date: 'asc', view: 'asc' }).select('_id name host type status views')

    let eventNameList = []
    let viewList = []

    for (const event of eventList) {
      eventNameList.push(event.name)
      viewList.push(event.views)
    }

    sendRespone(res, { data: eventNameList, viewList }, "Tìm tên và view sự kiện tương ứng thành công!")
  } catch (error) {
    next(error)
  }
}

const updateEventProfit = async (req, res, next) => {
  let { eventId, profitToAdd } = req.query

  try {
    const foundEvent = await Event.findById(eventId)

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    foundEvent.profit += parseFloat(profitToAdd)

    await foundEvent.save()
    return sendRespone(res, { data: foundEvent }, "Cập nhật doanh thu sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const deactivateEvent = async (req, res, next) => {
  let { eventId } = req.query

  try {
    const foundEvent = await Event.findById(eventId)

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    if (foundEvent.status === 2) {
      return sendRespone(res, { data: [] }, "Không thể khóa sự kiện đã diễn ra!")
    }

    const foundBill = await Bill.find({ eventId: eventId, status: 1 }).select("userId")
    
    let emailList = []

    for (const bill of foundBill) {
      const foundUser = await User.findById(bill.userId).select("fullName email")
      if (foundUser) {
        emailList.push({ email: foundUser.email, fullName: foundUser.fullName })
      }
    }

    console.log(emailList);

    foundEvent.status = 1
    await foundEvent.save()

    return sendRespone(res, { data: foundEvent, emailList: emailList }, "Khóa sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const activateEvent = async (req, res, next) => {
  let { eventId } = req.query

  try {
    const foundEvent = await Event.findById(eventId)

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    foundEvent.status = 0
    await foundEvent.save()

    return sendRespone(res, { data: foundEvent }, "Mở khóa sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const sendEmails = async (req, res, next) => {
  try {
    const emailList = req.body.emailList

    for (const recipient of emailList) {
      const mailOption = {
        from: ticketPlazaEmailAccount.USERNAME,
        to: recipient.email,
        subject: req.body.subject,
        text: req.body.text 
      }

      await transporter.sendMail(mailOption)

      return sendRespone(res, [{ data: [] }], "Đã gửi thông báo cho các email!")
    }
  } catch (error) {
    next(error)
  }
}

const updateEvent = async (req, res, next) => {   // Update event by id (patch)
  const { eventId } = req.query;
  const newEvent = req.value.body

  try {
    const foundEvent = await Event.findById(eventId)

    if (!foundEvent) {
      return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!");
    }
    
    foundEvent.set(newEvent)
    foundEvent.save()

    return sendRespone(res, { data: foundEvent }, "Cập nhật thông tin sự kiện thành công!");
  } catch (error) {
    next(error);
  }
}

const updateEventView = async (req, res, next) => {
  let { eventId } = req.query 

  try {
    const foundEvent = await Event.findById(eventId).select("_id name views")

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    foundEvent.views += 1
    await foundEvent.save()

    return sendRespone(res, { data: foundEvent }, "Cập nhật số lượng vé thành công!")
  } catch (error) {
    next(error)
  }
}

// Export controllers
module.exports = {
  getEvents, 
  getEventDetail,
  getRevenue,
  getViewList,
  createNewEvent,
  updateEvent,
  updateEventProfit,
  updateEventView,
  deactivateEvent,
  activateEvent,
  sendEmails
}