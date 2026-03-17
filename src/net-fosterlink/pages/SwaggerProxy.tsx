import { useMemo } from "react";
import { Navbar } from "@/net-fosterlink/components/navbar/Navbar";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import { ExternalLink } from "lucide-react";

function normalizeApiUrl(url: string): string {
    return url.replace(/\/+$/, "");
}

export const SwaggerProxy = () => {
    const auth = useAuth();
    const apiUrl = useMemo(() => normalizeApiUrl(import.meta.env.VITE_API_URL ?? ""), []);
    const iframeSrc = `${apiUrl}/swagger-ui/index.html`;

    const openInNewTab = () => {
        window.open(iframeSrc, "_blank", "noopener,noreferrer");
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
                    <iframe
                        src={iframeSrc}
                        title="Swagger UI"
                        className="w-full h-full min-h-[calc(100vh-12rem)] border-0"
                    />
                </div>
            </div>
        </div>
    );
};
