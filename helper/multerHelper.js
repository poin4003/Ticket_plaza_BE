const fs = require('fs')                        // Module for file handler
const multer = require('multer')                // Module for API file handler
const path = require('path')                    

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images')
  },
  filename: (req, file, cb) => {
    return cb(null, Date.now() + path.extname(file.originalname))
  }
})

// Middleware upload
const uploadImage = multer({ storage: storage })

const upload = multer()

const processUpload = (req, res, next) => {
  uploadImage.single('photo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      next(err)
    } else if (err) {
      next(err)
    } else {
      console.log(req.file);
      if (req.file) req.body.photo = req.file.filename
      next()
    }
  });
};


// Export modules
module.exports = {
  upload,
  uploadImage,
  processUpload
}