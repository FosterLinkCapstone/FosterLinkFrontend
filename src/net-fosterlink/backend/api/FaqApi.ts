import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper"
import { doGenericRequest, RequestType } from "@/net-fosterlink/util/ApiUtil"
import type { AuthContextType } from "../AuthContext"
import type { FaqModel } from "../models/FaqModel"
import type { ApprovalCheckModel } from "../models/ApprovalCheckModel"
import type { FaqRequestModel } from "../models/FaqRequestModel"
import type { GetFaqsResponse } from "../models/api/GetFaqsResponse"
import type { GetPendingFaqsResponse } from "../models/api/GetPendingFaqsResponse"
import type { GetHiddenFaqsResponse } from "../models/api/GetHiddenFaqsResponse"

export interface UpdateFaqPayload {
    title?: string;
    summary?: string;
    content?: string;
}

export type FaqSearchBy = 'authorFullName' | 'authorUsername' | 'title' | 'summary'

export interface FaqGetAllParams {
    pageNumber: number
    search?: string
    searchBy?: FaqSearchBy
}

export interface FaqApiType {
    getAll: (pageNumber: number, params?: { search?: string; searchBy?: FaqSearchBy }) => Promise<ErrorWrapper<GetFaqsResponse>>
    getContent: (faqId: number) => Promise<ErrorWrapper<string>>
    getPending: (pageNumber: number) => Promise<ErrorWrapper<GetPendingFaqsResponse>>
    approve: (id: number, approved: boolean) => Promise<ErrorWrapper<boolean>>
    create: (title: string, summary: string, content: string) => Promise<ErrorWrapper<FaqModel>>
    update: (id: number, payload: UpdateFaqPayload) => Promise<ErrorWrapper<boolean>>
    checkApprovalStatus: () => Promise<ApprovalCheckModel>
    getRequests: () => Promise<ErrorWrapper<FaqRequestModel[]>>
    answerRequest: (requestId: number) => Promise<ErrorWrapper<boolean>>
    createRequest: (suggested: string) => Promise<ErrorWrapper<boolean>>
    allAuthor: (userId: number, pageNumber?: number) => Promise<ErrorWrapper<GetFaqsResponse>>
    getHiddenFaqs: (type: 'ADMIN' | 'USER', pageNumber: number) => Promise<ErrorWrapper<GetHiddenFaqsResponse>>
    setFaqHidden: (faqId: number, hidden: boolean) => Promise<ErrorWrapper<boolean>>
    deleteHiddenFaq: (faqId: number) => Promise<ErrorWrapper<boolean>>
    deleteFaq: (faqId: number) => Promise<ErrorWrapper<boolean>>
}

export const faqApi = (auth: AuthContextType): FaqApiType => {
    const defaultErrorsAll: Map<number, string> = new Map<number, string>([
        [403, "You must be logged in to view FAQs!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsContent: Map<number, string> = new Map<number, string>([
        [404, "FAQ content not found!"],
        [403, "You must be logged in to view FAQ content!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsPending: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can view pending FAQs!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsApprove: Map<number, string> = new Map<number, string>([
        [403, "Only administrators can approve FAQs!"],
        [404, "FAQ not found!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsCreateFaq: Map<number, string> = new Map<number, string>([
        [400, "Invalid FAQ data. Please check your inputs."],
        [403, "Only FAQ authors can create FAQ responses!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsGetRequests: Map<number, string> = new Map<number, string>([
        [403, "Only FAQ authors can view FAQ requests!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsAnswerRequest: Map<number, string> = new Map<number, string>([
        [403, "Only FAQ authors can answer requests!"],
        [404, "FAQ request not found!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsAllAuthor: Map<number, string> = new Map<number, string>([
        [404, "User not found or has no FAQ responses!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsGetHiddenFaqs: Map<number, string> = new Map<number, string>([
        [403, "You must be an administrator to view hidden FAQs!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsSetFaqHidden: Map<number, string> = new Map<number, string>([
        [403, "You do not have permission to do that!"],
        [404, "FAQ not found!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsDeleteHiddenFaq: Map<number, string> = new Map<number, string>([
        [403, "You do not have permission to do that!"],
        [404, "Hidden FAQ not found!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsDeleteFaq: Map<number, string> = new Map<number, string>([
        [403, "You do not have permission to do that!"],
        [404, "FAQ not found!"],
        [-1, "Internal server error"]
    ])

    const defaultErrorsUpdateFaq: Map<number, string> = new Map<number, string>([
        [400, "Invalid FAQ data. Please provide at least one of title, summary, or content."],
        [403, "You do not have permission to update this FAQ!"],
        [404, "FAQ not found!"],
        [-1, "Internal server error"]
    ])

    return {
        getAll: async (pageNumber: number, params?: { search?: string; searchBy?: FaqSearchBy }): Promise<ErrorWrapper<GetFaqsResponse>> => {
            const searchParams = new URLSearchParams({ pageNumber: String(pageNumber) })
            if (params?.search?.trim()) searchParams.set('search', params.search.trim())
            if (params?.searchBy) searchParams.set('searchBy', params.searchBy)
            return doGenericRequest<GetFaqsResponse>(
                auth.api,
                RequestType.GET,
                `/faq/all?${searchParams.toString()}`,
                {},
                defaultErrorsAll
            )
        },
        getContent: async(faqId: number): Promise<ErrorWrapper<string>> => {
            return doGenericRequest<string>(
                auth.api,
                RequestType.GET,
                `/faq/content?id=${faqId}`,
                {},
                defaultErrorsContent
            )
        },
        getPending: async(pageNumber: number): Promise<ErrorWrapper<GetPendingFaqsResponse>> => {
            return doGenericRequest<GetPendingFaqsResponse>(
                auth.api,
                RequestType.GET,
                `/faq/pending?pageNumber=${pageNumber}`,
                {},
                defaultErrorsPending
            )
        },
        approve: async(id: number, approved: boolean): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                `/faq/approve`,
                { id, approved },
                defaultErrorsApprove
            )
        },
        create: async(title: string, summary: string, content: string): Promise<ErrorWrapper<FaqModel>> => {
            return doGenericRequest<FaqModel>(
                auth.api,
                RequestType.POST,
                `/faq/create`,
                { title, summary, content },
                defaultErrorsCreateFaq
            )
        },
        update: async(id: number, payload: UpdateFaqPayload): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.PUT,
                `/faq/update`,
                { id, ...payload },
                defaultErrorsUpdateFaq
            )
        },
        checkApprovalStatus: async(): Promise<ApprovalCheckModel> => {
            const res = await auth.api.get("/faq/checkApproval")
            return res.data
        },
        getRequests: async(): Promise<ErrorWrapper<FaqRequestModel[]>> => {
            return doGenericRequest<FaqRequestModel[]>(
                auth.api,
                RequestType.GET,
                "/faq/requests",
                {},
                defaultErrorsGetRequests
            )
        },
        answerRequest: async(requestId: number): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                '/faq/requests/answer',
                { reqId: requestId },
                defaultErrorsAnswerRequest
            )
        },
        createRequest: async(suggested: string): Promise<ErrorWrapper<boolean>> => {
            const defaultErrorsCreateRequest: Map<number, string> = new Map<number, string>([
                [400, "Invalid request content!"],
                [403, "You must be logged in to create FAQ requests!"],
                [-1, "Internal client error"]
            ])

            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                "/faq/requests/create",
                { suggested },
                defaultErrorsCreateRequest
            )
        },
        allAuthor: async(userId: number, pageNumber: number = 0): Promise<ErrorWrapper<GetFaqsResponse>> => {
            return doGenericRequest<GetFaqsResponse>(
                auth.api,
                RequestType.GET,
                `/faq/allAuthor?userId=${userId}&pageNumber=${pageNumber}`,
                {},
                defaultErrorsAllAuthor
            )
        },
        getHiddenFaqs: async(type: 'ADMIN' | 'USER', pageNumber: number): Promise<ErrorWrapper<GetHiddenFaqsResponse>> => {
            return doGenericRequest<GetHiddenFaqsResponse>(
                auth.api,
                RequestType.POST,
                `/faq/getHidden?type=${type}&pageNumber=${pageNumber}`,
                {},
                defaultErrorsGetHiddenFaqs
            )
        },
        setFaqHidden: async(faqId: number, hidden: boolean): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                `/faq/hide?faqId=${faqId}&hidden=${hidden}`,
                {},
                defaultErrorsSetFaqHidden
            )
        },
        deleteHiddenFaq: async(faqId: number): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.DELETE,
                `/faq/hidden/delete?id=${faqId}`,
                {},
                defaultErrorsDeleteHiddenFaq
            )
        },
        deleteFaq: async(faqId: number): Promise<ErrorWrapper<boolean>> => {
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.DELETE,
                `/faq/delete?id=${faqId}`,
                {},
                defaultErrorsDeleteFaq
            )
        }
    }
}
