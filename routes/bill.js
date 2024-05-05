// Import module for bill route
const express = require('express')               // Module for Api handler
const router = require('express-promise-router')() // Module for router


// Import controllers
const BillController = require('../controllers/bill')

// Import helper
const { validateBody, schemas } = require('../helper/routerHelper')

// Import passport
const passport = require('passport')
const passportConfig = require('../middlewares/passport')
const momo = require('../middlewares/momo')
const Bill = require('../models/Bill')

// Routes
router.route('/')
  .get(passport.authenticate('jwt', {session: false }),
    BillController.getBills)
  .post(passport.authenticate('jwt', {session: false }),
    validateBody(schemas.billSchema),
    BillController.createBill)
  .delete(passport.authenticate('jwt', { session: false }),
    BillController.deleteBill)

router.route('/momo')
  .post(momo.paidByMomo, momo.redirectFunction)

router.route('/paidBill')
  .get(BillController.paid)   

router.route('/checkinBill')
  .patch(
    passport.authenticate('jwt', { session: false }),
    BillController.checkin)

router.route('/updateFeetbackStatus')
  .patch(passport.authenticate('jwt', { session: false }),
    BillController.updateFeetbackStatus)

router.route('/getRevenueList')
  .get(passport.authenticate('jwt', { session: false }),
    BillController.getRevenueList)

router.route('/getTotalAmountTicketList')
  .get(passport.authenticate('jwt', { session: false }),
    BillController.getTotalAmountTicketOfEventList)
  
router.route('/getBillDetail')
  .get(passport.authenticate('jwt', { session: false }),
    BillController.getBillDetail)
  
module.exports = router