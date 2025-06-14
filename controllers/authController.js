const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const signToken = (userId) => {
  return jwt.sign({ id: userId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const createSendToken = (user, res, code) => {
  const token = signToken(user._id);

  res.status(code).json({ message: "New account created", user, token });
};

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, res, 201);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.signIn = (req, res) => {
  res.status(200).json({ message: "Sign In" });
};

exports.signOut = (req, res) => {
  res.status(200).json({ message: "Sign Out" });
};
