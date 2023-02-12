const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../../models/user.model");

// @route   GET api/dashboard
// @desc    Get user data and auth
router.get("/", async (req, res) => {
  res.json({ status: "successfully verified", user: req.user });
});
router.post("/my-projects/create", async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) return res.json({ status: "No Token", user: false });
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const username = verified.user.username;
    await User.updateOne(
      { username },
      // get data from body and update DB
      { $set: { siteName: req.body.siteName } }
    );
    return res.json({ status: "success" });
  } catch (error) {
    console.log(error);
    res.json({ status: "error", error: "Invalid token" });
  }
});

module.exports = router;
