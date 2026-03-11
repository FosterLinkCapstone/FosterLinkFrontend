import { useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import { useAuth } from "@/net-fosterlink/backend/AuthContext";
import { mailApi, type EmailPreference, type EmailPreferenceUpdate } from "@/net-fosterlink/backend/api/MailApi";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, AlertCircleIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

export interface EmailPreferencesCardHandle {
    hasChanges: boolean;
    save: () => Promise<void>;
    reset: () => void;
}

interface EmailPreferencesCardProps {
    onHasChanges: (has: boolean) => void;
    setSaving: (saving: boolean) => void;
    onSaveError: (msg: string) => void;
    onSaveSuccess: () => void;
}

export const EmailPreferencesCard = forwardRef<EmailPreferencesCardHandle, EmailPreferencesCardProps>(
    ({ onHasChanges, setSaving, onSaveError, onSaveSuccess }, ref) => {
        const auth = useAuth();

        const [open, setOpen] = useState(true);
        const [loading, setLoading] = useState(false);
        const [loadError, setLoadError] = useState<string | null>(null);

        const [unsubscribedAll, setUnsubscribedAll] = useState(false);
        const [preferences, setPreferences] = useState<EmailPreference[]>([]);
        const savedPrefsRef = useRef<EmailPreference[]>([]);

        const [pendingToggles, setPendingToggles] = useState<Record<string, boolean>>({});

        const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);

        const hasChanges = Object.keys(pendingToggles).length > 0;

        useEffect(() => {
            onHasChanges(hasChanges);
        }, [hasChanges]);

        const loadPreferences = async () => {
            setLoading(true);
            setLoadError(null);
            const res = await mailApi(auth).getEmailPreferences();
            setLoading(false);
            if (res.isError) {
                setLoadError(res.error ?? "Failed to load email preferences.");
                return;
            }
            if (res.data) {
                setUnsubscribedAll(res.data.unsubscribedAll);
                setPreferences(res.data.preferences);
                savedPrefsRef.current = res.data.preferences;
                setPendingToggles({});
            }
        };

        useEffect(() => {
            void loadPreferences();
        }, []);

        const getEffectiveDisabled = (pref: EmailPreference): boolean => {
            if (pref.name in pendingToggles) return pendingToggles[pref.name];
            return pref.disabled;
        };

        const handleToggle = (name: string, checked: boolean) => {
            if (unsubscribedAll) return;
            const original = savedPrefsRef.current.find(p => p.name === name);
            const originalDisabled = original?.disabled ?? false;

            setPendingToggles(prev => {
                const next = { ...prev };
                if (checked === !originalDisabled) {
                    // Back to original -- remove from pending
                    delete next[name];
                } else {
                    next[name] = !checked;
                }
                return next;
            });
        };

        const handleUnsubscribeAll = async () => {
            setUnsubscribeLoading(true);
            const res = await mailApi(auth).unsubscribeAll();
            setUnsubscribeLoading(false);
            if (res.isError) {
                onSaveError(res.error ?? "Failed to unsubscribe from all emails.");
                return;
            }
            await loadPreferences();
        };

        const handleResubscribe = async () => {
            setUnsubscribeLoading(true);
            const res = await mailApi(auth).resubscribe();
            setUnsubscribeLoading(false);
            if (res.isError) {
                onSaveError(res.error ?? "Failed to resubscribe.");
                return;
            }
            await loadPreferences();
        };

        const save = async () => {
            if (!hasChanges) return;
            setSaving(true);
            const updates: EmailPreferenceUpdate[] = Object.entries(pendingToggles).map(([name, disabled]) => ({
                name,
                disabled,
            }));
            const res = await mailApi(auth).updateEmailPreferences(updates);
            setSaving(false);
            if (res.isError) {
                onSaveError(res.error ?? "Failed to save email preferences.");
                return;
            }
            // Commit pending to saved
            savedPrefsRef.current = savedPrefsRef.current.map(p =>
                p.name in pendingToggles ? { ...p, disabled: pendingToggles[p.name] } : p
            );
            setPreferences(savedPrefsRef.current);
            setPendingToggles({});
            onSaveSuccess();
        };

        const reset = () => {
            setPendingToggles({});
        };

        useImperativeHandle(ref, () => ({
            hasChanges,
            save,
            reset,
        }));

        return (
            <Collapsible open={open} onOpenChange={setOpen}>
                <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                        <button
                            type="button"
                            className="w-full flex items-center px-6 py-4 hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex-1" />
                            <div className="flex flex-col items-center">
                                <h2 className="text-lg font-semibold">Email Preferences</h2>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Switch certain email notifications on/off or unsubscribe from all emails.
                                </p>
                            </div>
                            <div className="flex-1 flex justify-end">
                                {open ? (
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                        </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <div className="px-6 pb-6 space-y-4">
                            {loading && (
                                <p className="text-sm text-muted-foreground">Loading preferences...</p>
                            )}

                            {loadError && !loading && (
                                <div className="flex items-center gap-2 text-destructive text-sm">
                                    <AlertCircleIcon className="h-4 w-4 shrink-0" />
                                    <span>{loadError}</span>
                                </div>
                            )}

                            {!loading && !loadError && (
                                <>
                                    {unsubscribedAll && (
                                        <div className="flex items-center justify-between rounded-md bg-muted px-4 py-2.5 text-sm font-medium">
                                            <span>You have unsubscribed from all emails!</span>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="h-auto p-0 text-primary font-semibold"
                                                onClick={handleResubscribe}
                                                disabled={unsubscribeLoading}
                                                type="button"
                                            >
                                                Undo
                                            </Button>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {preferences.map(pref => {
                                            const effectiveDisabled = getEffectiveDisabled(pref);
                                            const switchChecked = !effectiveDisabled;
                                            return (
                                                <div key={pref.name} className="flex items-center justify-between">
                                                    <Label
                                                        htmlFor={`email-pref-${pref.name}`}
                                                        className={unsubscribedAll ? "text-muted-foreground cursor-not-allowed" : "cursor-pointer"}
                                                    >
                                                        {pref.uiName ?? pref.name}
                                                    </Label>
                                                    <Switch
                                                        id={`email-pref-${pref.name}`}
                                                        checked={unsubscribedAll ? false : switchChecked}
                                                        onCheckedChange={(checked) => handleToggle(pref.name, checked)}
                                                        disabled={unsubscribedAll}
                                                        aria-label={pref.uiName ?? pref.name}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {preferences.length === 0 && (
                                        <p className="text-sm text-muted-foreground">No configurable email preferences.</p>
                                    )}

                                    {!unsubscribedAll && (
                                        <div className="border-t border-border pt-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                                                onClick={handleUnsubscribeAll}
                                                disabled={unsubscribeLoading}
                                                type="button"
                                            >
                                                {unsubscribeLoading ? "Unsubscribing..." : "Unsubscribe from all emails"}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        );
    }
);

EmailPreferencesCard.displayName = "EmailPreferencesCard";
