const { log } = require("console");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/user.model");
const loginRouter = require("./routes/api/login");
const registerRouter = require("./routes/api/register");
const dashboardRouter = require("./routes/api/dashboard");
const app = express();

mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_STRING);

app.use(express.json());
app.use(cors());

app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3001, () => {
  console.log("Example app listening on port 3001!");
});
