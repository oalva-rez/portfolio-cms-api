const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user.model");
const { verify } = require("crypto");
const { log } = require("console");

module.exports = async (req, res, next) => {
  // If the user is trying to login or register or , skip this middleware
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.json({ status: "No Token", user: false });
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const username = verified.username;
    const user = await User.findOne({ username });
    req.user = user;
    next();
  } catch (error) {
    return res.json({ status: "Invalid Token", user: false });
  }
};
