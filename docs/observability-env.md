# QuickBlog observability environment guide

The backend still uses the existing application variables:

- `MONGO_URI` - MongoDB connection string used by the backend container.
- `JWT_SECRET` - JWT signing secret for auth and admin auth.
- `OPENAI_API_KEY` - Required only if the AI generation endpoint should stay enabled.
- `IMAGEKIT_PUBLIC_KEY` - Optional image hosting key for direct uploads.
- `IMAGEKIT_PRIVATE_KEY` - Optional image hosting secret for direct uploads.
- `IMAGEKIT_URL_ENDPOINT` - Optional ImageKit endpoint.

The observability stack adds the following new variables:

- `GRAFANA_ADMIN_USER` - Grafana admin username. Example: `admin`.
- `GRAFANA_ADMIN_PASSWORD` - Grafana admin password. Example: `change-me-now`.
- `ALERTMANAGER_CRITICAL_SLACK_WEBHOOK` - Slack incoming webhook URL for critical alerts (error rate, heap pressure, event loop lag, Mongo connection loss).
- `ALERTMANAGER_OPS_SLACK_WEBHOOK` - Slack incoming webhook URL for lower-urgency operational alerts (moderation backlog, AI latency).

The Docker Compose file assumes the backend can reach an external MongoDB instance instead of running a database container locally.

Security note:

- The backend service is no longer published to the host in this observability compose stack.
- Prometheus scrapes it using the internal Docker network target `backend:3000`.
- If you run a separate reverse proxy (for example Nginx) in your production stack, explicitly deny external access to `/metrics` at that proxy layer as defense-in-depth.