// Import module for event controller
const dayjs = require('dayjs')
const Event = require('../models/Event')
const Ticket = require('../models/Ticket')

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

// Sort events by date time
const sortEventsByDateTime = (events) => {
  events.sort((a, b) => {
    const timeA = a.time ? a.time.split(':') : ['00', '00']
    const timeB = b.time ? b.time.split(':') : ['00', '00']

    const dateA = dayjs(a.date).startOf('day').add(parseInt(timeA[0]), 'hour').add(parseInt(timeA[1]), 'minute')
    const dateB = dayjs(b.date).startOf('day').add(parseInt(timeB[0]), 'hour').add(parseInt(timeB[1]), 'minute') 
    
    return dateA - dateB
  })
  return events
}

// Sort events by views
const sortEventsByViews = (events) => {
    events.sort((eventA, eventB) => eventB.views - eventA.views)
    return events
}

// Check and update status to 2
const checkAndUpdateEventStatus = async (events) => {
  const currentDate = new Date()

  for (const event of events) {
    if (event.status !== 1) {
      const eventDate = dayjs(event.date).add(event.durationDate, 'days').toDate()

      if (currentDate > eventDate) {
        event.status = 2
        await event.save()
      } else if (currentDate <= eventDate) {
        event.status = 0
        await event.save()
      }
    }
  }
}

// Controller for event

const createNewEvent = async (req, res, next) => {   // Create new Event
  console.log(req.body);
  
  const imageUrl = `${req.protocol}://${req.get('host')}/getImage/${req.body.photo}`

  const newEvent = new Event(req.body)

  await newEvent.save()

  return sendRespone(res, { data: newEvent, imageUrl:  imageUrl}, "Tạo sự kiện mới thành công!") 
}

const getEvents = async (req, res, next) => {      // Get list event
  let { page, limit, status, eventId, name, host, 
    member, type, startDate, endDate, sort, ticket } = req.query

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit

  try {
    let eventQuery = {}

    if (host) eventQuery.host = host
    if (member) eventQuery.members = { $in: member }
    if (eventId) eventQuery._id = eventId 
    if (name) eventQuery.name = { $regex: new RegExp(name, 'i') }
    if (type) eventQuery.type = { $regex: new RegExp(type, 'i') }
    if (status) eventQuery.status = status

    if (startDate && endDate) {
        startDate = dayjs(startDate).startOf('day').toDate();
        endDate = dayjs(endDate).endOf('day').toDate();
        
        eventQuery.date = { $gte: startDate, $lte: endDate };
    }

    let events = await Event.find(eventQuery).skip(skip).limit(limit)

    if (events.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    if (sort === 'view') { 
      events = sortEventsByViews(events)
    } else {
      events = sortEventsByDateTime(events)
    }

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

    if (sort === 'view') { 
      events = sortEventsByViews(events)
    } else {
      events = sortEventsByDateTime(events)
    }

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

const updateEventProfit = async (req, res, next) => {
  let { eventId, profitToAdd } = req.query

  try {
    let query = {}

    if (eventId) query._id = eventId

    const foundEvent = await Event.findOne(query)

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
    let query = {}

    if (eventId) query._id = eventId

    const foundEvent = await Event.findOne(query)

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    if (foundEvent.status === 2) {
      return sendRespone(res, { data: [] }, "Không thể khóa sự kiện đã diễn ra!")
    }

    foundEvent.status = 1
    await foundEvent.save()

    return sendRespone(res, { data: foundEvent }, "Mở khóa sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const activateEvent = async (req, res, next) => {
  let { eventId } = req.query

  try {
    let query = {}

    if (eventId) query._id = eventId

    const foundEvent = await Event.findOne(query)

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")

    foundEvent.status = 0
    await foundEvent.save()

    return sendRespone(res, { data: foundEvent }, "Mở khóa sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const updateEvent = async (req, res, next) => {   // Update event by id (patch)
  const { eventId } = req.query

  try {
    const foundEvent = await Event.findById(eventId)

    var imageUrl = `${req.protocol}://${req.get('host')}/getImage/${req.body.photo}`

    if (!foundEvent) return sendRespone(res, { data: [] }, "Không thể tìm thấy sự kiện!")
    if (!req.file) imageUrl = ''
    
    const newEvent = req.body

    const updateEvent = await Event.findByIdAndUpdate(eventId, newEvent)

    return sendRespone(res, { data: newEvent, imageUrl: imageUrl }, "Cập nhật thông tin sự kiện thành công!") 
  } catch (error) {
    next(error)
  }
}

// Export controllers
module.exports = {
  getEvents, 
  getRevenue,
  createNewEvent,
  updateEvent,
  updateEventProfit,
  deactivateEvent,
  activateEvent
}