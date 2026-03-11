import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../backend/AuthContext";

type ActionState = "loading" | "success" | "error" | "invalid";
type TokenAction = "approve" | "deny" | "approve-revoke" | "deny-revoke";

const MESSAGES: Record<TokenAction, { success: string; error: string }> = {
    approve: {
        success: "The administrator role has been successfully approved and granted.",
        error: "This approval link is invalid or has already been used.",
    },
    deny: {
        success: "The administrator role request has been denied. All pending approvals for this user have been revoked.",
        error: "This denial link is invalid or has already been used.",
    },
    "approve-revoke": {
        success: "The administrator role has been successfully revoked.",
        error: "This revocation approval link is invalid or has already been used.",
    },
    "deny-revoke": {
        success: "The administrator role revocation has been denied. All pending revocation requests for this user have been cancelled.",
        error: "This denial link is invalid or has already been used.",
    },
};

export const TokenAction = () => {
    const { api } = useAuth();
    const [searchParams] = useSearchParams();
    const [state, setState] = useState<ActionState>("loading");
    const [message, setMessage] = useState("");
    const hasFired = useRef(false);

    const action = searchParams.get("action");
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    useEffect(() => {
        if (hasFired.current) return;
        hasFired.current = true;

        const validActions: TokenAction[] = ["approve", "deny", "approve-revoke", "deny-revoke"];
        if (!action || !validActions.includes(action as TokenAction) || !token || !userId) {
            setState("invalid");
            setMessage("This link is malformed. Please check that you copied the full URL from your email.");
            return;
        }

        const typedAction = action as TokenAction;
        let endpoint: string;
        if (typedAction === "approve") endpoint = "/token/assignAdmin";
        else if (typedAction === "approve-revoke") endpoint = "/token/revokeAdmin";
        else endpoint = "/token/cancel";
        const msgs = MESSAGES[typedAction];

        api
            .post(`${endpoint}?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`, {}, {
                withCredentials: true,
            })
            .then(() => {
                setState("success");
                setMessage(msgs.success);
            })
            .catch(() => {
                setState("error");
                setMessage(msgs.error);
            });
    }, [action, token, userId, api]);

    const isSuccess = state === "success";
    const isLoading = state === "loading";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6 text-center">

                <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-foreground">FosterLink</span>
                    <span className="text-sm text-muted-foreground">Role Assignment</span>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground text-sm">Processing your request…</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-2">
                        {isSuccess ? (
                            <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" strokeWidth={1.75} />
                        ) : (
                            <XCircle className="h-14 w-14 text-red-500 dark:text-red-400" strokeWidth={1.75} />
                        )}
                        <p className="text-foreground font-medium leading-relaxed">{message}</p>
                    </div>
                )}

                {!isLoading && (
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = "/"}
                        className="w-full"
                    >
                        Return to FosterLink
                    </Button>
                )}

                <p className="text-xs text-muted-foreground">
                    This action was triggered from an email link. If you did not expect this, please contact{" "}
                    <a href="mailto:admin@fosterlink.net" className="underline hover:text-foreground transition-colors">
                        admin@fosterlink.net
                    </a>
                    .
                </p>
            </div>
        </div>
    );
};
