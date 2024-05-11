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

// Import cloudinary
const { uploadImageToCloud, uploadImageToCloudOptional } = require('../middlewares/cloudinary')

// Routes
router.route('/')
  .get(EventController.getEvents)
  .post(passport.authenticate('jwt', { session: false }), 
    uploadImageToCloud, 
    validateBody(schemas.eventSchema), 
    EventController.createNewEvent)

router.route('/getEventDetail')
  .get(EventController.getEventDetail)

router.route('/getRevenue')
  .get(passport.authenticate('jwt', { session: false }),
    EventController.getRevenue)

router.route('/getViewList')
  .get(passport.authenticate('jwt', { session: false }),
    EventController.getViewList)

router.route('/updateEvent')
  .patch(passport.authenticate('jwt', {session: false }), 
    uploadImageToCloudOptional,
    validateBody(schemas.eventOptionalSchema), 
    EventController.updateEvent)

router.route('/updateEventProfit')
  .patch(passport.authenticate('jwt', {session: false }),
    EventController.updateEventProfit)
   
router.route('/updateEventView')
  .patch(EventController.updateEventView)

router.route('/deactivateEvent')
  .patch(passport.authenticate('jwt', { session: false }),
    EventController.deactivateEvent)

router.route('/activateEvent')
  .patch(passport.authenticate('jwt', { session: false }),
    EventController.activateEvent)

router.route('/sendEmails')
  .post(passport.authenticate('jwt', { session: false }),
    validateBody(schemas.emailSchema),
    EventController.sendEmails)


// Export module
module.exports = router