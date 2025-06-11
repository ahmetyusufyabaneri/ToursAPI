const fs = require("fs");
const Tour = require("../models/tourModel");
const mongoose = require("mongoose");

require("dotenv").config();

mongoose
  .connect(process.env.DB_URL)
  .then(() => console.log("Connected db"))
  .catch((err) => console.log(err));

const toursJson = fs.readFileSync(`${__dirname}/tours.json`, "utf-8");
const tours = JSON.parse(toursJson);

const importData = async () => {
  try {
    await Tour.create(tours, { validateBeforeSave: false });
    console.log("Data transferred to db");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
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
