const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const Notify = require("../models/notify");

module.exports = (userId, refId, message, ref, io) => {
  const notify = Notify({
    _id: new mongoose.Types.ObjectId(),
    owner: userId,
    message: message,
    data: {
      id: mongoose.Types.ObjectId(refId),
      ref: ref
    }
  });
  notify.save().then(doc => {
    io.sockets.emit("new-feed", { feed: doc });
    return true;
  })
  .catch(err => { return false });
};