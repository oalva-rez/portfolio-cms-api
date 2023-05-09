const { s3, bucketName } = require("../controllers/aws-sdk");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const getSignedImageURL = async (object) => {
  const getObjectParams = {
    Bucket: bucketName,
    Key: object.imageName,
  };

  // Get signed image URL
  const command = new GetObjectCommand(getObjectParams);
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
};

module.exports = { getSignedImageURL };
