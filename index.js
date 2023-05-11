const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const loginRouter = require("./routes/api/login");
const registerRouter = require("./routes/api/register");
const dashboardRouter = require("./routes/api/dashboard/dashboard");
const myProjectsRouter = require("./routes/api/dashboard/my-projects");
const myBlogRouter = require("./routes/api/dashboard/my-blog");
const userRouter = require("./routes/api/my-api");
const verifyUser = require("./middleware/verifyUser");

require("dotenv").config();

const mongoString = process.env.MONGO_STRING;

const corsOptions = {
  origin: "*",
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
mongoose.set("strictQuery", true);
mongoose.connect(mongoString);

app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);

app.use("/api/dashboard", verifyUser, dashboardRouter);
app.use("/api/dashboard/my-projects", verifyUser, myProjectsRouter);
app.use("/api/dashboard/my-blog", verifyUser, myBlogRouter);

app.listen(3005, () => {
  console.log("Example app listening on port 3005!");
});
