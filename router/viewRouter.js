const express = require('express');
const router = express.Router();
const controller = require('./../controller/viewController');
const authController = require('./../controller/authController');
const bookingController = require('./../controller/bookingController.js');

router.use(authController.isLoggedIn);

router.get(
  '/',
  bookingController.createBookingAfterCheckout,
  authController.isLoggedIn,
  controller.getOverView
);
router.get('/tours/:slug', authController.isLoggedIn, controller.getTour);
router.get('/login', authController.isLoggedIn, controller.loginTo);
router.get('/Me', authController.protect, controller.aboutMe);
router.get('/my-tours', authController.protect, controller.getMyTours);

module.exports = router;
