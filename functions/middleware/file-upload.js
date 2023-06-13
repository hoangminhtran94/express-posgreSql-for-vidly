const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4 } = require("uuid");
const AWS = require("aws-sdk");
AWS.config.update({
  // eslint-disable-next-line no-undef
  accessKeyId: process.env.AWS_ACCESS_KEY_VERY_ID,
  // eslint-disable-next-line no-undef
  secretAccessKey: process.env.AWS_ACCESS_KEY_VERY_SECRET,
  region: "us-east-1",
});
// eslint-disable-next-line no-undef

const s3 = new AWS.S3();
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};
exports.fileUpload = multer({
  limits: 500000,
  storage: multerS3({
    s3,
    bucket: "vidly-storage",
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const extension = MIME_TYPE_MAP[file.mimetype];
      cb(null, v4() + "." + extension);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime typed!");
    cb(error, isValid);
  },
});
