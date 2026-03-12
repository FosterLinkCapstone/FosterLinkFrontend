import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import { doGenericRequest, RequestType } from "@/net-fosterlink/util/ApiUtil";
import type { AuthContextType } from "../AuthContext";
import type { CreateThreadResponse } from "../models/api/CreateThreadResponse";
import type { GetHiddenThreadsResponse } from "../models/api/GetHiddenThreadsResponse";
import type { GetThreadsResponse } from "../models/api/GetThreadsResponse";
import { SearchBy } from "../models/api/SearchBy";
import type { ThreadSearchResponse } from "../models/api/ThreadSearchResponse";
import type { ReplyModel } from "../models/ReplyModel";
import type { ThreadModel } from "../models/ThreadModel";
import type { HiddenThreadModel } from "../models/HiddenThreadModel";

export interface ThreadApiType {
    search: (searchBy: SearchBy, searchTerm: string, pageNumber?: number) => Promise<ThreadSearchResponse>,
    rand: () => Promise<ErrorWrapper<ThreadModel[]>>,
    randForUser: (userId: number) => Promise<ErrorWrapper<ThreadModel[]>>,
    getThreads: (orderBy: "most liked" | "oldest" | "newest", pageNumber: number) => Promise<ErrorWrapper<GetThreadsResponse>>,
    getReplies: (threadId: number) => Promise<ErrorWrapper<ReplyModel[]>>,
    searchById: (threadId: number) => Promise<ErrorWrapper<ThreadModel | undefined>>,
    replyTo: (content: string, threadId: number) => Promise<ErrorWrapper<ReplyModel | undefined>>,
    likeReply: (replyId: number) => Promise<ErrorWrapper<boolean>>,
    likeThread: (threadId: number) => Promise<ErrorWrapper<boolean>>,
    createThread: (title: string, content: string, tags: string[]) => Promise<CreateThreadResponse>,
    editThreadContent: (threadId: number, newContent: string) => Promise<ErrorWrapper<void>>,
    editReplyContent: (replyId: number, newContent: string) => Promise<ErrorWrapper<ReplyModel|undefined>>,
    deleteReply: (replyId: number, markAsUserDeleted?: boolean) => Promise<ErrorWrapper<boolean>>
    hideReply: (replyId: number, hidden: boolean) => Promise<ErrorWrapper<boolean>>
    deleteHiddenReply: (replyId: number) => Promise<ErrorWrapper<boolean>>
    searchByUser: (userId: number, pageNumber: number) => Promise<ErrorWrapper<GetThreadsResponse>>
    getHiddenThreads: (hiddenThreadType: 'ADMIN' | 'USER', pageNumber: number) => Promise<ErrorWrapper<GetHiddenThreadsResponse>>
    setThreadHidden: (threadId: number, hidden: boolean, markAsUserDeleted?: boolean) => Promise<ErrorWrapper<boolean>>,
    getHiddenThread: (threadId: number) => Promise<ErrorWrapper<HiddenThreadModel | undefined>>,
    deleteHiddenThread: (threadId: number) => Promise<ErrorWrapper<boolean>>,
    updateTags: (threadId: number, tags: string[]) => Promise<ErrorWrapper<boolean>>,
    updateTitle: (threadId: number, title: string) => Promise<ErrorWrapper<void>>
}
export const threadApi = (auth: AuthContextType): ThreadApiType => {
    
    
    const defaultErrors: Map<number, string> = new Map<number,string>([[403, "You are not authorized to view this!"], [404, "No content was found!"],[400, "Invalid parameters"], [-1, "Internal server error. Please try again later."]]);
    
    return {
        search: async(searchBy: SearchBy, searchTerm: string, pageNumber = 0): Promise<ThreadSearchResponse> => {
            const defaultErrorsSearch: Map<number, string> = new Map<number, string>([
                [404, "There is no user with that username!"],
                [400, "Invalid search parameters"],
                [-1, "Internal client error. Please try again later."]
            ]);

            const result = await doGenericRequest<ThreadSearchResponse["response"]>(
                auth.api,
                RequestType.POST,
                "/threads/search",
                {
                    searchBy,
                    searchTerm,
                    pageNumber
                },
                defaultErrorsSearch
            );

            return {
                response: result.data ?? [],
                errorMessage: result.error
            };
        },
        rand: async(): Promise<ErrorWrapper<ThreadModel[]>> => {
            return await doGenericRequest<ThreadModel[]>(auth.api, RequestType.GET, "/threads/rand", {}, defaultErrors)
        },
        randForUser: async(userId: number): Promise<ErrorWrapper<ThreadModel[]>> => {
            const errors = new Map<number, string>([
                [404, "User not found!"],
                [403, "You must be logged in to view threads!"],
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<ThreadModel[]>(
                auth.api,
                RequestType.GET,
                `/threads/rand?userId=${userId}`,
                {},
                errors
            );
        },
        getThreads: async(orderBy: "most liked" | "oldest" | "newest", pageNumber: number): Promise<ErrorWrapper<GetThreadsResponse>> => {
            const errors = new Map<number, string>([
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<GetThreadsResponse>(
                auth.api,
                RequestType.GET,
                `/threads/getThreads?orderBy=${encodeURIComponent(orderBy)}&pageNumber=${pageNumber}`,
                {},
                errors
            );
        },
        getReplies: async(threadId: number): Promise<ErrorWrapper<ReplyModel[]>> => {
            const errors = new Map<number, string>([
                [404, "Thread not found!"],
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<ReplyModel[]>(
                auth.api,
                RequestType.GET,
                `/threads/replies?threadId=${threadId}`,
                {},
                errors
            );
        },
        searchById: async(threadId: number): Promise<ErrorWrapper<ThreadModel | undefined>> => {
            const errors = new Map<number, string>([
                [404, "Thread not found!"],
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<ThreadModel | undefined>(
                auth.api,
                RequestType.GET,
                `/threads/search-by-id?threadId=${threadId}`,
                {},
                errors
            );
        },
        replyTo: async(content: string, threadId: number): Promise<ErrorWrapper<ReplyModel | undefined>> => {
            const errors = new Map<number, string>([
                [400, "Invalid reply content!"],
                [403, "You must be logged in to reply!"],
                [404, "Thread not found!"],
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<ReplyModel | undefined>(
                auth.api,
                RequestType.POST,
                "/threads/replies",
                { content, threadId },
                errors
            );
        },
        likeReply: async(replyId: number): Promise<ErrorWrapper<boolean>> => {
            const errors = new Map<number, string>([
                [403, "You must be logged in to like replies!"],
                [404, "Reply not found!"],
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                "/threads/replies/like",
                { replyId },
                errors
            );
        },
        likeThread: async(threadId: number): Promise<ErrorWrapper<boolean>> => {
            const errors = new Map<number, string>([
                [403, "You must be logged in to like threads!"],
                [404, "Thread not found!"],
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<boolean>(
                auth.api,
                RequestType.POST,
                "/threads/like",
                { threadId },
                errors
            );
        },
        createThread: async(title: string, content: string, tags: string[]): Promise<CreateThreadResponse> => {
            const errors = new Map<number, string>([
                [400, "Invalid thread data. Please check your inputs."],
                [403, "You must be logged in to do that!"],
                [-1, "Internal client error"]
            ]);

            const result = await doGenericRequest<ThreadModel>(
                auth.api,
                RequestType.POST,
                "/threads/create",
                { title, content, tags },
                errors
            );

            return {
                thread: result.data,
                error: result.error,
                validationErrors: result.validationErrors
            };
        },
        editThreadContent: async(threadId: number, newContent: string): Promise<ErrorWrapper<void>> => {
            const errors = new Map<number, string>([
                [400, "Invalid thread content!"],
                [403, "You must be the thread author to do that!"],
                [404, "Thread not found!"],
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<void>(
                auth.api,
                RequestType.PUT,
                "/threads/update",
                { threadId, content: newContent, title: null },
                errors
            );
        },
        editReplyContent: async(replyId: number, newContent: string): Promise<ErrorWrapper<ReplyModel|undefined>> => {
            const errors = new Map<number, string>([
                [400, "Invalid reply content!"],
                [403, "You must be the reply author to do that!"],
                [404, "Reply not found!"],
                [-1, "Internal client error"]
            ]);

            return doGenericRequest<ReplyModel | undefined>(
                auth.api,
                RequestType.PUT,
                "/threads/replies/update",
                { replyId, content: newContent },
                errors
            );
        },
        deleteReply: async(replyId: number, markAsUserDeleted?: boolean): Promise<ErrorWrapper<boolean>> => {
            const errors = new Map<number, string>([
                [403, "You must be the reply author to do that!"],
                [404, "Reply not found!"],
                [-1, "Internal server error"]
            ]);
            const params = new URLSearchParams({ replyId: String(replyId) });
            if (markAsUserDeleted) params.set("markAsUserDeleted", "true");
            return doGenericRequest<boolean>(
                auth.api,
                RequestType.DELETE,
                `/threads/replies/delete?${params.toString()}`,
                {},
                errors
            );
            },
            hideReply: async(replyId: number, hidden: boolean): Promise<ErrorWrapper<boolean>> => {
                const errors = new Map<number, string>([
                    [403, "You do not have permission to do that!"],
                    [404, "Reply not found!"],
                    [-1, "Internal client error"]
                ]);

                return doGenericRequest<boolean>(
                    auth.api,
                    RequestType.POST,
                    `/threads/replies/hide?replyId=${replyId}&hidden=${hidden}`,
                    {},
                    errors
                );
            },
            deleteHiddenReply: async(replyId: number): Promise<ErrorWrapper<boolean>> => {
                const errors = new Map<number, string>([
                    [403, "You do not have permission to do that!"],
                    [404, "Hidden reply not found!"],
                    [-1, "Internal client error"]
                ]);

                return doGenericRequest<boolean>(
                    auth.api,
                    RequestType.DELETE,
                    `/threads/replies/hidden/delete?replyId=${replyId}`,
                    {},
                    errors
                );
            },
            searchByUser: async(userId: number, pageNumber: number): Promise<ErrorWrapper<GetThreadsResponse>> => {
                const errors = new Map<number, string>([
                    [404, "User not found!"],
                    [-1, "Internal client error"]
                ]);

                return doGenericRequest<GetThreadsResponse>(
                    auth.api,
                    RequestType.GET,
                    `/threads/search-by-user?userId=${userId}&pageNumber=${pageNumber}`,
                    {},
                    errors
                );
            },
            getHiddenThreads: async(hiddenThreadType: 'ADMIN' | 'USER', pageNumber: number): Promise<ErrorWrapper<GetHiddenThreadsResponse>> => {
                const errors = new Map<number, string>([
                    [403, "You must be an administrator to view hidden threads!"],
                    [-1, "Internal client error"]
                ]);

                return doGenericRequest<GetHiddenThreadsResponse>(
                    auth.api,
                    RequestType.POST,
                    `/threads/getHidden?hiddenThreadType=${hiddenThreadType}&pageNumber=${pageNumber}`,
                    {},
                    errors
                );
            },
            setThreadHidden: async(threadId: number, hidden: boolean, markAsUserDeleted?: boolean): Promise<ErrorWrapper<boolean>> => {
                const errors = new Map<number, string>([
                    [403, "You do not have permission to do that!"],
                    [404, "Thread not found!"],
                    [-1, "Internal client error"]
                ]);
                const params = new URLSearchParams({ threadId: String(threadId), hidden: String(hidden) });
                if (markAsUserDeleted) params.set("markAsUserDeleted", "true");
                return doGenericRequest<boolean>(
                    auth.api,
                    RequestType.POST,
                    `/threads/hide?${params.toString()}`,
                    {},
                    errors
                );
            },
            getHiddenThread: async(threadId: number): Promise<ErrorWrapper<HiddenThreadModel | undefined>> => {
                const errors = new Map<number, string>([
                    [404, "Hidden thread not found!"],
                    [403, "You do not have permission to do that!"],
                    [-1, "Internal client error"]
                ]);

                return doGenericRequest<HiddenThreadModel | undefined>(
                    auth.api,
                    RequestType.GET,
                    `/threads/hidden?threadId=${threadId}`,
                    {},
                    errors
                );
            },
            deleteHiddenThread: async(threadId: number): Promise<ErrorWrapper<boolean>> => {
                const errors = new Map<number, string>([
                    [403, "You do not have permission to do that!"],
                    [404, "Hidden thread not found!"],
                    [-1, "Internal client error"]
                ]);

                return doGenericRequest<boolean>(
                    auth.api,
                    RequestType.DELETE,
                    `/threads/hidden/delete?threadId=${threadId}`,
                    {},
                    errors
                );
            },
            updateTags: async(threadId: number, tags: string[]): Promise<ErrorWrapper<boolean>> => {
                const errors = new Map<number, string>([
                    [403, "You do not have permission to do that!"],
                    [404, "Thread not found!"],
                    [400, "Invalid tags!"],
                    [-1, "Internal client error"]
                ]);
                return doGenericRequest<boolean>(
                    auth.api,
                    RequestType.PUT,
                    `/threads/tags`,
                    { threadId, tags },
                    errors
                );
            },
            updateTitle: async(threadId: number, title: string): Promise<ErrorWrapper<void>> => {
                const errors = new Map<number, string>([
                    [403, "You do not have permission to do that!"],
                    [404, "Thread not found!"],
                    [400, "Invalid title!"],
                    [-1, "Internal server error"]])
                return doGenericRequest<void>(
                    auth.api,
                    RequestType.PUT,
                    `/threads/update`,
                    { threadId, title, content: null },
                    errors
                );
            }
        }    
    }