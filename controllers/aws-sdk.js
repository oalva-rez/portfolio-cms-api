const { S3Client } = require("@aws-sdk/client-s3");
const multer = require("multer");

require("dotenv").config();


const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const bucketRegion = process.env.AWS_REGION;
const bucketName = process.env.BUCKET_NAME;

const s3 = new S3Client({
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretAccessKey,
    },
    region: bucketRegion,
  });

const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = { s3, upload, bucketName }
  