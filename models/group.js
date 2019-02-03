const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true },
  image: { type: String },
  description: { type: String },
  owner: { type: Number },
  members: [{
    user: { type: Number },
    join: { type: Number },
    admin: { type: Boolean }
  }],
  chat: [{
    from: { type: Number, required: true },
    text: { type: String, required: true },
    image: { type: String },
    created: { type: Number }
  }]
});

module.exports = mongoose.model("Group", groupSchema);