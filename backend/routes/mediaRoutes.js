const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Media = require("../models/Media");
const authMiddleware = require("../middleware/authMiddleware");

/* =========================================
   Multer Setup (Memory Storage)
========================================= */
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* =========================================
   Upload Media
========================================= */
router.post(
  "/upload/:eventId",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const { eventId } = req.params;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Upload to Cloudinary using stream
      const streamUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "og-memory-vault",
              resource_type: "auto",
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );

          stream.end(req.file.buffer);
        });
      };

      const result = await streamUpload();

      // Save in MongoDB
      const newMedia = new Media({
        eventId,
        fileUrl: result.secure_url,
        publicId: result.public_id, // ✅ VERY IMPORTANT
        fileType: result.resource_type,
        originalSize: result.bytes,
      });

      await newMedia.save();

      res.status(201).json({
        message: "File uploaded successfully",
        media: newMedia,
      });

    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

/* =========================================
   Get Media By Event
========================================= */
router.get("/event/:eventId", authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;

    const media = await Media.find({ eventId }).sort({ createdAt: -1 });

    res.status(200).json(media);

  } catch (error) {
    console.error("Fetch Media Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* =========================================
   Delete Media
========================================= */
router.delete("/delete/:mediaId", authMiddleware, async (req, res) => {
  try {
    const { mediaId } = req.params;

    const media = await Media.findById(mediaId);

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Delete from Cloudinary if publicId exists
    if (media.publicId) {
      try {
        await cloudinary.uploader.destroy(media.publicId, {
          resource_type: media.fileType || "image",
        });
      } catch (err) {
        console.log("Cloudinary delete failed:", err.message);
      }
    }

    // Delete from MongoDB
    await Media.findByIdAndDelete(mediaId);

    res.status(200).json({ message: "Media deleted successfully" });

  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;