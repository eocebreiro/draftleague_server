const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
//const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
//const Profile = require("../../models/Profile");
//const User = require("../../models/User");
const League = require("../../models/Leagues");
const NewPlayer = require("../../models/NewPlayer");

// @route   GET api/league/newplayers
// @desc    Get new players for the week
// @access  Private
router.get("/newplayers", async (req, res) => {
  try {
    const newPlayers = await NewPlayer.find();
    res.send(newPlayers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/league/:leagueId
// @desc    Get users league
// @access  Private
router.get("/:leagueId", auth, async (req, res) => {
  try {
    const league = await League.findOne({
      _id: mongoose.Types.ObjectId(req.params.leagueId),
    });
    console.log(league.participants[0].user);
    console.log(mongoose.Types.ObjectId(req.user.id));
    for (let l = 0; l < league.participants.length; l++) {
      if (
        league.participants[l].user.equals(mongoose.Types.ObjectId(req.user.id))
      ) {
        console.log("ENTER");
        return res.json(league);
      }
    }
    return res.status(400).json({ msg: "There is no league for this user" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
