const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  subject: { type: String, required: true },
  petani: { type: Number, required: true },
  agronomis: { type: Number, default: 0 },
  created: { type: Number },
  chat: [{
    from: { type: Number, required: true },
    text: { type: String, required: true },
    image: { type: String },
    created: { type: Number },
    read: { type: Boolean, default: false }
  }]
});

module.exports = mongoose.model("Room", roomSchema);