const express = require("express");
const router = express.Router();
const User = require("../../models/user.model");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const apiKey = uuidv4();

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      siteName: req.body.siteName,
      email: req.body.email,
      apiKey: apiKey,
    });
    user.save();
    res.json({ status: "success", error: false });
  } catch (error) {
    res.status(500).json({ status: "Error", error });
  }
});

module.exports = router;
