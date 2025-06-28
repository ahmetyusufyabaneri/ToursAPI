const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const err = require("../utils/error");

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

exports.signUp = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    createSendToken(newUser, res, 201, "New account created");
  } catch (error) {
    next(err(400, error.message));
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email && !password) {
      next(err(400, "Please enter email and password"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      next(err(404, "No user registered to the entered email"));
    }

    const isValid = await user.passwordValidation(password, user.password);

    if (!isValid) {
      next(err(401, "Password is invalid"));
    }

    createSendToken(user, res, 200, "Account logged in");
  } catch (error) {
    next(err(400, error.message));
  }
};

exports.signOut = (req, res) => {
  res.clearCookie("jwt").status(200).json({ message: "Sign Out" });
};

exports.protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    next(
      err(
        403,
        "You are not authorized for this operation (token not provided)"
      )
    );
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    next(err(403, "Token is invalid"));
  }

  let activeUser;

  try {
    activeUser = await User.findById(!decoded.id);
  } catch (error) {
    next(err(403, "Token is invalid"));
  }

  if (!activeUser) {
    next(err(403, "User's account can't be accessed"));
  }

  if (!activeUser.active) {
    next(err(403, "User's account has been frozen"));
  }

  if (activeUser.passwordChangedAt && decoded.iat) {
    const passwordChangedSeconds = parseInt(
      activeUser.passwordChangedAt.getTime() / 1000
    );

    if (passwordChangedSeconds > decoded.iat) {
      next(err(403, "You changed password recently, please try again"));
    }
  }

  req.user = activeUser;

  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(roles);
    console.log(req.user.role);

    if (!roles.includes(req.user.role)) {
      next(err(403, "You don't have authorized for this process"));
    }
    next();
  };
