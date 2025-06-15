const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const signToken = (userId) => {
  return jwt.sign({ id: userId, role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const createSendToken = (user, res, code, message) => {
  const token = signToken(user._id);

  const expireDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  res.cookie("jwt", token, {
    expires: expireDate,
    httpOnly: true,
  });

  user.password = undefined;

  res.status(code).json({
    message: message,
    user,
    token,
  });
};

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, res, 201, "New account created");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No user registered to the entered email",
      });
    }

    const isValid = await user.passwordValidation(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: "Password is invalid" });
    }

    createSendToken(user, res, 200, "Account logged in");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.signOut = (req, res) => {
  res.status(200).json({ message: "Sign Out" });
};
