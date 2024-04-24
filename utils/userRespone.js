const { ticketPlazaEmailAccount } = require('../configs')
const { transporter } = require('./clientRespone')
const { generateQR } = require('./dataEncrypt')


// Temporary storage for OTP
const otpStorage = {}
let otpAttempts = {}

const generateAndSendOTP = async (email) => {
  try {
    const OTP = Math.floor(1000 + Math.random() * 9000)
    const expirationTime = Date.now() + (5 * 60 * 1000)
    otpStorage[email] = { OTP, expirationTime }

    const mailOptions = {
      from: ticketPlazaEmailAccount.USERNAME,
      to: email,
      subject: 'OTP for password reset',
      text: `Your OTP is: ${OTP}\nPlease request in 5 minutes`
    }

    await transporter.sendMail(mailOptions)

    return OTP
  } catch (error) {
    throw new Error("Không thể tạo và gửi OTP!")
  }
}

const sendBill = async (email, subject, text, billId) => {
  try {
    const data = billId.toString()
    const qrCheckin = await generateQR(data)
    
    const mailOption = {
      from: ticketPlazaEmailAccount.USERNAME,
      to: email,
      subject: subject,
      html: text,
      attachments: [{
        filename: "qrCheckin.png",
        content: qrCheckin,
        encoding: 'base64'
      }]
    }

    await transporter.sendMail(mailOption)
  } catch (error) {
    const customError = new Error('Lỗi gửi email, không thể gửi email!')
    customError.originalError = error
    throw customError
  }
}

module.exports = {
  generateAndSendOTP,
  sendBill,
  otpStorage,
  otpAttempts
}