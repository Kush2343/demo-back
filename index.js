const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./database/db");
const cors = require("cors");
const bcrypt = require("bcrypt");
const routes = require("./Auth/route");
const leadRoute = require("./routes/leadRoute");
const csvRoute = require("./routes/csvRoute");
const remoteLeadRoute = require("./routes/remoteLeadRoute");
const passwordReset = require("./Auth/passwordReset");
const { adminAuth, userAuth } = require("./middleware/auth");
const phonepeRoute = require("./routes/phoneperoute");
const { userRouter } = require("./Auth/route");
const dotenv = require("dotenv");

dotenv.config();

const app = express(); // Initialize express app here

app.use(cors({ origin: `https://demo-lead-front.vercel.app`, credentials: true })); // Now you can use cors middleware after initializing app

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
const path = require('path');
app.use(express.static(path.resolve(__dirname, 'public')));

app.get("/", (req, res) => res.send("home"));

app.get("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: "0" });
  res.status(200).json({ message: "Logged out successfully" });
});

// Authentication routes  LOGIN
app.use("/api/auth", require("./Auth/route"));

// Additional routes with authentication middleware
app.use("/api/routes", routes);
app.use("/api/passwordReset", passwordReset);

//REGISTER
app.use("/api/phonepe", phonepeRoute);

// CSV upload route
app.use("/api/csv", csvRoute);

// Adding admin and basic routes with their respective middleware
app.get("/api/admin", adminAuth, (req, res) => res.send("Admin Route"));
app.get("/api/basic", userAuth, (req, res) => res.send("User Route"));

app.use("/api/leads", leadRoute);
app.use("/api/remoteleads", remoteLeadRoute);
// app.use("/api/leads", userAuth, routes);

app.use("/api/v1", userRouter);

app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: process.env.KEY_ID })
);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server connected to port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`An error occurred: ${err.message}`);
  server.close(() => process.exit(1));
});
