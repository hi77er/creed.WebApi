require('dotenv').config();
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
mongoose
  .connect(
    process.env.MONGO_DB_CONNECTION_STRING,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected."))
  .catch((err) => console.log("err"));
