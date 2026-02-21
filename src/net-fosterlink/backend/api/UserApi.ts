import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { extractValidationError, getValidationErrors } from "@/net-fosterlink/util/ValidationError";
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
    return {
        login: async (email: string, password: string): Promise<ErrorWrapper<string>> => {
        let response: ErrorWrapper<string> = {
            isError: false,
            error: undefined,
            data: ""
        }
        try {
            const res = await auth.api.post("/users/login", {
                email: email,
                password: password
            })
            response.data = res.data.token
            return response
        } catch (err: any) {
            response.isError = true
            response.data = undefined
            if (err.response) {
                // Check for validation errors first
                const validationError = extractValidationError(err.response);
                if (validationError) {
                    response.validationErrors = getValidationErrors(err.response)
                }
                
                switch(err.response.status) {
                    case 400:
                        response.error = "Invalid login credentials format"
                        return response
                    case 401:
                        response.error = "Incorrect password"
                        return response
                    case 404:
                        response.error = "That email was not found"
                        return response
                    default:
                        response.error = "Unknown error!"
                        return response
                }
            } else {
                response.isError = true
                response.error = "Unknown error!"
                return response
            }
        }
        },
        getInfo: async (): Promise<ErrorWrapper<UserInfoResponse>> => {
            try {
                const res = await auth.api.get(`/users/getInfo`)
                return {
                    data: {
                        found: true,
                        user: res.data
                    },
                    error: undefined,
                    isError: false
                }
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 401:
                            return {data: {found: false, user: undefined}, error: "You must be logged in to view your info!", isError: true}
                        case 404:
                            return {data: {found: false, user: undefined}, error: "User not found!", isError: true}
                        default:
                            return {data: {found: false, user: undefined}, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: {found: false, user: undefined}, error: "Internal client error", isError: true}
        },
        register: async (info: {firstName: string, lastName: string, username: string, email: string, password: string}): Promise<ErrorWrapper<string>> => {
            
            try {
                const res = await auth.api.post(`/users/register`, {
                    ...info,
                    registeredUsingEmail: true
                })
                return {
                    error: undefined,
                    isError: false,
                    data: res.data.token
                }
            } catch(err: any) {
                if (err.response) {
                    // Check for validation errors first
                    const validationError = extractValidationError(err.response);
                    let error = {}
                    if (validationError) {
                        error = {
                            validationErrors: getValidationErrors(err.response),
                            data: undefined,
                            isError: true
                        }
                    }
                    
                    if (err.response.status == 400) {
                        error = {
                            ...error,
                            error: "Invalid registration data. Please check your inputs.",
                        }
                    } else if (err.response.status == 429) {
                        error = {
                            ...error,
                            error: "You have already registered in the last 10 minutes, and need to wait to create the next one.",
                        }
                    } else if (err.response.status == 409) {
                        error = {
                            ...error,
                            error: "A user with that email or username already exists.",
                        }
                    } else {
                        error = {
                            ...error,
                            error: "Unknown error",
                        }
                    }
                    return error as ErrorWrapper<string>;
                } else {
                    return {
                        error: "Unknown error",
                        isError: true,
                        data: undefined
                    }
                }
            }
        },
        isAdmin: async(): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.get("/users/isAdmin")
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 401:
                            return {data: undefined, error: "You must be logged in to check admin status!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        isFaqAuthor: async(): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.get("/users/isFaqAuthor")
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 401:
                            return {data: undefined, error: "You must be logged in to check FAQ author status!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        getAgentInfo: async(userId: number): Promise<ErrorWrapper<AgentInfoModel>> => {
            try {
                const res = await auth.api.get(`/users/agentInfo?userId=${userId}`)
                return {isError: false, error: undefined, data: res.data}
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 400:
                            return {isError: true, error: "You can only request the agent info of a user marked as an agent. Message an administrator if you believe this is a mistake.", data: undefined}
                        case 404:
                            return {isError: true, error: "Could not find that user!", data: undefined}
                    }
                }
            }
            return {isError: true, error: "Internal server error", data: undefined}
        },
        getProfileMetadata: async(userId: number): Promise<ErrorWrapper<ProfileMetadataModel>> => {
            try {
                const res = await auth.api.get(`/users/profileMetadata?userId=${userId}`)
                return {isError: false, error: undefined, data: res.data}
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 404:
                            return {isError: true, error: "Could not find that user!", data: undefined}
                        default:
                            return {isError: true, error: "Internal server error", data: undefined}
                    }
                }
            }
            return {isError: true, error: "Internal server error", data: undefined}
        }

    }
    
    }