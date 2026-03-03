import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { doGenericRequest, RequestType } from "@/net-fosterlink/util/ApiUtil";
import type { AuthContextType } from "../AuthContext";
import type { AgentInfoModel } from "../models/AgentInfoModel";
import type { UserInfoResponse } from "../models/api/UserInfoResponse";
import type { ProfileMetadataModel } from "../models/ProfileMetadataModel";

export interface UserApiType {
    login: (email: string, password: string) => Promise<ErrorWrapper<string>>,
    getInfo: () => Promise<ErrorWrapper<UserInfoResponse>>,
    register: (info: {firstName: string, lastName: string, username: string, email: string, phoneNumber: string, password: string}) => Promise<ErrorWrapper<string>>
    isAdmin: () => Promise<ErrorWrapper<boolean>>
    isFaqAuthor: () => Promise<ErrorWrapper<boolean>>
    getAgentInfo: (userId: number) => Promise<ErrorWrapper<AgentInfoModel>>,
    getProfileMetadata: (userId: number) => Promise<ErrorWrapper<ProfileMetadataModel>>
}

export const userApi = (auth: AuthContextType): UserApiType => {
    const defaultErrorsLogin: Map<number, string> = new Map<number, string>([
        [400, "Invalid login credentials format"],
        [401, "Incorrect password"],
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
        [-1, "Internal server error"]
    ]);

    return {
        login: async (email: string, password: string): Promise<ErrorWrapper<string>> => {
            return doGenericRequest<string>(
                auth.api,
                RequestType.POST,
                "/users/login",
                { email, password },
                defaultErrorsLogin,
                (data: any) => data.token as string
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
        }

    }
    
    }