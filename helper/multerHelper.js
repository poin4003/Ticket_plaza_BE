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
    cb(null, '../images')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

// Middleware upload
const upload = multer({ storage: storage })

// Middleware for saving file and send respone
const processUpload = (req, res, next) => {
  let file = req.file;
  console.log(req.file);
  console.log("Multer helper: ", file);
  if (!file) {
    return sendRespone(res, { data: [] }, "Không tìm thấy ảnh!"); 
  }

  const timestamp = Date.now();
  const originalName = file.originalname;
  const extension = path.extname(originalName);
  const newFileName = `${timestamp}${extension}`;

  fs.renameSync(file.path, `../Images/${newFileName}`);

  // req.body.photo = newFileName;
  // next();
  return sendRespone(res, { data: newFileName }, "Đã gửi ảnh!");
};


// Export modules
module.exports = {
  processUpload
}