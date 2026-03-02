const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

// Create Event
router.post("/create",authMiddleware, async (req, res) => {
  try {
    const { title, date, description } = req.body;

    const newEvent = new Event({
      title,
      date,
      description
    });

    await newEvent.save();

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Events
router.get("/all",authMiddleware, async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Event
// Delete Event
router.delete("/delete/:eventId",authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const Media = require("../models/Media");
    const cloudinary = require("../config/cloudinary");

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Find media inside event
    const mediaItems = await Media.find({ eventId });

    // Delete media from Cloudinary
    for (let item of mediaItems) {
      if (item.publicId) {
        await cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.fileType
        });
      }
    }

    // Delete media from DB
    await Media.deleteMany({ eventId });

    // Delete event from DB
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: "Event deleted successfully" });

  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, date } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { title, description, date },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;