// Config environment
require('dotenv').config()    // Module for config environment

// Import modules for product
const express = require('express')         // Module for Api handler
const logger = require('morgan')           // Module for logger
const mongoClient = require('mongoose')    // Module for database
const bodyParser = require('body-parser')  // Module for body handler
const secureApp = require('helmet')        // Module for security

// Import environment files
const usersRoute = require('./routes/user')

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

// Middlewares
app.use(logger('dev'))
app.use(bodyParser.json())

// Routes
app.get('/', (req, res, next) => {  // Test route
  return res.status(200).json({
    message: 'Server is OK!'
  })
})

app.use('/users', usersRoute)  // Navigate to usersRoute

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