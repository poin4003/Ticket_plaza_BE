const { cloudinarySetup } = require('../configs')     // Import environment value setup
const cloudinary = require('cloudinary').v2          // Import cloud API

cloudinary.config({
  cloud_name: cloudinarySetup.CLOUD_NAME,
  api_key: cloudinarySetup.API_KEY,
  api_secret: cloudinarySetup.API_SECRET
})



module.exports = { cloudinary }