const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  fileUrl: String,
  public_id: String,   // ✅ ADD THIS
  fileType: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Media", mediaSchema);