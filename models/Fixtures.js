const mongoose = require("mongoose");

const FixturesSchema = new mongoose.Schema({
  week: Number,
  active: Boolean,
  fixtures: [],
});

module.exports = Fixtures = mongoose.model("fixtures", FixturesSchema);
