const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({});

  res.status(200).json({
    message: "All reviews recieved",
    length: reviews?.length,
    reviews,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({ message: "New review created", review: newReview });
});

exports.getReview = () => {};

exports.updateReview = () => {};

exports.deleteReview = () => {};
