module.exports = {
  MONGODB_CONNECTION_STRING: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  auth: {
    google: {
      CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    }
  },
  cloudinarySetup : {
    CLOUD_NAME: process.env.CLOUDINARY_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET
  }
}