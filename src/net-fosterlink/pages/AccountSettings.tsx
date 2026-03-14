import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { PageLayout } from "../components/PageLayout";
import { userApi } from "../backend/api/UserApi";
import { faqApi } from "../backend/api/FaqApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PhoneNumberInput } from "../components/PhoneNumberInput";
import { Pencil, Lock, Trash2, AlertCircleIcon, LogOut, FileText } from "lucide-react";
import { getInitials } from "../util/StringUtil";
import { ProfilePictureDialog } from "../components/account-settings/ProfilePictureDialog";
import { ChangePasswordDialog } from "../components/account-settings/ChangePasswordDialog";
import { DeleteAccountDialog } from "../components/account-deletion/DeleteAccountDialog";
import { StatusDialog } from "../components/StatusDialog";
import { UnsavedChangesBar } from "../components/account-settings/UnsavedChangesBar";
import { emptyForm, validateAccountSettings, type FormState } from "../util/AccountSettingsValidation";
import { EmailPreferencesCard, type EmailPreferencesCardHandle } from "../components/account-settings/EmailPreferencesCard";
import { MyDataDialog } from "../components/account-settings/MyDataDialog";

export const AccountSettings = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const savedRef = useRef<FormState>(emptyForm());

    const [form, setForm] = useState<FormState>(emptyForm());
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

    const [showProfilePicDialog, setShowProfilePicDialog] = useState(false);
    const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showMyDataDialog, setShowMyDataDialog] = useState(false);
    const [logoutAllLoading, setLogoutAllLoading] = useState(false);
    const [deletingFaqSuggestions, setDeletingFaqSuggestions] = useState(false);

    const [saveStatus, setSaveStatus] = useState<{ msg: string; success: boolean } | null>(null);
    const [saving, setSaving] = useState(false);
    const [resendVerifyLoading, setResendVerifyLoading] = useState(false);
    const pendingLogout = useRef(false);

    const emailPrefsRef = useRef<EmailPreferencesCardHandle>(null);
    const [emailPrefsHasChanges, setEmailPrefsHasChanges] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const loadSettings = async () => {
            setLoading(true);
            setLoadError(null);

            let res = await userApi(auth).getSettings();
            // Safeguard for rare first-request auth race: retry once if we appear logged in
            // but the initial settings call returns unauthorized.
            if (res.isError && auth.isLoggedIn() && res.error === "You must be logged in to view your settings.") {
                await new Promise(resolve => setTimeout(resolve, 150));
                res = await userApi(auth).getSettings();
            }

            if (cancelled) return;

            if (res.isError) {
                setLoadError(res.error ?? "Failed to load account settings.");
            } else if (res.data) {
                const { id, ...fields } = res.data;
                setUserId(id);
                setForm(fields);
                savedRef.current = { ...fields };
            }

            setLoading(false);
        };

        if (!auth.isLoggedIn()) {
            navigate("/login?currentPage=/settings", { replace: true });
            return;
        }
        void loadSettings();

        return () => {
            cancelled = true;
        };
    }, []);

    const formErrors = useMemo(() => validateAccountSettings(form), [form]);
    const hasErrors = Object.keys(formErrors).length > 0;

    const hasChanges = useMemo(() => {
        const saved = savedRef.current;
        const formChanged = (Object.keys(form) as (keyof FormState)[]).some(k => form[k] !== saved[k]);
        return formChanged || emailPrefsHasChanges;
    }, [form, emailPrefsHasChanges]);

    const handleField = (field: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: keyof FormState) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleReset = () => {
        setForm({ ...savedRef.current });
        setTouched({});
        emailPrefsRef.current?.reset();
    };

    const handleSave = async () => {
        if (!userId) return;

        const allTouched = (Object.keys(form) as (keyof FormState)[]).reduce(
            (acc, k) => ({ ...acc, [k]: true }),
            {} as Record<keyof FormState, boolean>
        );
        setTouched(allTouched);

        if (hasErrors) return;

        setSaving(true);

        const saved = savedRef.current;
        const payload: Record<string, string | number> = { userId };
        const optionalFields: (keyof FormState)[] = ["phoneNumber", "profilePictureUrl"];
        const str = (v: string | number | boolean | null | undefined): string => (v == null ? "" : String(v));
        (Object.keys(form) as (keyof FormState)[]).forEach(k => {
            const key = k as keyof FormState;
            const val = form[key];
            if (typeof val === "boolean") return;
            const changed = val !== saved[key];
            const hasValue = str(val).trim() !== "";
            if (changed && (hasValue || optionalFields.includes(key))) {
                payload[k] = typeof val === "number" ? val : str(val);
            }
        });

        const willLogout = "email" in payload || "phoneNumber" in payload;

        const profileChanged = Object.keys(payload).length > 1;
        const emailPrefsChanged = emailPrefsRef.current?.hasChanges ?? false;

        let profileError: string | null = null;

        if (profileChanged) {
            const res = await userApi(auth).updateUser(payload as any);
            if (!res.isError) {
                savedRef.current = { ...form };
            } else {
                profileError = res.error ?? "Failed to save settings.";
            }
        }

        if (emailPrefsChanged) {
            // save() reports errors via onSaveError callback which sets saveStatus directly
            await emailPrefsRef.current?.save();
        }

        setSaving(false);

        if (profileError) {
            setSaveStatus({ msg: profileError, success: false });
            return;
        }

        if (profileChanged) {
            if (willLogout) {
                pendingLogout.current = true;
                setSaveStatus({
                    msg: "Settings saved. Since you changed your email or phone number, you will be logged out.",
                    success: true,
                });
            } else {
                setSaveStatus({ msg: "Your settings have been saved.", success: true });
                const infoRes = await userApi(auth).getInfo();
                if (!infoRes.isError && infoRes.data?.user) {
                    auth.setUserInfo(infoRes.data.user);
                }
            }
        } else if (emailPrefsChanged) {
            setSaveStatus({ msg: "Your settings have been saved.", success: true });
        }
    };

    const handleDeleteFaqSuggestions = async () => {
        setDeletingFaqSuggestions(true);
        const res = await faqApi(auth).deleteMyRequests();
        setDeletingFaqSuggestions(false);
        if (res.isError) {
            setSaveStatus({ msg: res.error ?? "Failed to delete FAQ suggestions. Please try again.", success: false });
        } else {
            setSaveStatus({ msg: "Your FAQ suggestions have been deleted.", success: true });
        }
    };

    if (!auth.isLoggedIn()) return null;

    if (loading) {
        return (
            <PageLayout auth={auth}>
                <div className="flex items-center justify-center py-24">
                    <span className="text-muted-foreground">Loading settings...</span>
                </div>
            </PageLayout>
        );
    }

    if (loadError) {
        return (
            <PageLayout auth={auth}>
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <AlertCircleIcon className="h-10 w-10 text-destructive" />
                    <span className="text-destructive">{loadError}</span>
                    <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
                </div>
            </PageLayout>
        );
    }

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    return (
        <PageLayout auth={auth}>
            <title>Account Settings</title>

            <ProfilePictureDialog
                open={showProfilePicDialog}
                onOpenChange={setShowProfilePicDialog}
                currentUrl={form.profilePictureUrl}
                onConfirm={(url) => handleField("profilePictureUrl", url)}
            />
            <ChangePasswordDialog
                open={showChangePasswordDialog}
                onOpenChange={setShowChangePasswordDialog}
            />
            <DeleteAccountDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            />
            <MyDataDialog
                open={showMyDataDialog}
                onOpenChange={setShowMyDataDialog}
            />
            <StatusDialog
                open={!!saveStatus}
                onOpenChange={() => {
                    setSaveStatus(null);
                    if (pendingLogout.current) {
                        pendingLogout.current = false;
                        auth.logout();
                    }
                }}
                title={saveStatus?.success ? "Saved" : "Save failed"}
                subtext={saveStatus?.msg ?? ""}
                isSuccess={saveStatus?.success ?? false}
            />

            <div className="max-w-2xl mx-auto px-4 py-8 pb-24 space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group mb-4">
                        <Avatar className="h-28 w-28">
                            <AvatarImage src={form.profilePictureUrl} alt={fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                {getInitials(fullName)}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            type="button"
                            onClick={() => setShowProfilePicDialog(true)}
                            disabled={auth.restricted}
                            className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-background border border-border shadow flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
                            aria-label="Change profile picture"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <h1 className="text-xl font-semibold">{fullName || "—"}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{form.email}</p>
                </div>

                <div className="border-t border-border mb-6" />

                {/* Settings Form */}
                <Card className="p-6 space-y-5">
                    <h2 className="text-lg font-semibold">Settings</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="first-name">First name</Label>
                            <Input
                                id="first-name"
                                value={form.firstName}
                                onChange={e => handleField("firstName", e.target.value)}
                                onBlur={() => handleBlur("firstName")}
                                placeholder="First name"
                                className={touched.firstName && formErrors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {touched.firstName && formErrors.firstName && (
                                <p className="text-xs text-destructive">{formErrors.firstName}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="last-name">Last name</Label>
                            <Input
                                id="last-name"
                                value={form.lastName}
                                onChange={e => handleField("lastName", e.target.value)}
                                onBlur={() => handleBlur("lastName")}
                                placeholder="Last name"
                                className={touched.lastName && formErrors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {touched.lastName && formErrors.lastName && (
                                <p className="text-xs text-destructive">{formErrors.lastName}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={e => handleField("email", e.target.value)}
                            onBlur={() => handleBlur("email")}
                            placeholder="Email"
                            className={touched.email && formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {touched.email && formErrors.email ? (
                            <p className="text-xs text-destructive">{formErrors.email}</p>
                        ) : form.email !== savedRef.current.email && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Changing your email will log you out.
                            </p>
                        )}
                        {form.emailVerified === false && (
                            <Alert
                                variant="default"
                                className="mt-2 bg-amber-200 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700"
                            >
                                <AlertCircleIcon className="h-4 w-4" />
                                <AlertTitle className="text-left">Email not verified</AlertTitle>
                                <AlertDescription className="text-amber-900 dark:text-amber-100">
                                    <p>
                                        Check your inbox for a verification link, or{" "}
                                        <button
                                            type="button"
                                            className="font-medium underline underline-offset-2 text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={resendVerifyLoading || auth.restricted}
                                            onClick={async () => {
                                                setResendVerifyLoading(true);
                                                const res = await userApi(auth).resendVerificationEmail();
                                                setResendVerifyLoading(false);
                                                if (res.isError) {
                                                    setSaveStatus({ msg: res.error ?? "Failed to send verification email.", success: false });
                                                } else {
                                                    setSaveStatus({ msg: "Verification email sent. Check your inbox.", success: true });
                                                }
                                            }}
                                        >
                                            {resendVerifyLoading ? "Sending…" : "request a new one"}
                                        </button>
                                        .
                                    </p>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={form.username}
                            onChange={e => handleField("username", e.target.value)}
                            onBlur={() => handleBlur("username")}
                            placeholder="Username"
                            className={touched.username && formErrors.username ? "border-destructive focus-visible:ring-destructive" : ""}
                        />
                        {touched.username && formErrors.username && (
                            <p className="text-xs text-destructive">{formErrors.username}</p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="phone">Phone number</Label>
                        <div onBlur={() => handleBlur("phoneNumber")}>
                            <PhoneNumberInput
                                value={form.phoneNumber}
                                setValue={v => handleField("phoneNumber", v)}
                            />
                        </div>
                        {touched.phoneNumber && formErrors.phoneNumber ? (
                            <p className="text-xs text-destructive">{formErrors.phoneNumber}</p>
                        ) : form.phoneNumber !== savedRef.current.phoneNumber && (
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Changing your phone number will log you out.
                            </p>
                        )}
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                        <Button
                            variant="outline"
                            className="w-full justify-center gap-2"
                            onClick={() => setShowChangePasswordDialog(true)}
                            type="button"
                            disabled={auth.restricted}
                        >
                            <Lock className="h-4 w-4" />
                            Change password
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-center gap-2"
                            onClick={() => {
                                setLogoutAllLoading(true)
                                auth.logoutAll()
                            }}
                            type="button"
                            disabled={logoutAllLoading}
                        >
                            <LogOut className="h-4 w-4" />
                            {logoutAllLoading ? "Signing out everywhere…" : "Log out everywhere"}
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full justify-center gap-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                            onClick={() => setShowDeleteDialog(true)}
                            type="button"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete account
                        </Button>
                    </div>
                </Card>

                {/* Email Preferences */}
                <EmailPreferencesCard
                    ref={emailPrefsRef}
                    onHasChanges={setEmailPrefsHasChanges}
                    setSaving={setSaving}
                    onSaveError={(msg) => setSaveStatus({ msg, success: false })}
                    onSaveSuccess={() => {}}
                />

                {/* Privacy & Data */}
                <Card className="p-6 space-y-3">
                    <h2 className="text-lg font-semibold">Privacy &amp; Data</h2>
                    <p className="text-sm text-muted-foreground">
                        Under GDPR you have the right to access and download all personal data FosterLink holds about you.
                    </p>
                    <Button
                        variant="outline"
                        className="w-full justify-center gap-2"
                        onClick={() => setShowMyDataDialog(true)}
                        type="button"
                    >
                        <FileText className="h-4 w-4" />
                        View my data
                    </Button>
                </Card>

                {/* FAQ Suggestions */}
                <Card className="p-6 space-y-3">
                    <h2 className="text-lg font-semibold">FAQ Suggestions</h2>
                    <p className="text-sm text-muted-foreground">
                        Your FAQ topic suggestions are stored for 90 days and then automatically deleted.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteFaqSuggestions}
                        disabled={deletingFaqSuggestions}
                        type="button"
                    >
                        {deletingFaqSuggestions ? "Deleting..." : "Delete all my suggestions"}
                    </Button>
                </Card>
            </div>

            {hasChanges && (
                <UnsavedChangesBar
                    hasErrors={hasErrors}
                    saving={saving}
                    restricted={auth.restricted}
                    onReset={handleReset}
                    onSave={handleSave}
                />
            )}
        </PageLayout>
    );
};
