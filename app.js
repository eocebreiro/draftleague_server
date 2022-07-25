const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");

const connectDB = require("./config/db");

//Routes
const userRoutes = require("./routes/api/users");
const authRoutes = require("./routes/api/auth");
const profileRoutes = require("./routes/api/profile");
const leagueRoutes = require("./routes/api/league");

//Init Middleware
app.use(morgan("dev"));
app.use(express.json({ extended: false }));

//Connect to the database
connectDB();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (res.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET"); //CHECK BACK LATER
    return res.status(200).json({});
  }
  next();
});

//Routes which should handle requests
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/league", leagueRoutes);

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
