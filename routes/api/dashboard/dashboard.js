const express = require("express");
const router = express.Router();
const User = require("../../../models/user.model");

require("dotenv").config();

// @route   GET api/dashboard
// @desc    Get user data and auth
router.get("/", async (req, res) => {
  res.json({ status: "successfully verified", user: req.user });
});
router.get("/api-key", async (req, res) => {
  // get users api key from db
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      res.json({ status: "success", apiKey: user.apiKey });
    }
  });
});
module.exports = router;
