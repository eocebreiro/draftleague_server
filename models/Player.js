const mongoose = require("mongoose");

const dataSchema = new mongoose.Schema(
  {
    week: Number,
    active: Boolean,
    fixture_id: Number,
    played: Boolean,
    home: Boolean,
    opponent_name: String,
    opponent_short_code: String,
    opponent_logo_path: String,
    minutes: {
      data: Number,
      score: Number,
    },
    goals: {
      data: Number,
      score: Number,
    },
    assists: {
      data: Number,
      score: Number,
    },
    cleansheet: {
      data: Number,
      score: Number,
    },
    pen_saved: {
      data: Number,
      score: Number,
    },
    pen_won: {
      data: Number,
      score: Number,
    },
    pen_missed: {
      data: Number,
      score: Number,
    },
    goals_conceded: {
      data: Number,
      score: Number,
    },
    saves: {
      data: Number,
      score: Number,
    },
    yellow_card: {
      data: Number,
      score: Number,
    },
    red_card: {
      data: Number,
      score: Number,
    },
    own_goal: {
      data: Number,
      score: Number,
    },
    tackles: {
      data: Number,
      score: Number,
    },
    passes: {
      data: Number,
      score: Number,
    },
    key_passes: {
      data: Number,
      score: Number,
    },
    crosses_accuracy: {
      data: Number,
      score: Number,
    },
    clearance: {
      data: Number,
      score: Number,
    },
    blocks: {
      data: Number,
      score: Number,
    },
    shots: {
      data: Number,
      score: Number,
    },
    fouls_drawn: {
      data: Number,
      score: Number,
    },
  },
  { _id: false }
);

const ownershipSchema = new mongoose.Schema(
  {
    league_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leagues",
      require: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    date: { type: Date, defualt: Date.now, require: true },
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
  lock: Boolean,
  team: {
    team_id: Number,
    name: String,
    short_code: String,
    logo_path: String,
  },
  ownership: [ownershipSchema],
  data: [dataSchema],
});

module.exports = {
  NewPlayer: mongoose.model("newplayers", PlayerSchema),
  Player: mongoose.model("currentplayers", PlayerSchema),
};
