const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../../models/user.model");

router.get("/", async (req, res) => {
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) return res.json({ status: "No Token", user: false });
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    const username = verified.user.username;
    const user = await User.findOne({ username });
    return res.json({ status: "User Found", user });
  } catch (error) {
    return res.json({ status: "Invalid Token", user: false });
  }
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
