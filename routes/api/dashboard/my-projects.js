const express = require("express");
const router = express.Router();
const User = require("../../../models/user.model");
const { s3, bucketName, upload } = require("../../../controllers/aws-sdk");
const { GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const sharp = require("sharp");
const { nanoid } = require("nanoid");

require("dotenv").config();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

router.post("/create", upload.single("projImage"), async (req, res) => {
  try {
    // If i wish to resize image, change the Body to buffer
    // const buffer = await sharp(req.file.buffer).resize({height: 1920, width: 1080, fit: 'contain'}).toBuffer
    const imageName = randomImageName();
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);
    User.findOne({ _id: req.user._id }, (err, user) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        const projId = nanoid();
        user.projects.push({
          projectId: projId,
          title: req.body.title,
          description: req.body.description,
          githubUrl: req.body.githubUrl,
          liveUrl: req.body.liveUrl,
          techSelect: req.body.techSelect,
          imageName: imageName,
        });
        user.save();
      }
    });
    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

router.get("/", async (req, res) => {
  try {
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        let projects = [];
        for (let project of user.projects) {
          const getObjectParams = {
            Bucket: bucketName,
            Key: project.imageName,
          };
          const command = new GetObjectCommand(getObjectParams);
          const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
          project.imageUrl = url;
          projects.push(project);
        }

        Promise.all(projects).then((projects) => {
          user.save();
          res.json({ status: "success", projects });
        });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

module.exports = router;
