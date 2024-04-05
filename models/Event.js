// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const User = require('./User')
const Schema = mongoose.Schema 

const EventSchema = new Schema({
  name: {
    type: String
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: User
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: User
  }],
  description: {
    type: String
  },
  photo: {
    type: String
  },
  type: {
    type: String,
    default: "other"
  },
  place: {
    type: String,
    dafault: "Viet Nam"
  },
  time: {
    type: String,
    default: "00:00"
  },
  date: {
    type: String,
    default: "0/0/0"
  },
  status: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  profit: {
    type: Number,
    default: 0
  }, 
  maxTicketPerBill: {
    type: Number,
    default: 0
  }
})

// Export Event model
const Event = mongoose.model('Event', EventSchema)
module.exports = Event