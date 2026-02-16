const express = require("express");
const router = express.Router();
const Log = require("../models/Log");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, async (req, res) => {
  const { severity, search } = req.query;

  let filter = {};

  if (severity) {
    filter.severity = severity;
  }

  if (search) {
    filter.message = { $regex: search, $options: "i" };
  }

  const logs = await Log.find(filter).sort({ createdAt: -1 });

  res.json(logs);
});

module.exports = router;
