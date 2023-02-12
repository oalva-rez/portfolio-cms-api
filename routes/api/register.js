const express = require("express");
const router = express.Router();
const User = require("../../models/user.model");

router.post("/", async (req, res) => {
  try {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      siteName: req.body.siteName,
      email: req.body.email,
    });
    console.log(user);
    res.json({ status: "success", error: false });
  } catch (error) {
    res.status(500).json({ status: "Error", error });
  }
});

module.exports = router;
