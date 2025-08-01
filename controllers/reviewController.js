const catchAsync = require("../utils/catchAsync");
const Review = require("../models/reviewModel");
const factory = require("./handlerFactory");

exports.getAllReviews = factory.getAll(Review);

exports.createReview = factory.createOne(Review);

exports.getReview = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
