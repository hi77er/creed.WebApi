const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model('users');
const router = express.Router();
const { verifyUser } = require("../services/auth/authenticate");

router.get(
  '/list/delete',
  async (req, res) => {
    User.findOneAndRemove({ email: 'kkrastev@live.com' });
    User.collection.dropIndexes(() => { });
    User.collection.drop(() => { });

    User
      .find({})
      .then((users) => {
        res.send(users);
      });
  }
);

router.get(
  '/list',
  (req, res) => {
    User
      .find({})
      .then((users) => {
        res.send(users);
      });
  }
);

router.get(
  '/current',
  verifyUser,
  async (req, res) => {
    const user = await User.findOne({ _id: req.user._id });
    res.send(user);
  }
);

router.get(
  '/indexes',
  (req, res) => {
    User.listIndexes().then(x => {
      res.send(x);
    });
  }
);

module.exports = router;