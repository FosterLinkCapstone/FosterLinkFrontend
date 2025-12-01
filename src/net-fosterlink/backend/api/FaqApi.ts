import type { AuthContextType } from "../AuthContext"
import type { FaqModel } from "../models/FaqModel"
import type { PendingFaqModel } from "../models/PendingFaqModel"

export interface FaqApiType {
    getAll: () => Promise<FaqModel[]>
    getContent: (faqId: number) => Promise<string>
    getPending: () => Promise<PendingFaqModel[]>
    approve: (id: number, approved: boolean) => Promise<boolean>
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
                    switch (err.status) {
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
                    switch(err.status) {
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
                    switch(err.status) {
                        case 403:
                            console.error("Unauthorized: this endpoint is administrator only")
                    }
                }
            }
            return false
        }
    }
}
