const express = require("express");

const app = express();

app.get('/', (req, res) => {
  res.send(
    {
      version: "1.0.4",
      message: 'Hello from DEV branch of a serverless containerized and continuously deployed Servey Maker!'
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);