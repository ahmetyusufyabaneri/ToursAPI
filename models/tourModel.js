const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tour must have name value"],
      unique: [true, "Name value must be unique"],
    },
    duration: {
      type: Number,
      required: [true, "Tour must have duration value"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Tour must have max group size value"],
    },
    difficulty: {
      type: String,
      required: [true, "Tour must have difficulty value"],
      enum: ["easy", "medium", "hard", "difficult"],
    },
    ratingAverage: {
      type: Number,
      min: [1, "Rating average mustn't less than 1"],
      max: [5, "Rating average mustn't more than 1"],
      default: 4.0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Tour must have price value"],
    },
    summary: {
      type: String,
      required: [true, "Tour must have summary value"],
      maxLength: [200, "Summary mustn't more than 200 character"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Tour must have description value"],
      maxLength: [1500, "Description mustn't more than 1500 character"],
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "Tour must have image cover value"],
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    hour: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("slug").get(function () {
  return this.name.toLowerCase().replaceAll(/ /g, "-");
});

tourSchema.virtual("turkishPrice").get(function () {
  return this.price * 40;
});

tourSchema.pre("save", function (next) {
  console.log("It worked before save");

  this.hour = this.duration * 24;

  next();
});

const Tour = model("Tour", tourSchema);

module.exports = Tour;
