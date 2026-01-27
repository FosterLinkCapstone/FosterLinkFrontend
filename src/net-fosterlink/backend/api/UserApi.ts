import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import type { AuthContextType } from "../AuthContext";
import type { AgentInfoModel } from "../models/AgentInfoModel";
import type { LoginResponse } from "../models/api/LoginResponse";
import type { UserInfoResponse } from "../models/api/UserInfoResponse";
import type { ProfileMetadataModel } from "../models/ProfileMetadataModel";

export interface UserApiType {
    login: (email: string, password: string) => Promise<LoginResponse>,
    getInfo: () => Promise<ErrorWrapper<UserInfoResponse>>,
    register: (info: {firstName: string, lastName: string, username: string, email: string, phoneNumber: string, password: string}) => Promise<{error: string | undefined, jwt: string}>
    isAdmin: () => Promise<ErrorWrapper<boolean>>
    isFaqAuthor: () => Promise<ErrorWrapper<boolean>>
    getAgentInfo: (userId: number) => Promise<ErrorWrapper<AgentInfoModel>>,
    getProfileMetadata: (userId: number) => Promise<ErrorWrapper<ProfileMetadataModel>>
}

export const userApi = (auth: AuthContextType): UserApiType => {
    return {
        login: async (email: string, password: string): Promise<LoginResponse> => {
        let response: LoginResponse = {
            isError: false,
            error: "",
            jwt: ""
        }
        try {
            const res = await auth.api.post("/users/login", {
                email: email,
                password: password
            })
            response.jwt = res.data.token
            return response
        } catch (err: any) {
            if (err.response) {
                switch(err.response.status) {
                    case 401:
                        response.isError = true
                        response.error = "Incorrect password"
                        return response
                    case 404:
                        response.isError = true
                        response.error = "That email was not found"
                        return response
                    default:
                        response.isError = true
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
        register: async (info: {firstName: string, lastName: string, username: string, email: string, password: string}): Promise<{error: string | undefined, jwt: string}> => {
            
            try {
                const res = await auth.api.post(`/users/register`, {
                    ...info,
                    registeredUsingEmail: true
                })
                return {
                    error: undefined,
                    jwt: res.data.token
                }
            } catch(err: any) {
                if (err.response) {
                    if (err.response.status == 429) {
                        return {
                            error: "You have already registered in the last 10 minutes, and need to wait to create the next one.",
                            jwt: ""
                        }
                    } else if (err.response.status == 409) {
                        return {
                            error: "A user with that email or username already exists.",
                            jwt: ""
                        }
                    } else {
                        return {
                            error: "Unknown error",
                            jwt: ""
                        }
                    }
                } else {
                    return {
                        error: "Unknown error",
                        jwt: ""
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