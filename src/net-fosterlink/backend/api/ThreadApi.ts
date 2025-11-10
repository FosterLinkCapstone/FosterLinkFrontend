import type { AuthContextType } from "../AuthContext";
import type { ThreadModel } from "../models/ThreadModel";

export interface ThreadApiType {
    getAll: () => Promise<ThreadModel[]>
}

export const threadApi = (auth: AuthContextType): ThreadApiType => {
    return {
        getAll: async (): Promise<ThreadModel[]> => {
            try {
                const res = await auth.api.get("/threads/getAll")
                return res.data
            } catch (err: any) {
                console.log(err)
            }
            return []
        }
    }
}