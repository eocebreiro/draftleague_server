const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const League = require("../../models/Leagues");

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    pipeline = [
      {
        $match: {
          user: mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          includeArrayIndex: "arrayIndex",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          user: {
            $first: "$user",
          },
          leagues: {
            $first: "$leagues",
          },
          teamname: {
            $first: "$teamname",
          },
          __v: {
            $first: "$__v",
          },
          crest: {
            $first: "$crest",
          },
        },
      },
      {
        $lookup: {
          from: "leagues",
          localField: "leagues.league",
          foreignField: "_id",
          as: "leagues",
        },
      },
      {
        $unwind: {
          path: "$leagues",
          includeArrayIndex: "arrayIndex",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          "leagues.leaguename": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          crest: {
            $first: "$crest",
          },
          leagues: {
            $push: "$leagues",
          },
          teamname: {
            $first: "$teamname",
          },
          user: {
            $first: "$user",
          },
          __v: {
            $first: "$__v",
          },
        },
      },
      {
        $project: {
          "user.password": 0,
          "user.email": 0,
          "user.date": 0,
          "user.__v": 0,
        },
      },
    ];
    const profile = await Profile.aggregate(pipeline);
    if (profile.length < 1) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/profile/
// @desc    Create or update user profile
// @access  Private
router.post(
  "/",
  [auth, [check("teamname", "Team name is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { teamname, crest, leagues } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (teamname) profileFields.teamname = teamname;
    if (crest) {
      profileFields.crest = crest;
    } else {
      profileFields.crest =
        "https://draftleague.s3.us-west-1.amazonaws.com/avatar-1299805_640.png";
    }
    if (leagues) profileFields.leagues = leagues;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update Profile
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // Create Profile
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route   GET api/profile/
// @desc    Get all profiles
// @access  Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name"]);

    if (!profile) {
      return res.status(400).json({ msg: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/profile/
// @desc    Delete profile and user
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/profile/player/:player_id
// @desc    Delete a player from profile team
// @access  Private
router.delete("/player/:player_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    let found = false;
    // Remove Player
    profile.leagues.map((item) => {
      if (item.id === req.params.player_id) {
        item.remove();
        found = true;
      }
    });

    if (!found) {
      return res.status(400).json({ errors: [{ msg: "Player not found" }] });
    } else await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
