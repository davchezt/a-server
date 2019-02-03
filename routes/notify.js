const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

const Notify = require("../models/notify");

router.get("/:userId", (req, res, next) => {
  Notify.find({ owner: req.params.userId })
  .exec()
  .then(doc => {
    const response = {
      count: doc.length,
      feed: doc
    };
    res.status(200).json(response);
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

router.post("/:userId", (req, res, next) => {
  const notify = Notify({
    _id: new mongoose.Types.ObjectId(),
    owner: req.params.userId,
    message: req.body.message,
    data: {
      id: mongoose.Types.ObjectId(req.body.data.id),
      ref: req.body.data.ref
    }
  });
  notify.save().then(doc => {
    res.status(200).json(doc);
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Management
router.patch("/:feedId", (req, res, nest) => {
  Notify.findOneAndUpdate({ _id: req.params.feedId }, { read: true }, { new: true })
  .then(notify => {
    if (notify) {
      res.status(200).json(notify)
    } else {
      res.status(401).json({ message: 'feed not found' })
    }
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

router.delete("/:feedId", (req, res, nest) => {
  Notify.findOneAndRemove({ _id: req.params.feedId })
  .then(notify => {
    if (notify) {
      res.status(200).json(notify)
    } else {
      res.status(401).json({ message: 'feed not found' })
    }
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

module.exports = router;