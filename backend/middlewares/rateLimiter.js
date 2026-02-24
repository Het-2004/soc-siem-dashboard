const rateLimit = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW_MIN || 15);
  const windowMs = windowMinutes * 60 * 1000;
  const maxRequests = Number(process.env.RATE_LIMIT_MAX || 100);

  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
    res.setHeader("X-RateLimit-Reset", now + windowMs);
    return next();
  }

  if (entry.count >= maxRequests) {
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", 0);
    res.setHeader("X-RateLimit-Reset", entry.resetTime);
    return res.status(429).json({
      message: "Too many requests, please try again later"
    });
  }

  entry.count += 1;
  rateLimit.set(ip, entry);
  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - entry.count));
  res.setHeader("X-RateLimit-Reset", entry.resetTime);
  next();
};

module.exports = rateLimiter;
