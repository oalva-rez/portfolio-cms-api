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
const { log } = require("console");

require("dotenv").config();

const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

// create new project
router.post("/create", upload.single("featuredImage"), async (req, res) => {
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
        const blogId = nanoid();
        user.blogs.push({
          blogId: blogId,
          title: req.body.title,
          body: req.body.body,
          featuredImage: imageName,
          metaTitle: req.body.metaTitle,
          metaDescription: req.body.metaDescription,
          metaKeywords: req.body.metaKeywords,
        });
        console.log(user.blogs);
        user.save();
      }
    });
    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

// get all blog posts
router.get("/", async (req, res) => {
  try {
    console.log("running");
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's projects
        console.log(user.blogs);
        let blogs = [];
        if (user.blogs) {
          for (let blog of user.blogs) {
            const getObjectParams = {
              Bucket: bucketName,
              Key: blog.featuredImage,
            };

            // Get signed image URL
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            blog.featuredImage = url; // add image url to project object
            blogs.push(blog);
          }
        }
        // save user to update the session
        Promise.all(blogs).then((blogs) => {
          user.save();
          res.json({ status: "success", blogs });
        });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
});

// // get project by id
// router.get("/:id", async (req, res) => {
//   try {
//     User.findOne({ _id: req.user._id }, async (err, user) => {
//       if (err) {
//         // on error
//         res.status(500).json({ error: err });
//       } else {
//         // on success - return user's projects
//         let project = user.projects.find(
//           (project) => project.projectId === req.params.id
//         );
//         res.json({ status: "success", project });
//       }
//     });
//   } catch (error) {
//     res.json({ status: "error", error: error });
//   }
// });

// // update project by id
// router.put("/:id", upload.single("projImage"), async (req, res) => {
//   try {
//     User.findOne({ _id: req.user._id }, async (err, user) => {
//       if (err) {
//         // on error
//         res.status(500).json({ error: err });
//       } else {
//         // on success - return user's projects
//         let project = user.projects.find(
//           (project) => project.projectId === req.params.id
//         );
//         if (req.file) {
//           const imageName = randomImageName();
//           const params = {
//             Bucket: bucketName,
//             Key: imageName,
//             Body: req.file.buffer,
//             ContentType: req.file.mimetype,
//           };
//           const command = new PutObjectCommand(params);
//           await s3.send(command);
//           project.imageName = imageName;
//         }
//         project.title = req.body.title;
//         project.description = req.body.description;
//         project.githubUrl = req.body.githubUrl;
//         project.liveUrl = req.body.liveUrl;
//         project.techSelect = req.body.techSelect;
//         user.save();
//         res.json({ status: "success", project });
//       }
//     });
//   } catch (error) {
//     res.json({ status: "error", error: error });
//   }
// });

// //delete project by id
// router.delete("/:id", async (req, res) => {
//   try {
//     User.findOne({ _id: req.user._id }, async (err, user) => {
//       if (err) {
//         // on error
//         res.status(500).json({ error: err });
//       } else {
//         // on success - return user's projects
//         let project = user.projects.find(
//           (proj) => proj.projectId === req.params.id
//         );
//         const params = {
//           Bucket: bucketName,
//           Key: project.imageName,
//         };
//         const command = new DeleteObjectCommand(params);
//         await s3.send(command);
//         user.projects = user.projects.filter(
//           (project) => project.projectId !== req.params.id
//         );
//         user.save();
//         res.json({ status: "success" });
//       }
//     });
//   } catch (error) {
//     res.json({ status: "error", error: error });
//   }
// });

module.exports = router;
