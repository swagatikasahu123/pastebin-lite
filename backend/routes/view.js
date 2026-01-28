const express = require("express");
const router = express.Router();
const Paste = require("../models/Paste");
const getNow = require("../utils/getNow");

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const now = getNow(req);

    // Same availability rules, but DO NOT increment views here
    const paste = await Paste.findOne({
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
    });

    if (!paste) {
      return res.status(404).send("<h1>404 - Paste Not Found</h1>");
    }

    // Safe rendering (NO script execution)
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Paste</title>
        </head>
        <body>
          <pre>${escapeHtml(paste.content)}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    return res.status(404).send("<h1>404 - Paste Not Found</h1>");
  }
});

// Simple HTML escape to prevent XSS
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = router;
