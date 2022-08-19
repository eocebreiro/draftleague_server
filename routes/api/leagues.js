const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const League = require("../../models/Leagues");
const NewPlayer = require("../../models/Player").NewPlayer;
const Player = require("../../models/Player").Player;
const Profile = require("../../models/Profile");
const Fixtures = require("../../models/Fixtures");

// @route   GET api/leagues/
// @desc    Get all leagues from a user
// @access  Private
router.get("/:userId", auth, async (req, res) => {
  const user_id = req.params.userId;
  try {
    const leagues = await League.find({
      "participants.user": mongoose.Types.ObjectId(user_id),
    });

    res.send(leagues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
