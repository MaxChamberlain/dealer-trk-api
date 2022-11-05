var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var { connectDB } = require('./config/db');
const puppeteer = require('puppeteer');
const { exec } = require("child_process");
require('dotenv').config();

const test = async()=> {
  exec("node ./node_modules/puppeteer/install.js", async (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`finished installing chromium : ${stdout}`);
    exec("npm install", (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
    });
});
}
test()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var companyRouter = require('./routes/company');
var documentRouter = require('./routes/document');
var searchRouter = require('./routes/search');

var app = express();

//set cors to allow access to the api from any domain
app.use(cors({ origin: true, credentials: true, exposedHeaders: ['set-cookie'] }));

//set app header for access control allow origin to allow cross origin requests
const corsDetail = {
  origin: ["http://localhost:3000", 'http://localhost:5173', 'http://192.168.4.198:5173', 'http://192.168.4.129:5173', 'http://127.0.0.1:5173'],
  default: "http://localhost:3000"
}

app.use(function(req, res, next) {
  const origin = corsDetail.origin.includes(req.header('origin').toLowerCase()) ? req.headers.origin : corsDetail.default;
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//connect to db
connectDB();

app.use('/', indexRouter);
app.use('/auth', usersRouter);
app.use('/company', companyRouter);
app.use('/document', documentRouter);
app.use('/search', searchRouter);

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
