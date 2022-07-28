const mongoose = require("mongoose");

const FixturesSchema = new mongoose.Schema({
  name: String,
  week18: [],
  week19: [],
  week20: [],
  week21: [],
  week22: [],
  week23: [],
  week24: [],
  week25: [],
  week26: [],
  week27: [],
  week28: [],
  week29: [],
});

module.exports = Fixtures = mongoose.model("fixtures", FixturesSchema);
