const User = require("../models/userModel");

exports.signUp = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    res.status(201).json({ message: "New account created", data: newUser });
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
