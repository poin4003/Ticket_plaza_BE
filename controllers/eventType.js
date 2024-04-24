// Import module for user controller
const EventType = require('../models/EventType')
const { sendRespone } = require('../utils/clientRespone')

// Controllers for EventType
const getEventTypes = async (req, res, next) => {     // Get a eventType list
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

    if (eventTypes.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy kiểu sự kiện!")

    const totalEventTypes = await EventType.countDocuments(query)
    const totalPages = Math.ceil(totalEventTypes / limit)

    const pagination = {
      totalItems: totalEventTypes,
      currentPage: page,
      totalPages: totalPages
    }

    return sendRespone(res, { data: eventTypes }, `${totalEventTypes} kiểu sự kiện đã được tìm thấy!`,
    201, pagination)
  } catch (error) {
    next(error)
  }
}

const updateEventType = async (req, res, next) => {
  let { eventTypeId, typeId } = req.query
  const newEventType = req.value.body

  try {
    const query = {};

    if (eventTypeId) query._id = eventTypeId
    if (typeId) query = { typeId: { $regex: typeId, $options: 'i'} }

    const foundEventType = await EventType.findOne(query)

    if (!foundEventType) return sendRespone(res, { data: [] }, "Không thể tìm thấy kiểu sự kiện!")
    
    foundEventType.set(newEventType)
    foundEventType.save()

    return sendRespone(res, { data: foundEventType }, "Cập nhật kiểu sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const createEventType = async (req, res, next) => {   // Create eventType
  const newEventType = new EventType(req.value.body)

  if (newEventType.typeId === undefined) newUser.typeId = 0;

  await newEventType.save()

  return sendRespone(res, { data: newEventType }, "Tạo kiểu sự kiện mới thành công!")
}

const activateEventType = async (req, res, next) => {     // Activating eventype by id
  let { eventTypeId, typeId } = req.query

  try {
    let query = {};

    if (eventTypeId) query._id = eventTypeId
    if (typeId) query = { typeId: { $regex: typeId, $options: 'i'} }

    const foundEventType = await EventType.findOne(query)

    if (!foundEventType) return sendRespone(res, { data: [] }, "Không thể tìm thấy kiểu sự kiện!")

    foundEventType.status = 0
    await foundEventType.save()

    return sendRespone(res, { data: foundEventType }, "Mở khóa kiểu sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

const deavtivateEventType = async (req, res, next) => {     // Deactivating eventype by id
  let { eventTypeId, typeId } = req.query

  try {
    let query = {};

    if (eventTypeId) query._id = eventTypeId
    if (typeId) query = { typeId: { $regex: typeId, $options: 'i'} }

    const foundEventType = await EventType.findOne(query)

    if (!foundEventType) return sendRespone(res, { data: [] }, "Không thể tìm thấy kiểu sự kiện!")

    foundEventType.status = 1
    await foundEventType.save()

    return sendRespone(res, { data: foundEventType }, "Khóa kiểu sự kiện thành công!")
  } catch (error) {
    next(error)
  }
}

// Export controllers
module.exports = {
  getEventTypes,
  updateEventType,
  createEventType,
  activateEventType,
  deavtivateEventType
}