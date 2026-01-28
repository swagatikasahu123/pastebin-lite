const express = require("express");
const router = express.Router();
const Paste = require("../models/Paste");
const getNow = require("../utils/getNow");

// ===============================
// POST /api/pastes
// ===============================
router.post("/", async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    // Validation
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        error: "content must be a non-empty string"
      });
    }

    if (
      ttl_seconds !== undefined &&
      (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
    ) {
      return res.status(400).json({
        error: "ttl_seconds must be an integer >= 1"
      });
    }

    if (
      max_views !== undefined &&
      (!Number.isInteger(max_views) || max_views < 1)
    ) {
      return res.status(400).json({
        error: "max_views must be an integer >= 1"
      });
    }

    const now = getNow(req);
    let expiresAt = null;

    if (ttl_seconds !== undefined) {
      expiresAt = new Date(now.getTime() + ttl_seconds * 1000);
    }

    const paste = await Paste.create({
      content: content.trim(),
      expiresAt,
      maxViews: max_views ?? null,
      views: 0
    });

    const baseUrl =
  process.env.FRONTEND_BASE_URL || "http://localhost:5000";


    return res.status(201).json({
      id: paste._id.toString(),
      url: `${baseUrl}/p/${paste._id.toString()}`
    });
  } catch (err) {
    console.error("Create paste error:", err);
    return res.status(500).json({
      error: "internal server error"
    });
  }
});

// ===============================
// GET /api/pastes/:id
// ===============================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const now = getNow(req);

    // Atomic fetch + increment
    const paste = await Paste.findOneAndUpdate(
      {
        _id: id,
        $and: [
          {
            $or: [
              { expiresAt: null },
              { expiresAt: { $gt: now } }
            ]
          },
          {
            $or: [
              { maxViews: null },
              { $expr: { $lt: ["$views", "$maxViews"] } }
            ]
          }
        ]
      },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!paste) {
      return res.status(404).json({
        error: "paste not found"
      });
    }

    const remainingViews =
      paste.maxViews === null
        ? null
        : Math.max(paste.maxViews - paste.views, 0);

    return res.status(200).json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expiresAt
    });
  } catch (err) {
    console.error("Fetch paste error:", err);
    return res.status(404).json({
      error: "paste not found"
    });
  }
});

module.exports = router;
