// Import module for User model
const mongoose = require('mongoose')     // Module for database handling
const Schema = mongoose.Schema 

const TicketSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  name: {
    type: String
  },
  price: {
    type: Number
  },
  description: {
    type: String
  },
  releaseDate: {
    type: String
  },
  expirationDate: {
    type: String
  },
  totalAmount: {
    type: Number
  },
  status: {
    type: Number
  }
})

// Export Ticket model
const Ticket = mongoose.model('Ticket', TicketSchema)
module.exports = Ticket