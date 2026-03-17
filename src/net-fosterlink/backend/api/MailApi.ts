import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { doGenericRequest, RequestType } from "@/net-fosterlink/util/ApiUtil";
import type { AuthContextType } from "../AuthContext";

export interface EmailPreference {
    name: string;
    uiName: string;
    disabled: boolean;
}

export interface EmailPreferencesResponse {
    unsubscribedAll: boolean;
    preferences: EmailPreference[];
}

export interface EmailPreferenceUpdate {
    name: string;
    disabled: boolean;
}

export interface MailApiType {
    getEmailPreferences: () => Promise<ErrorWrapper<EmailPreferencesResponse>>;
    updateEmailPreferences: (preferences: EmailPreferenceUpdate[]) => Promise<ErrorWrapper<void>>;
    unsubscribeAll: () => Promise<ErrorWrapper<void>>;
    resubscribe: () => Promise<ErrorWrapper<void>>;
}

export const mailApi = (auth: AuthContextType): MailApiType => {
    return {
        getEmailPreferences: async (): Promise<ErrorWrapper<EmailPreferencesResponse>> => {
            const defaultErrors: Map<number, string> = new Map([
                [401, "You must be logged in to view email preferences."],
                [404, "User not found."],
                [429, "Too many requests. Please try again later."],
                [-1, "Internal server error"],
            ]);
            return doGenericRequest<EmailPreferencesResponse>(
                auth.api,
                RequestType.GET,
                "/mail/emailPreferences",
                {},
                defaultErrors
            );
        },

        updateEmailPreferences: async (preferences: EmailPreferenceUpdate[]): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [401, "You must be logged in to update email preferences."],
                [404, "User not found."],
                [409, "You are unsubscribed from all emails. Please undo that before changing individual preferences."],
                [429, "Too many requests. Please try again later."],
                [-1, "Internal server error"],
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.PUT,
                "/mail/emailPreferences",
                { preferences },
                defaultErrors
            );
        },

        unsubscribeAll: async (): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [401, "You must be logged in to unsubscribe."],
                [404, "User not found."],
                [429, "Too many requests. Please try again later."],
                [-1, "Internal server error"],
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                "/mail/unsubscribeAll",
                {},
                defaultErrors
            );
        },

        resubscribe: async (): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [401, "You must be logged in to resubscribe."],
                [404, "User not found."],
                [429, "Too many requests. Please try again later."],
                [-1, "Internal server error"],
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                "/mail/resubscribe",
                {},
                defaultErrors
            );
        },
    };
};
