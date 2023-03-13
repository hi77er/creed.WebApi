const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
  res.send(
    {
      version: "1.0.18",
      message: 'Hello from a serverless containerized and continuously deployed Creed Web Api!',
      oauth: 'Google'
    }
  );
});

module.exports = router;