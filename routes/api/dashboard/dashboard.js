const express = require("express");
const router = express.Router();
const sharp = require("sharp");

require("dotenv").config();

// @route   GET api/dashboard
// @desc    Get user data and auth
router.get("/", async (req, res) => {
  res.json({ status: "successfully verified", user: req.user });
});

module.exports = router;
