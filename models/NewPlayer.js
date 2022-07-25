const mongoose = require("mongoose");

const NewPlayerSchema = new mongoose.Schema({
  player_id: Number,
  position_id: Number,
  common_name: String,
  display_name: String,
  fullname: String,
  firstname: String,
  lastname: String,
  nationality: String,
  birthdate: String,
  image_path: String,
  nationality: String,
  team: {
    team_id: Number,
    name: String,
    short_code: String,
    logo_path: String,
  },
  data: {},
});

module.exports = NewPlayer = mongoose.model("newplayer", NewPlayerSchema);
