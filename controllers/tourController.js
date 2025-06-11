const Tour = require("../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.formattedQuery);
    const tourQuery = Tour.find(req.formattedQuery);

    if (req.query.sort) {
      tourQuery.sort(req.query.sort.replace(",", " "));
    } else {
      tourQuery.sort("createdAt");
    }

    if (req.query.fields) {
      const fields = req.query.fields.replace(",", " ");
      tourQuery.select(fields);
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    tourQuery.skip(skip).limit(limit);

    const tours = await tourQuery;

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
