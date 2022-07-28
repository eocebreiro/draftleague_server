const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const mongoose = require("mongoose");
const Fixtures = require("../../models/Fixtures");

// @route   GET api/fixtures/
// @desc    Get the current week fixtures
// @access  Private
router.get("/", async (req, res) => {
  try {
    const fixtures = await Fixtures.findOne({ active: true });
    return res.json(fixtures);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/fixtures/week/:week
// @desc    Get a certain week's fixtures
// @access  Private
router.get("/week/:week", async (req, res) => {
  try {
    const fixtures = await Fixtures.findOne({ week: req.params.week });
    return res.json(fixtures);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
module.exports = router;
