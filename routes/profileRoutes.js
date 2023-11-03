const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const authMiddleware = require("../middleware/authMiddleware");
const profileHandler = require("../handler/profileHandler");

router.put(
    "/profile_picture",
    authMiddleware,
    upload.single("foto"),
    profileHandler.updateProfilePicture
);
router.put("/profile", authMiddleware, profileHandler.updateUserProfile);
router.post("/reset_password", authMiddleware, profileHandler.resetPassword);
router.get("/profile", authMiddleware, profileHandler.showUserProfile);
router.delete("/profile", authMiddleware, profileHandler.deleteUserProfile);

module.exports = router;
