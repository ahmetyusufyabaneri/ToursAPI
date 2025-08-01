const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "User must have name value"],
  },
  email: {
    type: String,
    required: [true, "User must have email value"],
    unique: [true, "Email value must be unique"],
    validate: [validator.isEmail, "Email value must be email format"],
  },
  role: {
    type: String,
    enum: ["user", "guide", "lead-guide", "admin"],
    default: "user",
  },
  active: {
    type: Boolean,
    default: true,
  },
  photo: {
    type: String,
    default: "user.jpg",
  },
  password: {
    type: String,
    required: [true, "User must have password value"],
    validate: [validator.isStrongPassword, "Password "],
  },
  passwordConfirm: {
    type: String,
    required: [true, "User must have to do confirm password"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords aren't the same",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

userSchema.methods.passwordValidation = async function (
  password,
  hashedPassword
) {
  return await bcrypt.compare(password, hashedPassword);
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = model("User", userSchema);

module.exports = User;
