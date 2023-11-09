const supabase = require("../utils/supabase.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
require("dotenv").config();

const createUser = async (userData) => {
    if (!validator.isEmail(userData.email)) {
        throw new Error("Invalid email address");
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    console.log("Hashed Password:", hashedPassword);

    const { data, error } = await supabase.from("user").insert(
        [
            {
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                about: userData.about,
                foto: userData.foto,
                notelp: userData.notelp,
                alamat: userData.alamat,
                html_progress: userData.html_progress,
                css_progress: userData.css_progress,
                javascript_progress: userData.javascript_progress,
            },
        ],
        { returning: "minimal" }
    );

    if (error) {
        throw new Error(`Error inserting new user: ${error.message}`);
    }

    const token = jwt.sign({ user: userData }, process.env.JWT_SECRET, {
        expiresIn: "2h",
    });

    return {
        user: userData,
        token: token,
    };
};

const loginUser = async (userData) => {
    if (!validator.isEmail(userData.email)) {
        throw new Error("Invalid email address");
    }

    const { data, error } = await supabase
        .from("user")
        .select("*")
        .eq("email", userData.email)
        .single();

    if (error) {
        console.log(error);
        throw new Error(`Error fetching user: ${error.message}`);
    }

    if (!data) {
        throw new Error("No user found");
    }

    const isValidPassword = bcrypt.compareSync(
        userData.password,
        data.password
    );
    if (!isValidPassword) {
        throw new Error("Invalid password");
    }

    const token = jwt.sign({ user: data }, process.env.JWT_SECRET, {
        expiresIn: "2h",
    });

    const { password, ...userDataWithoutPassword } = data;

    return {
        user: userDataWithoutPassword,
        token: token,
    };
};

module.exports = {
    createUser,
    loginUser,
};
