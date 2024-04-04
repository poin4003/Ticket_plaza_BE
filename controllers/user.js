// Import module for user controller
const nodemailer = require('nodemailer')
const User = require('../models/User')
const JWT = require('jsonwebtoken')
const redis = require('redis')

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

// Nodemailer transporter configs
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'gmail',
  auth: {
    user: 'pchuy4003@gmail.com',
    pass: 'nvidiageforce940mx'
  }
})

// Redis databases configs
const client = redis.createClient();

// Controller for Authentication
const signIn = async (req, res, next) => {           // LogIn (post)
  const token = encodedToken(req.user._id)
  const user = req.user.toObject()
  delete user.password

  res.setHeader('Authorization', token)
  return res.status(201).json({ 
    data: [
      { 
        data: user,
        token: token 
      },
    ], 
    pagination: {},
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
    const newUser = new User({ fullName, email, phone, birthDay, password, type: 0})
    newUser.save()
    
    // Encode a token
    const token = encodedToken(newUser._id)

    const user = newUser.toObject()
    delete user.password

    res.setHeader('Authorization', token)
      return res.status(201).json({ 
      data: [
        { 
          data: user,
          token: token
        }
      ], 
      pagination: {},
      message: "Tạo tài khoản mới thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

const authGoogle = async (req, res, next) => {       // Login with google api
  try {
    let user = await User.findOne({ authGoogleID: req.user.id, authType: "google" })

    if (!user) {
      user = new User({
        type: 0,
        authType: 'google',
        authGoogleID: req.user.id,
        email: req.user.emails[0].value,
        fullName: req.user.displayName
      })
      await user.save()
    }

    const token = encodedToken(user._id);
    res.setHeader('Authorization', token)

    const data = {
      data: [{
        data: user,
        token: token
      }],
      pagination: {},
      message: "Đăng nhập với Google thành công!"
    }
    
    res.redirect(`http://localhost:3000/login?data=${encodeURIComponent(JSON.stringify(data))}`);
  } catch (error) {
    next(error)
  }
}

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    let query = {};
    if (email) query = { email: { $regex: email, $options: 'i'} };

    const user = await User.findOne(query);

    if (!user) {
      const error = new Error("Không thể tìm thấy email!");
      error.status = 404;
      throw error;
    }

    const OTP = Math.floor(1000 + Math.random() * 9000);

    const mailOptions = {
      from: 'pchuy4003@gmail.com',
      to: email,
      subject: 'OTP for password reset',
      text: `Your OTP is: ${OTP}`
    };

    await transporter.sendMail(mailOptions);
    return res.status(201).json({ 
      data: { 
        user,
        status: true
      },
      message: 'Đã gửi email!'
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    await client.connect()
    const storedOTP = await client.get(email)

    if (storedOTP === otp) {
      client.del(email);
      res.status(201).json({ 
        data: [
          { 
            data: users,
            status: true
          }
        ], 
        pagination: {},
        message: 'Xác thực người OPT thành công!'
      });
    } else {
      const error = new Error("Lỗi trong quá trình xác thực OPT!");
      error.status = 500;
      throw error;
    }
  } catch (error) {
    next(error);
  }
}


// Controller for user
const getUsers = async (req, res, next) => {
  let { page, limit, userId, type, status, fullName, email, phone, identityID } = req.query
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
    if (status) query.status = status

    const users = await User.find(query).skip(skip).limit(limit).select("-password -authGoogleID")

    // console.log(users)

    if (users.length === 0) {
      const error = new Error("Không thể tìm thấy tài khoản người dùng!")
      error.status = 404
      throw error
    }

    const totalUsers = await User.countDocuments(query)
    const totalPages = Math.ceil(totalUsers / limit)

    return res.status(201).json({
      data: [
        { data: users }
      ],
      pagination: {
        totalItems: totalUsers,
        currentPage: page,
        totalPages: totalPages
      }
    }) 
  } catch (error) {
    next(error)
  }
}

const createNewUser = async (req, res, next) => {   // Create user
  const newUser = new User(req.value.body)

  // console.log(newUser.type)

  if (newUser.type === undefined) newUser.type = 1;

  await newUser.save()

  const user = newUser.toObject()
  delete user.password

  return res.status(201).json({ 
    data: [
      { data: user }
    ], 
    pagination: {},
    message: "Tạo người dùng mới thành công!" 
  })
}

const updateUserById = async (req, res, next) => {   // Update user by id (patch)
  const { userId } = req.query

  try {
    const foundUser = await User.findById(userId).select("-password -authGoogleID")

    if (!foundUser) {
      const error = new Error("Không thể tìm thấy tài khoản người dùng!")
      error.status = 404
      throw error 
    }

    const newUser = req.value.body

    const updateCustomer = await User.findByIdAndUpdate(userId, newUser)

    return res.status(201).json({ 
      data: [
        { data: newUser }
      ], 
      pagination: {},
      message: "Cập nhật thông tin người dùng thành công!" 
    })
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

    if (!foundUser) {
      const error = new Error("Không thể tìm thấy người dùng!")
      error.status = 404
      throw error
    }
    
    foundUser.status = 1
    await foundUser.save()

    return res.status(201).json({ 
      data: [
        { data: { status: foundUser.status } }
      ], 
      pagination: {},
      message: "Khóa tài khoản thành công!" 
    })
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

    if (!foundUser) {
      const error = new Error("Không thể tìm thấy người dùng!")
      error.status = 404
      throw error
    }
    
    foundUser.status = 0
    await foundUser.save()

    return res.status(201).json({ 
      data: [
        { data: { status: foundUser.status } }
      ], 
      pagination: {},
      message: "Mở khóa tài khoản thành công!" 
    })
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
  updateUserById,
  deactivateAccount,
  activateAccount
}