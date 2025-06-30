const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const err = require("../utils/error");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const c = require("../utils/catchAsync");

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

exports.signUp = c(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, res, 201, "New account created");
});

exports.signIn = c(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email && !password) {
    return next(err(400, "Please enter email and password"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(err(404, "No user registered to the entered email"));
  }

  const isValid = await user.passwordValidation(password, user.password);

  if (!isValid) {
    return next(err(401, "Password is invalid"));
  }

  createSendToken(user, res, 200, "Account logged in");
});

exports.signOut = (req, res) => {
  res.clearCookie("jwt").status(200).json({ message: "Sign Out" });
};

exports.protect = c(async (req, res, next) => {
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
    return next(
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
    return next(err(403, "Token is invalid"));
  }

  const activeUser = await User.findById(decoded.id);

  if (!activeUser) {
    return next(err(403, "User's account can't be accessed"));
  }

  if (!activeUser.active) {
    return next(err(403, "User's account has been frozen"));
  }

  if (activeUser?.passwordChangedAt && decoded?.iat) {
    const passwordChangedSeconds = parseInt(
      activeUser?.passwordChangedAt.getTime() / 1000
    );

    if (passwordChangedSeconds > decoded?.iat) {
      return next(err(403, "You changed password recently, please try again"));
    }
  }

  req.user = activeUser;

  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(roles);
    console.log(req.user.role);

    if (!roles.includes(req.user.role)) {
      return next(err(403, "You don't have authorized for this process"));
    }
    next();
  };

exports.forgotPassword = c(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return next(err(404, "No user registered to this mail found"));

  const resetToken = user.createResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const url = `${req.protocol}://${req.headers.host}/api/users/reset-password/${resetToken}`;

  await sendMail({
    email: user.email,
    subject: "Reset Password (10 min)",
    text: resetToken,
    html: `
    <h2>Hello ${user.name}</h2>
    <p>Password reset link for your account linked to your <b>${user.email}</b> email address</p>
    <a href=${url}>${url}</a>
    <p>Please <i>PATCH</i> request to this connection with new password</p>
    `,
  });

  res.status(201).json({ message: "Email sent" });
});

exports.resetPassword = c(async (req, res, next) => {
  const token = req.params.token;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(err(403, "Token is invalid"));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Password updated" });
});

exports.changePassword = c(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (
    !(await user.passwordValidation(req.body.currentPassword, user.password))
  ) {
    return next(err(400, "Current password is invalid"));
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPassword;

  await user.save();

  sendMail({
    email: user.email,
    subject: "Change Password",
    text: "Info text",
    html: `
    <h2>Account Information Updated</h2>
    <p>Hello ${user.name},</p>
    <p>We wanted to inform you that your account information has been successfully updated.</p>
    <p>If you did not make this change, please contact us immediately to secure your account.</p>
    <p>Check your account security here: [Security Link]</p>
    <p>Best regards,</p>
    <p>The Support Team</p>
    `,
  });

  createSendToken(user, res, 200);
});
