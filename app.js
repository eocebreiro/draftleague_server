const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

//Routes
const userRoutes = require("./routes/api/users");
const authRoutes = require("./routes/api/auth");
const profileRoutes = require("./routes/api/profile");
const leagueRoutes = require("./routes/api/league");
const leaguesRoutes = require("./routes/api/leagues");
const playersRoutes = require("./routes/api/players");
const playerRoutes = require("./routes/api/player");
const fixturesRoutes = require("./routes/api/fixtures");
const dataRoutes = require("./routes/api/data");
const cors = require("cors");
const { MONGOURI } = process.env;
//Init Middleware
app.use(morgan("dev"));
app.use(express.json({ extended: false }));

//Connect to the database
try {
  mongoose.connect(MONGOURI, { useNewUrlParser: true });
  console.log("MongoDB Connected...");
} catch (err) {
  console.error(err.message);
  // Exit process with failure
  process.exit(1);
}

app.use(cors());

//Routes which should handle requests
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/fixtures", fixturesRoutes);
app.use("/api/league", leagueRoutes);
app.use("/api/leagues", leaguesRoutes);
app.use("/api/players", playersRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/data", dataRoutes);
// Error 404
app.use((req, res, next) => {
  const error = new Error("Not Found (404)");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
