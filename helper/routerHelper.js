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
  next(error)
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
  // Validate schemas
  idSchema: Joi.object().keys({                 // Vaidate schema for param
    param: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  }),

  // Validate schemas for user
  authSignUpSchema: Joi.object().keys({         // Validate schema for create account
    fullName: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().min(2).required(),
    phone: Joi.string().max(10).min(10),    
    birthDay: Joi.string()
  }),

  authSignInSchema: Joi.object().keys({         // Validate schema for login
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }), 

  userSchema: Joi.object().keys({       // Validate schema for admin (updating)
    fullName: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().min(2).required(),
    phone: Joi.string().max(10).min(10).required(),
    birthDay: Joi.string().required(),
    type: Joi.number().min(0).max(2),
    identityID: Joi.string().min(12).max(12)
  }), 

  userOptionalSchema: Joi.object().keys({       // Validate schema for admin (updating)
    fullName: Joi.string().min(2),
    password: Joi.string().min(6),
    email: Joi.string().min(2),
    phone: Joi.string().max(10).min(10),
    birthDay: Joi.string(),
    type: Joi.number().min(1).max(2),
    identityID: Joi.string().min(12).max(12)
  }), 

  // Validate schema for event
  eventSchema: Joi.object().keys({              // Validate schema for event
    name: Joi.string().min(2).required(),
    host: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    members: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    description: Joi.string().min(10).required(),
    photo: Joi.string().required(),
    type: Joi.string().required(),
    place: Joi.string().required(),
    time: Joi.string().required(),
    date: Joi.string().required(),
    maxTicketPerBill: Joi.number().required()
  }),

  eventOptionalSchema: Joi.object().keys({              // Validate schema for event (updating)
    name: Joi.string().min(2),
    host: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    members: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    description: Joi.string().min(10),
    photo: Joi.string(),
    type: Joi.string(),
    place: Joi.string(),
    time: Joi.string(),
    date: Joi.string(),
    maxTicketPerBill: Joi.number()
  }),
}


// Export modules
module.exports = {
  validateParam,
  validateBody,
  schemas
}