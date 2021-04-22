'use strict';
const path = require('path');
const morgan = require('morgan');
const AppError = require('./utils/appError.js');
const globalErrorHandler = require('./controller/errorController');

const tourRouter = require('./router/tourRouter.js');
const userRouter = require('./router/userRouter.js');
const reviewRouter = require('./router/reviewRouter.js');
const viewRouter = require('./router/viewRouter.js');
const bookingRouter = require('./router/bookingRouter.js');

const cookieParser = require('cookie-parser');
const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const app = express();
const port = 3000;
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many request in a short time',
});

//initialixe pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// app.use(helmet());
app.use('/api', limit);
//hello
//body-parser
app.use(express.json({ limit: '10kb' }));
//form-urlencodedparser
app.use(express.urlencoded({ limit: '10kb', extended: true }));
//cookie-parser
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies.jwt);
  next();
});

// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Pugs',
//     user: 'deepika',
//   });
// });

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`${req.originalUrl} url not found `, 404));
});
app.use(globalErrorHandler);

module.exports = app;
