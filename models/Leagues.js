const mongoose = require("mongoose");
const shortid = require("shortid");

const teamSchema = new mongoose.Schema(
  {
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
    position: String,
    lock: Boolean,
    team: {
      team_id: Number,
      name: String,
      short_code: String,
      logo_path: String,
    },

    date_added: { type: Date, default: Date.now() },
  },
  { _id: false }
);

const partSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    date: { type: Date, defualt: Date.now },
    teamname: { type: String },
    team: [teamSchema],
  },
  { _id: false }
);
const dataSchema = new mongoose.Schema({
  winner_team_id: Number,
  team_one: {},
  team_two: {},
  standings: {},
});
const scheduleSchema = new mongoose.Schema({
  week: Number,
  active: Boolean,
  data: [dataSchema],
});

const LeagueSchema = new mongoose.Schema({
  leaguename: {
    type: String,
    required: true,
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  numOfParticipants: {
    type: Number,
    required: true,
    options: { min: 4, max: 16 },
  },
  numOfPlayers: {
    type: Number,
    required: true,
    options: { min: 11, max: 20 },
  },
  participants: [partSchema],

  leagueId: {
    type: String,
    required: true,
    default: shortid.generate,
    index: { unique: true },
  },

  participantsFull: {
    type: Boolean,
    default: false,
  },
  draftComplete: {
    type: Boolean,
    default: false,
  },
  activeWeek: {
    type: Number,
    default: null,
  },
  schedule: [scheduleSchema],

  playerList: [],

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = League = mongoose.model("leagues", LeagueSchema);
