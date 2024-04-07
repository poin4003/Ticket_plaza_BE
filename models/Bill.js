// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const BillSchema = new Schema({
  date: {
    type: Date 
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  ticketsId: [{
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
const Bill = mongoose.model('Bill', BillSchema)
module.exports = Bill