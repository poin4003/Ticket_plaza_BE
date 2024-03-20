// Import module for validating
const Joi = require('@hapi/joi')


// Middleware function for validating body
const validateBody = (schema, name) => {
try {
  return (req, res, next) => {
    // console.log(req.body)
    const validatorResult = schema.validate(req.body)

    // console.log(validatorResult)
    if (validatorResult.error) {
      return res.status(400).json(validatorResult.error)
    } else {
      if (!req.value) req.value = {}
      if (!req.value['params']) req.value.params = {}

      req.value.body = validatorResult.value
      next()
    }
  }
} catch (error) {
  console.log("check body>>> ",error)
}
}

// Middleware function for validating param
const validateParam = (schema, name) => {
  return (req, res, next) => {
    const validatorResult = schema.validate({ param: req.params[name] })
    
    if (validatorResult.error) {
      return res.status(400).json(validatorResult.error)
    } else {
      if (!req.value) req.value = {}
      if (!req.value['params']) req.value.params = {}

      req.value.params[name] = req.params[name]
      next()
    }
  }
}

const schemas = {
  authSignUpSchema: Joi.object().keys({
    fullName: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().min(2).required(),
    phone: Joi.string().max(10).min(10),    
    birthDay: Joi.string(),
    identityID: Joi.number()
  }),

  authSignInSchema: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }), 

  idSchema: Joi.object().keys({
    param: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  }),

  userSchema: Joi.object().keys({
    fullName: Joi.string().min(2).required(),
    email: Joi.string().email().required() 
  }),

  userOptionalSchema: Joi.object().keys({
    fullName: Joi.string().min(2),
    email: Joi.string().email()
  })
}

module.exports = {
  validateParam,
  validateBody,
  schemas
}