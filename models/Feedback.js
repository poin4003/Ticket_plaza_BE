// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Bill = require('./Bill')
const Schema = mongoose.Schema 

const FeetbackSchema = new Schema({
  billId: {
    type: Schema.Types.ObjectId,
    ref: Bill
  },
  eventId: {
    type: String
  },
  rate: {
    type: Number
  },
  context: {
    type: String
  },
  photos: [{
    type: String
  }]
})

// Export Feedback model
const Feedback = mongoose.model('Feedback', FeetbackSchema)
module.exports = Feedback