module.exports = {
  MONGODB_CONNECTION_STRING: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_ENDPOINT: process.env.CLIENT_ENDPOINT,
  auth: {
    google: {
      CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      CLIENT_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL
    }
  },
  cloudinarySetup : {
    CLOUD_NAME: process.env.CLOUDINARY_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET
  },
  ticketPlazaEmailAccount: {
    USERNAME: process.env.EMAIL_USERNAME,
    PASSWORD: process.env.EMAIL_PASSWORD
  },
  momo: {
    ENDPOINT_HOST: process.env.MOMO_ENDPOINT_HOST,
    ENDPOINT_PATH: process.env.MOMO_ENDPOINT_PATH,
    PARTNER_CODE: process.env.MOMO_PARNER_CODE,
    ACCESS_KEY: process.env.MOMO_ACCESS_KEY,
    SECRET_KEY: process.env.MOMO_SECRET_KEY,
    REDIRECT_URL: process.env.MOMO_REDIRECT_URL,
    IPN_URL: process.env.MOMO_IPN_URL
  }
}