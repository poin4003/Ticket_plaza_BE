// Import module for feetback route
const express = require('express')               // Module for Api handler
const router = require('express-promise-router')() // Module for router

// Import controllers
const FeetbackController = require('../controllers/feetback')

// Import helper
const { validateBody, schemas } = require('../helper/routerHelper')

// Import passport
const passport = require('passport')

// Routes
router.route('/')
  .get(FeetbackController.getFeetbacks)
  .post(passport.authenticate('jwt', { session: false }),
    validateBody(schemas.feetbackSchema),
    FeetbackController.createFeetback)
  .patch(passport.authenticate('jwt', { session: false }),
    validateBody(schemas.feetbackOptionalSchema),
    FeetbackController.updateFeetbacks)



module.exports = router