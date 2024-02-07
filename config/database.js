const mongoose = require("mongoose");
require("dotenv").config();

const DB_URL = process.env.DB_URL;

// Connection to mongodb.
mongoose.connect(DB_URL);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to database");
});

module.exports = db;
