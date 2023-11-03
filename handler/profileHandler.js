const profileRepository = require("../repository/profileRepository");

exports.updateProfilePicture = async (req, res) => {
    try {
        const email = req.user.email;
        const file = req.file;

        const result = await profileRepository.updateProfilePicture(
            email,
            file
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const email = req.user.email;
        const userData = req.body;

        const updatedProfile = await profileRepository.updateUserProfile(
            email,
            userData
        );

        res.status(200).json(updatedProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const email = req.body.email;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        const resetResult = await profileRepository.resetPassword(
            email,
            oldPassword,
            newPassword
        );

        res.status(200).json(resetResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.showUserProfile = async (req, res) => {
    try {
        const email = req.user.email;

        const userProfile = await profileRepository.getUserProfile(email);

        delete userProfile.password;

        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUserProfile = async (req, res) => {
    try {
        const email = req.user.email;

        const deleteResult = await profileRepository.deleteUserProfile(email);

        res.status(200).json(deleteResult);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
