const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let RoleSchema = new Schema({
  name: { type: String, required: true },
});

module.exports = Role = mongoose.model("roles", RoleSchema);