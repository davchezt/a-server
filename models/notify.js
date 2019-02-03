const mongoose = require('mongoose');

const notifySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  owner: { type: Number },
  message: { type: String },
  data: {
    id: { type: mongoose.Schema.Types.ObjectId },
    ref: { type: String }
  },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notify", notifySchema);