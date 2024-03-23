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
router.route('/')
  .get(UserController.index)

router.route('/signup')  // Route for create account
  .post(validateBody(schemas.authSignUpSchema), 
    UserController.signUp)

router.route('/login')   // Route for login
  .post(passport.authenticate('local', { session: false}), 
    validateBody(schemas.authSignInSchema), 
    UserController.signIn)

router.route('/auth/google')
  .post(passport.authenticate('google-plus-token', { session: false }), 
    UserController.authGoogle)

router.route('/superAdmin')    // Route for superadmin
  .get(passport.authenticate('jwt', { session: false}), 
    UserController.getAllAdmin)
  .post(validateBody(schemas.adminSchema), 
    UserController.newAdmin)

router.route('/:userID')  // Route for User
  .get(passport.authenticate('jwt', { session: false}),
    validateParam(schemas.idSchema, 'userID'), 
    UserController.getUser)
  .patch(passport.authenticate('jwt', {session: false}),
    validateParam(schemas.idSchema, 'userID'), 
    validateBody(schemas.userOptionalSchema), 
    UserController.updateUser)


// Export module
module.exports = router