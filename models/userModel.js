const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const validator = require("validator");

const userModel = new Schema({
  name: {
    type: Number,
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
});

const User = model("User", userModel);

module.exports = User;
