// Import modules for decode support
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth2').Strategy
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

    if (!user) 
      return done({ message: "Lỗi xác thực, token không hợp lệ!" }, false)

    done(null, user)
  } catch (error) {
    done({ code: error.code, message: error.message }, false) 
  }
}))

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

passport.use(new GoogleStrategy({
  clientID: auth.google.CLIENT_ID,
  clientSecret: auth.google.CLIENT_SECRET, 
  callbackURL: "http://localhost:8000/users/auth/google/callback",
  passReqToCallback: true
}, (request, accessToken, refreshToken, profile, done) => {
  done(null, profile)
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
        if (!user) 
        return done({ message: "Lỗi xác thực, tài khoản chưa được tạo!" }, false)

        const isCorrectPassword = await user.isValidPassword(password)

        if (!isCorrectPassword) 
        return done({ message: "Lỗi xác thực, sai mật khẩu!" }, false) 

        done(null, user)
      } catch (error) {
        done({ code: error.code, message: error.message }, false)
      }
    }
  )
)