// Import module for feetback controller
const Feetback = require('../models/Feedback')

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

// Controller for feetback
const createFeetback = async (req, res, next) => {
  const newFeetback = new Feetback(req.body)
  
  await newFeetback.save()

  return sendRespone(res, { data: newFeetback }, "Tạo phản hồi thông tin thành công!")
}

const getFeetbacks = async (req, res, next) => {
  let { page, limit, status, feetbackId, eventId, rate} = req.query 

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit

  try {
    let feetbackquery = {}
    if (feetbackId) feetbackquery._id = feetbackId 
    if (eventId) feetbackquery.eventId = eventId
    if (rate) feetbackquery.rate = rate 
    if (status) feetbackquery.status = status 

    let feetbacks = await Feetback.find(feetbackquery).skip(skip).limit(limit).populate({ path: 'eventId', select: '_id name' })

    if (feetbacks.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy thông tin phản hồi!")

    feetbacks = feetbacks.map(feetback => ({
      ...feetback.toObject(),
      event: feetback.eventId
    }))

    const totalFeetbacks = await Feetback.countDocuments(feetbackquery)

    const totalPages = Math.ceil(totalFeetbacks / limit)

    const pagination = {
      totalItems: totalFeetbacks,
      currentPage: page,
      totalPages: totalPages
    }

    return sendRespone(res, { data: feetbacks }, `${totalFeetbacks} phản hồi thông tin đã được tìm thấy!`,
    201, pagination)
  } catch (error) {
    next(error)
  }
}

const updateFeetbacks = async (req, res, next) => {
  const { feetbackId } = req.query 
  const newFeetback = req.value.body

  try {
    const foundFeetback = await Feetback.findById(feetbackId)

    if (!foundFeetback) {
      return sendRespone(res, { data: [] }, "Không thể tìm thấy thông tin phản hồi!")
    }

    foundFeetback.set(newFeetback)
    await foundFeetback.save()

    return sendRespone(res, { data: foundFeetback }, "Cập nhật thông tin thông tin phản hồi thành công!")
  } catch (error) {
    next(error)
  }
}

const activateFeetback = async (req, res, next) => {
  const { feetbackId } = req.query 

  try {
    const foundFeetback = await Feetback.findById(feetbackId)

    if (!foundFeetback) return sendRespone(res, { data: [] }, "Không thể tìm thấy thông tin phản hồi!")

    foundFeetback.status = 0
    await foundFeetback.save()
    
    return sendRespone(res, { data: foundFeetback }, "Mở khóa thông tin phản hồi thành công!")
  } catch (error) {
    next(error)
  }
}

const deactivateFeetback = async (req, res, next) => {
  const { feetbackId } = req.query 

  try {
    const foundFeetback = await Feetback.findById(feetbackId)

    if (!foundFeetback) return sendRespone(res, { data: [] }, "Không thể tìm thấy thông tin phản hồi!")

    foundFeetback.status = 1
    await foundFeetback.save()
    
    return sendRespone(res, { data: foundFeetback }, "Khóa thông tin phản hồi thành công!")
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getFeetbacks,
  createFeetback,
  updateFeetbacks,
  activateFeetback,
  deactivateFeetback
}