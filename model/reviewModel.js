'use strict';
const mongoose = require('mongoose');
const Tour = require('./../model/tourModel.js');
const reviewSchmea = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createrAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// reviewSchmea.index({ tour: 1, user: 1 });
reviewSchmea.index({ tour: 1, user: 1 }, { unique: true });

reviewSchmea.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: 'name duration -guides' }).populate({
  //   path: 'user',
  //   select: 'name image',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
reviewSchmea.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRatings,
    ratingsAverage: stats[0].avgRating,
  });
  // if (stats.length() > 0) {
  //   await Tour.findByIdAndUpdate(tourId, {
  //     ratingsQuantity: stats[0].nRatings,
  //     ratingsAverage: stats[0].avgRating,
  //   });
  // } else {
  //   await Tour.findByIdAndUpdate(tourId, {
  //     ratingsQuantity: 0,
  //     ratingsAverage: 0,
  //   });
  // }
};

reviewSchmea.post('save', function () {
  console.log('review saving 74');
  this.constructor.calcAverageRating(this.tour);
});
reviewSchmea.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});
reviewSchmea.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchmea);

module.exports = Review;
