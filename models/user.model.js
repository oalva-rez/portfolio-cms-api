const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email is already taken"],
      trim: true,
      minlength: [3, "Email must be at least 3 characters long"],
      lowercase: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username is already taken"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    siteName: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
      minlength: 3,
    },
  },
  { collection: "user-data" }
);
User.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
const model = mongoose.model("User", User);

module.exports = model;
