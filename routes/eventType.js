// Import module for user route
const express = require('express')                  // Module for Api handler
const router = require('express-promise-router')()  // Module for router

// Import controllers
const EventTypeController = require('../controllers/eventType')  // User controller

// Import helper
const { validateBody, validateParam, schemas } = require('../helper/routerHelper')

// Import passport
const passport = require('passport')
const passportConfig = require('../middlewares/passport')

// Routes
router.route('/')
  .get(passport.authenticate('jwt', { session: false }), 
    EventTypeController.getEvents)
  .post(passport.authenticate('jwt', { session: false }),  
    validateBody(schemas.eventTypeSchema), 
    EventTypeController.createEventType)

router.route('/updateEventTypeByID/:eventTypeID')
  .patch(passport.authenticate('jwt', {session: false }), 
    validateParam(schemas.idSchema, 'eventTypeID'), 
    validateBody(schemas.eventTypeOptionalSchema), 
    EventTypeController.updateEventTypeByID)

router.route('/updateEventTypeByTypeID')
  .patch(passport.authenticate('jwt', { session: false }),
    validateBody(schemas.eventTypeOptionalSchema),
    EventTypeController.updateEventTypeByTypeID)

router.route('/deactivateEventTypeByTypeID')
  .patch(passport.authenticate('jwt', { session: false }),
    EventTypeController.deavtivateEventType)

router.route('/activateEventTypeByTypeID')
  .patch(passport.authenticate('jwt', { session: false }),
    EventTypeController.activateEventType)

// Export module
module.exports = router