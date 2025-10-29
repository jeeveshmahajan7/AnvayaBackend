const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGODB;

const initializeDatabase = async () => {
  try {
    await mongoose
      .connect(mongoURI)
      .then(console.log("Connected to the Database ✅."))
      .catch((error) => {
        console.log(
          "An error occured while connecting to the database:",
          error
        );
      });
  } catch (error) {
    console.log("Error connecting to the database ❌.");
  }
};

module.exports = { initializeDatabase };
