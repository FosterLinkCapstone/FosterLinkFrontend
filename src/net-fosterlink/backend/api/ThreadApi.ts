import type { ErrorWrapper } from "@/net-fosterlink/util/ErrorWrapper";
import type { AuthContextType } from "../AuthContext";
import type { CreateThreadResponse } from "../models/api/CreateThreadResponse";
import type { SearchBy } from "../models/api/SearchBy";
import type { ThreadSearchResponse } from "../models/api/ThreadSearchResponse";
import type { ReplyModel } from "../models/ReplyModel";
import type { ThreadModel } from "../models/ThreadModel";

// TODO implement error wrapper everywhere necessary 

export interface ThreadApiType {
    search: (searchBy: SearchBy, searchTerm: string) => Promise<ThreadSearchResponse>,
    rand: () => Promise<ErrorWrapper<ThreadModel[]>>,
    randForUser: (userId: number) => Promise<ErrorWrapper<ThreadModel[]>>,
    getThreads: (orderBy: "most liked" | "oldest" | "newest", count: number) => Promise<ErrorWrapper<ThreadModel[]>>,
    getReplies: (threadId: number) => Promise<ErrorWrapper<ReplyModel[]>>,
    searchById: (threadId: number) => Promise<ErrorWrapper<ThreadModel | undefined>>,
    replyTo: (content: string, threadId: number) => Promise<ErrorWrapper<ReplyModel | undefined>>,
    likeReply: (replyId: number) => Promise<ErrorWrapper<boolean>>,
    likeThread: (threadId: number) => Promise<ErrorWrapper<boolean>>,
    createThread: (title: string, content: string) => Promise<CreateThreadResponse>,
    editThreadContent: (threadId: number, newContent: string) => Promise<ErrorWrapper<ThreadModel|undefined>>,
    deleteThread: (threadId: number) => Promise<ErrorWrapper<boolean>>,
    editReplyContent: (replyId: number, newContent: string) => Promise<ErrorWrapper<ReplyModel|undefined>>,
    deleteReply: (replyId: number) => Promise<ErrorWrapper<boolean>>
}

export const threadApi = (auth: AuthContextType): ThreadApiType => {
    return {
        search: async(searchBy: SearchBy, searchTerm: string): Promise<ThreadSearchResponse> => {
            try {
                const res = await auth.api.post("/threads/search", {
                    searchBy: searchBy,
                    searchTerm: searchTerm
                })
                return {response: res.data, errorMessage: undefined}
            } catch (err: any) {
                if (err.repsonse) {
                    switch (err.response.code) {
                        case 404:
                            return {response: [], errorMessage: "There is no user with that username!"}
                        case 400:
                            return {response: [], errorMessage: "Incorrect search by syntadx"}
                        default:
                            return {response: [], errorMessage: "Internal server error. Please try again later."}
                    }
                } else {
                    return {response: [], errorMessage: "Internal client error. Please try again later."}
                }
            }
        },
        rand: async(): Promise<ErrorWrapper<ThreadModel[]>> => {
            try {
                const res = await auth.api.get("/threads/rand")
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be logged in to view threads!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        randForUser: async(userId: number): Promise<ErrorWrapper<ThreadModel[]>> => {
            try {
                const res = await auth.api.get(`/threads/rand?userId=${userId}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 404:
                            return {data: undefined, error: "User not found!", isError: true}
                        case 403:
                            return {data: undefined, error: "You must be logged in to view threads!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        getThreads: async(orderBy: "most liked" | "oldest" | "newest", count: number): Promise<ErrorWrapper<ThreadModel[]>> => {
            try {
                const res = await auth.api.get(`/threads/getThreads?orderBy=${encodeURIComponent(orderBy)}&count=${count}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        getReplies: async(threadId: number): Promise<ErrorWrapper<ReplyModel[]>> => {
            try {
                const res = await auth.api.get(`/threads/replies?threadId=${threadId}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 404:
                            return {data: undefined, error: "Thread not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        searchById: async(threadId: number): Promise<ErrorWrapper<ThreadModel | undefined>> => {
            try {
                const res = await auth.api.get(`/threads/search-by-id?threadId=${threadId}`)
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 404:
                            return {data: undefined, error: "Thread not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        replyTo: async(content: string, threadId: number): Promise<ErrorWrapper<ReplyModel | undefined>> => {
            try {
                const res = await auth.api.post(`/threads/replies`, {
                    content: content,
                    threadId: threadId
                })
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be logged in to reply!", isError: true}
                        case 404:
                            return {data: undefined, error: "Thread not found!", isError: true}
                        case 400:
                            return {data: undefined, error: "Invalid reply content!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        likeReply: async(replyId: number): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.post(`/threads/replies/like`, {replyId: replyId})
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be logged in to like replies!", isError: true}
                        case 404:
                            return {data: undefined, error: "Reply not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        likeThread: async(threadId: number): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.post(`/threads/like`, {threadId: threadId})
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be logged in to like threads!", isError: true}
                        case 404:
                            return {data: undefined, error: "Thread not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        createThread: async(title: string, content: string): Promise<CreateThreadResponse> => { // TODO implement tags
            const res = await auth.api.post(`/threads/create`, {title: title, content: content, tags: []})
                try {
                    return {thread: res.data, error: undefined}
                } catch (err: any) {
                    if (err.response) {
                        switch(err.response.status) {
                            case 403:
                                return {thread: undefined, error: "You must be logged in to do that!"}
                            case 400:
                                return {thread: undefined, error: "Your post content or title was too long!"} // TODO assuming that this will be a thing that gets added eventually
                            default:
                                return {thread: undefined, error: "Internal server error"}
                        }
                    }
                }
                return {thread: undefined, error: "Internal client error"}
        },
        editThreadContent: async(threadId: number, newContent: string): Promise<ErrorWrapper<ThreadModel|undefined>> => {
            try {
                const res = await auth.api.put(`/threads/update`, {threadId: threadId, content: newContent, title: null})
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be the thread author to do that!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        deleteThread: async(threadId: number): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.delete(`/threads/delete?threadId=${threadId}`)
                if (res.status == 200) {
                    return {data: true, error: undefined, isError: false}
                }
                return {data: false, error: "Internal server error", isError: true}
            } catch(err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: false, error: "You must be the thread author to do that!", isError: true}
                        case 404:
                            return {data: false, error: "Thread not found!", isError: true}
                        default:
                            return {data: false, error: "Internal server error", isError: true}
                        }
                    }
                }
                return {data: false, error: "Internal server error", isError: true}
            }
        ,
        editReplyContent: async(replyId: number, newContent: string): Promise<ErrorWrapper<ReplyModel|undefined>> => {
            try {
                const res = await auth.api.put(`/threads/replies/update`, {replyId: replyId, content: newContent})
                return {data: res.data, error: undefined, isError: false}
            } catch (err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: undefined, error: "You must be the reply author to do that!", isError: true}
                        case 404:
                            return {data: undefined, error: "Reply not found!", isError: true}
                        default:
                            return {data: undefined, error: "Internal server error", isError: true}
                    }
                }
            }
            return {data: undefined, error: "Internal client error", isError: true}
        },
        deleteReply: async(replyId: number): Promise<ErrorWrapper<boolean>> => {
            try {
                const res = await auth.api.delete(`/threads/replies/delete?replyId=${replyId}`)
                if (res.status == 200) {
                    return {data: true, error: undefined, isError: false}
                }
                return {data: false, error: "Internal server error", isError: true}
            } catch(err: any) {
                if (err.response) {
                    switch(err.response.status) {
                        case 403:
                            return {data: false, error: "You must be the reply author to do that!", isError: true}
                        case 404:
                            return {data: false, error: "Reply not found!", isError: true}
                        default:
                            return {data: false, error: "Internal server error", isError: true}
                        }
                    }
                }
                return {data: false, error: "Internal server error", isError: true}
            }
        }
    
    }