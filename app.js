const express = require('express');
const cors = require('cors');
const session = require('express-session');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const path = require('path');
const bodyParser = require("body-parser");

const connectDB = require("./config/db");
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const usersDBRouter = require('./routes/api/users');
const authRouter = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // set this to true on production
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Routes
// app.get("/", (req, res) => res.send("Hello world!"));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/users', usersDBRouter);
app.use('/auth', authRouter);

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/calendarFiles', express.static('calendarFiles'));

// Connect Database
connectDB();

// Error Handling
app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('index');
});

module.exports = app;
