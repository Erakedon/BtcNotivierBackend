const config = require('./config');
const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const app = express();

app.use(cors({origin: '*'}));

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

const database = require('./databaseController');
database.initialize();
require('./api')(app, database);
require('./blockchainMonitor')(app, database);

let server = app.listen(config.port , () => {
    console.log("Express is working on port " + config.port);
  });