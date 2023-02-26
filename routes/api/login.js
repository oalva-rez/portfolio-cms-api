const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
// @route   POST api/login
// @desc    Login user

router.post("/", async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [
        { username: req.body.usernameOrEmail },
        { email: req.body.usernameOrEmail },
      ],
    });

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (isPasswordValid) {
      const token = jwt.sign({ user }, process.env.TOKEN_SECRET);
      return res.json({ status: "User Found", token, user, error: false });
    } else {
      return res.json({
        status: "User Not Found",
        user: false,
        error: "Invalid username/password",
      });
    }
  } catch (error) {
    res.json({
      status: "User Not Found",
      user: false,
      error: "Invalid username/password",
    });
  }
});

module.exports = router;
