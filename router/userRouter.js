const express = require('express');
const controller = require('./../controller/userController');
const authController = require('./../controller/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch(
  '/updateMe',
  controller.uploadUserPhoto,
  controller.resizeUserPhoto,
  authController.updateMe
);
router.delete('/deleteMe', authController.deleteMe);
router
  .route('/')
  .get(controller.getAllUsers)
  .post(authController.restrictTo('admin'), controller.createUser);

router.route('/Me').get(controller.getMe, controller.getUser);
router
  .route('/:id')
  .get(controller.getUser)
  .patch(authController.restrictTo('admin', 'user'), controller.updateUser)
  .delete(authController.restrictTo('admin', 'user'), controller.deleteUser);

module.exports = router;
