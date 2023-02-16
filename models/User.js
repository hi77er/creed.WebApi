const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose = require("passport-local-mongoose");

const ExternalOAuth = new Schema({
  provider: { type: String, required: true },
  externalProfileId: { type: String, required: true },
  email: { type: String, required: true }
});

const Session = new Schema({
  authStrategy: { type: String, required: true },
  refreshToken: { type: String, required: true }
});

const Role = new Schema({
  name: { type: String, required: true },
});

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: false, unique: false },
  gender: { type: String },
  photos: [{ type: { value: String } }],
  salt: { type: String },
  hash: { type: String },
  roles: { type: [Role] },
  sessions: { type: [Session] },
  externalOAuth: { type: [ExternalOAuth] }
});

//Remove sessions' info from the object that we will serialize to send trough response
// User.set("toJSON", {
//   transform: function (doc, ret, options) {
//     delete ret.sessions
//     return ret;
//   },
// });

UserSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = User = mongoose.model("users", UserSchema);