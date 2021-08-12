// const mongoose = require('mongoose');
// const mongoUri = 'mongodb://localhost/blogmodo';

// mongoose.connect(mongoUri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
// });

// const db = mongoose.connection;

// module.exports = db;

const config = require("./config/config.js");

const { Pool, Client } = require("pg");

const pool = new Pool({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

const client = new Client({
  user: config.user,
  host: config.host,
  database: config.database,
  password: config.password,
  port: config.port,
});

exports.pool = pool;
exports.client = client;