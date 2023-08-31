const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const { auth } = require('express-openid-connect');

const indexRouter = require('./routes/index');
const profileRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const schedulesRouter = require('./routes/schedules');

dotenv.load();

const app = express();

//set up mongoose connection
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const mongoDB = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.ua5m9vk.mongodb.net/?retryWrites=true&w=majority`

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// Auth
const authConfig = {
  authRequired: true,
  auth0Logout: true,
  secret: process.env.AUTH_SECRET,
  baseURL: process.env.APP_BASE_URL + process.env.AUTH_BASE_PATH,
  clientID: process.env.AUTH_CLIENT_ID,
  issuerBaseURL: process.env.AUTH_ISSUER_BASE_URL
};

app.use('/auth', auth(authConfig));

// Middleware to make the `user` object available for all views
app.use('/auth', function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', profileRouter);
app.use('/auth/users', usersRouter);
app.use('/auth/schedules', schedulesRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
