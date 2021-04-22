'use strict';
const mongoose = require('mongoose');
const express = require('express');
const port = 3000;
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
// process.on('unhandledRejection', (err) => {
//   console.log(err.name, err.message);
//   console.log('unhandled Rejection shutting down....');
// });
// process.on('uncaughtException', (err) => {
//   console.log(err.name, err.message);
//   console.log('unhandled Exception shutting down....');
// });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('DB successfull');
  });

const app = require('./app');
const server = app.listen(process.env.PORT, () => {
  console.log('listening.....');
});
