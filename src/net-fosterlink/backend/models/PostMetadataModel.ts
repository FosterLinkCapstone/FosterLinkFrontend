export interface PostMetadataModel {
    id: number
    hidden: boolean
    userDeleted: boolean
    locked: boolean
    verified: boolean
    hiddenBy: string | null
}
