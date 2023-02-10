const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");

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
      return res.json({ status: "User Found", token, user });
    } else {
      return res.json({ status: "User Not Found", user: false });
    }
  } catch (error) {
    res.json({ status: "error", error: "Invalid username/password" });
  }
});

module.exports = router;
