const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const { auth } = require('express-openid-connect');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const workersRouter = require('./routes/workers');
const schedulesRouter = require('./routes/schedules');

dotenv.load();

const app = express();

//set up mongoose connection
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);

const mongoDB = "mongodb+srv://cluster0.ua5m9vk.mongodb.net/OnCall?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority";
const credentials = '../.cred/creds-jun2023.pem'

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(mongoDB, {
    tlsCertificateKeyFile: credentials,
  });
}

// Auth
const authConfig = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL
};

app.use(auth(authConfig));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
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
app.use('/users', userRouter);
app.use('/workers', workersRouter);
app.use('/schedules', schedulesRouter);

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
