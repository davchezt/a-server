const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.time() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

const Room = require('../models/room');
const addFeed = require('../utils/notify');

// Belum ada agronomis
router.get("/", (req, res, next) => {
  Room.find({ agronomis: 0 })
  // .select("-__v")
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      rooms: docs.map(doc => {
        return {
          id: doc._id,
          subject: doc.subject,
          petani: doc.petani,
          created: doc.created
        };
      })
    };
    res.status(200).json(response);
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Buat baru
router.post("/", (req, res, next) => {
  const room = new Room({
    _id: new mongoose.Types.ObjectId(),
    subject: req.body.subject,
    petani: req.body.userId,
    agronomis: 0,
    created: Date.time(),
    chat: []
  });
  room.save().then(rest => {
    if (rest) {
      req.io.sockets.emit("new-room", { room: rest }); // IO Socket
      res.status(200).json({
        message: "room created",
        room_id: rest._id
      });
    }
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Daftar chat petani
router.get("/:userId", (req, res, next) => {
  Room.find({ petani: req.params.userId })
  //.select("-__v")
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      rooms: docs.map(doc => {
        return {
          id: doc._id,
          subject: doc.subject,
          agronomis: doc.agronomis,
          chat: doc.chat.length > 0 ? doc.chat[0]:null,
          created: doc.created
        };
      })
    };
    res.status(200).json(response);
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Daftar chat agronomis
router.get("/:userId/agronomis", (req, res, next) => {
  Room.find({ agronomis: req.params.userId })
  //.select("-__v")
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      rooms: docs.map(doc => {
        return {
          id: doc._id,
          subject: doc.subject,
          petani: doc.petani,
          chat: doc.chat.length > 0 ? doc.chat[0]:null,
          created: doc.created
        };
      })
    };
    res.status(200).json(response);
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Masuk room id
router.get("/id/:roomId", (req, res, next) => {
  Room.findById(req.params.roomId)
  // .select("-_id -__v -petani")
  .exec()
  .then(doc => {
    if (doc) {
      res.status(200).json(doc);
    } else {
      res.status(404).json({ message: "room not found" });
    }
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Kirim pesan room
router.post("/id/:roomId", upload.single('image'), (req, res, next) => {
  Room.findById(req.params.roomId)
  .exec()
  .then(room => {
    const newImageChat = {
      from: req.body.from,
      text: req.body.text,
      image: req.file ? req.file.path.replace(/\\/g, '/'):'',
      created: Date.time(),
      read: req.body.read === "true" ? true : false
    }
    const newChat = {
      ...req.body,
      // image: req.file ? req.file.path.replace(/\\/g, '/'):'',
      created: Date.time()
    };
    room.chat.unshift(req.file ? newImageChat : newChat);
    room.save().then(chat => {
      res.status(200).json(chat);
      req.io.sockets.in(req.params.roomId).emit("message", { chat: room.chat[0], "room": req.params.roomId }); // IO Socket
    })
    .catch(err => { res.status(500).json({ error: err }); });
  })
});

// Agronomis gabung room
router.put("/id/:roomId", (req, res, next) => {
  Room.findOneAndUpdate({ _id: req.params.roomId }, req.body, { new: true })
  .then(room => {
    if (room) {
      res.status(200).json(room)
    } else {
      res.status(401).json({ message: 'room not found' })
    }
    // return !room
    //   ? res.status(401).json({ message: 'room not found' })
    //   : res.status(200).json(room)
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Agronomis meninggalkan room
router.patch("/id/:roomId", (req, res, next) => {
  Room.findOneAndUpdate({ _id: req.params.roomId }, { agronomis: 0 }, { new: true })
  .then(room => {
    if (room) {
      res.status(200).json(room)
    } else {
      res.status(401).json({ message: 'room not found' })
    }
    // return !room
    //   ? res.status(401).json({ message: 'room not found' })
    //   : res.status(200).json(room)
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Ubah subject
router.post("/edit/:roomId", (req, res, next) => {
  Room.findOneAndUpdate({ _id: req.params.roomId }, { subject: req.body.subject }, { new: true })
  .then(room => {
    if (room) {
      res.status(200).json(room)
    } else {
      res.status(401).json({ message: 'room not found' })
    }
    // return !room
    //   ? res.status(401).json({ message: 'room not found' })
    //   : res.status(200).json(room)
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Hapus room id
router.delete("/id/:roomId", (req, res, next) => {
  Room.findOneAndRemove({ _id: req.params.roomId })
  .then(room => {
    if (room) {
      res.status(200).json(room)
    } else {
      res.status(401).json({ message: 'room not found' })
    }
    // return !room
    //   ? res.status(401).json({ message: 'room not found' })
    //   : res.status(200).json({ message: 'room deleted' })
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Hapus pesan chat
router.delete("/id/:roomId/:chatId", (req, res, next) => {
  Room.findById(req.params.roomId)
  .exec()
  .then(room => {
    const index = room.chat.findIndex(chat => chat._id.toString() === req.params.chatId)
    index === -1 ? res.status(401).json({ message: 'chat not found' }) : room.chat.remove({ _id: req.params.chatId });
    room.save().then(chat => {
      res.status(200).json({ message: 'chat deleted' });
    })
    .catch(err => { res.status(500).json({ error: err }); });
  })
});

// Set read (room new message)
router.post("/read/:roomId/:userId", (req, res, next) => {
  Room.findById(req.params.roomId)
  .exec()
  .then(room => {
    let message = [];
    room.chat.map(chat => {
      if (chat.from.toString() !== req.params.userId.toString()) {
        if (!chat.read) {
          chat.read = true;
        }
      }
      message.push(chat);
    });
    room.update({ chat: message });
    room.save().then(doc => {
      const response = {
        count: doc.chat.length,
        chat: doc.chat
      }
      res.status(200).json(response);
    })
    .catch(err => { res.status(500).json({ error: err }); });
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

// Get room new message
router.get("/read/:roomId/:userId", (req, res, next) => {
  Room.findById(req.params.roomId)
  .exec()
  .then(room => {
    let message = [];
    room.chat.map(chat => {
      if (chat.from.toString() !== req.params.userId.toString()) {
        if (!chat.read) {
          message.push(chat);
        }
      }
    });
    res.status(200).json({
      count: message.length,
      chat: message
    });
  })
  .catch(err => { res.status(500).json({ error: err }); });
});

module.exports = router;