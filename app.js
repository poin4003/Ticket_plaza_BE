// Config environment
require('dotenv').config()    // Module for config environment

// Import modules for product
const express = require('express')         // Module for Api handler
const session = require('express-session') // Module for Api handler
const passport = require('passport')       // Module for Authenticate handler
const logger = require('morgan')           // Module for logger
const mongoClient = require('mongoose')    // Module for database
const bodyParser = require('body-parser')  // Module for body handler
const secureApp = require('helmet')        // Module for security
const cors = require('cors')               // Module for CORS

// Import environment files
const usersRoute = require('./routes/user')          // Import user's route configs
const eventRoute = require('./routes/event')         // Import event's route configs
const eventTypeRoute = require('./routes/eventType') // Import eventType's route configs

const passportauth = require('./middlewares/passport')

// Setup connect mongodb by mongoose
const dbUrl = `mongodb+srv://PcHuy:ctjerXC3Id87y0oH@cluster0.idi4juk.mongodb.net/TicketPlaza?retryWrites=true&w=majority&appName=Cluster0`;

mongoClient.connect(dbUrl).then(() => {
  console.info('\x1b[32mSUCCESS:\x1b[0m Connected to \x1b[36mMongoDB\x1b[0m')
}).catch((error) => {
  console.error('\x1b[31mFAILED:\x1b[0m Can\'t connect to MongoDB: ', error)
})

// Setup Express
const app = express()
app.use(secureApp())    // Update security option for express

app.use(session({ secret: "cats "}))
app.use(passport.initialize())
app.use(passport.session())

// Middlewares
app.use(logger('dev'))
app.use(bodyParser.json())

const corsOption = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.use(cors(corsOption))

// Routes
app.get('/', (req, res, next) => {  // Test route
  return res.status(200).json({
    message: 'Server is OK!'
  })
  //res.send('<a href="users/auth/google">Authenticate with Google</a>')
})

app.use('/users', usersRoute)           // Navigate to usersRoute
app.use('/events', eventRoute)          // Navigate to eventRoute
app.use('/eventTypes', eventTypeRoute)  // Naviaget to eventTypeRoute


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
app.listen(port, () => console.log(`Server is listening on port \x1b[36m${port}\x1b[0m`))