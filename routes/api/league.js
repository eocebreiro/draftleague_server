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
      check(
        "numOfPlayers",
        "Number of players should be between 11 to 20 players."
      ).isNumeric({ min: 11, max: 20 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //Build a new league object
    const { leaguename, numOfParticipants, numOfPlayers } = req.body;
    const leagueFields = {};

    leagueFields.admin = req.user.id;
    if (leaguename) leagueFields.leaguename = leaguename;
    if (numOfParticipants) leagueFields.numOfParticipants = numOfParticipants; // create new league
    if (numOfPlayers) leagueFields.numOfPlayers = numOfPlayers;

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
            console.log(numofWeeks);
            console.log(activeWeek);

            // DEV MODE FIX THIS NEXT change 29 to numOfWeeks    //*************************************************************************************DEV MODE OFF
            //for (let i = 18; i <= 29; i++) {
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
                    lineup: [],
                  },
                  team_two: {
                    user_id: half2[j].user,
                    teamname: half2[j].teamname,
                    logo_path: null,
                    score: null,
                    lineup: [],
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
// @desc    Get the user's specific league
// @access  Public
router.get("/:leagueId", async (req, res) => {
  const league_id = req.params.leagueId;

  try {
    const league = await League.findOne({
      _id: mongoose.Types.ObjectId(league_id),
    });

    return res.json(league);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/league/:leagueId/roster/:playerId
// @desc    Get any player's roster
// @access  Private
router.get("/:leagueId/roster/:userId", auth, async (req, res) => {
  try {
    const players = await Player.find({
      "ownership.user_id": mongoose.Types.ObjectId(req.params.userId),
      "ownership.league_id": mongoose.Types.ObjectId(req.params.leagueId),
    });
    return res.json(players);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/league/:leagueId/roster/add/:id
// @desc    Add player to team roster
// @access  Private
router.post("/:leagueId/roster/add/:playerId", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const league_id = req.params.leagueId;
  const player_id = req.params.playerId;
  const user_id = req.user.id;

  try {
    let player = await Player.findOne({ player_id: player_id });

    // Check to see if player is locked
    if (player.lock) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Player is locked for the week" }] });
    }

    // Check to see if player is taken or avalible
    for (let i = 0; i < player.ownership.length; i++) {
      if (
        player.ownership[i].league_id.equals(mongoose.Types.ObjectId(league_id))
      ) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Player is already on a team" }] });
      }
    }

    let league = await League.findOne({
      _id: mongoose.Types.ObjectId(league_id),
    });

    const roster = await Player.find({
      "ownership.user_id": mongoose.Types.ObjectId(user_id),
      "ownership.league_id": mongoose.Types.ObjectId(league_id),
    });

    // Check to see if there is room to add the player to the roster
    if (roster.length >= league.numOfPlayers) {
      return res.status(400).json({
        errors: [
          {
            msg: "You're team is full. Drop a player before adding a new one",
          },
        ],
      });
    }

    // (League Rules: 2 keeper per team)
    // Check to see if this rule is violated
    if (player.position_id === 1) {
      let goalkeeperCount = 0;
      for (let i = 0; i < roster.length; i++) {
        if (roster[i].position_id == 1) {
          goalkeeperCount++;
        }
      }
      if (goalkeeperCount >= 2) {
        return res.status(400).json({
          errors: [
            {
              msg: "You have the maximun number of goalkeepers (2). Drop a goalkeeper before adding a new one",
            },
          ],
        });
      }
    }
    // Add player to league
    player.ownership.push({ league_id: league_id, user_id: user_id });

    await player.save();
    const players = await Player.find();

    res.send(players);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/league/:leagueId/roster/drop/:playerId
// @desc    Drop (delete) player from team roster
// @access  Private
router.post("/:leagueId/roster/drop/:playerId", auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const league_id = req.params.leagueId;
  const player_id = req.params.playerId;
  const user_id = req.user.id;

  try {
    let player = await Player.findOne({ player_id: player_id });

    // Check to see if player is locked
    if (player.lock) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Player is locked for the week" }] });
    }

    // If player is on the user's team, drop the player

    for (let i = 0; i < player.ownership.length; i++) {
      if (
        player.ownership[i].user_id.equals(mongoose.Types.ObjectId(user_id)) &&
        player.ownership[i].league_id.equals(mongoose.Types.ObjectId(league_id))
      ) {
        player.ownership.splice(i, 1);
        break;
      }
    }

    // Also drop the player from the lineup if they are on one.
    let league = await League.findOne({ league_id: league_id });

    for (let i = 0; i < league.schedule.length; i++) {
      if (league.schedule[i].week === league.activeWeek) {
        for (let j = 0; j < league.schedule[i].data.length; j++) {
          if (
            league.schedule[i].data[j].team_one.user_id.equals(
              mongoose.Types.ObjectId(user_id)
            )
          ) {
            for (
              let k = 0;
              k < league.schedule[i].data[j].team_one.lineup.length;
              k++
            ) {
              if (
                league.schedule[i].data[j].team_one.lineup[k].player_id ==
                player_id
              ) {
                league.schedule[i].data[j].team_one.lineup.splice(k, 1);

                break;
              }
            }
            break;
          }
          if (
            league.schedule[i].data[j].team_two.user_id.equals(
              mongoose.Types.ObjectId(user_id)
            )
          ) {
            for (
              let k = 0;
              k < league.schedule[i].data[j].team_two.lineup.length;
              k++
            ) {
              if (
                league.schedule[i].data[j].team_two.lineup[k].player_id ==
                player_id
              ) {
                league.schedule[i].data[j].team_two.lineup.splice(k, 1);
                console.log("spiceS");
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }
    await league.save();

    await player.save();

    // Get updated roster list
    const roster = await Player.find({
      "ownership.user_id": mongoose.Types.ObjectId(user_id),
      "ownership.league_id": mongoose.Types.ObjectId(league_id),
    });
    res.send(roster);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/league/:leagueId/lineup/add/:playerId
// @desc    Add player from roster to current week's lineup
// @access  Private
router.post("/:leagueId/lineup/add/:playerId", auth, async (req, res) => {
  const league_id = req.params.leagueId;
  const player_id = req.params.playerId;
  const user_id = req.user.id;

  try {
    let player = await Player.findOne({ player_id: player_id }).lean();

    // Check to see if player is locked
    if (player.lock) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Player is locked for the week" }] });
    }

    let league = await League.findOne({
      _id: mongoose.Types.ObjectId(league_id),
    });

    // get schedule index
    let scheduleIndex;
    for (let i = 0; i < league.schedule.length; i++) {
      if (league.schedule[i].week === league.activeWeek) {
        scheduleIndex = i;
        break;
      }
    }

    // get data (fixture) index;
    let dataIndex;
    let team;
    for (let i = 0; i < league.schedule[scheduleIndex].data.length; i++) {
      if (
        league.schedule[scheduleIndex].data[i].team_one.user_id.equals(
          mongoose.Types.ObjectId(user_id)
        )
      ) {
        team = "team_one";
        dataIndex = i;
        break;
      }
      if (
        league.schedule[scheduleIndex].data[i].team_two.user_id.equals(
          mongoose.Types.ObjectId(user_id)
        )
      ) {
        team = "team_two";
        dataIndex = i;
      }
    }

    // Lineup short hand
    let lineup = league.schedule[scheduleIndex].data[dataIndex][team].lineup;

    // Check to see if lineup is full
    if (lineup.length === 11) {
      return res.status(400).json({
        errors: [
          {
            msg: "You're team is full. Drop a player from your lineup before adding a new one",
          },
        ],
      });
    }

    // Check to see if there is room to add the player to the lineup based on their position

    // Count the number of players per position
    let keeperCount = 0;
    let defCount = 0;
    let midCount = 0;
    let fwdCount = 0;

    let keeperMax = false;
    let defMin = false;
    let defMax = false;
    let midMin = false;
    let midMax = false;
    let fwdMin = false;
    let fwdMax = false;

    for (let i = 0; i < lineup.length; i++) {
      if (lineup[i].position_id === 1) {
        keeperCount++;
      } else if (lineup[i].position_id === 2) {
        defCount++;
      } else if (lineup[i].position_id === 3) {
        midCount++;
      } else if (lineup[i].position_id === 4) {
        fwdCount++;
      }
    }

    // count inner field players (everyone but keeper)
    let innerField = defCount + midCount + fwdCount;

    if (keeperCount === 1) {
      keeperMax = true;
    }
    if (defCount >= 3) {
      defMin = true;
    }
    if (defCount === 5) {
      defMax = true;
    }
    if (midCount >= 3) {
      midMin = true;
    }
    if (midCount === 5) {
      midMax = true;
    }
    if (fwdCount >= 1) {
      fwdMin = true;
    }
    if (fwdCount === 3) {
      fwdMax = true;
    }

    if (player.position_id === 1) {
      if (keeperMax) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid formation",
            },
          ],
        });
      }
    }
    if (player.position_id === 2) {
      if (defMax) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid formation",
            },
          ],
        });
      }
    }
    if (player.position_id === 3) {
      if (midMax) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid formation",
            },
          ],
        });
      }
    }
    if (player.position_id === 4) {
      if (fwdMax) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid formation",
            },
          ],
        });
      }
    }

    if (player.position_id !== 1 && innerField === 10) {
      return res.status(400).json({
        errors: [
          {
            msg: "Invalid formation",
          },
        ],
      });
    }

    // Check valid formation when adding the last player to lineup
    if (defCount + midCount + fwdCount === 9) {
      if (player.position_id === 2) {
        if (!midMin || !fwdMin) {
          return res.status(400).json({
            errors: [
              {
                msg: "Invalid formation",
              },
            ],
          });
        }
      }
      if (player.position_id === 3) {
        if (!defMin || !fwdMin) {
          return res.status(400).json({
            errors: [
              {
                msg: "Invalid formation",
              },
            ],
          });
        }
      }
      if (player.position_id === 4) {
        if (!midMin || !defMin) {
          return res.status(400).json({
            errors: [
              {
                msg: "Invalid formation",
              },
            ],
          });
        }
      }
    }

    // Check valid formation when adding the second to last player to lineup
    if (defCount + midCount + fwdCount === 8) {
      if (player.position_id === 2) {
        if (midCount === 1 || (midCount === 2 && fwdCount === 0)) {
          return res.status(400).json({
            errors: [
              {
                msg: "Invalid formation",
              },
            ],
          });
        }
      }
      if (player.position_id === 3) {
        if (defCount === 1 || (defCount === 2 && fwdCount === 0)) {
          return res.status(400).json({
            errors: [
              {
                msg: "Invalid formation",
              },
            ],
          });
        }
      }
      if (player.position_id === 4) {
        if (
          midCount === 1 ||
          defCount === 1 ||
          (midCount === 2 && defCount === 2)
        ) {
          return res.status(400).json({
            errors: [
              {
                msg: "Invalid formation",
              },
            ],
          });
        }
      }
    }

    /// COME BACK TO BELOW

    // Add player to league lineup
    delete player.ownership;
    delete player.data;
    delete player.fixtures;
    delete player.lock;
    league.schedule[scheduleIndex].data[dataIndex][team].lineup.push(player);

    await league.save();
    res.send(league);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/league/:leagueId/lineup/drop/:playerId
// @desc    Add player from roster to current week's lineup
// @access  Private
router.post("/:leagueId/lineup/drop/:playerId", auth, async (req, res) => {
  const league_id = req.params.leagueId;
  const player_id = req.params.playerId;
  const user_id = req.user.id;

  try {
    let player = await Player.findOne({ player_id: player_id }).lean();

    // Check to see if player is locked
    if (player.lock) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Player is locked for the week" }] });
    }

    let league = await League.findOne({
      _id: mongoose.Types.ObjectId(league_id),
    });

    // get schedule index
    let scheduleIndex;
    for (let i = 0; i < league.schedule.length; i++) {
      if (league.schedule[i].week === league.activeWeek) {
        scheduleIndex = i;
        break;
      }
    }

    // get data (fixture) index;
    let dataIndex;
    let team;
    for (let i = 0; i < league.schedule[scheduleIndex].data.length; i++) {
      if (
        league.schedule[scheduleIndex].data[i].team_one.user_id.equals(
          mongoose.Types.ObjectId(user_id)
        )
      ) {
        team = "team_one";
        dataIndex = i;
        break;
      }
      if (
        league.schedule[scheduleIndex].data[i].team_two.user_id.equals(
          mongoose.Types.ObjectId(user_id)
        )
      ) {
        team = "team_two";
        dataIndex = i;
      }
    }

    // Lineup short hand

    // Drop player from league lineup
    for (
      let i = 0;
      i < league.schedule[scheduleIndex].data[dataIndex][team].lineup.length;
      i++
    ) {
      if (
        league.schedule[scheduleIndex].data[dataIndex][team].lineup[i]
          .player_id == player_id
      ) {
        league.schedule[scheduleIndex].data[dataIndex][team].lineup.splice(
          i,
          1
        );
      }
    }

    await league.save();
    res.send(league);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/league/:leagueId/lineup/:userId
// @desc    Get a user's lineup
// @access  Private
router.get("/:leagueId/lineup/:userId", auth, async (req, res) => {
  const league_id = req.params.leagueId;
  const user_id = req.params.userId;

  try {
    const league = await League.findOne({
      _id: mongoose.Types.ObjectId(league_id),
    }).lean();

    let players = [];

    for (let i = 0; i < league.schedule.length; i++) {
      if (league.schedule[i].week === league.activeWeek) {
        for (let j = 0; j < league.schedule[i].data.length; j++) {
          if (
            league.schedule[i].data[j].team_one.user_id.equals(
              mongoose.Types.ObjectId(user_id)
            )
          ) {
            players = league.schedule[i].data[j].team_one.lineup;
            break;
          }
          if (
            league.schedule[i].data[j].team_two.user_id.equals(
              mongoose.Types.ObjectId(user_id)
            )
          ) {
            players = league.schedule[i].data[j].team_two.lineup;
            break;
          }
        }
        break;
      }
    }

    const lineup = [];
    for (let i = 0; i < players.length; i++) {
      let player = await Player.findOne({
        player_id: players[i].player_id,
      }).lean();
      lineup.push(player);
    }
    console.log(lineup[10]);
    res.send(lineup);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/league/
// @desc    Get all leagues from a user
// @access  Private
router.get("/", auth, async (req, res) => {
  const user_id = req.user.id;
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
