const { cloudinarySetup } = require('../configs')     // Import environment value setup
const cloudinary = require('cloudinary').v2          // Import cloud API

cloudinary.config({
  cloud_name: cloudinarySetup.CLOUD_NAME,
  api_key: cloudinarySetup.API_KEY,
  api_secret: cloudinarySetup.API_SECRET
})

// Respone function
const sendRespone = (res, data, message, status = 201, pagination = {}) =>{
  return res.status(status).json({
    data: [ data ],
    pagination,
    message
  })
}

const uploadImageToCloud = async (req, res, next) => {
  try { 
    const fileStr = req.body.photo
    
    // console.log(req.body);

    if (!fileStr) return sendRespone(res, { data: [] }, "Không tìm thấy ảnh!")

    const uploadedRespone = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'dev_setup'
    })
    
    req.body.photo = uploadedRespone.url
    
    // console.log(req.body.photo);

    next()
  } catch (error) {
    next(error)
  }
}

const uploadImageToCloudOptional = async (req, res, next) => {
  try { 
    const fileStr = req.body.photo 
    
    // console.log(req.body);

    if (!fileStr) return next()

    const uploadedRespone = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'dev_setup'
    })
    
    req.body.photo = uploadedRespone.url
  
    // console.log(req.body.photo);

    next()
  } catch (error) {
    next(error)
  }
}

const uploadQRCode = async (fileStr) => {
  try {
    const uploadedRespone = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'dev_setup'
    });
    
    return uploadedRespone.url
  } catch (error) {
    console.error(error);
    return ""
  }
}

module.exports = { cloudinary, uploadImageToCloud, uploadImageToCloudOptional, uploadQRCode }