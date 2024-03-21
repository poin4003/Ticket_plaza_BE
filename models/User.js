// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const bcrypt = require('bcryptjs')       // Module for hash password handling

// Create schema for users
const UserSchema = new Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String
  },
  birthDay: {
    type: String
  }, 
  password: {
    type: String
  },
  type: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 0
  },
  authType: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  authGoogleID: {
    type: String,
    default: null
  },
  identityID: {
    type: String
  }
})

// Hash password
UserSchema.pre('save', async function (next) {
  try {
    if (this.authType !== 'local') next()

    // Generate a salt
    const salt = await bcrypt.genSalt(10)
    
    // Generate a password hash (salt + hash)
    const passwordHashed = await bcrypt.hash(this.password, salt)

    // Re-assign password hash
    this.password = passwordHashed
    next()
  } catch (error) {
    next(error)
  }
})

// Check password
UserSchema.methods.isValidPassword = async function (newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password)
  } catch (error) {
    throw new Error(error)
  }
}

// Export User model
const User = mongoose.model('User', UserSchema)
module.exports = User