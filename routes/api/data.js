const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const mongoose = require("mongoose");
const GlobalVar = require("../../models/GlobalVar");
const Fixtures = require("../../models/Fixtures");

// @route   GET api/data/live/fixtures
// @desc    Get new players for the week
// @access  Private
router.get("/live/fixtures", auth, async (req, res) => {
  try {
    const fixtures = await Fixtures.findOne();
    const globalvar = await GlobalVar.findOne({ name: "currentWeek" });
    const currentWeek = globalvar.data.week;

    res.send(fixtures["week" + currentWeek]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
