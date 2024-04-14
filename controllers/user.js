// Import module for user controller
const nodemailer = require('nodemailer')
const User = require('../models/User')
const JWT = require('jsonwebtoken')
const bcrypt = require('bcryptjs')                            // Module for hash password handling


// Config JsonWebToken
const { JWT_SECRET, ticketPlazaEmailAccount, CLIENT_ENDPOINT } = require('../configs')

const encodedToken = (userID) => {
  return JWT.sign({
    iss: "PcHuy",
    sub: userID,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 100)
  }, JWT_SECRET)
}

// Nodemailer transporter configs
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: ticketPlazaEmailAccount.USERNAME,
    pass: ticketPlazaEmailAccount.PASSWORD
  }
})

// Temporary storage for OTP
const otpStorage = {}
let otpAttempts = {}

// Supporting function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

const generateAndSendOTP = async (email) => {
  try {
    const OTP = Math.floor(1000 + Math.random() * 9000)
    const expirationTime = Date.now() + (5 * 60 * 1000)
    otpStorage[email] = { OTP, expirationTime }
    // console.log(otpStorage[email].OTP);
    // console.log(otpStorage[email].expirationTime);

    const mailOptions = {
      from: 'ticketplaza1000@gmail.com',
      to: email,
      subject: 'OTP for password reset',
      text: `Your OTP is: ${OTP}\nPlease request in 5 minutes`
    }

    await transporter.sendMail(mailOptions)

    return OTP
  } catch (error) {
    console.log(error)
  }
}

// Controller for Authentication
const signIn = async (req, res, next) => {           // LogIn (post)
  const token = encodedToken(req.user._id)
  const user = req.user.toObject()
  delete user.password

  res.setHeader('Authorization', token)
  return sendRespone(res, { data: user, token}, "Đăng nhập thành công!")
}

const signUp = async (req, res, next) => {           // SignUp (post)
  const { fullName, email, phone, birthDay, password } = req.value.body

  try {
    // Check if there is a user with the same user
    const foundUser = await User.findOne({ email })
    if (foundUser) return sendRespone(res, { data: []}, "Email đã được sử dụng!")

    // Create a new user
    const newUser = new User({ fullName, email, phone, birthDay, password, type: 0})
    newUser.save()
    
    // Encode a token
    const token = encodedToken(newUser._id)

    const user = newUser.toObject()
    delete user.password

    res.setHeader('Authorization', token)
    return sendRespone(res, { data: user, token }, "Tạo tài khoản thành công!") 
  } catch (error) {
    next(error)
  }
}

const authGoogle = async (req, res, next) => {       // Login with google api
  try {
    let data = {
      data: [{
        data: []
      }],
      pagination: {},
      message: "Tài khoản đã được tạo trên máy chủ, hãy đăng nhập bằng các ô thông tin thay vì google!"
    }

    const foundUserLocal = await User.findOne({ email: req.user.emails[0].value, authType: "local" })

    if (foundUserLocal) return res.redirect(`${CLIENT_ENDPOINT}/login?data=${encodeURIComponent(JSON.stringify(data))}`);
    
    let foundUserGoogle = await User.findOne({ authGoogleID: req.user.id, authType: "google" })

    if (!foundUserGoogle) {
      foundUserGoogle = new User({
        type: 0,
        authType: 'google',
        authGoogleID: req.user.id,
        email: req.user.emails[0].value,
        fullName: req.user.displayName
      })
      await foundUserGoogle.save()
    }

    const token = encodedToken(foundUserGoogle._id);
    res.setHeader('Authorization', token)

    data = {
      data: [{
        data: foundUserGoogle,
        token: token
      }],
      pagination: {},
      message: "Đăng nhập với Google thành công!"
    }
    
    res.redirect(`${CLIENT_ENDPOINT}/login?data=${encodeURIComponent(JSON.stringify(data))}`);
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  const { email } = req.query

  try {
    if (!email) {
      return sendRespone(res, { data: [] }, "Email chưa được cung cấp!")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return sendRespone(res, { data: [] }, "Email không hợp lệ!")
    }

    const query = {} 
    query.email = { $regex: new RegExp(email, 'i') }
    
    const user = await User.findOne(query)

    if (!user) {
      return sendRespone(res, { data: [] }, "Không thể tìm thấy email!")
    }

    const OTP = await generateAndSendOTP(email)
    
    return sendRespone(res, { data: user, status: true}, "Gửi email thành công!")
  } catch (error) {
    next(error)
  }
}

// Controller for Verifying OTP
const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.query;

  try {
    if (!email || !otp) {
      return sendRespone(res, { data: [] }, "Email hoặc otp chưa được nhập!")
    }
    
    const storedOTP = otpStorage[email]

    const currentTime = Date.now()
    
    if (currentTime > storedOTP.expirationTime) return sendRespone(res, { data: [], status: 3 }, "Mã OTP đã hết hạn!")

    if (!storedOTP || parseInt(storedOTP.OTP) !== parseInt(otp)) {
      otpAttempts[email] = (otpAttempts[email] || 0) + 1
      if (otpAttempts[email] >= 3) {
        const newOTP = generateAndSendOTP(email)
        return sendRespone(res, { data: [], status: 2 }, "Nhập sai quá 3 lần. OTP mới đã được gửi lại tới email của bạn!")
      } else {
        console.log(otp);
        console.log(storedOTP);
        return sendRespone(res, { data: [], remainingAttempts: 3 - otpAttempts[email], status: 1 }, "Mã OTP không chính xác. Vui lòng nhập lại!")
      }
    }

    delete otpAttempts[email]
    delete otpStorage[email]
    return sendRespone(res, { data: [], status: 0 }, "Xác thực OTP thành công!")
  } catch (error) {
    next(error)
  }
}

// Controller for user
const getUsers = async (req, res, next) => {
  let { page, limit, userId, type, justAdmin, status, fullName, email, phone, identityID } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  
  const skip = (page - 1) * limit

  try {
    const query = {}

    if (userId) query._id = userId
    if (fullName) query.fullName = { $regex: new RegExp(fullName, 'i') }
    if (email) query.email = { $regex: new RegExp(email, 'i') }
    if (phone) query.phone = { $regex: phone }
    if (identityID) query.identityID = { $regex: identityID }
    if (type) query.type = { $in: [parseInt(type)] }
    if (justAdmin) query.type = { $in: [1, 2] }
    if (status) query.status = status

    const users = await User.find(query).skip(skip).limit(limit).select("-password -authGoogleID")

    if (users.length === 0) return sendRespone(res, { data: [] }, "Không thể tìm thấy người dùng!")

    const totalUsers = await User.countDocuments(query)
    const totalPages = Math.ceil(totalUsers / limit)

    const pagination = {
      totalItems: totalUsers,
      currentPage: page,
      totalPages: totalPages
    }
    return sendRespone(res, { data: users }, `${totalUsers} người dùng đã được tìm thấy`,
    201, pagination)
  } catch (error) {
    next(error)
  }
}

const createNewUser = async (req, res, next) => {   // Create user
  const newUser = new User(req.value.body)

  if (newUser.type === undefined) newUser.type = 1;

  await newUser.save()

  const user = newUser.toObject()
  delete user.password

  return sendRespone(res, { data: user }, "Tạo người dùng mới thành công!")
}

const updateUserById = async (req, res, next) => {   // Update user by id (patch)
  const { userId } = req.query

  try {
    const foundUser = await User.findById(userId).select("-password -authGoogleID")

    if (!foundUser) return sendRespone(res, { data: [] }, "Không thể tìm thấy tài khoản người dùng!")

    const newUser = req.value.body

    const updateCustomer = await User.findByIdAndUpdate(userId, newUser)

    return sendRespone(res, { data: newUser }, "Cập nhật thông tin người dùng thành công!")
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req, res, next) => {
  const { email, password } = req.value.body

  try {
    const foundUser = await User.findOne({ email: email }).select("_id email password")

    if (!foundUser) return sendRespone(res, { data: [] }, "Không thể tìm thấy tài khoản người dùng!")
    // if (foundUser.authType === "google") return sendRespone(res, { data: [] }, "Không thể đổi mật khẩu tài khoản đã đăng nhập bằng google!")

    const salt = await bcrypt.genSalt(10)
    const passwordHashed = await bcrypt.hash(password, salt)

    foundUser.password = passwordHashed
    await foundUser.save()

    console.log(foundUser.password);
    console.log(password);
    const token = encodedToken(foundUser._id)
    res.setHeader('Authorization', token)

    return sendRespone(res, { data: foundUser, token }, "Đổi mật khẩu thành công!")
  } catch (error) {
    next(error)
  }
}

const deactivateAccount = async (req, res, next) => {     // Deactivating account by id
  let { userId, email } = req.query

  try {
    const query = {}

    if (userId) query._id = userId
    if (email) query.email = email

    const foundUser = await User.findOne(query)

    if (!foundUser) return sendRespone(res, { data: [] }, "Không thể tìm thấy tài khoản người dùng!") 
     
    foundUser.status = 1
    await foundUser.save()

    return sendRespone(res, { data: foundUser }, "Khóa tài khoản thành công!")
  } catch (error) {
    next(error)
  }
}

const activateAccount = async (req, res, next) => {     // Activating account by id
  let { userId, email } = req.query

  try {
    const query = {}

    if (userId) query._id = userId
    if (email) query.email = email

    const foundUser = await User.findOne(query)

    if (!foundUser) return sendRespone(res, { data: [] }, "Không thể tìm thấy tài khoản người dùng!")
    
    foundUser.status = 0
    await foundUser.save()

    return sendRespone(res, { data: foundUser }, "Mở khóa tìa khoản thành công!")
  } catch (error) {
    next(error)
  }
}

// Export controllers
module.exports = {
  signIn,
  signUp,
  authGoogle,
  forgotPassword,
  verifyOTP,
  getUsers,
  createNewUser,
  changePassword,
  updateUserById,
  deactivateAccount,
  activateAccount
}