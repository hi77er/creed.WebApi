const express = require('express');
const { default: mongoose } = require("mongoose");

const app = express();

// Configuring GoogleStrategy for passport
require('./services/passport');

// Configuring routs
require('./routs/authRoutеs')(app);
require('./routs/dashboardRoutеs')(app);

mongoose
  .connect(
    process.env.MONGO_DB_CONNECTION_STRING,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected."))
  .catch((err) => console.log("err"));

const PORT = process.env.PORT || 80;
app.listen(PORT);