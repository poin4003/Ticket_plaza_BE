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
    exp: new Date().setDate(new Date().getDate() + 3)
  }, JWT_SECRET)
}

// Controller for Authentication
const signIn = async (req, res, next) => {           // LogIn (post)
  const token = encodedToken(req.user._id)
  res.setHeader('Authorization', token)
  return res.status(200).json({ success: true })
}

const signUp = async (req, res, next) => {           // SignUp (post)
  const { fullName, email, phone, birthDay, password } = req.value.body

  // Check if there is a user with the same user
  const foundUser = await User.findOne({ email })
  if (foundUser) return res.status(403).json({ 
    error: { message: "Email is already in use." }
  })

  // Create a new user
  const newUser = new User({ fullName, email, phone, birthDay, password})
  newUser.save()
  
  // Encode a token
  const token = encodedToken(newUser._id)

  res.setHeader('Authorization', token)
  return res.status(201).json({ success: true })
}

const authGoogle = async (req, res, next) => {       // Login with google api
  const token = encodedToken(req.user._id)
  res.setHeader('Authorization', token)
  return res.status(200).json({ success: true})
}

// Controller for testing
const index = async (req, res, next) => {     // Get all users
  const user = await User.find({})
  return res.status(200).json({ user })
}

const newUser = async (req, res, next) => {   // Create user with fullname and email only
  const newUser = new User(req.body)

  await newUser.save()

  return res.status(201).json({ user: newUser })
}

// Controller for User handling
const getUser = async (req, res, next) => {      // Get user by id (get)
  const { userID } = req.value.params

  const user = await User.findById(userID)

  return res.status(200).json({ user })
}

const replaceUser = async (req, res, next) => {  //  Replace user by id (put)
  const { userID } = req.value.params

  const newUser = req.value.body
  
  await User.findByIdAndUpdate(userID, newUser)

  return res.status(200).json({ success: true })
}

const updateUser = async (req, res, next) => {   // Update user by id (patch)
  const { userID } = req.value.params

  const newUser = req.value.body

  await User.findByIdAndUpdate(userID, newUser)

  return res.status(200).json({ success: true })
}

// Export controllers
module.exports = {
  index,
  newUser, 
  getUser,
  replaceUser,
  updateUser,
  signIn,
  signUp,
  authGoogle
}