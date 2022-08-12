const mongoose = require("mongoose");
const shortid = require("shortid");

const partSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    date: { type: Date, defualt: Date.now },
    teamname: { type: String },
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

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = League = mongoose.model("leagues", LeagueSchema);
