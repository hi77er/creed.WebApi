const express = require('express');
const { default: mongoose } = require("mongoose");
const cookieSession = require('cookie-session');
const passport = require('passport');

/////
// Mongoose
/////

require('./models/User');
// Configuring GoogleStrategy for passport
require('./services/passport');

mongoose
  .connect(
    process.env.MONGO_DB_CONNECTION_STRING,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected."))
  .catch((err) => console.log("err"));

/////
// App
/////

const app = express();

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY]
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Configuring routs
require('./routes/authRoutеs')(app);
require('./routes/dashboardRoutеs')(app);

const PORT = process.env.PORT || 80;
app.listen(PORT);