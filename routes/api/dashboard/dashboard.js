const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../../../models/user.model");
const mongoose = require("mongoose");

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
router.get("/my-projects", async (req, res) => {
  const db = mongoose.connections[0].db;
  let dum = gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });
  // set header to content type image
  res.set("Content-Type", "image/png");
  await gfs
    .find({
      metadata: {
        _id: req.user._id,
      },
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          error: "No files exist",
        });
      }
      let arr = [];
      for (const file of files) {
        const imageStream = gfs.openDownloadStreamByName(file.filename)
        arr.push(imageStream);
      }
      Promise.all(arr).then((values) => {
        res.json(values);
      }
      );
    });
});

module.exports = router;
