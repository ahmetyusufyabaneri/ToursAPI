const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllTours = async (req, res) => {
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
    res.status(400).json({ message: "An error occured", error: error.message });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({ message: "New tour created", tour: newTour });
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error.message });
  }
};

exports.getTour = async (req, res) => {
  const id = req.params.id;
  try {
    const tour = await Tour.findById(id);
    res.status(200).json({ message: "Tour recieved", tour });
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error.message });
  }
};

exports.updateTour = async (req, res) => {
  const id = req.params.id;
  try {
    const updateTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({ message: "Tour updated", tour: updateTour });
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error.message });
  }
};

exports.deleteTour = async (req, res) => {
  const id = req.params.id;
  try {
    await Tour.findByIdAndDelete(id);
    res.status(204).json({ message: "Tour deleted" });
  } catch (error) {
    res.status(400).json({ message: "An error occured", error: error.message });
  }
};

exports.getTourStats = async (req, res) => {
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
    res.status(400).json({ message: "An error occured", error: error.message });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  const year = Number(req.params.year);

  const stats = await Tour.aggregate([]);
};

exports.aliasTopTours = (req, res, next) => {
  req.query.sort = "-ratingAverage,-ratingsQuantity";
  req.query.fields = "name,price,ratingAverage,summary,difficulty";
  req.query["price[lte]"] = 1200;
  req.query.limit = 5;

  next();
};
