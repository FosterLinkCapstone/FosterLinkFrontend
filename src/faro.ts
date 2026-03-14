import { initializeFaro, getWebInstrumentations } from "@grafana/faro-react";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

export function initFaro(): void {
  let mode = "dev";
  switch (import.meta.env.VITE_BRANCH) {
    case "master":
      mode = "prod";
      break;
    case "staging":
      mode = "staging";
      break;
    default:
      mode = "dev";
      break;
  }

  /**
   * URL sanitisation audit — 2026-03-14
   *
   * All dynamic route segments in App.tsx were audited against this function.
   * Covered patterns:
   *   - /users/:userId                   → /users/[redacted]
   *     (regex /\/users\/[0-9]+/ matches the substring present in both
   *      /users/:userId and /admin/users/:userId/*)
   *   - /admin/users/:userId/faq-suggestions → /admin/users/[redacted]/faq-suggestions
   *   - /admin/users/:userId/faq-answers     → /admin/users/[redacted]/faq-answers
   *   - /admin/users/:userId/agencies        → /admin/users/[redacted]/agencies
   *   - /admin/users/:userId/replies         → /admin/users/[redacted]/replies
   *   - /admin/users/:userId/threads         → /admin/users/[redacted]/threads
   *   - /threads/thread/:threadId            → /threads/thread/[redacted]
   *   - /threads/hidden/thread/:threadId     → /threads/hidden/thread/[redacted]
   *   - ?userId= / &userId= query parameter  → [redacted]
   *
   * Static routes with no dynamic segments (no PII risk, not redacted):
   *   /, /login, /register, /threads, /threads/hidden, /faq, /faq/pending,
   *   /faq/hidden, /agencies, /agencies/pending, /admin/account-deletion-requests,
   *   /admin/users, /admin/audit-log, /settings, /banned, /token-action,
   *   /forgot-password, /reset-password, /privacy, /terms
   *
   * Console capture: fully disabled (all levels: log, info, warn, error, debug, trace)
   * via consoleInstrumentation.
   */
  function sanitizeUrl(url: string): string {
    return url
      .replace(/\/users\/[0-9]+/g, "/users/[redacted]")
      .replace(/\/thread\/[0-9]+/g, "/thread/[redacted]")
      .replace(/([?&])userId=[^&]*/g, "$1userId=[redacted]");
  }

  initializeFaro({
    url: import.meta.env.VITE_GRAFANA_FARO_URL,
    app: {
      name: `fosterlink-frontend-${mode}`,
      version: "1.0.0",
      environment: import.meta.env.MODE,
    },
    instrumentations: [
      ...getWebInstrumentations({
        consoleInstrumentation: {
          disabledLevels: ["log", "info", "warn", "error", "debug", "trace"],
        },
      }),
      new TracingInstrumentation(),
    ],
    beforeSend: (event) => {
      if (event.meta?.page?.url) {
        event.meta.page.url = sanitizeUrl(event.meta.page.url);
      }
      return event;
    },
  });
}
