import { Button } from "@/components/ui/button";
import { useConsent } from "./ConsentContext";
import { Cookie } from "lucide-react";

export function CookieConsentBanner() {
  const { analyticsConsent, acceptAll, rejectAll } = useConsent();

  if (analyticsConsent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            We use analytics cookies to improve FosterLink.{" "}
            <a
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Learn more
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={rejectAll}
            className="w-full sm:w-auto"
          >
            Reject Non-Essential
          </Button>
          <Button
            size="sm"
            onClick={acceptAll}
            className="w-full sm:w-auto"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
