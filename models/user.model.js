const mongoose = require("mongoose");

const Blog = new mongoose.Schema({
  blogId: {
    type: String,
    required: [true, "Blog id is required"],
  },
  title: {
    type: String,
    required: [true, "Blog title is required"],
    trim: true,
    minlength: [3, "Blog title must be at least 3 characters long"],
  },
  body: {
    type: String,
    required: [true, "Blog body is required"],
    minlength: [3, "Blog body must be at least 3 characters long"],
  },
  imageName: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  metaTitle: {
    type: String,
    required: [true, "Blog meta title is required"],
    trim: true,
  },
  metaDescription: {
    type: String,
    required: [true, "Blog meta description is required"],
    trim: true,
  },
  metaKeywords: {
    type: String,
    required: [true, "Blog meta keywords are required"],
  },
  status: {
    type: String,
    required: [true, "Blog status is required"],
  },
  createdAt: {
    type: String,
  },
  updatedAt: {
    type: String,
  },
});
const Project = new mongoose.Schema({
  projectId: {
    type: String,
    required: [true, "Project id is required"],
  },
  title: {
    type: String,
    required: [true, "Project name is required"],
    trim: true,
    minlength: [3, "Project name must be at least 3 characters long"],
  },
  description: {
    type: String,
    required: [true, "Project description is required"],
    trim: true,
    minlength: [3, "Project description must be at least 3 characters long"],
  },
  githubUrl: {
    type: String,
    required: [true, "Project github url is required"],
    trim: true,
    minlength: [3, "Project github url must be at least 3 characters long"],
  },
  liveUrl: {
    type: String,
    required: [true, "Project live url is required"],
    trim: true,
    minlength: [3, "Project live url must be at least 3 characters long"],
  },
  featured: {
    type: Boolean,
  },
  wip: {
    type: Boolean,
  },
  techSelect: {
    type: String,
  },
  imageName: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
});

const User = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email is already taken"],
      trim: true,
      minlength: [3, "Email must be at least 3 characters long"],
      lowercase: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username is already taken"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    siteName: {
      type: String,
      required: [true, "Site name is required"],
      trim: true,
      minlength: 3,
    },
    apiKey: {
      type: String,
    },
    projects: [Project],
    blogs: [Blog],
  },
  { collection: "user-data" }
);

const model = mongoose.model("User", User);

module.exports = model;
