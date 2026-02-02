const Log = require("../models/Log");

module.exports = async function monitorCheck() {
  const count = await Log.countDocuments();
  console.log(`Monitoring check: ${count} logs available`);
};
