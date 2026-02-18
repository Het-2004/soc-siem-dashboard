const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, async (req, res) => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const alerts = await Alert.aggregate([
    {
      $match: { createdAt: { $gte: last7Days } }
    },
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id": 1 } }
  ]);

  res.json(alerts);
});

module.exports = router;
