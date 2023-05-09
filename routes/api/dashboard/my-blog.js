const express = require("express");
const router = express.Router();
const { upload } = require("../../../controllers/aws-sdk");
const {
  getAllBlogs,
  createNewBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById,
} = require("../../../controllers/blogsController");

// get all blog posts
router.get("/", getAllBlogs);

// create new blog
router.post("/create", upload.single("blogImage"), createNewBlog);

// get blog by id
router.get("/:id", getBlogById);

// update blog by id
router.put("/:id", upload.single("blogImage"), updateBlogById);

//delete blog by id
router.delete("/:id", deleteBlogById);

module.exports = router;
