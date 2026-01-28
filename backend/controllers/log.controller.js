const Log = require("../models/Log");

exports.createLog = async (data) => {
  await Log.create(data);
};

exports.getLogs = async (req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 });
  res.json(logs);
};
