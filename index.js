const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const loginRouter = require("./routes/api/login");
const registerRouter = require("./routes/api/register");
const dashboardRouter = require("./routes/api/dashboard/dashboard");
const verifyUser = require("./middleware/verifyUser");
const upload = require("./controllers/fileUploader");
const Grid = require("gridfs-stream");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(verifyUser);
mongoose.set("strictQuery", true);
mongoose.connect(process.env.MONGO_STRING);

app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      // res.json({ file: req.file });
      console.log(req.body);
      res.json({ success: true });
    }
  });
});
app.get("/files", (req, res) => {
  const db = mongoose.connections[0].db;
  gfs = Grid(db, mongoose.mongo);
  gfs.collection("uploads");

  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }
    console.log("running");
    return res.json(files);
  });
});
app.listen(3001, () => {
  console.log("Example app listening on port 3001!");
});
