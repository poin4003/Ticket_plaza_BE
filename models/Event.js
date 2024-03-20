// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const EventSchema = new Schema({
  name: {
    type: String
  },
  host: {
    type: String
  },
  members: [{
    type: String
  }],
  description: {
    type: String
  },
  photos: {
    type: String
  },
  type: {
    type: String
  },
  time: {
    type: String
  },
  date: {
    type: String
  },
  tickets_id: [{
    type: String
  }],
  successBill_id: [{
    type: String
  }],
  status: {
    type: Number
  },
  views: {
    type: Number
  },
  profit: {
    type: String
  },
  feedback_id: [{
    type: String
  }],
  maxTicketPerBill: {
    type: Number
  }
})

// Export Event model
const Event = mongoose.model('Event', EventSchema)
module.exports = Event