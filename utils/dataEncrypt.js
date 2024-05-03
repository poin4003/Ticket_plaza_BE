const qr = require('qrcode')
const JWT = require('jsonwebtoken')
const { JWT_SECRET } = require('../configs')

const encodedToken = (userID) => {
  return JWT.sign({
    iss: "PcHuy",
    sub: userID,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 100)
  }, JWT_SECRET)
}

const generateQR = async (billId) => {
  try {
    const qrDataURL = await qr.toDataURL(billId)
    //const qrBuffer = Buffer.from(qrDataURL.split(',')[1], 'base64')
    return qrDataURL
  } catch (error) {
    throw new Error('Không thể tạo mã QR')
  }
}

module.exports = {
  encodedToken,
  generateQR
}