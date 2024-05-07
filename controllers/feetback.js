// Import module for feetback controller
const Feetback = require('../models/Feedback')
const User = require('../models/User')
const Bill = require('../models/Bill')
const { sendRespone } = require('../utils/clientRespone')

// Controller for feetback
const createFeetback = async (req, res, next) => {
  const newFeetback = new Feetback(req.body)

  const foundBill = await Bill.findById(req.body.billId)

  if (!foundBill) return sendRespone(res, { data: [] }, "Không thể tìm thấy hóa đơn!")

  foundBill.feetbackStatus = 1

  await foundBill.save()
  await newFeetback.save()

  return sendRespone(res, { data: newFeetback }, "Tạo phản hồi thông tin thành công!")
}

const getFeetbacks = async (req, res, next) => {
  let { page, limit, status, feetbackId, eventId, billId, rate} = req.query 

  limit = parseInt(limit) || 8
  page = parseInt(page) || 1

  const skip = (page - 1) * limit

  try {
    let feetbackquery = {}
    if (feetbackId) feetbackquery._id = feetbackId 
    if (rate) feetbackquery.rate = parseInt(rate)
    if (status) feetbackquery.status = status 
    if (billId) feetbackquery.billId = billId

    let feetbacks = await Feetback.find(feetbackquery).skip(skip).limit(limit)
    .populate({ path: 'billId', select: '_id eventId userId'})

    if (eventId) { 
      feetbacks = feetbacks.filter(feetback => feetback.billId.eventId.toString() === eventId.toString())
    }

    if (feetbacks.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy thông tin phản hồi!")
    
    for (let i = 0; i < feetbacks.length; i++) {
      const user = await User.findById(feetbacks[i].billId.userId).select('_id fullName email')
      if (!user) return sendRespone(res, { data: [] }, "Không thể tìm thấy người dùng!")
      feetbacks[i] = {
        ...feetbacks[i].toObject(),
        event: feetbacks[i].eventId,
        user: user
      }
    }

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