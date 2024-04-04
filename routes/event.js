// Import module for user route
const express = require('express')                  // Module for Api handler
const router = require('express-promise-router')()  // Module for router

// Import controllers
const EventController = require('../controllers/event')  // User controller

// Import helper
const { validateBody, validateParam, schemas } = require('../helper/routerHelper')

// Import passport
const passport = require('passport')
const passportConfig = require('../middlewares/passport')

// Routes
router.route('/')
  .get(passport.authenticate('jwt', { session: false }), 
    EventController.getEvents)
  .post(passport.authenticate('jwt', { session: false }),  
    validateBody(schemas.eventSchema), 
    EventController.createNewEvent)

router.route('/udpateEventById/:eventID')
  .patch(passport.authenticate('jwt', {session: false }), 
    validateParam(schemas.idSchema, 'eventID'), 
    validateBody(schemas.eventOptionalSchema), 
    EventController.updateEventById)



// Export module
module.exports = router