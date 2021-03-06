require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const postRouter = require('./posts/posts-router');
const userRouter = require('./user/user-router');
const authRouter = require('./auth/auth-router');


const app = express();

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/posts', postRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// eslint-disable-next-line no-unused-vars
app.use(function errorHandler(error, req, res, next){
  let response;
  if (NODE_ENV === 'production'){
    console.error(error);
    response = {error: {message: 'servor error'} };
  } else {
    console.error(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;



