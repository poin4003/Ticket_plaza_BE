const fs = require('fs')                        // Module for file handler
const multer = require('multer')                // Module for API file handler
const path = require('path')                    

const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

// Middleware upload
const upload = multer({ storage: storage })

// Middleware for saving file and send respone
const processUpload = (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      next(err)
    } else if (err) {
      next(err)
    } else {
      next()
    }
  })
}

// Export modules
module.exports = {
  processUpload
}