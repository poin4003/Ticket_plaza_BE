// Import module for user route
const express = require('express')                  // Module for Api handler
const passport = require('passport')                // Module for authenticate supporter
const router = require('express-promise-router')()  // Module for router
const mongoose = require('mongoose')                // Module for Mongodb database
const { JWT_SECRET, auth } = require('../configs')

// Import models
const User = require('../models/User')

// Import controllers
const UserController = require('../controllers/user')  // User controller

// Import helper
const { validateBody, validateParam, schemas } = require('../helper/routerHelper')

// Routes
router.route('/')
  .get(passport.authenticate('jwt', { session: false }),
    UserController.getUsers)
  .post(validateBody(schemas.userSchema), 
    UserController.createNewUser)

router.route('/getUsersByName')
  .get(passport.authenticate('jwt', { session: false }),
    UserController.getUsersByName)

router.route('/getUsersByEmail')
  .get(passport.authenticate('jwt', { session: false }),
    UserController.getUsersByEmail)

router.route('/getUsersByPhone')
  .get(passport.authenticate('jwt', { session: false }),
    UserController.getUsersByPhone)

router.route('/getUsersByIdentityID')
  .get(passport.authenticate('jwt', { session: false }),
    UserController.getUsersByIdentityId)

router.route('/deactivateAccount/:userID')
  .patch(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'userID'),
    UserController.deactivateAccount)

router.route('/activateAccount/:userID')
  .patch(passport.authenticate('jwt', { session: false }),
    validateParam(schemas.idSchema, 'userID'),
    UserController.activateAccount)

router.route('/signup')  // Route for create account
  .post(validateBody(schemas.authSignUpSchema), 
    UserController.signUp)

router.route('/login')   // Route for login
  .post(passport.authenticate('local', { session: false}), 
    validateBody(schemas.authSignInSchema), 
    UserController.signIn)

router.route('/:userID')  // Route for User
  .get(passport.authenticate('jwt', { session: false}),
    validateParam(schemas.idSchema, 'userID'), 
    UserController.getUserById)
  .patch(passport.authenticate('jwt', {session: false}),
    validateParam(schemas.idSchema, 'userID'), 
    validateBody(schemas.userOptionalSchema), 
    UserController.updateUserById)
  
router.route('/auth/google')
  .get(passport.authenticate('google', { scope: ["profile"] }))

router.route('/auth/google/callback')
  .get(passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }), UserController.authGoogle);

// Export module
module.exports = router