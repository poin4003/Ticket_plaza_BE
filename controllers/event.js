// Import module for event controller
const Event = require('../models/Event')

// Controller for event
const createNewEvent = async (req, res, next) => {   // Create new Event
  const newEvent = new Event(req.body)

  await newEvent.save()

  return res.status(201).json({ 
    data: [
      { data: newEvent }
    ], 
    paganition: {},
    message: "Tạo sự kiện mới thành công" 
  })
}

const getEvents = async (req, res, next) => {      // Get list event
  let { page, limit, status, eventId, name, host, member, type, startDate, endDate } = req.query
  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit;

  try {
    let eventQuery = {}

    if (host) eventQuery.host = host
    if (member) eventQuery.members = { $in: member }
    if (eventId) eventQuery._id = eventId 
    if (name) eventQuery.name = { $regex: new RegExp(name, 'i') }
    if (type) eventQuery.type = { $regex: new RegExp(type, 'i') }
    if (status) eventQuery.status = status;

    if (startDate && endDate) {
      eventQuery.date = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(eventQuery).skip(skip).limit(limit)

    events.sort((eventA, eventB) => {
      const dateTimeA = new Date(`${eventA.date} ${eventA.time}`);
      const dateTimeB = new Date(`${eventB.date} ${eventB.time}`);
      return dateTimeA - dateTimeB;
    });

    events.reverse();


    const totalEvents = await Event.countDocuments(eventQuery)

    const totalPages = Math.ceil(totalEvents / limit)

    return res.status(201).json({ 
      data: [
        { data: events }
      ], 
      pagination: {
        totalItems: totalEvents,
        currentPage: page,
        totalPages: totalPages
      },
      message: `${totalEvents} sự kiện đã được tìm thấy!` 
    })
  } catch (error) {
    next(error)
  }
}

const deactivateEvent = async (req, res, next) => {

}

const activateEvent = async (req, res, next) => {

}

const updateEventById = async (req, res, next) => {   // Update event by id (patch)
  const { eventID } = req.value.params

  try {
    const foundEvent = await Event.findById(eventID)

    if (!foundEvent) {
      const error = new Error("Không thể tìm thấy sự kiện!")
      error.status = 404
      throw error 
    }

    const newEvent = req.value.body

    const updateEvent = await Event.findByIdAndUpdate(eventID, newEvent)

    return res.status(201).json({ 
      data: [
        { data: newEvent }
      ], 
      paganition: {},
      message: "Cập nhật thông tin sự kiện thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

// Export controllers
module.exports = {
  getEvents, 
  createNewEvent,
  updateEventById,
  deactivateEvent,
  activateEvent
}