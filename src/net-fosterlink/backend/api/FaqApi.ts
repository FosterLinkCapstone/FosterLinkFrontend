import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper"
import type { AuthContextType } from "../AuthContext"
import type { FaqModel } from "../models/FaqModel"
import type { PendingFaqModel } from "../models/PendingFaqModel"
import type { ApprovalCheckModel } from "../models/ApprovalCheckModel"
import type { FaqRequestModel } from "../models/FaqRequestModel"

export interface FaqApiType {
    getAll: () => Promise<FaqModel[]>
    getContent: (faqId: number) => Promise<string>
    getPending: () => Promise<PendingFaqModel[]>
    approve: (id: number, approved: boolean) => Promise<boolean>
    create: (title: string, summary: string, content: string) => Promise<ErrorWrapper<FaqModel>>
    checkApprovalStatus: () => Promise<ApprovalCheckModel>
    getRequests: () => Promise<ErrorWrapper<FaqRequestModel[]>>
    answerRequest: (requestId: number) => Promise<boolean>
    createRequest: (suggested: string) => Promise<boolean>
}

export const faqApi = (auth: AuthContextType): FaqApiType => {
    return {
        getAll: async (): Promise<FaqModel[]> => {
            const res = await auth.api.get("/faq/all")
            if (res.data) {
                return res.data
            } else return []
        },
        getContent: async(faqId: number): Promise<string> => {
            try {
                const res = await auth.api.get(`/faq/content?id=${faqId}`)
                return res.data
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 404:
                            return "No content! (404)"
                    }
                }
            }
            return "Internal server error (500)"
        },
        getPending: async(): Promise<PendingFaqModel[]> => {
            try {
                const res = await auth.api.get(`/faq/pending`)
                return res.data
            } catch (err:any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            console.error("Unauthorized: this endpoint is administrator only")
                    }
                }
            }
            return []
        },
        approve: async(id: number, approved: boolean): Promise<boolean> => {
            try {
                const res = await auth.api.post(`/faq/approve`, {id: id, approved: approved})
                if (res.status == 200) return true
            } catch (err:any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            console.error("Unauthorized: this endpoint is administrator only")
                    }
                }
            }
            return false
        },
        create: async(title: string, summary: string, content: string): Promise<ErrorWrapper<FaqModel>> => {
            try {
                const res = await auth.api.post(`/faq/create`, {title: title, summary: summary, content: content})
                return {data: res.data, isError: false, error: undefined}
            } catch (err: any) {
                if (err.response) {
                    switch (err.response.status) {
                        case 403:
                            console.error("Unauthorized: only users marked as faq authors can create faq responses!")
                            return {data: undefined, isError: true, error: "Only FAQ authors can create FAQ responses!"}
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
        answerRequest: async(requestId: number): Promise<boolean> => {
            try {
                const res = await auth.api.post('/faq/requests/answer', {reqId: requestId})
                if (res.status == 200) return true
            } catch (error: any) {
                return false
            }
            return false
        },
        createRequest: async(suggested: string): Promise<boolean> => {
            try {
                const res = await auth.api.post('/faq/requests/create', {suggested: suggested})
                if (res.status == 200) return true;
            } catch (error: any) {
                return false
            }
            return false
        }
    }
}
