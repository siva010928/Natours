const catchAsync = require('./../utils/catchAsync');
const APIfeatures = require('./../utils/APIfeatures');
const AppError = require('./../utils/appError.js');

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    //mergeParams for reviews from tour route
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fielding()
      .paginate();
    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      query: req.query,
      data: docs,
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query.populate('reviews');
    if (!doc) {
      return next(
        new AppError(`document not found with id:${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(
        new AppError(`document not found with id:${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`${Model} not found with id:${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: 'Deleted',
    });
  });
