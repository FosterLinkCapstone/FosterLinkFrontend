import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../backend/AuthContext";
import { PageLayout } from "../components/PageLayout";
import { userApi } from "../backend/api/UserApi";
import type { UserSettingsModel } from "../backend/models/UserSettingsModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PhoneNumberInput } from "../components/PhoneNumberInput";
import { Pencil, Lock, Trash2, AlertCircleIcon, Save, RotateCcw } from "lucide-react";
import { getInitials } from "../util/StringUtil";
import { ProfilePictureDialog } from "../components/account-settings/ProfilePictureDialog";
import { ChangePasswordDialog } from "../components/account-settings/ChangePasswordDialog";
import { DeleteAccountDialog } from "../components/account-deletion/DeleteAccountDialog";
import { StatusDialog } from "../components/StatusDialog";


type FormState = Omit<UserSettingsModel, "id">;
type FormErrors = Partial<Record<keyof FormState, string>>;

const emptyForm = (): FormState => ({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    username: "",
    profilePictureUrl: "",
});

const validate = (form: FormState): FormErrors => {
    const errors: FormErrors = {};

    if (!form.firstName.trim())
        errors.firstName = "First name is required.";
    else if (form.firstName.trim().length > 50)
        errors.firstName = "First name must be 50 characters or fewer.";

    if (!form.lastName.trim())
        errors.lastName = "Last name is required.";
    else if (form.lastName.trim().length > 50)
        errors.lastName = "Last name must be 50 characters or fewer.";

    if (!form.email.trim())
        errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = "Please enter a valid email address.";
    else if (form.email.length > 255)
        errors.email = "Email must be 255 characters or fewer.";

    if (!form.username.trim())
        errors.username = "Username is required.";
    else if (form.username.length < 3)
        errors.username = "Username must be at least 3 characters.";
    else if (form.username.length > 30)
        errors.username = "Username must be 30 characters or fewer.";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
        errors.username = "Username may only contain letters, numbers, and underscores.";

    const phoneDigits = form.phoneNumber.replace(/\D/g, "");
    if (!form.phoneNumber.trim())
        errors.phoneNumber = "Phone number is required.";
    else if (phoneDigits.length < 10)
        errors.phoneNumber = "Please enter a complete 10-digit phone number.";

    return errors;
};

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

    const [saveStatus, setSaveStatus] = useState<{ msg: string; success: boolean } | null>(null);
    const [saving, setSaving] = useState(false);
    const pendingLogout = useRef(false);

    useEffect(() => {
        if (!auth.isLoggedIn()) {
            navigate("/login?currentPage=/settings", { replace: true });
            return;
        }
        setLoading(true);
        userApi(auth).getSettings().then(res => {
            if (res.isError) {
                setLoadError(res.error ?? "Failed to load account settings.");
            } else if (res.data) {
                const { id, ...fields } = res.data;
                setUserId(id);
                setForm(fields);
                savedRef.current = { ...fields };
            }
            setLoading(false);
        });
    }, []);

    const formErrors = useMemo(() => validate(form), [form]);
    const hasErrors = Object.keys(formErrors).length > 0;

    const hasChanges = useMemo(() => {
        const saved = savedRef.current;
        return (Object.keys(form) as (keyof FormState)[]).some(k => form[k] !== saved[k]);
    }, [form]);

    const handleField = (field: keyof FormState, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field: keyof FormState) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleReset = () => {
        setForm({ ...savedRef.current });
        setTouched({});
    };

    const handleSave = async () => {
        if (!userId) return;

        // Touch all fields so every error becomes visible on a save attempt
        const allTouched = (Object.keys(form) as (keyof FormState)[]).reduce(
            (acc, k) => ({ ...acc, [k]: true }),
            {} as Record<keyof FormState, boolean>
        );
        setTouched(allTouched);

        if (hasErrors) return;

        setSaving(true);

        const saved = savedRef.current;
        const payload: Record<string, string | number> = { userId };
        (Object.keys(form) as (keyof FormState)[]).forEach(k => {
            if (form[k] !== saved[k] && form[k].trim() !== "") {
                payload[k] = form[k];
            }
        });

        const willLogout = "email" in payload || "phoneNumber" in payload;

        const res = await userApi(auth).updateUser(payload as any);
        setSaving(false);

        if (!res.isError) {
            savedRef.current = { ...form };
            if (willLogout) {
                pendingLogout.current = true;
                setSaveStatus({
                    msg: "Settings saved. Since you changed your email or phone number, you will be logged out.",
                    success: true,
                });
            } else {
                setSaveStatus({ msg: "Your settings have been saved.", success: true });
                // Refresh auth user info
                const infoRes = await userApi(auth).getInfo();
                if (!infoRes.isError && infoRes.data?.user) {
                    auth.setUserInfo(infoRes.data.user);
                }
            }
        } else {
            setSaveStatus({ msg: res.error ?? "Failed to save settings.", success: false });
        }
    };

    const handleProfilePicConfirm = (url: string) => {
        handleField("profilePictureUrl", url);
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

            {/* Dialogs */}
            <ProfilePictureDialog
                open={showProfilePicDialog}
                onOpenChange={setShowProfilePicDialog}
                currentUrl={form.profilePictureUrl}
                onConfirm={handleProfilePicConfirm}
            />
            <ChangePasswordDialog
                open={showChangePasswordDialog}
                onOpenChange={setShowChangePasswordDialog}
            />
            <DeleteAccountDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
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

            <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
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

                    {/* First Name + Last Name */}
                    <div className="grid grid-cols-2 gap-4">
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

                    {/* Email */}
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
                    </div>

                    {/* Username */}
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

                    {/* Phone Number */}
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
                        {/* Change Password */}
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

                        {/* Delete Account */}
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
            </div>

            {/* Unsaved Changes Bar */}
            {hasChanges && (
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
                    <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                        <span className="text-sm text-muted-foreground font-medium">
                            {hasErrors ? "Fix errors before saving." : "You have unsaved changes!"}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                disabled={saving}
                                className="gap-1.5"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving || hasErrors || auth.restricted}
                                className="gap-1.5"
                            >
                                <Save className="h-3.5 w-3.5" />
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
};
