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
    "mongodb://mongo:27017/docker-node-mongo",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected."))
  .catch((err) => console.log("err"));

const PORT = process.env.PORT || 5000;
app.listen(PORT);