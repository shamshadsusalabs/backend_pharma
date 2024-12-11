const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../MiddleWare/cloudinary"); // Import Cloudinary configuration

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "temp", // Folder where files will be stored in Cloudinary (no leading slash)
        allowed_formats: ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "svg", "pdf"], // Allowed file formats
    },
});

// Multer setup
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Custom file filtering (optional)
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return cb(new Error("Invalid file type. Only images and PDFs are allowed."), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB file size limit (adjust as needed)
    },
});

// Export the configured Multer instance
module.exports = upload;
