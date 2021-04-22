const catchAsync = require('./../utils/catchAsync');
const APIfeatures = require('./../utils/APIfeatures');
const AppError = require('./../utils/appError.js');
const Tour = require('./../model/tourModel.js');
const Booking = require('./../model/bookingModel.js');
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

exports.getOverView = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  if (!tour) {
    return next(new AppError('tour not found'), 402);
  }
  const title = tour.name;
  res.status(200).render('tour', {
    title,
    tour,
    mapboxgl,
  });
});

exports.loginTo = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login to your account',
  });
};

exports.aboutMe = (req, res, next) => {
  res.status(200).render('accountTemplate', {
    title: 'Your Account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const myBookings = await Booking.find({ user: req.user.id });
  const tourIds = myBookings.map((el) => el.tour);
  const myTours = await Tour.find({ _id: { $in: tourIds } });
  res.status(200).render('overview', {
    title: 'My bookings',
    tours: myTours,
  });
});
