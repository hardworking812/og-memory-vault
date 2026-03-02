const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/storage", authMiddleware, async (req, res) => {
  try {
    const result = await cloudinary.api.usage();

    const usedBytes = result.storage.usage;
    const limitBytes = result.storage.limit;

    res.json({
      used: usedBytes,
      limit: limitBytes,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;