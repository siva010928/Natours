'use strict';
const express = require('express');
const controller = require('./../controller/bookingController.js');
const authController = require('./../controller/authController.js');

const router = express.Router();
router.use(authController.protect);
router.get('/checkout-session/:tourId', controller.getCheckoutSession);
router.use(authController.restrictTo('admin', 'lead-guide'));

router.route('/').get(controller.getAllBookings).post(controller.createBooking);

router
  .route('/:id')
  .get(controller.getBooking)
  .patch(controller.updateBooking)
  .delete(controller.deleteBooking);

module.exports = router;
