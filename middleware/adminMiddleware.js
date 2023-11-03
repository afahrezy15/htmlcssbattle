const jwt = require("jsonwebtoken"); // Import the jsonwebtoken module

module.exports = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Missing token" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }

        // Make sure the email is correctly extracted from the decoded object
        const email = decoded.user.email;

        if (email === "fahrezy@gmail.com") {
            // User has admin access, proceed
            next();
        } else {
            return res.status(403).json({ error: "Admin access required" });
        }
    });
};
