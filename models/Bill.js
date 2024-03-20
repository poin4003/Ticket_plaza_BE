// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const BillSchema = new Schema({
  date: {
    type: String
  },
  user_id: {
    type: String
  },
  event_id: {
    type: String
  },
  tickets_id: [{
    type: String
  }],
  totalPrice: {
    type: Number
  },
  discount: {
    type: Number
  },
  checkoutMethod: {
    type: String
  },
  status: {
    type: Number
  }
})

// Export Bill model
const Bill = mongoose.model('Bill', UserSchema)
module.exports = Bill