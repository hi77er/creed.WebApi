const express = require("express");

const app = express();

app.get('/', (req, res) => {
  res.send(
    {
      version: "1.0.8",
      message: 'Hello from a serverless containerized and continuously deployed Servey Maker!'
    }
  );
})

const PORT = process.env.PORT || 5000;
app.listen(PORT);