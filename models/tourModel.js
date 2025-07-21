const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const validator = require("validator");

const tourSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Tour must have name value"],
      unique: [true, "Name value must be unique"],
      min: [5, "Name value mustn't less than 5"],
      min: [50, "Name value mustn't more than 50"],
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
      max: [5, "Rating average mustn't more than 5"],
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
    priceDiscount: {
      type: Number,
      validate: {
        validator: function () {
          return value < this.price;
        },
        message: "Discount price mustn't more than price",
      },
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
    startLocation: {
      description: String,
      type: { type: String, default: "Point", enum: "Point" },
      coordinates: [Number],
      address: String,
    },
    locations: [
      {
        description: String,
        type: { type: String, default: "Point", enum: "Point" },
        coordinates: [Number],
        address: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "tour",
});

tourSchema.virtual("slug").get(function () {
  return this.name.toLowerCase().replaceAll(/ /g, "-");
});

tourSchema.virtual("turkishPrice").get(function () {
  return this.price * 40;
});

tourSchema.pre("save", function (next) {
  this.hour = this.duration * 24;

  next();
});

tourSchema.post("save", function (doc, next) {
  console.log("It worked after create account process");
  next();
});

tourSchema.pre("find", function (next) {
  this.find({ premium: { $ne: true } });

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select:
      "-password -__v -passwordResetToken -passwordResetExpires -passwordChangedAt",
  });

  next();
});

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { premium: { $ne: true } } });

  next();
});

tourSchema.post("aggregate", function (doc, next) {
  console.log("It worked just after report process");

  next();
});

const Tour = model("Tour", tourSchema);

module.exports = Tour;
