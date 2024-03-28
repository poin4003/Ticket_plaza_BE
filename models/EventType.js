// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

// Create schema for users
const EventTypeSchema = new Schema({
  typeId: {
    type: String,
    require: true,
    unique: true
  },
  eventTypeName: {
    type: String,
    require: true
  },
  status: {
    type: Number,
    default: 0
  }
})

// Export User model
const EventType = mongoose.model('EventType', EventTypeSchema)
module.exports = EventType