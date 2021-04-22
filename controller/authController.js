'use strict';
const User = require('./../model/userModel.js');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError.js');
const jwt = require('jsonwebtoken');
const Email = require('./../utils/email');
const { promisify } = require('util');
const sendMail = require('./../utils/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const signinToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signinToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    name: req.body.name,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signinToken(newUser._id);
  const welcomeUrl = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, welcomeUrl).sendWelcome();
  console.log('Welcome email sent');
  await createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('please enter email and password'), 401);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('password or email is incorrect'), 401);
  }
  createSendToken(user, 201, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  res.cookie('jwt', 'logged out', cookieOptions);
  res.status(200).json({
    status: 'success',
  });
});

module.exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers && req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log('TOKEN', token);
  if (!token) {
    return next(new AppError('you are not logged in', 401));
  }
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('PAYLOAD', payload);

  const currentUser = await User.findById(payload.id);
  if (!currentUser) {
    return next(new AppError('user not exists please log in', 401));
  }
  if (currentUser.checkChangePassword(payload.iat)) {
    return next(
      new AppError('token was expired,user has changed the password', 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

module.exports.isLoggedIn = async (req, res, next) => {
  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next();
    }
    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log('PAYLOAD', payload);

    const currentUser = await User.findById(payload.id);
    if (!currentUser) {
      return next();
    }
    if (currentUser.checkChangePassword(payload.iat)) {
      return next();
    }
    res.locals.user = currentUser;
    next();
  } catch (error) {
    return next();
  }
};

module.exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`only ${roles} have this access`), 402);
    }
    next();
  };
};

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log('entering forgot spassword');
  const email = req.body.email;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("user doesn't exist with this email"), 402);
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const subject = 'this token will expired soon....';
  const message = `forgotten your password click this link \n ${resetUrl}`;
  try {
    await new Email(user, resetUrl).sendResetPassword();
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('mail not sent'), 402);
  }
  res.status(200).json({
    message: 'mail sent',
  });
});
module.exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log(1);
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('invalid token or expired'), 402);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  await user.save();
  createSendToken(user, 201, res);
});
module.exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.checkPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('current password is wrong'), 402);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 201, res);
});
const filteringBody = (body, ...options) => {
  let filtersBody = {};
  Object.keys(body).forEach((el) => {
    if (options.includes(el)) {
      filtersBody[el] = body[el];
    }
  });
  return filtersBody;
};
module.exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('password cannt be updated'), 402);
  }
  const filterdBody = filteringBody(req.body, 'email', 'name');
  if (req.file) filterdBody.photo = req.file.filename;
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updateUser,
      file: req.file,
    },
  });
});
module.exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: 'success',
    message: 'user deleted',
  });
});
