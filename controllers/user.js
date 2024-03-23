// Import module for user controller
const User = require('../models/User')
const JWT = require('jsonwebtoken')

// Config JsonWebToken
const { JWT_SECRET } = require('../configs')

const encodedToken = (userID) => {
  return JWT.sign({
    iss: "PcHuy",
    sub: userID,
    iat: new Date().getTime(),
    exp: new Date().setDate(new Date().getDate() + 100)
  }, JWT_SECRET)
}

// Controller for Authentication
const signIn = async (req, res, next) => {           // LogIn (post)
  const token = encodedToken(req.user._id)
  const user = req.user
  res.setHeader('Authorization', token)
  return res.status(201).json({ 
    data: [
      { data: user }
    ], 
    paganition: {},
    message: "Đăng nhập thành công!" 
  })
}

const signUp = async (req, res, next) => {           // SignUp (post)
  const { fullName, email, phone, birthDay, password } = req.value.body

  try {
    // Check if there is a user with the same user
    const foundUser = await User.findOne({ email })
    if (foundUser) {
      const error = new Error("Email đã được sử dụng!")
      error.status = 403
      throw error
    }

    // Create a new user
    const newUser = new User({ fullName, email, phone, birthDay, password})
    newUser.save()
    
    // Encode a token
    const token = encodedToken(newUser._id)

    res.setHeader('Authorization', token)
      return res.status(201).json({ 
      data: [
        { data: newUser}
      ], 
      paganition: {},
      message: "Tạo tài khoản mới thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

const authGoogle = async (req, res, next) => {       // Login with google api
  const token = encodedToken(req.user._id)
  const user = req.user
  res.setHeader('Authorization', token)
  return res.status(200).json({
    data: [{ data: user }], 
    paganition: {}, 
    message: "Đăng nhập với Google OAuth thành công!" 
  })
}

// Controller for super admin
const index = async (req, res, next) => {     // Get all users
  const user = await User.find({})
    return res.status(201).json({ 
    data: [
      { data: user }
    ], 
    paganition: {},
    message: "Tất cả người dùng đã được tìm thấy thành công!" 
  })
}

const newAdmin = async (req, res, next) => {   // Create user (admin with status = 1)
  const newAdmin = new User(req.body)

  await newAdmin.save()

  return res.status(201).json({ 
    data: [
      { data: newAdmin }
    ], 
    paganition: {},
    message: "Tạo admin mới thành công!" 
  })
}

const getAllAdmin = async (req, res, next) => {      // Get admins
  const admin = await User.find({ type: 1 })

  return res.status(201).json({ 
    data: [
      { data: admin }
    ], 
    paganition: {},
    message: "Tất cả admin đã được tìm thấy thành công!" 
  })
}


// Controller for User handling
const getUser = async (req, res, next) => {      // Get user by id (get)
  const { userID } = req.value.params

  const user = await User.findById(userID)

  return res.status(200).json({ user })
}

const updateUser = async (req, res, next) => {   // Update user by id (patch)
  const { userID } = req.value.params

  try {
    const foundUser = await User.findById(userID)

    if (!foundUser) {
      const error = new Error("Không thể tìm thấy người dùng!")
      error.status = 404
      throw error 
    }

    const newUser = req.value.body

    const updateUser = await User.findByIdAndUpdate(userID, newUser)

    return res.status(201).json({ 
      data: [
        { data: newUser }
      ], 
      paganition: {},
      message: "Cập nhật thông tin người dùng thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

// Export controllers
module.exports = {
  index,
  newAdmin, 
  getAllAdmin,
  getUser,
  updateUser,
  signIn,
  signUp,
  authGoogle
}