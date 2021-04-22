const AppError = require('./../utils/appError.js');

const handleCastErrorDB = (err, req, res) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};

const handleJWTError = (err, req, res) =>
  new AppError('invalid token log in again', 401);

const handleTokenExpiredError = (err, req, res) =>
  new AppError('token expired', 401);

const handleDuplicatefieldsDB = (err, req, res) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err, req, res) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  console.log(err);
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      error: err,
      yes: 'yes',
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  }
  console.log('Error', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  console.log(err);
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.log(`ERROR ${err}`);
    return res.status(err.statusCode).json({
      status: 500,
      message: 'Something Went Wrong',
    });
  }
  if (err.isOperational) {
    console.log('Error', err.message);
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong!',
      msg: err.message,
    });
  }
  console.log('Error', err.message);
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong!',
    msg: 'Something Went Wrong!',
  });
};
module.exports = (err, req, res, next) => {
  console.warn(err.status, err.statusCode, 'error  come');
  // console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') {
      console.log('errorName', err.name);
      error = handleCastErrorDB(err, req, res);
    }
    if (err.code === 11000) {
      error = handleDuplicatefieldsDB(err, req, res);
    }
    if (err.name === 'ValidationError') {
      error = handleValidationErrorDB(err, req, res);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError(err, req, res);
    }
    if (err.name === 'TokenExpiredError') {
      error = handleTokenExpiredError(err, req, res);
    }
    sendErrorProd(error, req, res);
  }
  next();
};
