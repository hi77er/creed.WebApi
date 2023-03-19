import { Router } from "express";
import { model } from "mongoose";
import User from "../models/User";
import { verifyUser } from "../services/auth/authenticate";

const router = Router();

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
    if (req.authInfo && req.authInfo.errorMessage === 'expired')
      res.status(401).send(req.authInfo);
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

export default router;