const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { adminAuth } = require("../middleware/auth");

const databaseController = require("../controllers/databaseController");

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

// CSV upload route
router.post('/importUser',adminAuth, upload.single('file'), databaseController.importUser);

// Route to delete all lead data
router.delete('/deleteAllLeadData',adminAuth, databaseController.deleteAllLeadData);

module.exports = router;
