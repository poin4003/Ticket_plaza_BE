// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const FeetbackSchema = new Schema({
  user_id: {
    type: String
  },
  event_id: {
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