import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initFaro } from "@/faro";

const CONSENT_STORAGE_KEY = "fosterlink-consent";

type ConsentContextValue = {
  analyticsConsent: boolean | null;
  acceptAll: () => void;
  rejectAll: () => void;
  revokeAnalytics: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

function readStoredConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;
  return null;
}

export function ConsentContextProvider({ children }: { children: ReactNode }) {
  const [analyticsConsent, setAnalyticsConsent] = useState<boolean | null>(
    () => readStoredConsent()
  );

  useEffect(() => {
    if (analyticsConsent === true) {
      initFaro();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const acceptAll = useCallback(() => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    setAnalyticsConsent(true);
    initFaro();
  }, []);

  const rejectAll = useCallback(() => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "false");
    setAnalyticsConsent(false);
  }, []);

  const revokeAnalytics = useCallback(() => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "false");
    setAnalyticsConsent(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({ analyticsConsent, acceptAll, rejectAll, revokeAnalytics }),
    [analyticsConsent, acceptAll, rejectAll, revokeAnalytics]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx)
    throw new Error("useConsent must be used within a ConsentContextProvider");
  return ctx;
}
