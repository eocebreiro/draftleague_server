const mongoose = require("mongoose");

const GlobalVarSchema = new mongoose.Schema(
  {
    name: String,
    data: {},
  },
  {
    collection: "globalvar",
  }
);

module.exports = GlobalVar = mongoose.model("globalvar", GlobalVarSchema);
