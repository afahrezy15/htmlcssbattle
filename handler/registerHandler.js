require("dotenv").config();

const userRepository = require("../repository/registerRepository");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    try {
        const userData = req.body;
        const user = await userRepository.createUser(userData);
        res.status(201).json({
            message: `User created`,
            user: user,
        });
    } catch (error) {
        res.status(400).json({
            message: `Failed to create user: ${error.message}`,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const userData = req.body;
        const loginData = await userRepository.loginUser(userData);
        console.log(userData);
        res.status(200).json({
            message: `User logged in`,
            user: loginData.user,
            token: loginData.token,
        });
    } catch (error) {
        res.status(400).json({
            message: `Failed to log in user: ${error.message}`,
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
};
