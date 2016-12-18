const express = require('express');
const config = require('./config/config');
const multer=require('multer');
var paginate = require("express-paginate");
const app = express();
app.use(paginate.middleware(10,50));
let env = 'development';
require('./config/database')(config[env]);
require('./config/express')(app, config[env]);
require('./config/passport')();
require('./config/routes')(app);

module.exports = app;
