const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema(
  {
    minutes: Number,
    goals: Number,
    assists: Number,
    cleansheet: Number,
    pen_saved: Number,
    pen_won: Number,
    pen_missed: Number,
    goals_conceded: Number,
    team_conceded: Number,
    saves: Number,
    yellow_card: Number,
    red_card: Number,
    own_goal: Number,
    tackles: Number,
    passes: Number,
    key_passes: Number,
    crosses_accuracy: Number,
    clearance: Number,
    blocks: Number,
    shots: Number,
    fouls_drawn: Number,
  },
  { _id: false }
);

const PlayerSchema = new mongoose.Schema({
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
  data: [dataSchema],
});

module.exports = {
  NewPlayer: mongoose.model("newplayer", PlayerSchema),
  Player: mongoose.model("currentplayer", PlayerSchema),
};
