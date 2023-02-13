const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let UserSchema = new Schema({
  emails: [{ type: { value: String, verified: Boolean }, required: true }],
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: false },
  // roles: [{ type: Schema.Types.ObjectId, ref: 'roles', required: true }],
  googleId: { type: String, required: false },
  googlePhotos: [{ type: { value: String }, required: false }],
});

module.exports = User = mongoose.model("users", UserSchema);