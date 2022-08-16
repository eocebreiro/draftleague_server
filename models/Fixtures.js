const mongoose = require("mongoose");

const FixturesSchema = new mongoose.Schema({
  week: Number,
  active: Boolean,
  data: [],
});

module.exports = Fixtures = mongoose.model("fixtures", FixturesSchema);
