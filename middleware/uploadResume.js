const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "resumes",        // folder name in Cloudinary
        public_id: (req, file) => {
            // create unique filename
            return Date.now() + "_" + file.originalname;
        },
        resource_type: "auto"      // allow PDF, DOC, DOCX
    },
});

const upload = multer({ storage });

module.exports = upload;
