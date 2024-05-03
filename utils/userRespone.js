
const { ticketPlazaEmailAccount } = require('../configs')
const { transporter } = require('./clientRespone')
const { generateQR } = require('./dataEncrypt')
const fs = require('fs')
const handlebars = require('handlebars')
const path = require('path');
const { formatDate, CurrencyDisplay } = require('./htmlRender')

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

const sendBill = async (subject, text, bill) => {
  try {
    const data = bill._id.toString()
    const qrCheckin = await generateQR(data)

    const filePath = path.join(__dirname, 'test.html');

    const htmlSrc = fs.readFileSync(filePath, 'utf8');

    const template = handlebars.compile(htmlSrc);

    const replacement = {
      _id: bill?._id,
      date: formatDate(bill?.date, "DD/MM/YYYY | HH:mm"),
      event: bill?.event,
      fullName: bill?.user?.fullName,
      email: bill?.user?.email,
      checkoutMethod: bill?.checkoutMethod,
      totalMoney: CurrencyDisplay(bill?.totalMoney),
      discount: bill?.discount,
      theMoneyHasToPaid: CurrencyDisplay(bill?.theMoneyHasToPaid),
      tickets: bill?.tickets.map((ticket, index) => ({
        index: index + 2,
        name: ticket?.name,
        price: CurrencyDisplay(ticket?.price),
        amount: ticket?.amount,
        totalMoneyOfTicket: CurrencyDisplay(ticket?.totalMoneyOfTicket)
      }))
    };

    const htmlToSend = template(replacement);

    const mailOption = {
      from: ticketPlazaEmailAccount.USERNAME,
      to: bill?.user?.email,
      subject: subject,
      html: htmlToSend,
      attachments: [{
        filename: "qrCheckin.png",
        content: qrCheckin,
        encoding: 'base64'
      }]
    }

    console.log(mailOption);

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