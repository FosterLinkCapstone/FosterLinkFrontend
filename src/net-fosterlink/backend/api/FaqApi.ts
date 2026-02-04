import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper"
import { extractValidationError, getValidationErrors } from "@/net-fosterlink/util/ValidationError"
import type { AuthContextType } from "../AuthContext"
import type { FaqModel } from "../models/FaqModel"
import type { PendingFaqModel } from "../models/PendingFaqModel"
import type { ApprovalCheckModel } from "../models/ApprovalCheckModel"
import type { FaqRequestModel } from "../models/FaqRequestModel"

export interface FaqApiType {
    getAll: () => Promise<ErrorWrapper<FaqModel[]>>
    getContent: (faqId: number) => Promise<ErrorWrapper<string>>
    getPending: () => Promise<ErrorWrapper<PendingFaqModel[]>>
    approve: (id: number, approved: boolean) => Promise<ErrorWrapper<boolean>>
    create: (title: string, summary: string, content: string) => Promise<ErrorWrapper<FaqModel>>
    checkApprovalStatus: () => Promise<ApprovalCheckModel>
    getRequests: () => Promise<ErrorWrapper<FaqRequestModel[]>>
    answerRequest: (requestId: number) => Promise<ErrorWrapper<boolean>>
    createRequest: (suggested: string) => Promise<ErrorWrapper<boolean>>
    allAuthor: (userId: number) => Promise<ErrorWrapper<FaqModel[]>>
}

export const faqApi = (auth: AuthContextType): FaqApiType => {
    return {
        getAll: async (): Promise<ErrorWrapper<FaqModel[]>> => {
            try {
                const res = await auth.api.get("/faq/all")
                return {data: res.data || [], error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be logged in to view FAQs!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        getContent: async(faqId: number): Promise<ErrorWrapper<string>> => {
            try {
                const res = await auth.api.get(`/faq/content?id=${faqId}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 404:
                            return {data: undefined, error: "FAQ content not found!", isError: true}
                        case 403:
                            return {data: undefined, error: "You must be logged in to view FAQ content!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        getPending: async(): Promise<ErrorWrapper<PendingFaqModel[]>> => {
            try {
                const res = await auth.api.get(`/faq/pending`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can view pending FAQs!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        approve: async(id: number, approved: boolean): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.post(`/faq/approve`, {id: id, approved: approved})
                if (res.status == 200) {
                    return {data: true, error: undefined, isError: false}
                }
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only administrators can approve FAQs!", isError: true}
                        case 404:
                            return {data: undefined, error: "FAQ not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        create: async(title: string, summary: string, content: string): Promise<ErrorWrapper<FaqModel>> => {
            try {
                const res = await auth.api.post(`/faq/create`, {title: title, summary: summary, content: content})
                return {data: res.data, isError: false, error: undefined}
            } catch (err: any) {
                if (err.response) {
                    // Check for validation errors first
                    const validationError = extractValidationError(err.response);
                    if (validationError) {
                        return {data: undefined, isError: true, error: validationError, validationErrors: getValidationErrors(err.response)}
                    }
                    
                    switch (err.response.status) {
                        case 400:
                            return {data: undefined, isError: true, error: "Invalid FAQ data. Please check your inputs."}
                        case 403:
                            console.error("Unauthorized: only users marked as faq authors can create faq responses!")
                            return {data: undefined, isError: true, error: "Only FAQ authors can create FAQ responses!"}
                        default:
                            return {data: undefined, isError: true, error: "Internal server error"}
                    }
                }
            }
            return {data: undefined, isError: true, error: "Internal server error"}
        },
        checkApprovalStatus: async(): Promise<ApprovalCheckModel> => {
            const res = await auth.api.get("/faq/checkApproval")
            return res.data
        },
        getRequests: async(): Promise<ErrorWrapper<FaqRequestModel[]>> => {
            try {
                const res = await auth.api.get("/faq/requests")
                return {isError: false, error: undefined, data: res.data}
            } catch(err: any) {
                if (err.response) {
                    switch (err.status) {
                        case 403:
                            return {data: undefined, isError: true, error: "Only FAQ authors can view FAQ requests!"}
                    }
                }
            }
            return {data: undefined, isError: true, error: "Internal server error"}
        },
        answerRequest: async(requestId: number): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.post('/faq/requests/answer', {reqId: requestId})
                if (res.status == 200) {
                    return {data: true, error: undefined, isError: false}
                }
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "Only FAQ authors can answer requests!", isError: true}
                        case 404:
                            return {data: undefined, error: "FAQ request not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        createRequest: async(suggested: string): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.post('/faq/requests/create', {suggested: suggested})
                if (res.status == 200) {
                    return {data: true, error: undefined, isError: false}
                }
            } catch (err: any) {
                if (err.response) {
                    // Check for validation errors first
                    const validationError = extractValidationError(err.response);
                    if (validationError) {
                        return {data: undefined, error: validationError, isError: true, validationErrors: getValidationErrors(err.response)}
                    }
                    
                    switch(err.response.status) {
                        case 400:
                            return {data: undefined, error: "Invalid request content!", isError: true}
                        case 403:
                            return {data: undefined, error: "You must be logged in to create FAQ requests!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        allAuthor: async(userId: number): Promise<ErrorWrapper<FaqModel[]>> => {
            try {
                const res = await auth.api.get(`/faq/allAuthor?userId=${userId}`)
                return {isError: false, error: undefined, data: res.data}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 404:
                            return {data: undefined, isError: true, error: "User not found or has no FAQ responses!"}
                        default:
                            return {data: undefined, isError: true, error: "Internal server error"}
                    }
                }
            }
            return {data: undefined, isError: true, error: "Internal client error"}
        }
    }
}
