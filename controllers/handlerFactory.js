const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filters = {};

    if (req.params.tourId) filters = { tour: req.params.tourId };

    const features = new APIFeatures(
      Model.find(filters),
      req.query,
      req.formattedQuery
    );

    features.filter().sort().limit().pagination();

    const documents = await features.query;

    res.status(200).json({
      message: "Documents recieved",
      length: documents.length,
      data: documents,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({
      message: "New document created",
      data: newDocument,
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) query = query.populate(populateOptions);

    const document = await query;

    res.status(200).json({
      message: "Document recieved",
      data: document,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ message: "Document updated", data: document });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({});
  });
