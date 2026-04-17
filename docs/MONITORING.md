# Monitoring & Logging Strategy

## Health Checks
### Endpoint: `/health`
- **Method**: GET
- **Returns**: JSON object containing basic server status, current timestamp, and more importantly, the `mongoose` connection state.
- **Use Case**: Used by Render.com (or AWS ALB) to determine if the backend service is healthy. If it returns anything other than 2xx, the load balancer stops routing traffic to the instance and potentially restarts it.

## Application Logging
The backend uses **Winston**, a versatile logging library that structures and standardizes logs.

### Features
1. **Console Logs**: Useful for real-time development environments. Printed in distinct colors depending on the log level (INFO, WARN, ERROR).
2. **File Transports**:
    - `logs/error.log`: Records only `error` level messages.
    - `logs/combined.log`: Records all `info`, `warn`, and `error` messages for auditing paths.
3. **Format**: Uses standard JSON timestamping for file transports, making parsing easier for automated log ingestors (e.g. Datadog, ELK stack).

### Location
Logs are saved in the `backend/logs/` directory. Be sure not to commit this folder to version control (already handled by `.gitignore`).

## Third-party APM Integration (Future)
For scaling, consider integrating an Application Performance Monitoring (APM) tool:
- **Datadog / New Relic**: Integrates by appending a specific agent loader in `server.js` before application load.
- **Sentry**: Good for capturing uncaught exceptions and tracing asynchronous tasks.
