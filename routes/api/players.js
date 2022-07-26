const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const NewPlayer = require("../../models/Player").NewPlayer;
const Player = require("../../models/Player").Player;
const League = require("../../models/Leagues");

// @route   GET api/players/new
// @desc    Get new players for the week
// @access  Private
router.get("/new", auth, async (req, res) => {
  try {
    const players = await NewPlayer.find();
    return res.json(players);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/players/
// @desc    Get ALL players for the week EXCEPT incoming new players
// @access  Private
router.get("/", async (req, res) => {
  try {
    const players = await Player.find();
    return res.json(players);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
