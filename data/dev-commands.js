const fs = require("fs");
const Tour = require("../models/tourModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");

require("dotenv").config();

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected db"))
  .catch((err) => console.log(err));

const toursJson = fs.readFileSync(
  `${__dirname}/json/tours-simple.json`,
  "utf-8"
);
const tours = JSON.parse(toursJson);

const usersJson = fs.readFileSync(`${__dirname}/json/users.json`, "utf-8");
const users = JSON.parse(usersJson);

const reviewsJson = fs.readFileSync(`${__dirname}/json/reviews.json`, "utf-8");
const reviews = JSON.parse(reviewsJson);

const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log("Data transferred to db");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log("All data deleted");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv.includes("--import")) {
  importData();
} else if (process.argv.includes("--delete")) {
  deleteData();
} else {
  process.exit();
}
