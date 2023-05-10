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

// @desc Get all blogs
// @route GET /
const getAllBlogs = async (req, res) => {
  const queryByValue = req.headers["x-api-key"] || req.user._id;
  const queryByKey = req.headers["x-api-key"] ? "apiKey" : "_id";
  try {
    User.findOne({ [queryByKey]: queryByValue }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's blogs
        let blogs = [];
        if (user.blogs) {
          for (let blog of user.blogs) {
            const url = await getSignedImageURL(blog);
            blog.imageUrl = url; // add image url to blog object
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
};

// @desc Create new blog
// @route POST /create
const createNewBlog = async (req, res) => {
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
          imageName: imageName,
          metaTitle: req.body.metaTitle,
          metaDescription: req.body.metaDescription,
          metaKeywords: JSON.parse(req.body.metaKeywords),
          status: req.body.status,
          createdAt: new Date().toISOString(),
          updatedAt: null,
        });
        user.save();
      }
    });
    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
};

// @desc Get blog by id
// @route GET /:id
const getBlogById = async (req, res) => {
  try {
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's blog post
        let blog = user.blogs.find((blog) => blog.blogId === req.params.id);
        res.json({ status: "success", blog });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
};

// @desc Update blog by id
// @route PUT /:id
const updateBlogById = async (req, res) => {
  try {
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's blog posts
        let blog = user.blogs.find((blog) => blog.blogId === req.params.id);
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
          blog.imageName = imageName;
        }
        blog.title = req.body.title;
        blog.body = req.body.body;
        blog.metaTitle = req.body.metaTitle;
        blog.metaDescription = req.body.metaDescription;
        blog.metaKeywords = JSON.parse(req.body.metaKeywords);
        blog.status = req.body.status;
        blog.updatedAt = new Date().toISOString();
        user.save();
        res.json({ status: "success", blog });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
};

// @desc Delete blog by id
// @route DELETE /:id
const deleteBlogById = async (req, res) => {
  try {
    User.findOne({ _id: req.user._id }, async (err, user) => {
      if (err) {
        // on error
        res.status(500).json({ error: err });
      } else {
        // on success - return user's blog posts
        let blogs = user.blogs.find((blog) => blog.blogId === req.params.id);
        const params = {
          Bucket: bucketName,
          Key: blogs.imageName,
        };
        const command = new DeleteObjectCommand(params);
        await s3.send(command);
        user.blogs = user.blogs.filter((blog) => blog.blogId !== req.params.id);
        user.save();
        res.json({ status: "success" });
      }
    });
  } catch (error) {
    res.json({ status: "error", error: error });
  }
};

module.exports = {
  getAllBlogs,
  createNewBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById,
};
