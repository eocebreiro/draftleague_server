const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const mongoose = require("mongoose");
const NewPlayer = require("../../models/Player").NewPlayer;
const Player = require("../../models/Player").Player;

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

// @route   GET api/players/:id
// @desc    Get a player by ID
// @access  Private
router.get("/:playerId", async (req, res) => {
  try {
    console.log(req.params.playerId);
    const player = await Player.findOne({
      player_id: req.params.playerId,
    });
    return res.json(player);
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
