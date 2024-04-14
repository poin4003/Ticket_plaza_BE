const { momo } = require('../configs')     // Import environment value setup
const crypto = require('crypto')
const express = require('express')
const https = require('https')

const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

const createRequestBody = (billIdParam, orderInfoParam, amountParam) => {
  console.log(orderInfoParam);
  console.log(amountParam);
  var partnerCode = momo.PARTNER_CODE
  var accessKey = momo.ACCESS_KEY
  var secretKey = momo.SECRET_KEY
  var requestId = partnerCode + new Date().getTime() + "." + billIdParam
  var orderId = requestId
  var orderInfo = orderInfoParam
  var redirectUrl = momo.REDIRECT_URL
  var ipnUrl = momo.IPN_URL
  var amount = amountParam
  var requestType = "captureWallet"
  var extraData = ""

  var rawSignature = "accessKey=" + accessKey + 
    "&amount=" + amount + "&extraData=" + extraData +
    "&ipnUrl=" + ipnUrl + "&orderId=" + orderId +
    "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode +
    "&redirectUrl=" + redirectUrl + "&requestId=" + requestId +
    "&requestType=" + requestType 

  // console.log(rawSignature)

  var signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex')

  // console.log(signature)

  return JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: 'en'
  })
}

const sendRequest = (requestBody, callback) => {
  const option = {
    hostname: momo.ENDPOINT_HOST,
    port: 443,
    path: momo.ENDPOINT_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  }  

  const req = https.request(option, res => {
    let responseData = ''
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      // console.log('Received data chunk: ', chunk);
      responseData += chunk
    })
    res.on('end', () => {
      console.log('No more data in respone.')
      callback(null, responseData)
    })
  })

  req.on('error', (error) => {
    callback(error, null)
  })

  console.log("Sending request....")
  req.write(requestBody)
  req.end()
}

const paidByMomo = (req, res, next) => {
  console.log(req.body);
  // const { billId, orderInfo, amount } = req.query
  const billId = req.body.billId
  const orderInfo = req.body.orderInfo 
  const amount = req.body.amount
  if (!billId && !orderInfo && !amount) return sendRespone(res, { data: [] }, "Thiếu thông tin!")
  const requestBody = createRequestBody(billId, orderInfo, amount)
  sendRequest(requestBody, (error, responseData) => {
    if (error) {
      console.error(`Problem with request: ${error.message}`)
      next(error)
    } else {
      try {
        if (error) throw error 
        else {
          const parsedData = JSON.parse(responseData)
          if (parsedData.payUrl) {
            console.log(parsedData.payUrl);
            req.body.payUrl = parsedData.payUrl
            next()
          } else {
            const error = new Error('No payUrl found in response')
            throw error
          }
        }
      } catch (error) {
        next(error)
      }
    }
  })
}

const redirectFunction = (req, res, next) => {
  const payUrl = req.body.payUrl
  if (!payUrl) {
    return sendRespone(res, { data: [] }, "Không thể tạo link thanh toán Momo!")
  }
  res.redirect(payUrl)
}

module.exports = { paidByMomo, redirectFunction }