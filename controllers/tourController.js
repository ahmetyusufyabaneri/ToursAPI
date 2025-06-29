const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const err = require("../utils/error");

exports.getAllTours = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Tour.find(),
      req.query,
      req.formattedQuery
    );

    features.filter().sort().limit().pagination();

    const tours = await features.query;

    res
      .status(200)
      .json({ message: "All tours recieved", results: tours.length, tours });
  } catch (error) {
    next(err(500, error.message));
  }
};

exports.createTour = async (req, res, next) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ message: "New tour created", tour: newTour });
  } catch (error) {
    next(err(400, error.message));
  }
};

exports.getTour = async (req, res, next) => {
  const id = req.params.id;
  try {
    const tour = await Tour.findById(id);
    res.status(200).json({ message: "Tour recieved", tour });
  } catch (error) {
    next(err(400, error.message));
  }
};

exports.updateTour = async (req, res, next) => {
  const id = req.params.id;
  try {
    const updateTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Tour updated", tour: updateTour });
  } catch (error) {
    next(err(400, error.message));
  }
};

exports.deleteTour = async (req, res, next) => {
  const id = req.params.id;
  try {
    await Tour.findByIdAndDelete(id);
    res.status(204).json({ message: "Tour deleted" });
  } catch (error) {
    next(err(400, error.message));
  }
};

exports.getTourStats = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(err(400, error.message));
  }
};

exports.getMonthlyPlan = async (req, res, next) => {
  const year = Number(req.params.year);

  try {
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
  } catch (error) {
    next(err(400, error.message));
  }
};

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = "-ratingAverage,-ratingsQuantity";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  req.query["price[lte]"] = 1200;
  req.query.limit = 5;

  next();
};
