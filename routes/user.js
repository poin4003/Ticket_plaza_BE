// Import module for user route
const express = require('express')                  // Module for Api handler
const router = require('express-promise-router')()  // Module for router

// Import controllers
const UserController = require('../controllers/user')  // User controller

// Import helper
const { validateBody, validateParam, schemas } = require('../helper/routerHelper')

// Import passport
const passport = require('passport')
const passportConfig = require('../middlewares/passport')

// Routes

router.route('/signup')  // Route for create account
  .post(validateBody(schemas.authSignUpSchema), UserController.signUp)

router.route('/login')   // Route for login
  .post(validateBody(schemas.authSignInSchema), passport.authenticate('local', { session: false}), UserController.signIn)

router.route('/auth/google')
  .post(passport.authenticate('google-plus-token', { session: false }), UserController.authGoogle)

router.route('/')    // Route for create user with only fullname and email
  .get(UserController.index)
  .post(validateBody(schemas.userSchema), UserController.newUser)

router.route('/:userID')  // Route for User
  .get(passport.authenticate('jwt', { session: false }),validateParam(schemas.idSchema, 'userID'), UserController.getUser)
  .put(passport.authenticate('jwt', { session: false }),validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userSchema), UserController.replaceUser)
  .patch(passport.authenticate('jwt', {session: false}),validateParam(schemas.idSchema, 'userID'), validateBody(schemas.userOptionalSchema), UserController.updateUser)


// Export module
module.exports = router