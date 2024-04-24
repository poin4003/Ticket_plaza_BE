const nodemailer = require('nodemailer')
const { ticketPlazaEmailAccount } = require('../configs')     // Import environment value setup

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

// Nodemailer transporter configs
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ticketPlazaEmailAccount.USERNAME,
    pass: ticketPlazaEmailAccount.PASSWORD
  }
})


// Export module
module.exports = {
  transporter,
  sendRespone
}
