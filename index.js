const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const loginRouter = require("./routes/api/login");
const registerRouter = require("./routes/api/register");
const dashboardRouter = require("./routes/api/dashboard/dashboard");
const myProjectsRouter = require("./routes/api/dashboard/my-projects");

const verifyUser = require("./middleware/verifyUser");

require("dotenv").config();

const mongoString = process.env.MONGO_STRING;

const app = express();
app.use(express.json());
app.use(cors());
app.use(verifyUser);
mongoose.set("strictQuery", true);
mongoose.connect(mongoString);

app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/dashboard/my-projects", myProjectsRouter);

app.listen(3001, () => {
  console.log("Example app listening on port 3001!");
});
