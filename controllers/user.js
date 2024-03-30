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
    return res.status(201).json({
      data: [{
        data: user,
        token: token
      }],
      pagination: {},
      message: "Đăng nhập với Google thành công!"
    })
  } catch (error) {
    next(error)
  }
}

// Controller for user
const getUsers = async (req, res, next) => {     // Get a users list
  let { page, limit, type, status } = req.query
  limit = parseInt(limit) || 10
  page = parseInt(page) || 1
  if (!type) type = 1
  if (!status) status = undefined

  const skip = (page - 1) * limit;

  try {
    let query = { type: type }

    if (status !== undefined) query.status = status;

    const users = await User.find(query).skip(skip).limit(limit).select("-password -authGoogleID")

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
      },
      message: `${totalUsers} người dùng đã được tìm thấy!` 
    })
  } catch (error) {
    next(error)
  }
}

const getUsersByName = async (req, res, next) => {    // Get a users list by name, type and status
  let { page, limit, type, status, keyword } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  if (!type) type = 1
  if (!status) status = undefined

  const skip = (page - 1) * limit

  try {
    let query = {};
    if (keyword) query = { fullName: { $regex: keyword, $options: 'i'} }
    if (status) query.status = status
    query.type = type
    // console.log(query)

    const users = await User.find(query).skip(skip).limit(limit).select("-password -authGoogleID")

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
      },
      message: `${totalUsers} người dùng được tìm thấy!`
    })
  } catch (error) {
    next(error)
  }
}

const getUsersByEmail = async (req, res, next) => {    // Get a users list by email, type and status
  let { page, limit, type, status, email } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  if (!type) type = 1
  if (!status) status = undefined

  const skip = (page - 1) * limit

  try {
    let query = {};
    if (email) query = { email: { $regex: email, $options: 'i'} }
    if (status) query.status = status
    query.type = type
    // console.log(query)

    const users = await User.find(query).skip(skip).limit(limit).select("-password -authGoogleID")

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
      },
      message: `${totalUsers} người dùng được tìm thấy!`
    })
  } catch (error) {
    next(error)
  }
}

const getUsersByPhone = async (req, res, next) => {    // Get a users list by phone, type and status
  let { page, limit, type, status, phone } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  if (!type) type = 1
  if (!status) status = undefined

  const skip = (page - 1) * limit

  try {
    let query = {};
    if (phone) query = { phone: { $regex: phone } }
    if (status) query.status = status
    query.type = type
    // console.log(query)

    const users = await User.find(query).skip(skip).limit(limit).select("-password -authGoogleID")

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
      },
      message: `${totalUsers} người dùng được tìm thấy!`
    })
  } catch (error) {
    next(error)
  }
}

const getUsersByIdentityId = async (req, res, next) => {    // Get a users list by identityId ,type and status
  let { page, limit, type, status, identityID } = req.query
  page = parseInt(page) || 1
  limit = parseInt(limit) || 10
  if (!type) type = 1
  if (!status) status = undefined

  const skip = (page - 1) * limit

  try {
    let query = {};
    if (identityID) query = { identityID: { $regex: identityID, $options: 'i'} }
    if (status) query.status = status
    query.type = type
    // console.log(query)

    const users = await User.find(query).skip(skip).limit(limit).select("-password -authGoogleID")

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
      },
      message: `${totalUsers} người dùng được tìm thấy!`
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

// Controller for Customer
const getUserById = async (req, res, next) => {      // Get user by id (get)
  const { userID } = req.value.params

  try {
    const user = await User.findById(userID).select("-password -authGoogleID")

    if (!user) {
      const error = new Error("Không thể tìm thấy tài khoản người dùng!")
      error.status = 404
      throw error
    }

    return res.status(201).json({ 
      data: [
        { data: user }
      ], 
      pagination: {},
      message: "Tài khoản đã được tìm thấy!" 
    })
  } catch (error) {
    next(error)
  }
}

const updateUserById = async (req, res, next) => {   // Update user by id (patch)
  const { userID } = req.value.params

  try {
    const foundUser = await User.findById(userID).select("-password -authGoogleID")

    if (!foundUser) {
      const error = new Error("Không thể tìm thấy tài khoản người dùng!")
      error.status = 404
      throw error 
    }

    const newUser = req.value.body

    const updateCustomer = await User.findByIdAndUpdate(userID, newUser)

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
  const { userID } = req.value.params

  try {
    const foundUser = await User.findById(userID)

    if (!foundUser) {
      const error = new Error("Không thể tìm thấy người dùng!")
      error.status = 404
      throw error
    }

    const newUser = req.value.body

    const deactivateUser = await User.findByIdAndUpdate(userID, { status: 1 })

    return res.status(201).json({ 
      data: [
        { data: { status: 1 } }
      ], 
      pagination: {},
      message: "Khóa tài khoản thành công!" 
    })
  } catch (error) {
    next(error)
  }
}

const activateAccount = async (req, res, next) => {     // Activating account by id
  const { userID } = req.value.params

  try {
    const foundUser = await User.findById(userID)

    if (!foundUser) {
      const error = new Error("Không thể tìm thấy người dùng!")
      error.status = 404
      throw error
    }

    const newUser = req.value.body

    const activateUser = await User.findByIdAndUpdate(userID, { status: 0 })

        return res.status(201).json({ 
      data: [
        { data: { status: 0 } }
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
  getUsers,
  getUsersByName,
  getUsersByEmail,
  getUsersByPhone,
  getUsersByIdentityId,
  getUserById,
  createNewUser,
  updateUserById,
  deactivateAccount,
  activateAccount
}