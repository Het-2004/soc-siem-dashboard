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


## [7/24] 2026-03-06 10:44:07
- Alerts page now supports selecting and bulk-dismissing multiple low-severity alerts at once.


## [8/24] 2026-03-06 10:49:12
- MongoDB connection now retries up to 5 times with exponential backoff before failing.


## [9/24] 2026-03-06 10:54:16
- Incidents page displays a chronological timeline view of all events linked to each incident.


## [10/24] 2026-03-06 10:59:21
- Bumped express to 4.19 and audited all dependencies; updated package-lock.json.

