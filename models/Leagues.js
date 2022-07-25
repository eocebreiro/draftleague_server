const mongoose = require("mongoose");
const shortid = require("shortid");

const teamSchema = new mongoose.Schema(
  {
    player_id: {
      type: Number,
      required: true,
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
    team: [teamSchema],
  },
  { _id: false }
);

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
  participants: [partSchema],

  leagueId: {
    type: String,
    required: true,
    default: shortid.generate,
    index: { unique: true },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = League = mongoose.model("leagues", LeagueSchema);
