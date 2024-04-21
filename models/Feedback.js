// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const FeetbackSchema = new Schema({
  billId: {
    type: Schema.Types.ObjectId,
    ref: 'Bill'
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  rate: {
    type: Number
  },
  context: {
    type: String
  },
  status: {
    type: Number,
    default: 0
  }
})

// Export Feedback model
const Feedback = mongoose.model('Feedback', FeetbackSchema)
module.exports = Feedback