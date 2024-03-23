// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const EventSchema = new Schema({
  name: {
    type: String
  },
  host: {
    type: Schema.Types.ObjectId
  },
  members: [{
    type: Schema.Types.ObjectId
  }],
  description: {
    type: String
  },
  photo: {
    type: String
  },
  type: {
    type: String,
    enum: ["music", "workshop", "concert", "exhibit", "orther"],
    default: "orther"
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