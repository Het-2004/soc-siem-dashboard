# Changelog

All notable changes to the SOC-SIEM Dashboard are documented here.


## [1/24] 2026-03-05 10:03:54
- Implemented JWT refresh token rotation to prevent token fixation and extend session security.


## [2/24] 2026-03-05 10:33:58
- Lowered rate-limit threshold (100 -> 50 req/window) in rateLimiter middleware for better DDoS protection.


## [1/24] 2026-03-06 10:13:33
- Implemented JWT refresh token rotation to prevent token fixation and extend session security.


## [2/24] 2026-03-06 10:18:38
- Lowered rate-limit threshold (100 -> 50 req/window) in rateLimiter middleware for better DDoS protection.


## [3/24] 2026-03-06 10:23:44
- Dashboard now shows live alert counts grouped by severity (Critical / High / Medium / Low).


## [4/24] 2026-03-06 10:28:49
- Fixed IPv6 loopback (::1) being incorrectly blocked by the IP blocker middleware.


## [5/24] 2026-03-06 10:33:55
- Added filter dropdown in Logs page allowing users to filter by log level in real time.


## [6/24] 2026-03-06 10:39:01
- Refactored detector.js: threat scoring moved to calculateThreatScore() helper for reusability.

