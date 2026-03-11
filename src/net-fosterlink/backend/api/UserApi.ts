import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { doGenericRequest, RequestType } from "@/net-fosterlink/util/ApiUtil";
import type { AuthContextType } from "../AuthContext";
import type { AgentInfoModel } from "../models/AgentInfoModel";
import type { UserInfoResponse } from "../models/api/UserInfoResponse";
import type { ProfileMetadataModel } from "../models/ProfileMetadataModel";
import type { UserSettingsModel } from "../models/UserSettingsModel";
import type { AdminUserStatsModel, GetAdminUsersResponse } from "../models/AdminUserModel";
import type { AdminFaqSuggestionModel } from "../models/AdminFaqSuggestionModel";
import type { AdminFaqForUserModel } from "../models/AdminFaqForUserModel";
import type { AdminAgencyForUserModel } from "../models/AdminAgencyForUserModel";
import type { AdminReplyForUserModel } from "../models/AdminReplyForUserModel";
import type { AdminThreadForUserModel } from "../models/AdminThreadForUserModel";

export interface UpdateUserPayload {
    userId: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    username?: string;
    password?: string;
    profilePictureUrl?: string;
}

export interface UserApiType {
    login: (email: string, password: string, stayLoggedIn?: boolean) => Promise<ErrorWrapper<string>>,
    forgotPassword: (email: string) => Promise<ErrorWrapper<void>>,
    resetPassword: (token: string, userId: string, newPassword: string) => Promise<ErrorWrapper<void>>,
    getInfo: () => Promise<ErrorWrapper<UserInfoResponse>>,
    register: (info: {firstName: string, lastName: string, username: string, email: string, phoneNumber: string, password: string}) => Promise<ErrorWrapper<string>>
    isAdmin: () => Promise<ErrorWrapper<boolean>>
    isFaqAuthor: () => Promise<ErrorWrapper<boolean>>
    getAgentInfo: (userId: number) => Promise<ErrorWrapper<AgentInfoModel>>,
    getProfileMetadata: (userId: number) => Promise<ErrorWrapper<ProfileMetadataModel>>,
    getSettings: () => Promise<ErrorWrapper<UserSettingsModel>>,
    resendVerificationEmail: () => Promise<ErrorWrapper<void>>,
    updateUser: (data: UpdateUserPayload) => Promise<ErrorWrapper<void>>,
    changePassword: (oldPassword: string, newPassword: string) => Promise<ErrorWrapper<void>>,
    banUser: (userId: number) => Promise<ErrorWrapper<void>>,
    unbanUser: (userId: number) => Promise<ErrorWrapper<void>>,
    restrictUser: (userId: number, restrictedUntil?: string) => Promise<ErrorWrapper<void>>,
    unrestrictUser: (userId: number) => Promise<ErrorWrapper<void>>,
    getUserStats: () => Promise<ErrorWrapper<AdminUserStatsModel>>,
    getAllUsers: (page: number) => Promise<ErrorWrapper<GetAdminUsersResponse>>,
    getDeletedUsers: (page: number) => Promise<ErrorWrapper<GetAdminUsersResponse>>,
    searchUsers: (searchBy: string, query: string, page: number) => Promise<ErrorWrapper<GetAdminUsersResponse>>,
    setUserRole: (userId: number, role: string, enabled: boolean) => Promise<ErrorWrapper<void>>,
    requestAdminRole: (userId: number) => Promise<ErrorWrapper<void>>,
    requestRevokeAdminRole: (userId: number) => Promise<ErrorWrapper<void>>,
    getFaqSuggestionsForUser: (userId: number) => Promise<ErrorWrapper<AdminFaqSuggestionModel[]>>,
    getFaqAnswersForUser: (userId: number) => Promise<ErrorWrapper<AdminFaqForUserModel[]>>,
    getAgenciesForUser: (userId: number) => Promise<ErrorWrapper<AdminAgencyForUserModel[]>>,
    getRepliesForUser: (userId: number) => Promise<ErrorWrapper<AdminReplyForUserModel[]>>,
    getThreadsForUser: (userId: number) => Promise<ErrorWrapper<AdminThreadForUserModel[]>>,
}

export const userApi = (auth: AuthContextType): UserApiType => {
    const defaultErrorsLogin: Map<number, string> = new Map<number, string>([
        [400, "Invalid login credentials format"],
        [401, "Incorrect password"],
        [403, "Your account has been banned. If you believe this is a mistake, please contact an administrator."],
        [404, "That email was not found"],
        [-1, "Unknown error!"]
    ]);

    const defaultErrorsGetInfo: Map<number, string> = new Map<number, string>([
        [401, "You must be logged in to view your info!"],
        [404, "User not found!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsRegister: Map<number, string> = new Map<number, string>([
        [400, "Invalid registration data. Please check your inputs."],
        [429, "You have already registered in the last 10 minutes, and need to wait to create the next one."],
        [409, "A user with that email or username already exists."],
        [-1, "Unknown error"]
    ]);

    const defaultErrorsIsAdmin: Map<number, string> = new Map<number, string>([
        [401, "You must be logged in to check admin status!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsIsFaqAuthor: Map<number, string> = new Map<number, string>([
        [401, "You must be logged in to check FAQ author status!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsGetAgentInfo: Map<number, string> = new Map<number, string>([
        [400, "You can only request the agent info of a user marked as an agent. Message an administrator if you believe this is a mistake."],
        [404, "Could not find that user!"],
        [-1, "Internal server error"]
    ]);

    const defaultErrorsGetProfileMetadata: Map<number, string> = new Map<number, string>([
        [404, "Could not find that user!"],
        [-1, "Internal server error"],
        [403, "This account is locked pending deletion."]
    ]);

    return {
        login: async (email: string, password: string, stayLoggedIn?: boolean): Promise<ErrorWrapper<string>> => {
            return doGenericRequest<string>(
                auth.api,
                RequestType.POST,
                "/users/login",
                { email, password, stayLoggedIn: stayLoggedIn ?? false },
                defaultErrorsLogin,
                (data: any) => data.token as string
            );
        },
        forgotPassword: async (email: string): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [400, "Invalid email address."],
                [429, "Too many requests. Please try again later."],
                [-1, "Unknown error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                "/users/forgotPassword",
                { email },
                defaultErrors
            );
        },
        resetPassword: async (token: string, userId: string, newPassword: string): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [400, "Invalid request."],
                [403, "This reset link is invalid or has expired."],
                [404, "Account not found."],
                [429, "Too many requests. Please try again later."],
                [-1, "Unknown error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/users/resetPassword?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`,
                { newPassword },
                defaultErrors
            );
        },
        getInfo: async (): Promise<ErrorWrapper<UserInfoResponse>> => {
            return doGenericRequest<UserInfoResponse>(
                auth.api,
                RequestType.GET,
                "/users/getInfo",
                {},
                defaultErrorsGetInfo,
                (data: any) => ({
                    found: true,
                    user: data
                })
            );
        },
        register: async (info: {firstName: string, lastName: string, username: string, email: string, password: string}): Promise<ErrorWrapper<string>> => {
            return doGenericRequest<string>(
                auth.api,
                RequestType.POST,
                "/users/register",
                {
                    ...info,
                    registeredUsingEmail: true
                },
                defaultErrorsRegister,
                (data: any) => data.token as string
            );
        },
        isAdmin: async(): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.GET,
                "/users/isAdmin",
                {},
                defaultErrorsIsAdmin
            );
        },
        isFaqAuthor: async(): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.GET,
                "/users/isFaqAuthor",
                {},
                defaultErrorsIsFaqAuthor
            );
        },
        getAgentInfo: async(userId: number): Promise<ErrorWrapper<AgentInfoModel>> => {
            return doGenericRequest<AgentInfoModel>(
                auth.api,
                RequestType.GET,
                `/users/agentInfo?userId=${userId}`,
                {},
                defaultErrorsGetAgentInfo
            );
        },
        getProfileMetadata: async(userId: number): Promise<ErrorWrapper<ProfileMetadataModel>> => {
            return doGenericRequest<ProfileMetadataModel>(
                auth.api,
                RequestType.GET,
                `/users/profileMetadata?userId=${userId}`,
                {},
                defaultErrorsGetProfileMetadata
            );
        },

        getSettings: async(): Promise<ErrorWrapper<UserSettingsModel>> => {
            const defaultErrors: Map<number, string> = new Map([
                [401, "You must be logged in to view your settings."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<UserSettingsModel>(
                auth.api,
                RequestType.GET,
                "/users/getSettings",
                {},
                defaultErrors
            );
        },

        resendVerificationEmail: async(): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [401, "You must be logged in."],
                [404, "User not found."],
                [429, "Too many requests. Please try again later."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                "/users/resendVerificationEmail",
                {},
                defaultErrors
            );
        },

        updateUser: async(data: UpdateUserPayload): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [400, "Invalid update data. Please check your inputs."],
                [401, "You are not authorized to update this account."],
                [409, "That username or email is already taken."],
                [429, "Too many requests. Please try again later."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.PUT,
                "/users/update",
                data,
                defaultErrors
            );
        },

        changePassword: async(oldPassword: string, newPassword: string): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [401, "Old password is incorrect."],
                [404, "User not found."],
                [429, "Too many requests. Please try again later."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                "/users/changePassword",
                { oldPassword, newPassword },
                defaultErrors
            );
        },

        banUser: async(userId: number): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to ban users."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/users/ban?userId=${userId}`,
                {},
                defaultErrors
            );
        },

        unbanUser: async(userId: number): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to unban users."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/users/unban?userId=${userId}`,
                {},
                defaultErrors
            );
        },

        restrictUser: async(userId: number, restrictedUntil?: string): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to restrict users."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            const params = restrictedUntil
                ? `/users/restrict?userId=${userId}&restrictedUntil=${encodeURIComponent(restrictedUntil)}`
                : `/users/restrict?userId=${userId}`;
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                params,
                {},
                defaultErrors
            );
        },

        unrestrictUser: async(userId: number): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to unrestrict users."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/users/unrestrict?userId=${userId}`,
                {},
                defaultErrors
            );
        },

        getUserStats: async(): Promise<ErrorWrapper<AdminUserStatsModel>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to view user stats."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<AdminUserStatsModel>(
                auth.api,
                RequestType.GET,
                `/admin/users/stats`,
                {},
                defaultErrors
            );
        },

        getDeletedUsers: async(page: number): Promise<ErrorWrapper<GetAdminUsersResponse>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to view deleted accounts."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<GetAdminUsersResponse>(
                auth.api,
                RequestType.GET,
                `/admin/users/deleted?page=${page}`,
                {},
                defaultErrors
            );
        },

        getAllUsers: async(page: number): Promise<ErrorWrapper<GetAdminUsersResponse>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to view users."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<GetAdminUsersResponse>(
                auth.api,
                RequestType.GET,
                `/admin/users/all?page=${page}`,
                {},
                defaultErrors
            );
        },

        searchUsers: async(searchBy: string, query: string, page: number): Promise<ErrorWrapper<GetAdminUsersResponse>> => {
            const defaultErrors: Map<number, string> = new Map([
                [400, "Invalid search parameters."],
                [403, "You do not have permission to search users."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<GetAdminUsersResponse>(
                auth.api,
                RequestType.GET,
                `/admin/users/search?searchBy=${encodeURIComponent(searchBy)}&query=${encodeURIComponent(query)}&page=${page}`,
                {},
                defaultErrors
            );
        },

        setUserRole: async(userId: number, role: string, enabled: boolean): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [400, "That role cannot be set via this endpoint."],
                [403, "You do not have permission to set user roles."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/admin/users/setRole?userId=${userId}&role=${encodeURIComponent(role)}&enabled=${enabled}`,
                {},
                defaultErrors
            );
        },

        requestAdminRole: async(userId: number): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to request administrator role assignment."],
                [404, "User not found."],
                [409, "User is already an administrator or account is deleted."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/admin/users/requestAdminRole?userId=${userId}`,
                {},
                defaultErrors
            );
        },

        requestRevokeAdminRole: async(userId: number): Promise<ErrorWrapper<void>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to request administrator role revocation."],
                [404, "User not found."],
                [409, "User is not an administrator or account is deleted."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<void>(
                auth.api,
                RequestType.POST,
                `/admin/users/requestRevokeAdminRole?userId=${userId}`,
                {},
                defaultErrors
            );
        },

        getFaqSuggestionsForUser: async(userId: number): Promise<ErrorWrapper<AdminFaqSuggestionModel[]>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to view this user's FAQ suggestions."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<AdminFaqSuggestionModel[]>(
                auth.api,
                RequestType.GET,
                `/admin/users/${userId}/faq-suggestions`,
                {},
                defaultErrors
            );
        },

        getFaqAnswersForUser: async(userId: number): Promise<ErrorWrapper<AdminFaqForUserModel[]>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to view this user's FAQ answers."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<AdminFaqForUserModel[]>(
                auth.api,
                RequestType.GET,
                `/admin/users/${userId}/faq-answers`,
                {},
                defaultErrors
            );
        },

        getAgenciesForUser: async(userId: number): Promise<ErrorWrapper<AdminAgencyForUserModel[]>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to view this user's agencies."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<AdminAgencyForUserModel[]>(
                auth.api,
                RequestType.GET,
                `/admin/users/${userId}/agencies`,
                {},
                defaultErrors
            );
        },

        getRepliesForUser: async(userId: number): Promise<ErrorWrapper<AdminReplyForUserModel[]>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to view this user's replies."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<AdminReplyForUserModel[]>(
                auth.api,
                RequestType.GET,
                `/admin/users/${userId}/replies`,
                {},
                defaultErrors
            );
        },

        getThreadsForUser: async(userId: number): Promise<ErrorWrapper<AdminThreadForUserModel[]>> => {
            const defaultErrors: Map<number, string> = new Map([
                [403, "You do not have permission to view this user's threads."],
                [404, "User not found."],
                [-1, "Internal server error"]
            ]);
            return doGenericRequest<AdminThreadForUserModel[]>(
                auth.api,
                RequestType.GET,
                `/admin/users/${userId}/threads`,
                {},
                defaultErrors
            );
        },
    }
}