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

}

const updateFeetbacks = async (req, res, next) => {
  const { feetbackId } = req.query 

  try {
    const newFeetback = req.value.body

    const updateFeetbacks = await Feetback.findByIdAndUpdate(feetbackId, newFeetback)

    if (!updateFeetbacks) {
      return sendRespone(res, { data: [] }, "Không thể tìm thấy thông tin phản hồi!")
    }

    return sendRespone(res, { data: newFeetback }, "Cập nhật thông tin thông tin phản hồi thành công!")
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getFeetbacks,
  createFeetback,
  updateFeetbacks
}