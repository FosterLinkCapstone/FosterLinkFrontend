export interface ThreadModel {
    id: number,
    title: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    postedByUsername: string,
    postedById: number,
    likeCount: number,
    tags: string[]
}