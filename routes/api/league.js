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

    leagueFields.playerList = [];

    // Add leage to profile
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      league = new League(leagueFields);
      league.participants.push({
        user: req.user.id,
        teamname: profile.teamname,
        date: Date.now(),
      });
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
        for (let i = 0; i < league.participants.length; i++) {
          if (profile.user.equals(league.participants[i].user)) {
            return res
              .status(400)
              .json({ errors: [{ msg: "User already in the league" }] });
          }
        }
        //Check to see if there is room for player to join the league
        if (league.participants.length < league.numOfParticipants) {
          profile.leagues.push({ league: league.id, date: Date.now() });
          await profile.save();
          league.participants.push({
            user: req.user.id,
            teamname: profile.teamname,
            date: Date.now(),
          });

          // Check to see if the league is full after adding the participant
          // If it is full, start the league
          if (league.participants.length === league.numOfParticipants) {
            league.participantsFull = true;
            // Build the schedule
            let schedule = [];
            let half1 = [];
            let half2 = [];
            let partArray = league.participants
              .map((value) => ({
                value,
                sort: Math.random(),
              }))
              .sort((a, b) => a.sort - b.sort)
              .map(({ value }) => value);

            //split array
            for (let i = 0; i < partArray.length; i++) {
              if (i % 2 == 0) {
                half1.push(partArray[i]);
              } else {
                half2.push(partArray[i]);
              }
            }
            console.log(half2.length);

            // Get number of weeks left and current active week +1 (matches start the following week)
            let fixtures = await Fixtures.find();
            let numofWeeks = fixtures.length;
            let activeWeek;
            for (let i = 0; i < fixtures.length; i++) {
              if (fixtures[i].active) {
                activeWeek = fixtures[i].week + 1;
                break;
              }
            }
            // Assign scheudle
            console.log("num of weeks");
            console.log(numofWeeks);
            console.log("actjive weeks");
            console.log(activeWeek);

            // DEV MODE FIX THIS NEXT change 29 to numOfWeeks
            for (let i = activeWeek; i <= 29; i++) {
              let data = [];
              for (let j = 0; j < half1.length; j++) {
                data.push({
                  winner_team_id: null,
                  team_one: {
                    user_id: half1[j].user,
                    teamname: half1[j].teamname,
                    logo_path: null,
                    score: null,
                  },
                  team_two: {
                    user_id: half2[j].user,
                    teamname: half2[j].teamname,
                    logo_path: null,
                    score: null,
                  },
                  standings: {
                    team_one_position: null,
                    team_two_position: null,
                  },
                });
                console.log("test3");
              }

              // Adjust array for next schedule
              half2.push(half1[half1.length - 1]); // add the last one of half1 to half2
              half1.splice(1, 0, half2[0]); // Add the first one of half2 under the first one of half1
              half2.splice(0, 1); // Remove the first one in half2
              half1.splice(half1.length - 1, 1); // Remove last one in half1

              schedule.push({
                week: i,
                active: false,
                data: data,
              });
            }

            console.log(schedule);
            league.schedule = schedule;
          }

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
