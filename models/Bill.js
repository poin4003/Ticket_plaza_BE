// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const TicketForBillSchema = new Schema({
  ticketId: { type: Schema.Types.ObjectId },
  amount: { type: Number },
  price: { type: Number }
})

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
  tickets: [
    TicketForBillSchema
  ],
  totalPrice: {
    type: Number
  },
  discount: {
    type: Number
  },
  checkoutMethod: {
    type: String
  },
  feetbackStatus: {
    type: Number,
    default: 0
  },
  status: {
    type: Number
  }
})

// Export Bill model
const Bill = mongoose.model('Bill', BillSchema)
module.exports = Bill