// Import module for user controller
const EventType = require('../models/EventType')

// Controllers for EventType
const getEvents = async (req, res, next) => {     // Get a eventType list
  let { page, limit, status, eventTypeId, typeId, eventTypeName } = req.query
  limit = parseInt(limit) || 10
  page = parseInt(page) || 1

  const skip = (page - 1) * limit;

  try {
    const query = {}

    if (eventTypeId) query._id = eventTypeId
    if (typeId) query.typeId = { $regex: new RegExp(typeId, 'i') }
    if (eventTypeName) query.eventTypeName = { $regex: new RegExp(eventTypeName, 'i') }
    if (status) query.status = status

    const eventTypes = await EventType.find(query).skip(skip).limit(limit)

    if (eventTypes.length === 0) {
      const error = new Error("Không thể tìm thấy kiểu sự kiện!")
      error.status = 404
      throw error 
    }

    const totalEventTypes = await EventType.countDocuments(query)

    const totalPages = Math.ceil(totalEventTypes / limit)

    return res.status(201).json({ 
      data: [
        { data: eventTypes }
      ], 
      pagination: {
        totalItems: totalEventTypes,
        currentPage: page,
        totalPages: totalPages
      },
      message: `${totalEventTypes} kiểu sự kiện đã được tìm thấy!` 
    })
  } catch (error) {
    next(error)
  }
}

const updateEventTypeByID = async (req, res, next) => {
  const { eventTypeID } = req.value.params

  try {
    const foundEventType = await EventType.findById(eventTypeID)

    if (!foundEventType) {
      const error = new Error("Không thể tìm thấy kiểu sự kiện!")
      error.status = 404
      throw error 
    }

    const newEventType = req.value.body

    const updateEventType = await EventType.findByIdAndUpdate(eventTypeID, newEventType)

    return res.status(201).json({ 
      data: [
        { data: newEventType }
      ], 
      pagination: {},
      message: "Cập nhật thông tin kiểu sự kiện thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

const updateEventTypeByTypeID = async (req, res, next) => {
  let { typeId } = req.query

  try {
    let query = {};
    if (typeId) query = { typeId: { $regex: typeId, $options: 'i'} }

    const eventType = await EventType.findOne(query)

    if (!eventType) {
      const error = new Error("Không thể tìm thấy kiểu sự kiện")
      error.status = 404
      throw error
    }

    const newEventType = req.value.body

    const udpateEventType = await EventType.updateOne({ _id: newEventType._id }, newEventType)

    return res.status(201).json({ 
      data: [
        { data: newEventType }
      ], 
      pagination: {},
      message: `Cập nhật thông tin kiểu sự kiện thành công!`
    })
  } catch (error) {
    next(error)
  }
}

const createEventType = async (req, res, next) => {   // Create eventType
  const newEventType = new EventType(req.value.body)

  if (newEventType.typeId === undefined) newUser.typeId = 0;

  await newEventType.save()

  return res.status(201).json({ 
    data: [
      { data: newEventType }
    ], 
    pagination: {},
    message: "Tạo kiểu sự kiện mới thành công!" 
  })
}

const activateEventType = async (req, res, next) => {     // Activating eventype by id
  let { typeId } = req.query

  try {
    let query = {};
    if (typeId) query = { typeId: { $regex: typeId, $options: 'i'} }

    const foundEventType = await EventType.findOne(query)

    if (!foundEventType) {
      const error = new Error("Không thể tìm thấy kiểu sự kiện!")
      error.status = 404
      throw error
    }

    foundEventType.status = 0
    await foundEventType.save()

    return res.status(201).json({ 
      data: [
        { data: { status: 0 } }
      ], 
      pagination: {},
      message: "Mở khóa kiểu sự kiện thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

const deavtivateEventType = async (req, res, next) => {     // Deactivating eventype by id
  let { typeId } = req.query

  try {
    let query = {};
    if (typeId) query = { typeId: { $regex: typeId, $options: 'i'} }

    const foundEventType = await EventType.findOne(query)

    if (!foundEventType) {
      const error = new Error("Không thể tìm thấy kiểu sự kiện!")
      error.status = 404
      throw error
    }

    foundEventType.status = 1
    await foundEventType.save()

    return res.status(201).json({ 
      data: [
        { data: { status: 1 } }
      ], 
      pagination: {},
      message: "Khóa kiểu sự kiện thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

// Export controllers
module.exports = {
  getEvents,
  updateEventTypeByID,
  updateEventTypeByTypeID,
  createEventType,
  activateEventType,
  deavtivateEventType
}