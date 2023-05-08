const express = require("express");
const router = express.Router();
const User = require("../../../models/user.model");
const { s3, bucketName, upload } = require("../../../controllers/aws-sdk");
const {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const sharp = require("sharp");
const { nanoid } = require("nanoid");

require("dotenv").config();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

// create new project
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
        const newTechSelect = JSON.parse(req.body.techSelect);
        user.projects.push({
          projectId: projId,
          title: req.body.title,
          description: req.body.description,
          githubUrl: req.body.githubUrl,
          liveUrl: req.body.liveUrl,
          featured: req.body.featured,
          wip: req.body.wip,
          techSelect: newTechSelect,
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

// get all projects
router.get("/", async (req, res) => {
  try {
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's projects
        let projects = [];
        if (user.projects) {
          for (let project of user.projects) {
            const getObjectParams = {
              Bucket: bucketName,
              Key: project.imageName,
            };

            // Get signed image URL
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            project.imageUrl = url; // add image url to project object
            projects.push(project);
          }
        }
        // save user to update the session
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

// get project by id
router.get("/:id", async (req, res) => {
  try {
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's projects
        let project = user.projects.find(
          (project) => project.projectId === req.params.id
        );
        res.json({ status: "success", project });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

// update project by id
router.put("/:id", upload.single("projImage"), async (req, res) => {
  try {
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's projects
        let project = user.projects.find(
          (project) => project.projectId === req.params.id
        );
        if (req.file) {
          const imageName = randomImageName();
          const params = {
            Bucket: bucketName,
            Key: imageName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
          };
          const command = new PutObjectCommand(params);
          await s3.send(command);
          project.imageName = imageName;
        }
        project.title = req.body.title;
        project.description = req.body.description;
        project.githubUrl = req.body.githubUrl;
        project.featured = req.body.featured;
        project.wip = req.body.wip;
        project.liveUrl = req.body.liveUrl;
        project.techSelect = req.body.techSelect;
        user.save();
        res.json({ status: "success", project });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

//delete project by id
router.delete("/:id", async (req, res) => {
  try {
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's projects
        let project = user.projects.find(
          (proj) => proj.projectId === req.params.id
        );
        const params = {
          Bucket: bucketName,
          Key: project.imageName,
        };
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        user.projects = user.projects.filter(
          (project) => project.projectId !== req.params.id
        );
        user.save();
        res.json({ status: "success" });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

module.exports = router;
