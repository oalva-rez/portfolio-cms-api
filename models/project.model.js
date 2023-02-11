// const mongoose = require("mongoose");

// const Project = new mongoose.Schema(
//     {
//         title: {
//             type: String,
//             required: [true, "Project name is required"],
//             trim: true,
//             minlength: [3, "Project name must be at least 3 characters long"],
//             lowercase: true,
//         },
//         description: {
//             type: String,
//             required: [true, "Project description is required"],
//             trim: true,
//             minlength: [3, "Project description must be at least 3 characters long"],
//             lowercase: true,
//         },
//         githubUrl: {
//             type: String,
//             required: [true, "Project github url is required"],
//             trim: true,
//             minlength: [3, "Project github url must be at least 3 characters long"],
//             lowercase: true,
//         },
//         liveUrl: {
//             type: String,
//             required: [true, "Project live url is required"],
//             trim: true,
//             minlength: [3, "Project live url must be at least 3 characters long"],
//             lowercase: true,
//         },
//         image: {
//             type: String,
//             required: [true, "Project image is required"],
//             trim: true,
//             minlength: [3, "Project image must be at least 3 characters long"],
//             lowercase: true,
//         },

//         }

// const model = mongoose.model("Project", Project);

// module.exports = model;
