const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log(req.query.price);

  const features = new APIFeatures(Tour.find(), req.query, req.formattedQuery);

  features.filter().sort().limit().pagination();

  const tours = await features.query;

  res
    .status(200)
    .json({ message: "All tours recieved", results: tours.length, tours });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ message: "New tour created", tour: newTour });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findById(id).populate({
    path: "guides",
    select:
      "-password -__v -passwordResetToken -passwordResetExpires -passwordChangedAt",
  });
  res.status(200).json({ message: "Tour recieved", tour });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const updateTour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.status(200).json({ message: "Tour updated", tour: updateTour });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  await Tour.findByIdAndDelete(id);
  res.status(204).json({ message: "Tour deleted" });
});

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
