const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const dbState = mongoose.connection.readyState;

  if (dbState !== 1) {
    return res.status(500).json({ ok: false });
  }

  res.status(200).json({ ok: true });
});

module.exports = router;
