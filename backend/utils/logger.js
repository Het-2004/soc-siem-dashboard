const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const getTimestamp = () => {
  return new Date().toISOString();
};

const logger = {
  info: (message, data = {}) => {
    const log = `[${getTimestamp()}] INFO: ${message} ${JSON.stringify(data)}\n`;
    console.log(log);
    fs.appendFileSync(path.join(logDir, "info.log"), log);
  },

  error: (message, error = {}) => {
    const log = `[${getTimestamp()}] ERROR: ${message} ${error.stack || JSON.stringify(error)}\n`;
    console.error(log);
    fs.appendFileSync(path.join(logDir, "error.log"), log);
  },

  warn: (message, data = {}) => {
    const log = `[${getTimestamp()}] WARN: ${message} ${JSON.stringify(data)}\n`;
    console.warn(log);
    fs.appendFileSync(path.join(logDir, "warn.log"), log);
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === "development") {
      const log = `[${getTimestamp()}] DEBUG: ${message} ${JSON.stringify(data)}\n`;
      console.log(log);
      fs.appendFileSync(path.join(logDir, "debug.log"), log);
    }
  }
};

module.exports = logger;
