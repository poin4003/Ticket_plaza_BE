// Import module for bill controller
const Bill = require('../models/Bill')

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}


// Controller for bill
const createBill = async (req, res, next) => {

}

const getBills = async (req, res, next) => {

}

module.exports = {
  getBills,
  createBill
}