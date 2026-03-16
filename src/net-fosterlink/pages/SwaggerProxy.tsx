import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/net-fosterlink/components/navbar/Navbar";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import { ExternalLink } from "lucide-react";

const COOKIE_NAME = "swagger_auth";
// JWT lifetime is 900 s (15 min). Match it so the cookie doesn't outlive the token.
const COOKIE_MAX_AGE_SEC = 900;

function normalizeApiUrl(url: string): string {
    return url.replace(/\/+$/, "");
}

export const SwaggerProxy = () => {
    const auth = useAuth();
    const apiUrl = useMemo(() => normalizeApiUrl(import.meta.env.VITE_API_URL ?? ""), []);
    const isDev = import.meta.env.DEV;
    // In dev: Vite proxies /swagger-ui/** and /v3/api-docs/** to the backend.
    // Spring Boot's Swagger UI HTML contains root-relative links to both paths,
    // so we point the iframe at the proxied path directly rather than via a
    // prefix alias. Cookie path is "/" so it is sent with all sub-requests
    // (asset fetches and API-docs calls) that Swagger UI makes after load.
    const iframeSrc = isDev
        ? `/swagger-ui/index.html`
        : `${apiUrl}/swagger-ui/index.html`;

    // In dev the iframe must not render until the swagger_auth cookie is written.
    // React renders the iframe src immediately on mount; if the cookie isn't
    // present yet the browser fires the navigation request before useEffect runs,
    // and the Vite proxy has no token to inject → 401.
    // Initialise to true in production (no cookie needed, iframe can load freely).
    const [cookieReady, setCookieReady] = useState(!isDev);

    useEffect(() => {
        if (!isDev) return;
        if (!auth.token) return;
        document.cookie = `${COOKIE_NAME}=${encodeURIComponent(auth.token)}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; samesite=strict`;
        setCookieReady(true);
        return () => {
            document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
            setCookieReady(false);
        };
    }, [isDev, auth.token]);

    const openInNewTab = () => {
        window.open(`${apiUrl}/swagger-ui/index.html`, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar userInfo={auth.getUserInfo()} />
            <div className="flex-1 flex flex-col p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-xl font-semibold text-foreground">Swagger API Docs</h1>
                    <button
                        type="button"
                        onClick={openInNewTab}
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open in new tab
                    </button>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                    Backend API documentation (admin only). If the frame shows an error, try opening in a new tab.
                </p>
                <div className="flex-1 min-h-0 rounded-md border border-border overflow-hidden bg-background">
                    {cookieReady && (
                        <iframe
                            src={iframeSrc}
                            title="Swagger UI"
                            className="w-full h-full min-h-[calc(100vh-12rem)] border-0"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
