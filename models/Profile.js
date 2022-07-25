const mongoose = require("mongoose");

const subSchema = new mongoose.Schema(
  {
    league: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "leagues",
      require: true,
    },
    date: { type: Date, defualt: Date.now, require: true },
  },
  { _id: false }
);

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  teamname: { type: String, required: true },

  crest: String,

  date: { type: Date, defualt: Date.now },
  leagues: [subSchema],
});

module.exports = Profile = mongoose.model("profile", ProfileSchema);
