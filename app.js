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
const path = require('path')
const fs = require('fs')

// Import environment files
const usersRoute = require('./routes/user')            // Import user's route configs
const eventRoute = require('./routes/event')           // Import event's route configs
const eventTypeRoute = require('./routes/eventType')   // Import eventType's route configs
const ticketRoute = require('./routes/ticket')         // Import ticket's route configs
const billRoute = require('./routes/bill')             // Import bill's route configs
const feetbackRoute = require('./routes/feetback')     // Import feetback's route configs
const passportSetup = require("./middlewares/passport")// Import passport setup file

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
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE,PATCH",
  credentials: true
}))
app.use(express.static("./images"))

// Routes
app.get('/', (req, res, next) => {  // Test route
  return res.status(200).json({
    message: 'Server is OK!'
  })
  //res.send('<a href="users/auth/google">Authenticate with Google</a>')
})

app.use('/users', usersRoute)           // Navigate to usersRoute
app.use('/events', eventRoute)          // Navigate to eventRoute
app.use('/eventTypes', eventTypeRoute)  // Navigate to eventTypeRoute
app.use('/tickets', ticketRoute)        // Navigate to ticketRoute
app.use('/bills', billRoute)            // Navigate to billRoute
app.use('/feetback', feetbackRoute)     // Navigate to feetbackRoute

app.get('/getImage/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'Images', imageName);

  // Kiểm tra xem file có tồn tại không
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ message: 'Không tìm thấy ảnh' });
  }

  // Đọc dữ liệu từ file và gửi lại
  fs.readFile(imagePath, (err, data) => {
    if (err) {
      console.error('Lỗi khi đọc file ảnh:', err);
      return res.status(500).json({ message: 'Đã xảy ra lỗi khi đọc ảnh' });
    }

    // Set header và gửi dữ liệu về client
    res.set('Content-Type', 'image/jpeg');
    res.send(data);
  });
});

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