const express = require("express");
const registerRoutes = require("./routes/registerRoutes");
const profileRoutes = require("./routes/profileRoutes");
const materiRoutes = require("./routes/materiRoutes");
const app = express();

app.use(express.json());
app.use(registerRoutes);
app.use(profileRoutes);
app.use(materiRoutes);

app.listen(3000, () => console.log("Server started on port 3000"));
