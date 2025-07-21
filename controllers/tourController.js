const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllTours = factory.getAll(Tour);

exports.createTour = factory.createOne(Tour);

exports.getTour = factory.getOne(Tour, "reviews");

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingAverage: { $gte: 4.0 },
      },
    },
    {
      $group: {
        _id: "$difficulty",
        count: { $sum: 1 },
        averageRating: { $avg: "$ratingAverage" },
        averagePrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    {
      $sort: {
        averagePrice: 1,
      },
    },
    {
      $match: {
        averagePrice: { $gte: 500 },
      },
    },
  ]);

  res.status(200).json({ message: "Report created", stats });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);

  const stats = await Tour.aggregate([
    {
      $unwind: {
        path: "$startDates",
      },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        count: {
          $sum: 1,
        },
        tours: {
          $push: "$name",
        },
      },
    },
    {
      $addFields: {
        month: "$_id",
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  res.status(200).json({ message: `Plan created for ${year} year`, stats });
});

exports.aliasTopTours = (req, res, next) => {
  req.query = {
    ...req.query,
    sort: "-ratingAverage,-ratingsQuantity",
    fields: "name,price,ratingAverage,summary,difficulty",
    "price[lte]": 1200,
    limit: 5,
  };

  next();
};
