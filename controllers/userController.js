const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const err = require("../utils/error");
const filterObject = require("../utils/filterObject");
const factory = require("./handlerFactory");

exports.updateAccount = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(err(400, "Password cannot update with this endpoint"));
  }

  const filteredBody = filterObject(req.body, ["name", "email"]);

  const updated = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
  });

  res.status(200).json({ message: "Account updated", updated });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ message: "Account deleted" });
});

exports.getAllUsers = factory.getAll(User);

exports.createUser = factory.createOne(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
