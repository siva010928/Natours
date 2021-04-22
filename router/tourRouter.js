'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./../controller/tourController.js');
const authController = require('./../controller/authController.js');
const reviewRouter = require('./../router/reviewRouter');
const reviewController = require('./../controller/reviewController.js');

// router.param('id', controller.checkId);

//login to tour details
router.use(authController.protect);

router.route('/monthly-plan/:year').get(controller.monthlyPlan);
router.route('/tour-stats').get(controller.tourStats);
router
  .route('/top-5-cheap')
  .get(controller.getCheaptours, controller.getAllTours);
router
  .route('/')
  .get(controller.getAllTours)
  .post(
    authController.restrictTo('admin', 'lead-guide'),
    controller.createTour
  );

router.route('/distances/:latlng/unit/:unit').get(controller.getTourDistance);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(controller.getToursWithin);

router
  .route('/:id')
  .get(controller.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    controller.uploadTourImages,
    controller.resizeTourImages,
    controller.updateTour
  )
  .delete(
    authController.restrictTo('admin', 'lead-guide'),
    controller.deleteTour
  );

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
