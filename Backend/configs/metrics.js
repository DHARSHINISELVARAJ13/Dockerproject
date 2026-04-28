import { AsyncLocalStorage } from "node:async_hooks";
import os from "node:os";
import { monitorEventLoopDelay } from "node:perf_hooks";

import mongoose from "mongoose";
import client from "prom-client";

const registry = new client.Registry();
const requestContext = new AsyncLocalStorage();
const labelNames = [
  "route",
  "method",
  "status_code",
  "user_role",
  "content_category",
  "outcome",
];

// Keep the label model consistent so Prometheus queries stay simple across HTTP, business, and system metrics.
const systemLabels = {
  route: "system",
  method: "system",
  status_code: "200",
  user_role: "system",
  content_category: "system",
  outcome: "success",
};

const inFlightLabels = {
  route: "all",
  method: "all",
  status_code: "na",
  user_role: "all",
  content_category: "all",
  outcome: "inflight",
};

const httpRequestCounter = new client.Counter({
  name: "quickblog_http_requests_total",
  help: "Total HTTP requests handled by the Express backend.",
  labelNames,
  registers: [registry],
});

const httpRequestDuration = new client.Histogram({
  name: "quickblog_http_request_duration_ms",
  help: "HTTP request duration in milliseconds.",
  labelNames,
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [registry],
});

const httpInFlightRequests = new client.Gauge({
  name: "quickblog_http_in_flight_requests",
  help: "Number of HTTP requests currently being processed.",
  labelNames,
  registers: [registry],
});

const blogSubmissionCounter = new client.Counter({
  name: "quickblog_blog_submissions_total",
  help: "Blog submission attempts, including pending user submissions and admin direct publishes.",
  labelNames,
  registers: [registry],
});

const blogModerationCounter = new client.Counter({
  name: "quickblog_blog_moderation_actions_total",
  help: "Blog moderation decisions taken by admins.",
  labelNames,
  registers: [registry],
});

const moderationResolutionLatency = new client.Histogram({
  name: "quickblog_moderation_resolution_duration_ms",
  help: "Time from content submission to moderation decision in milliseconds.",
  labelNames,
  buckets: [1000, 5000, 15000, 30000, 60000, 300000, 900000, 1800000, 3600000],
  registers: [registry],
});

const moderationQueueDepth = new client.Gauge({
  name: "quickblog_moderation_queue_depth",
  help: "Number of pending moderation items still waiting for admin review.",
  labelNames,
  registers: [registry],
});

const commentSubmissionCounter = new client.Counter({
  name: "quickblog_comment_submissions_total",
  help: "Comment submission attempts from authenticated users.",
  labelNames,
  registers: [registry],
});

const commentModerationCounter = new client.Counter({
  name: "quickblog_comment_moderation_actions_total",
  help: "Comment moderation decisions taken by admins.",
  labelNames,
  registers: [registry],
});

const aiGenerationCounter = new client.Counter({
  name: "quickblog_ai_generation_requests_total",
  help: "AI content generation requests handled by the backend.",
  labelNames,
  registers: [registry],
});

const aiGenerationDuration = new client.Histogram({
  name: "quickblog_ai_generation_duration_ms",
  help: "Latency of synchronous AI content generation requests in milliseconds.",
  labelNames,
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 20000, 30000],
  registers: [registry],
});

const userRegistrationCounter = new client.Counter({
  name: "quickblog_user_registration_attempts_total",
  help: "User registration attempts, split by success and failure.",
  labelNames,
  registers: [registry],
});

const userLoginCounter = new client.Counter({
  name: "quickblog_user_login_attempts_total",
  help: "User and admin login attempts, split by success and failure.",
  labelNames,
  registers: [registry],
});

const imageUploadCounter = new client.Counter({
  name: "quickblog_image_upload_events_total",
  help: "Image upload events handled by the backend.",
  labelNames,
  registers: [registry],
});

const imageUploadSize = new client.Histogram({
  name: "quickblog_image_upload_size_bytes",
  help: "Uploaded image sizes in bytes.",
  labelNames,
  buckets: [1024, 10 * 1024, 100 * 1024, 512 * 1024, 1024 * 1024, 5 * 1024 * 1024],
  registers: [registry],
});

const dbOperationDuration = new client.Histogram({
  name: "quickblog_db_operation_duration_ms",
  help: "Duration of MongoDB operations triggered by the backend.",
  labelNames,
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
  registers: [registry],
});

const processHeapUsed = new client.Gauge({
  name: "quickblog_node_process_memory_heap_used_bytes",
  help: "Node.js heap used in bytes.",
  labelNames,
  registers: [registry],
});

const processHeapTotal = new client.Gauge({
  name: "quickblog_node_process_memory_heap_total_bytes",
  help: "Node.js heap total in bytes.",
  labelNames,
  registers: [registry],
});

const processRss = new client.Gauge({
  name: "quickblog_node_process_memory_rss_bytes",
  help: "Node.js resident set size in bytes.",
  labelNames,
  registers: [registry],
});

const processCpuPercent = new client.Gauge({
  name: "quickblog_node_process_cpu_usage_percent",
  help: "Approximate Node.js CPU usage as a percent of one interval.",
  labelNames,
  registers: [registry],
});

const eventLoopLag = new client.Gauge({
  name: "quickblog_node_event_loop_lag_ms",
  help: "Mean event loop lag in milliseconds.",
  labelNames,
  registers: [registry],
});

const mongoConnections = new client.Gauge({
  name: "quickblog_mongodb_active_connections",
  help: "Number of active Mongoose connections currently in the connected state.",
  labelNames,
  registers: [registry],
});

const eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });

let lastCpuSample = process.cpuUsage();
let lastSampleTime = process.hrtime.bigint();
let systemMetricsTimer = null;

function getMongoPoolConnectionCount() {
  const mongoClient = mongoose.connection?.getClient?.();
  const topologyServers = mongoClient?.topology?.s?.servers;

  // Prefer pool-level counters from the active MongoClient topology when available.
  if (topologyServers && typeof topologyServers.values === "function") {
    let totalConnections = 0;

    for (const server of topologyServers.values()) {
      const pool = server?.pool;

      if (pool && typeof pool.totalConnectionCount === "number") {
        totalConnections += pool.totalConnectionCount;
        continue;
      }

      if (
        pool &&
        typeof pool.availableConnectionCount === "number" &&
        typeof pool.checkedOutConnectionCount === "number"
      ) {
        totalConnections += pool.availableConnectionCount + pool.checkedOutConnectionCount;
      }
    }

    if (totalConnections > 0) {
      return totalConnections;
    }
  }

  // Fallback if driver internals are unavailable in a given runtime/version.
  return mongoose.connections.filter((connection) => connection.readyState === 1).length;
}

function cleanLabelValue(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return String(value);
}

function stripQuery(url) {
  return String(url || "unknown").split("?")[0] || "unknown";
}

function resolveRouteLabel(req) {
  if (req?.route?.path) {
    const routePath = Array.isArray(req.route.path)
      ? req.route.path.join("|")
      : String(req.route.path);
    return `${req.baseUrl || ""}${routePath}` || stripQuery(req.originalUrl || req.url);
  }

  return stripQuery(req?.originalUrl || req?.url);
}

function resolveContentCategory(req) {
  const route = resolveRouteLabel(req).toLowerCase();

  if (route.includes("/generate")) return "ai";
  if (route.includes("/comment")) return "comment";
  if (route.includes("/blog")) return "blog";
  if (route.includes("/login") || route.includes("/register") || route.includes("/profile") || route.includes("/submit-blog")) {
    return "user";
  }

  return "system";
}

function resolveUserRole(req) {
  if (req?.user?.role) {
    return req.user.role;
  }

  const route = resolveRouteLabel(req).toLowerCase();

  if (route.includes("/api/admin")) return "admin";
  if (route.includes("/login") || route.includes("/register") || route.includes("/profile") || route.includes("/submit-blog")) {
    return "user";
  }

  return "anonymous";
}

function resolveOutcome(statusCode, explicitOutcome) {
  if (explicitOutcome) {
    return explicitOutcome;
  }

  return Number(statusCode) >= 400 ? "failure" : "success";
}

function buildLabels(req, overrides = {}) {
  const route = cleanLabelValue(overrides.route ?? resolveRouteLabel(req), "unknown");
  const method = cleanLabelValue(overrides.method ?? req?.method, "system");
  const statusCode = cleanLabelValue(overrides.status_code ?? overrides.statusCode ?? req?.res?.statusCode, "200");
  const userRole = cleanLabelValue(overrides.user_role ?? resolveUserRole(req), "anonymous");
  const contentCategory = cleanLabelValue(overrides.content_category ?? resolveContentCategory(req), "system");
  const outcome = cleanLabelValue(
    overrides.outcome ?? resolveOutcome(statusCode, overrides.outcome),
    "unknown"
  );

  return {
    route,
    method,
    status_code: String(statusCode),
    user_role: userRole,
    content_category: contentCategory,
    outcome,
  };
}

function buildSystemLabels(overrides = {}) {
  return {
    ...systemLabels,
    ...overrides,
  };
}

function recordDbDuration(labels, durationMs) {
  dbOperationDuration.observe(labels, durationMs);
}

export function metricsMiddleware(req, res, next) {
  if (req.path === "/metrics") {
    return next();
  }

  requestContext.run({ req }, () => {
    const startedAt = process.hrtime.bigint();
    let recorded = false;

    // Track in-flight requests separately so Grafana can surface pressure spikes before they turn into errors.
    httpInFlightRequests.inc(inFlightLabels);

    const recordRequest = (statusCodeOverride) => {
      if (recorded) return;
      recorded = true;

      const statusCode = statusCodeOverride ?? res.statusCode ?? 500;
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      const labels = buildLabels(req, {
        status_code: String(statusCode),
        outcome: resolveOutcome(statusCode),
      });

      httpRequestCounter.inc(labels);
      httpRequestDuration.observe(labels, durationMs);
      httpInFlightRequests.dec(inFlightLabels);
    };

    res.on("finish", () => recordRequest());
    res.on("close", () => recordRequest(499));

    next();
  });
}

export async function metricsHandler(req, res) {
  res.setHeader("Content-Type", registry.contentType);
  res.end(await registry.metrics());
}

export function startSystemMetricsCollection() {
  if (systemMetricsTimer) {
    return;
  }

  eventLoopMonitor.enable();

  const sample = () => {
    const memory = process.memoryUsage();
    const currentCpuUsage = process.cpuUsage(lastCpuSample);
    const currentSampleTime = process.hrtime.bigint();
    const elapsedSeconds = Number(currentSampleTime - lastSampleTime) / 1e9;
    const cpuMicros = currentCpuUsage.user + currentCpuUsage.system;
    const cpuPercent = elapsedSeconds > 0 ? (cpuMicros / 1000 / elapsedSeconds / os.cpus().length) * 100 : 0;

    lastCpuSample = process.cpuUsage();
    lastSampleTime = currentSampleTime;

    processHeapUsed.set(buildSystemLabels(), memory.heapUsed);
    processHeapTotal.set(buildSystemLabels(), memory.heapTotal);
    processRss.set(buildSystemLabels(), memory.rss);
    processCpuPercent.set(buildSystemLabels(), cpuPercent);
    eventLoopLag.set(buildSystemLabels(), Number(eventLoopMonitor.mean / 1e6));
    mongoConnections.set(buildSystemLabels(), getMongoPoolConnectionCount());
  };

  sample();
  systemMetricsTimer = setInterval(sample, 15000);
  systemMetricsTimer.unref();
}

export function stopSystemMetricsCollection() {
  if (systemMetricsTimer) {
    clearInterval(systemMetricsTimer);
    systemMetricsTimer = null;
  }

  eventLoopMonitor.disable();
}

export function setModerationQueueDepth({ blogPending = 0, commentPending = 0 }) {
  moderationQueueDepth.set(buildSystemLabels({ content_category: "blog", outcome: "pending" }), blogPending);
  moderationQueueDepth.set(buildSystemLabels({ content_category: "comment", outcome: "pending" }), commentPending);
}

export function incrementModerationQueueDepth(contentCategory, delta = 1) {
  moderationQueueDepth.inc(
    buildSystemLabels({ content_category: contentCategory, outcome: "pending" }),
    delta
  );
}

export function decrementModerationQueueDepth(contentCategory, delta = 1) {
  moderationQueueDepth.dec(
    buildSystemLabels({ content_category: contentCategory, outcome: "pending" }),
    delta
  );
}

export function recordHttpOutcome(req, statusCode, explicitOutcome) {
  const labels = buildLabels(req, {
    status_code: String(statusCode),
    outcome: explicitOutcome ?? resolveOutcome(statusCode),
  });

  httpRequestCounter.inc(labels);
  return labels;
}

export function recordBlogSubmission(req, outcome = "success", statusCode = 201) {
  blogSubmissionCounter.inc(
    buildLabels(req, {
      status_code: String(statusCode),
      outcome,
      content_category: "blog",
    })
  );
}

export function recordBlogModeration(req, outcome, statusCode = 200) {
  blogModerationCounter.inc(
    buildLabels(req, {
      status_code: String(statusCode),
      outcome,
      content_category: "blog",
    })
  );
}

export function recordCommentSubmission(req, outcome = "success", statusCode = 200) {
  commentSubmissionCounter.inc(
    buildLabels(req, {
      status_code: String(statusCode),
      outcome,
      content_category: "comment",
    })
  );
}

export function recordCommentModeration(req, outcome, statusCode = 200) {
  commentModerationCounter.inc(
    buildLabels(req, {
      status_code: String(statusCode),
      outcome,
      content_category: "comment",
    })
  );
}

export function recordModerationLatency(req, contentCategory, outcome, startedAt) {
  if (!startedAt) return;

  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
  moderationResolutionLatency.observe(
    buildLabels(req, {
      status_code: "200",
      outcome,
      content_category: contentCategory,
    }),
    durationMs
  );
}

export function recordAiGeneration(req, outcome, durationMs, statusCode = 200) {
  const labels = buildLabels(req, {
    status_code: String(statusCode),
    outcome,
    content_category: "ai",
  });

  aiGenerationCounter.inc(labels);
  aiGenerationDuration.observe(labels, durationMs);
}

export function recordUserRegistration(req, outcome, statusCode = 201) {
  userRegistrationCounter.inc(
    buildLabels(req, {
      status_code: String(statusCode),
      outcome,
      content_category: "user",
    })
  );
}

export function recordLoginAttempt(req, outcome, statusCode = 200) {
  userLoginCounter.inc(
    buildLabels(req, {
      status_code: String(statusCode),
      outcome,
      content_category: "user",
    })
  );
}

export function recordImageUpload(req, fileSizeBytes, outcome = "success", statusCode = 201) {
  const labels = buildLabels(req, {
    status_code: String(statusCode),
    outcome,
    content_category: "blog",
  });

  imageUploadCounter.inc(labels);
  imageUploadSize.observe(labels, fileSizeBytes);
}

export function observeDbOperation(req, durationMs, outcome = "success", statusCode = 200) {
  const labels = buildLabels(req, {
    status_code: String(statusCode),
    outcome,
  });

  recordDbDuration(labels, durationMs);
}

export function recordModerationLatencyFromCreatedAt(req, contentCategory, outcome, createdAt) {
  if (!createdAt) return;

  const createdTimestamp = new Date(createdAt).getTime();
  if (Number.isNaN(createdTimestamp)) return;

  const durationMs = Date.now() - createdTimestamp;
  moderationResolutionLatency.observe(
    buildLabels(req, {
      status_code: "200",
      outcome,
      content_category: contentCategory,
    }),
    durationMs
  );
}

export function mongooseMetricsPlugin(schema) {
  const trackedQueryOps = [
    "countDocuments",
    "deleteMany",
    "find",
    "findOne",
    "findOneAndUpdate",
    "findOneAndDelete",
    "updateOne",
    "updateMany",
  ];

  const startTimer = function startTimer() {
    this._quickblogMetricStartedAt = process.hrtime.bigint();
  };

  const stopTimer = function stopTimer() {
    const startedAt = this._quickblogMetricStartedAt;

    if (!startedAt) return;

    const context = requestContext.getStore();
    const req = context?.req;
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    observeDbOperation(req, durationMs);
  };

  for (const op of trackedQueryOps) {
    schema.pre(op, startTimer);
    schema.post(op, stopTimer);
  }

  schema.pre("save", startTimer);
  schema.post("save", stopTimer);
}

export function getCurrentRequest() {
  return requestContext.getStore()?.req ?? null;
}

export { registry };