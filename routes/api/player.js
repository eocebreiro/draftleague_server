const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const NewPlayer = require("../../models/Player").NewPlayer;
const Player = require("../../models/Player").Player;
const League = require("../../models/Leagues");

// @route   GET api/player/:id
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

// @route   GET api/player/:id/status
// @desc    Returns true if player is locked and returns false if player is avalabie (unlocked)
// @access  Private
router.get("/:playerId/status", async (req, res) => {
  try {
    console.log(req.params.playerId);
    const player = await Player.findOne({
      player_id: req.params.playerId,
    });
    return res.json(player.lock);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
