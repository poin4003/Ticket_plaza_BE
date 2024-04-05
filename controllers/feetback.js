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

}

const getFeetbacks = async (req, res, next) => {

}

module.exports = {
  getFeetbacks,
  createFeetback
}