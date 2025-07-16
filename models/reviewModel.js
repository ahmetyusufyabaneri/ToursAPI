const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      required: [true, "Comment content musn't be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Rating musn't be empty"],
    },
    tour: {
      type: Schema.ObjectId,
      ref: "Tour",
      required: [true, "Tour info musn't be empty"],
    },
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "User info musn't be empty"],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });

  next();
});

const Review = model("Review", reviewSchema);

module.exports = Review;
