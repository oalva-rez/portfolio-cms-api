const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const loginRouter = require("./routes/api/login");
const registerRouter = require("./routes/api/register");
const dashboardRouter = require("./routes/api/dashboard/dashboard");
const verifyUser = require("./middleware/verifyUser");
const upload = require("./controllers/fileUploader");
const Grid = require("gridfs-stream");
const { nanoid } = require("nanoid");
const User = require("./models/user.model");

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
  User.findOne({ _id: req.user._id }, (err, user) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      console.log(req.body.imageFileName);
      const projId = nanoid();
      user.projects.push({
        projectId: projId,
        title: req.body.title,
        description: req.body.description,
        githubUrl: req.body.githubUrl,
        liveUrl: req.body.liveUrl,
        techSelect: req.body.techSelect,
        imageFileName: req.body.imageFileName,
      });
      user.save();
    }
  });

  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      if (req.file === undefined) {
        res.status(400).json({ error: "No File Selected" });
      } else {
        console.log(req.body);
        User.findOne({ _id: req.user._id }, (err, user) => {
          if (err) {
            res.status(500).json({ error: err });
          } else {
            user.projects.forEach((project) => {
              if (project.projectId === req.body.projId) {
                project.image = req.file.filename;
                user.save();
              }
            });
          }
        });
        res.json({
          file: `/${req.file.filename}`,
        });
      }
    }
  });
});
app.get("/files", (req, res) => {
  const db = mongoose.connections[0].db;
  gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads" });
  const FILENAME_STATIC = "bf182930102edf486afaded185f1f460.png";
  async function getUser() {
    const user = await User.findOne({ _id: req.user._id });
    
  }
  
  gfs
    .find({
      filename: FILENAME_STATIC,
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          error: "No files exist",
        });
      }
      gfs.openDownloadStreamByName(files[0].filename).pipe(res);
    });
});

app.listen(3001, () => {
  console.log("Example app listening on port 3001!");
});
