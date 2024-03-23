// Import module for user controller
const Event = require('../models/Event')

// Controller for event
const newEvent = async (req, res, next) => {   // Create new Event
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

const getAllEvent = async (req, res, next) => {      // Get all events
  const event = await Event.find({})

  return res.status(201).json({ 
    data: [
      { data: event }
    ], 
    paganition: {},
    message: "Toàn bộ sự kiện đã được tìm thấy thành công!" 
  })
}

const getEvent = async (req, res, next) => {      // Get user by id (get)
  const { eventID } = req.value.params

  const event = await Event.findById(eventID)

  return res.status(200).json({ event })
}

const updateEvent = async (req, res, next) => {   // Update event by id (patch)
  const { eventID } = req.value.params

  try {
    const foundEvent = await Event.findById(eventID)

    if (!foundEvent) {
      const error = new Error("Không thể tìm thấy người dùng!")
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
      message: "Cập nhật thông tin người dùng thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

// Export controllers
module.exports = {
  newEvent, 
  getAllEvent,
  getEvent,
  updateEvent
}