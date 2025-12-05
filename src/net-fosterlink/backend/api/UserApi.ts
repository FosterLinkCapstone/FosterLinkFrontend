import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import type { AuthContextType } from "../AuthContext";
import type { AgentInfoModel } from "../models/AgentInfoModel";
import type { LoginResponse } from "../models/api/LoginResponse";
import type { UserInfoResponse } from "../models/api/UserInfoResponse";

export interface UserApiType {
    login: (email: string, password: string) => Promise<LoginResponse>,
    getInfo: () => Promise<UserInfoResponse>,
    register: (info: {firstName: string, lastName: string, username: string, email: string, password: string}) => Promise<{error: string | undefined, jwt: string}>
    isAdmin: () => Promise<boolean>
    isFaqAuthor: () => Promise<boolean>
    getAgentInfo: (userId: number) => Promise<ErrorWrapper<AgentInfoModel>>
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
        getInfo: async (): Promise<UserInfoResponse> => {
            try {
                const res = await auth.api.get(`/users/getInfo`)
                return {
                    found: true,
                    user: res.data
                }
            } catch(err) {
                return {
                    found: false,
                    user: undefined
                }
            }
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
        isAdmin: async(): Promise<boolean> => {
            const res = await auth.api.get("/users/isAdmin")
            return res.data
        },
        isFaqAuthor: async(): Promise<boolean> => {
            const res = await auth.api.get("/users/isFaqAuthor")
            return res.data
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
        }
    }
    
    }