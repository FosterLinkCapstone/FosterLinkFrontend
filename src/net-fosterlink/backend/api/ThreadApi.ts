import type { AuthContextType } from "../AuthContext";
import type { CreateThreadResponse } from "../models/api/CreateThreadResponse";
import type { SearchBy } from "../models/api/SearchBy";
import type { ThreadSearchResponse } from "../models/api/ThreadSearchResponse";
import type { ReplyModel } from "../models/ReplyModel";
import type { ThreadModel } from "../models/ThreadModel";

// TODO implement error wrapper everywhere necessary 

export interface ThreadApiType {
    search: (searchBy: SearchBy, searchTerm: string) => Promise<ThreadSearchResponse>,
    rand: () => Promise<ThreadModel[]>,
    randForUser: (userId: number) => Promise<ThreadModel[]>,
    getReplies: (threadId: number) => Promise<ReplyModel[]>,
    searchById: (threadId: number) => Promise<ThreadModel | undefined>,
    replyTo: (content: string, threadId: number) => Promise<ReplyModel | undefined>,
    likeReply: (replyId: number) => Promise<boolean>,
    likeThread: (threadId: number) => Promise<boolean>,
    createThread: (title: string, content: string) => Promise<CreateThreadResponse>
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
        rand: async(): Promise<ThreadModel[]> => {
            const res = await auth.api.get("/threads/rand")
            return res.data
        },
        randForUser: async(userId: number): Promise<ThreadModel[]> => {
            const res = await auth.api.get(`/threads/rand?userId=${userId}`)
            return res.data
        },
        getReplies: async(threadId: number): Promise<ReplyModel[]> => {
            const res = await auth.api.get(`/threads/replies?threadId=${threadId}`)
            return res.data
        },
        searchById: async(threadId: number): Promise<ThreadModel | undefined> => {
            try {
                const res = await auth.api.get(`/threads/search-by-id?threadId=${threadId}`)
                return res.data
            } catch (err:any) {
                return undefined // todo
            }
        },
        replyTo: async(content: string, threadId: number): Promise<ReplyModel | undefined> => {
            try {
                const res = await auth.api.post(`/threads/replies`, {
                    content: content,
                    threadId: threadId
                })
                return res.data
            } catch (err: any) {
                return undefined
            }
        },
        likeReply: async(replyId: number): Promise<boolean> => {
            auth.api.post(`/threads/replies/like`, {replyId: replyId}).then(res => {
                try {
                    return res.data
                } catch(err: any) {
                    return false
                }
            })
            return false
        },
        likeThread: async(threadId: number): Promise<boolean> => {
            auth.api.post(`/threads/like`, {threadId: threadId}).then(res => {
                try {
                    return res.data
                } catch (err: any) {
                    return false
                }
            })
            return false
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
        }
    }
}