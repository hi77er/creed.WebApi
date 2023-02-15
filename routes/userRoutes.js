const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = mongoose.model('users');

router.get(
  '/current',
  (req, res) => {
    console.log('Current user: ');
    console.log(req.user);
    res.send(req.user);
  }
);

module.exports = router;