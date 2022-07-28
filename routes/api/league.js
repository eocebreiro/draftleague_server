const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const League = require("../../models/Leagues");
const NewPlayer = require("../../models/Player").NewPlayer;
const Player = require("../../models/Player").Player;
const Profile = require("../../models/Profile");

// @route   GET api/league/newplayers
// @desc    Get new players for the week
// @access  Private
router.get("/newplayers", auth, async (req, res) => {
  try {
    const Players = await NewPlayer.find();
    return res.json(Players);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/league/create
// @desc    Create a new league
// @access  Private
router.post(
  "/create",
  [
    auth,
    [
      check("leaguename", "League name is required").not().isEmpty(),

      check(
        "numOfParticipants",
        "Number of participants should be between 4 to 16 players."
      ).isNumeric({ min: 4, max: 16 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Build a new league object
    const { leaguename, numOfParticipants } = req.body;
    const leagueFields = {};

    leagueFields.admin = req.user.id;
    if (leaguename) leagueFields.leaguename = leaguename;
    if (numOfParticipants) leagueFields.numOfParticipants = numOfParticipants; // create new league

    // Get the list of players
    try {
      let players = await Player.find();
      leagueFields.playerList = players;
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }

    // Add leage to profile
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      league = new League(leagueFields);
      league.participants.push({ user: req.user.id, date: Date.now() });
      await league.save();

      profile.leagues.push({ league: league.id, date: Date.now() });
      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   POST api/league/join
// @desc    join a new league
// @access  Private
router.post(
  "/join",
  [auth, [check("leagueId", "League code is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      let league = await League.findOne({ leagueId: req.body.leagueId });

      if (league) {
        //Check to see if user is already in the league
        console.log(profile.user);
        for (let i = 0; i < league.participants.length; i++) {
          console.log(league.participants[i].user);
          if (profile.user.equals(league.participants[i].user)) {
            return res
              .status(400)
              .json({ errors: [{ msg: "User already in the league" }] });
          }
        }
        //Check to see if there is room for player to join the league
        if (league.participants.length < league.numOfParticipants) {
          profile.leagues.push({ league: league.id, date: Date.now() });
          console.log(profile);
          await profile.save();
          league.participants.push({ user: req.user.id, date: Date.now() });
          await league.save();
          return res.json(profile);
        }
      }
      return res.status(400).json({ errors: [{ msg: "Invalid league code" }] });
    } catch (err) {}
  }
);

// @route   GET api/league/:leagueId
// @desc    Get users league
// @access  Private
router.get("/:leagueId", auth, async (req, res) => {
  try {
    const league = await League.findOne({
      _id: mongoose.Types.ObjectId(req.params.leagueId),
    });
    for (let l = 0; l < league.participants.length; l++) {
      if (
        league.participants[l].user.equals(mongoose.Types.ObjectId(req.user.id))
      ) {
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
