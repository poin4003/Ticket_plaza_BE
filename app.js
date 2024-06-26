// Config environment
require('dotenv').config()    // Module for config environment

// Import modules for product
const express = require('express')              // Module for Api handler
const logger = require('morgan')                // Module for logger
const session = require("express-session")      // Module for session handler
const passport = require("passport")            // Module for authenticate supporter
const mongoClient = require('mongoose')         // Module for database
const bodyParser = require('body-parser')       // Module for body handler
const secureApp = require('helmet')             // Module for security
const cors = require('cors')                    // Module for CORS
const http = require('http')

// Import environment files
const usersRoute = require('./routes/user')                    // Import user's route configs
const eventRoute = require('./routes/event')                   // Import event's route configs
const eventTypeRoute = require('./routes/eventType')           // Import eventType's route configs
const ticketRoute = require('./routes/ticket')                 // Import ticket's route configs
const billRoute = require('./routes/bill')                     // Import bill's route configs
const feetbackRoute = require('./routes/feetback')             // Import feetback's route configs
const passportSetup = require("./middlewares/passport")        // Import passport setup file
const cloudinary = require('./middlewares/cloudinary')         // Import cloudinary setup file
const { MONGODB_CONNECTION_STRING, CLIENT_ENDPOINT } = require('./configs')     // Import environment value setup

// Setup connect mongodb by mongoose
const dbUrl = MONGODB_CONNECTION_STRING

mongoClient.connect(dbUrl).then(() => {
  console.info('\x1b[32mSUCCESS:\x1b[0m Connected to \x1b[36mMongoDB\x1b[0m')
}).catch((error) => {
  console.error('\x1b[31mFAILED:\x1b[0m Can\'t connect to MongoDB: ', error)
})

// Setup Express
const app = express()
app.use(secureApp())    // Update security option for express

const sessionMiddleware = session({
  secret: 'secret', // Change this to a more secure secret
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to true if your server is using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // Corrected maxAge value (in milliseconds)
  }
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Middlewares
app.use(logger('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(cors({
//   origin: CLIENT_ENDPOINT,
//   methods: "GET,POST,PUT,DELETE,PATCH",
//   credentials: true
// }))

var corsOptionsDelegate = function (req, callback) {
  var corsOptions = { origin: true };
  callback(null, corsOptions);
}

app.use(cors(corsOptionsDelegate))

// Routes
app.get('/', (req, res, next) => {  // Test route
  return res.status(200).json({
    message: 'Server is OK!'
  }) 
})

app.use('/users', usersRoute)           // Navigate to usersRoute
app.use('/events', eventRoute)          // Navigate to eventRoute
app.use('/eventTypes', eventTypeRoute)  // Navigate to eventTypeRoute
app.use('/tickets', ticketRoute)        // Navigate to ticketRoute
app.use('/bills', billRoute)            // Navigate to billRoute
app.use('/feetbacks', feetbackRoute)     // Navigate to feetbackRoute

// Error handler function
app.use((err, req, res, next) => {
  const error = app.get('env') === 'development' ? err : {}
  const status = err.status || 500

  // Respone to Client
  return res.status(status).json({
    error: {
      code: status,
      message: error.message
    }
  })
})

// Start the server
const port = app.get('port') || 8000
const host = '0.0.0.0'
app.listen(port, host,() => console.log(`Server is listening on port \x1b[36m${port}\x1b[0m`))