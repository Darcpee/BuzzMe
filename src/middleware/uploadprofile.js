const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* ===========================================
   CREATE UPLOAD FOLDER
=========================================== */

const uploadPath = path.join(process.cwd(), "uploads", "profile");
console.log(uploadPath);
console.log(fs.existsSync(uploadPath));
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

/* ===========================================
   STORAGE
=========================================== */

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }

});

/* ===========================================
   FILE FILTER
=========================================== */

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG and WEBP images are allowed."), false);
    }

};

/* ===========================================
   MULTER
=========================================== */

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = upload;