// Import module for feetback route
const express = require('express')               // Module for Api handler
const router = require('express-promise-router')() // Module for router

// Import controllers
const FeetbackController = require('../controllers/feetback')

// Import helper
const { validateBody, schemas } = require('../helper/routerHelper')

// Import passport
const passport = require('passport')
const passportConfig = require('../middlewares/passport')

// Routes
router.route('/')
  .get(FeetbackController.getFeetbacks)
  .post(passport.authenticate('jwt', { session: false }),
    validateBody(schemas.feetbackSchema),
    FeetbackController.createFeetback)

module.exports = router