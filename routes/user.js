// Import module for user route
const express = require('express')                  // Module for Api handler
const session = require('express-session')          // Module for Authenticate session
const router = require('express-promise-router')()  // Module for router
const mongoose = require('mongoose')                // Module for Mongodb database

// Import models
const User = require('../models/User')

// Import controllers
const UserController = require('../controllers/user')  // User controller

// Import helper
const { validateBody, validateParam, schemas } = require('../helper/routerHelper')

// Import passport
const passport = require('passport')
const passportConfig = require('../middlewares/passport')

// Config passport
passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
  try {
    // console.log(id)
    const user = await User.find({ authGoogleID: id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

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

router.route('/auth/google')
  .get(passport.authenticate('google', { scope: ['email', 'profile'] }))

router.route('/auth/google/callback')
  .get(passport.authenticate('google', { failureRedirect: '/login' }),
  UserController.authGoogle)

router.route('/logout')
  .get((req, res) => {
    req.logout(() => {
      req.session.destroy(() => {
        res.send('Goodbye!')
      })
    })
  })

router.route('/:userID')  // Route for User
  .get(passport.authenticate('jwt', { session: false}),
    validateParam(schemas.idSchema, 'userID'), 
    UserController.getUserById)
  .patch(passport.authenticate('jwt', {session: false}),
    validateParam(schemas.idSchema, 'userID'), 
    validateBody(schemas.userOptionalSchema), 
    UserController.updateUserById)


// Export module
module.exports = router