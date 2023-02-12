const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
const path = require("path");

const app = express();
require("dotenv").config();

app.use(methodOverride("_method"));

let gfs;
console.log(process.env.MONGO_STRING);
mongoose.connection.on("connected", () => {
  const db = mongoose.connections[0].db;
  gfs = Grid(db, mongoose.mongo);
  gfs.collection("uploads");
});

// Create Storage Engine
const storage = new GridFsStorage({
  url: process.env.MONGO_STRING,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
          metadata: {
            projName: req.body.projName,
          },
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage }).single("projImage");

module.exports = upload;
