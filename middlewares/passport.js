// Import modules for decode support
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const LocalStrategy = require('passport-local').Strategy
const GooglePlusTokenStrategy = require('passport-google-plus-token')
const { ExtractJwt } = require('passport-jwt')

// Import configs setup
const { JWT_SECRET, auth } = require('../configs')

// Import models
const User = require('../models/User')

// Passport Jwt
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
  secretOrKey: JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.sub)

    if (!user) return done(null, false)

    done(null, user)
  } catch (error) {
    done(error, false)
  }
}))

// Passport Google
passport.use(new GooglePlusTokenStrategy({
  clientID: auth.google.CLIENT_ID,
  clientSecret: auth.google.CLIENT_SECRET
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check wether this current user exists in out database
    const user = await User.findOne({
      authGoogleID: profile.id,
      authType: "google"
    })

    if (user) return done(null, user)

    // If new account
    const newUser = new User({
      authType: 'google',
      authGoogleID: profile.id,
      email: profile.emails[0].value,
      fullName: profile.name.givenName + " " + profile.name.familyName
    })

    await newUser.save()

    done(null, newUser)
  } catch (error) {
    done(error, false)
  }
}))

// Passport Local
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email })
        if (!user) return done(null, false)

        const isCorrectPassword = await user.isValidPassword(password)

        if (!isCorrectPassword) return done(null, false)

        done(null, user)
      } catch (error) {
        done(error, false)
      }
    }
  )
)