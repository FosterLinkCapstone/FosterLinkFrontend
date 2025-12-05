import { initializeFaro, getWebInstrumentations } from "@grafana/faro-react";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

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

initializeFaro({
  url: import.meta.env.VITE_GRAFANA_FARO_URL,
  app: {
    name: `fosterlink-frontend-${mode}`,
    version: "1.0.0",
    environment: import.meta.env.MODE,
  },
  instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
});
