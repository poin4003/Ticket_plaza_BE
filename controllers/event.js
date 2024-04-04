// Import module for user controller
const Event = require('../models/Event')
const User = require('../models/User')

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

const getListEvents = async (req, res, next) => {      // Get list event
  let { page, limit, status } = req.query
  limit = parseInt(limit) || 8
  page = parseInt(page) || 1
  if (!status) status = undefined

  const skip = (page - 1) * limit;

  try {
    let query = {}

    if (status !== undefined) query.status = status;

    const events = await Event.find(query).skip(skip).limit(limit)

    if (events.length === 0) {
      const error = new Error("Không thể tìm thấy sự kiện!")
      error.status = 404
      throw error 
    }

    const totalEvents = await Event.countDocuments(query)

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
      message: `${totalEvents} kiểu sự kiện đã được tìm thấy!` 
    })
  } catch (error) {
    next(error)
  }
}

const getListEventsByName = async (req, res, next) => {
  let { page, limit, status, keyword } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  if (!status) status = undefined

  const skip = (page - 1) * limit

  try {
    let query = {};
    if (keyword) query = query = { name: { $regex: new RegExp(keyword, 'i') } }
    if (status) query.status = status

    // console.log(keyword)
    // console.log(query)

    const events = await Event.find(query).skip(skip).limit(limit)

    if (events.length === 0) {
      const error = new Error("Không thể tìm thấy sự kiện!")
      error.status = 404
      throw error 
    }

    const totalEvents = await Event.countDocuments(query)
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
      message: `${totalEvents} người dùng được tìm thấy!`
    })
  } catch (error) {
    next(error)
  }
}

const getListEventsByHost = async (req, res, next) => {
  let { page, limit, status, type, keyword } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  if (!status) status = undefined

  const skip = (page - 1) * limit

  try {
    let userQuery = {}
    // if (keyword) userQuery = { fullName: { $regex: new RegExp(keyword, 'i') } }
    if (keyword) userQuery = { fullName: keyword }
    if (status) userQuery.status = status
    if (type) userQuery.type = { $in: [parseInt(type)] }
    

    console.log(userQuery)

    const users = await User.find(userQuery)

    if (users.length === 0) {
      const error = new Error("Không thể tìm thấy người dùng!")
      error.status = 404
      throw error 
    }

    const userIds = users.map(user => user._id)

    console.log(userIds)

    const eventQuery = { host: { $in: userIds } }

    const events = await Event.find(eventQuery).skip(skip).limit(limit)

    if (events.length === 0) {
      const error = new Error("Không thể tìm thấy sự kiện!")
      error.status = 404
      throw error 
    }

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
      message: `${totalEvents} sự kiện được tìm thấy!`
    })
  } catch (error) {
    next(error)
  }
}

const getListEventsByMember = async (req, res, next) => {
  let { page, limit, status, type, keyword } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  if (!status) status = undefined

  const skip = (page - 1) * limit

  try {
    let userQuery = {}
    // if (keyword) userQuery = { fullName: { $regex: new RegExp(keyword, 'i') } }
    if (keyword) userQuery = { fullName: keyword }
    if (status) userQuery.status = status
    if (type) userQuery.type = { $in: [parseInt(type)] }

    console.log(userQuery)

    const users = await User.find(userQuery)

    if (users.length === 0) {
      const error = new Error("Không thể tìm thấy người dùng!")
      error.status = 404
      throw error 
    }

    const userIds = users.map(user => user._id)

    const eventQuery = { members: { $elemMatch: { $in: userIds } } }

    const events = await Event.find(eventQuery).skip(skip).limit(limit)

    if (events.length === 0) {
      const error = new Error("Không thể tìm thấy sự kiện!")
      error.status = 404
      throw error 
    }

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
      message: `${totalEvents} sự kiện được tìm thấy!`
    })
  } catch (error) {
    next(error)
  }
}

const getListEventsByHostOrMember = async (req, res, next) => {
  let { page, limit, status, type, keyword } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  if (!status) status = undefined

  const skip = (page - 1) * limit

  try {
    let userQuery = {}
    // if (keyword) userQuery = { fullName: { $regex: new RegExp(keyword, 'i') } }
    if (keyword) userQuery = { fullName: keyword }
    if (status) userQuery.status = status
    if (type) userQuery.type = { $in: [parseInt(type)] }
    
    console.log(userQuery)

    const users = await User.find(userQuery)

    if (users.length === 0) {
      const error = new Error("Không thể tìm thấy người dùng!")
      error.status = 404
      throw error 
    }

    const userIds = users.map(user => user._id)

    console.log(userIds)

    const eventQuery = { 
      $or: [
        { host: { $in: userIds } },
        { members: { $elemMatch: { $in: userIds } } }
      ]
    }

    const events = await Event.find(eventQuery).skip(skip).limit(limit)

    if (events.length === 0) {
      const error = new Error("Không thể tìm thấy sự kiện!")
      error.status = 404
      throw error 
    }

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
      message: `${totalEvents} sự kiện được tìm thấy!`
    })
  } catch (error) {
    next(error)
  }
}

const getListEventsByType = async (req, res, next) => {

}

const getListEventsByPlace = async (req, res, next) => {

}

const getListEventsByDate = async (req, res, next) => {

}

const deactivateEvent = async (req, res, next) => {

}

const activateEvent = async (req, res, next) => {

}

const getEventById = async (req, res, next) => {      // Get user by id (get)
  const { eventID } = req.value.params

  try {
    const event = await Event.findById(eventID)

    if (!event) {
      const error = new Error("Không thể tìm thấy sự kiện!")
      error.status = 404
      throw error
    }

    return res.status(201).json({ 
      data: [
        { data: event }
      ], 
      pagination: {},
      message: "Sự kiện đã được tìm thấy!" 
    })
  } catch (error) {
    next(error)
  }
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
  getListEvents, 
  getListEventsByName,
  getListEventsByHost,
  getListEventsByMember,
  getListEventsByHostOrMember,
  getListEventsByType,
  getListEventsByPlace,
  getListEventsByDate,
  getEventById,
  createNewEvent,
  getEventById,
  updateEventById,
  deactivateEvent,
  activateEvent
}