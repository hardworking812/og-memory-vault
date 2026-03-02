const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event"
  },
  fileUrl: String,
  fileType: String,
  originalSize: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Media", MediaSchema);