import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = (env.VITE_API_URL ?? '').replace(/\/+$/, '')

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router"],
            "vendor-radix": [
              "@radix-ui/react-avatar",
              "@radix-ui/react-collapsible",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-label",
              "@radix-ui/react-navigation-menu",
              "@radix-ui/react-popover",
              "@radix-ui/react-select",
              "@radix-ui/react-separator",
              "@radix-ui/react-slot",
              "@radix-ui/react-switch",
              "@radix-ui/react-tabs",
              "@radix-ui/react-tooltip",
            ],
            "vendor-utils": ["date-fns", "axios", "js-cookie"],
            "vendor-icons": ["lucide-react"],
          },
        },
      },
    },
    server: apiUrl ? {
      proxy: {
        // Swagger UI and its API spec must be proxied together — Spring Boot's
      // Swagger HTML uses root-relative links to /swagger-ui/** assets and
      // /v3/api-docs. Auth is handled by the backend reading the swagger_auth
      // cookie directly (JwtAuthFilter cookie fallback), so no proxy-level
      // header injection is needed.
      '/swagger-ui': {
          target: apiUrl,
          changeOrigin: true,
          configure: (proxy) => {
            // Strip frame-blocking response headers so the browser renders
            // the proxied response inside the iframe. Safe because this
            // only runs in the local Vite dev server, never in prod builds.
            proxy.on('proxyRes', (proxyRes) => {
              delete proxyRes.headers['x-frame-options']
              delete proxyRes.headers['content-security-policy']
            })
          },
        },
        '/v3/api-docs': {
          target: apiUrl,
          changeOrigin: true,
        },
      },
    } : undefined,
  }
})
