// Import module for ticket route
const express = require('express')               // Module for Api handler
const router = require('express-promise-router')() // Module for router

// Import controllers
const TicketController = require('../controllers/ticket')

// Import helper
const { validateBody, schemas } = require('../helper/routerHelper')

// Import passport
const passport = require('passport')
const passportConfig = require('../middlewares/passport')

// Routes
router.route('/')
  .get(TicketController.getTickets)
  .post(passport.authenticate('jwt', { session: false }),
    validateBody(schemas.ticketSchema),
    TicketController.createTicket)

module.exports = router