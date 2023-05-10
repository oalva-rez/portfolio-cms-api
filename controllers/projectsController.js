const User = require("../models/user.model");
const { s3, bucketName } = require("../controllers/aws-sdk");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedImageURL } = require("../helpers/getSignedURL");
const crypto = require("crypto");
const sharp = require("sharp");
const { nanoid } = require("nanoid");

require("dotenv").config();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

// @desc Get all projects
// @route GET /
const getAllProjects = async (req, res) => {
  try {
    const queryByValue = req.headers["x-api-key"] || req.user._id;
    const queryByKey = req.headers["x-api-key"] ? "apiKey" : "_id";

    User.findOne({ [queryByKey]: queryByValue }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's projects
        let projects = [];
        if (user.projects) {
          for (let project of user.projects) {
            const url = await getSignedImageURL(project);
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
};

// @desc Create new project
// @route POST /create
const createNewProject = async (req, res) => {
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
          featured: req.body.featured,
          wip: req.body.wip,
          techSelect: JSON.parse(req.body.techSelect),
          imageName: imageName,
        });
        user.save();
      }
    });
    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
};

// @desc Get project by Id
// @route GET /:id
const getProjectById = async (req, res) => {
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
};

// @desc Update project by Id
// @route PUT /:id
const updateProjectById = async (req, res) => {
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
        project.techSelect = JSON.parse(req.body.techSelect);
        user.save();
        res.json({ status: "success", project });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
};

// @desc Delete project by Id
// @route DELETE /:id
const deleteProjectById = async (req, res) => {
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
};

module.exports = {
  createNewProject,
  getAllProjects,
  getProjectById,
  updateProjectById,
  deleteProjectById,
};
