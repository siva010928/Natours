'use strict';
const express = require('express');
const router = express.Router({
  mergeParams: true,
});
const controller = require('./../controller/reviewController.js');
const authController = require('./../controller/authController.js');

router
  .route('/')
  .get(controller.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    controller.createTourUserID,
    controller.createReview
  );

router.use(authController.protect);

router
  .route('/:id')
  .patch(authController.restrictTo('admin', 'user'), controller.updateReview)
  .delete(authController.restrictTo('admin', 'user'), controller.deleteReview);

module.exports = router;
