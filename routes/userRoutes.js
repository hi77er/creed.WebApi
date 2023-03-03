const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = mongoose.model('users');
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
        console.log('List users after deletion:');
        console.log(users);
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
  // verifyUser,
  (req, res) => {
    res.send(req.user);
  }
);

router.get(
  '/indexes',
  (req, res) => {
    User.listIndexes().then(x => {
      console.log('Indexes: ');
      console.log(x);
      res.send(x);
    });
  }
);

module.exports = router;