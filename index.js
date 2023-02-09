const { log } = require("console");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/user.model");
const app = express();

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_STRING);

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
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
app.get("/api/dashboard", async (req, res) => {
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
app.post("/api/dashboard", async (req, res) => {
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

app.post("/api/register", async (req, res) => {
  try {
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      siteName: req.body.siteName,
    });
    console.log(user);
    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "Error", error });
  }
});
app.listen(3001, () => {
  console.log("Example app listening on port 3001!");
});
