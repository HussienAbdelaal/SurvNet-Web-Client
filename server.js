'use strict';

//Modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // eslint-disable-line no-use-before-define
const methodOverride = require('method-override');

//Routes declarations
const ROUTERS = require('./routes/routers');

const app = express();

//View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Path for static files
app.use(express.static(path.join(__dirname, 'public')));

//Parser for Requests
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//Method Override for Standard HTTP Requests-- IMPORTANT: philipm.at/2017/method-override_in_expressjs.html
app.use(methodOverride('_method')); // eslint-disable-line

//Routes
app.use('/', ROUTERS);

//Catch 404 and forward error to handler
app.use((request, response, next) => {
    let error = new Error('Not Found');
    error.status = 404;
    next(error);
});

//Error Handler
app.use((error, request, response, next) => { // eslint-disable-line
    response.status(error.status || 500);
    response.render('error', {
        status: error.status,
        message: error.message
    });
});

app.listen(3000, function () {
    console.log('Survival Network Listening to PORT 3000'); // eslint-disable-line
});

module.exports = app;