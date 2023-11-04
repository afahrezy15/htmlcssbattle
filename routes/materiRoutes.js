const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const authMiddleware = require("../middleware/authMiddleware");
const materiHandler = require("../handler/materiHandler");
const adminMiddleware = require("../middleware/adminMiddleware");
const { auth } = require("../utils/supabase");

// Create a new route for creating "materi"
router.post(
    "/materi",
    authMiddleware,
    adminMiddleware,
    upload.array("foto_materi"), // Handle file upload for "foto_materi"
    materiHandler.createMateri
);
// Create a route to get all "materi"
router.get("/materi", materiHandler.getAllMateri);

// Create a route to get a specific "materi" by ID
router.get("/materi/:id", materiHandler.getMateriById);
router.get("/materi/search/:jenis_materi", materiHandler.searchMateriByJenis);
router.delete(
    "/materi/:id",
    authMiddleware,
    adminMiddleware,
    materiHandler.deleteMateri
);

router.put(
    "/cover_photo/:id",
    authMiddleware,
    upload.single("foto_cover"),
    materiHandler.updateCoverPhoto
);

module.exports = router;
