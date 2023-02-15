const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose")

const Session = new Schema({
  refreshToken: { type: String, default: "", required: true }
});

const UserSchema = new Schema({
  emails: [{ type: { value: String, verified: Boolean }, required: true }],
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: false },
  authStrategy: { type: String, default: "local" },
  sessions: { type: [Session] },
  photos: [{ type: { value: String }, required: false }],
  googleId: { type: String, required: false },
  // roles: [{ type: Schema.Types.ObjectId, ref: 'roles', required: true }],
});

//Remove sessions' info from the object that we will serialize to send trough response
// User.set("toJSON", {
//   transform: function (doc, ret, options) {
//     delete ret.sessions
//     return ret;
//   },
// });

UserSchema.plugin(passportLocalMongoose);

module.exports = User = mongoose.model("users", UserSchema);