// Import module for validating
const Joi = require('@hapi/joi')
const dayjs = require('dayjs')

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

// Middleware function for validating date time
const dateTimeValidator = Joi.string().custom((value, helpers) => {
    const dateTime = dayjs(value, 'YYYY-MM-DDTHH:mm:ss.SSSZ', true);
    if (!dateTime.isValid()) {
        return helpers.error('any.invalid');
    }
    return value;
}, 'Custom DateTime Validator');

module.exports = dateTimeValidator;


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
    birthDay: dateTimeValidator
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
    birthDay: dateTimeValidator.required(),
    type: Joi.number().min(0).max(2),
    identityID: Joi.string().min(12).max(12)
  }), 

  userOptionalSchema: Joi.object().keys({       // Validate schema for admin (updating)
    fullName: Joi.string().min(2),
    password: Joi.string().min(6),
    email: Joi.string().min(2),
    phone: Joi.string().max(10).min(10),
    birthDay: dateTimeValidator,
    type: Joi.number().min(1).max(2),
    identityID: Joi.string().min(12).max(12)
  }), 

  // Validate schema for event
  eventSchema: Joi.object().keys({              // Validate schema for event
    name: Joi.string().min(2).required(),
    host: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    members: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    description: Joi.string().min(10).required(),
    type: Joi.string().required(),
    place: Joi.string().required(),
    date: dateTimeValidator.required(),
    durationDate: Joi.number().min(0),
    maxTicketPerBill: Joi.number().required()
  }),

  eventOptionalSchema: Joi.object().keys({       // Validate schema for event (updating)
    name: Joi.string().min(2),
    host: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    members: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    description: Joi.string().min(10),
    type: Joi.string(),
    place: Joi.string(),
    date: dateTimeValidator,
    durationDate: Joi.number().min(0),
    maxTicketPerBill: Joi.number()
  }),

  eventTypeSchema: Joi.object().keys({            // Validate schema for event type
    typeId: Joi.string().min(2).required(),
    eventTypeName: Joi.string().required(),
    status: Joi.number()
  }),

  eventTypeOptionalSchema: Joi.object().keys({    // Validate schema for event type (updating)
    typeId: Joi.string().min(2),
    eventTypeName: Joi.string(),
    status: Joi.number()
  }),

  ticketSchema: Joi.object().keys({                // Validate schema for ticket
    eventId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    name: Joi.string().min(2).required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    releaseDate: dateTimeValidator.required(),
    expirationDate: dateTimeValidator.required(),
    totalAmount: Joi.number().required(),
    status: Joi.number() 
  }),

  ticketOptionalSchema: Joi.object().keys({         // Validate schema for ticket (updating)
    eventId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    name: Joi.string().min(2),
    price: Joi.number(),
    description: Joi.string(),
    releaseDate: dateTimeValidator,
    expirationDate: dateTimeValidator,
    totalAmount: Joi.number(),
    status: Joi.number() 
  }),

  billSchema: Joi.object().keys({                    // Validate schema for bill 
    date: dateTimeValidator.required(),
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    eventId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    ticketsId: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).required(),
    totalPrice: Joi.number().required(),
    discount: Joi.number().required(),
    checkoutMethod: Joi.string().required(),
    status: Joi.number().required()
  }),
  
  billOptionalSchema: Joi.object().keys({             // Validate schema for bill (updating)
    date: dateTimeValidator,
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    eventId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    ticketsId: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)),
    totalPrice: Joi.number(),
    discount: Joi.number(),
    checkoutMethod: Joi.string(),
    status: Joi.number()
  }),

  feetbackSchema: Joi.object().keys({                  // Validate schema for feetback
    billId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    eventId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    rate: Joi.number().max(5).required(),
    context: Joi.string().required(),
    photos: Joi.array().items(Joi.string()).required()
  }),

  feetbackOptionalSchema: Joi.object().keys({          // Validate schema for feetback (updating)
    billId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    eventId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    rate: Joi.number().max(5),
    context: Joi.string(),
    photos: Joi.array().items(Joi.string())
  })
}


// Export modules
module.exports = {
  validateParam,
  validateBody,
  schemas
}