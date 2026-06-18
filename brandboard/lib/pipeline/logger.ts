import "server-only";

export function logPipeline(
  projectId: string,
  message: string,
  meta?: Record<string, unknown>
) {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
  console.log(`[audit-pipeline][${projectId}] ${message}${suffix}`);
}

export function logPipelineError(
  projectId: string,
  message: string,
  error: unknown
) {
  const detail =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Unknown error";
  console.error(`[audit-pipeline][${projectId}] ${message}: ${detail}`);
}

export function createStepTimer(projectId: string, step: string) {
  const start = performance.now();

  return {
    end(meta?: Record<string, unknown>) {
      const durationMs = Math.round(performance.now() - start);
      logPipeline(projectId, `${step}`, { durationMs, status: "ok", ...meta });
      return durationMs;
    },
    fail(error: unknown, meta?: Record<string, unknown>) {
      const durationMs = Math.round(performance.now() - start);
      logPipelineError(
        projectId,
        `${step} failed after ${durationMs}ms`,
        error
      );
      if (meta) {
        logPipeline(projectId, `${step}`, { durationMs, status: "failed", ...meta });
      }
      return durationMs;
    },
  };
}

export function logPipelineTimingSummary(
  projectId: string,
  timings: Record<string, number>
) {
  const totalMs = Object.values(timings).reduce((sum, ms) => sum + ms, 0);
  const slowest = Object.entries(timings).sort((a, b) => b[1] - a[1])[0];
  logPipeline(projectId, "Timing summary", {
    totalMs,
    slowestStep: slowest?.[0] ?? null,
    slowestMs: slowest?.[1] ?? null,
    timings,
  });
}
