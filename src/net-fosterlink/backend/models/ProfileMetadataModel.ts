import type { UserModel } from "./UserModel";

export interface ProfileMetadataModel {
    userId: number,
    admin: boolean,
    faqAuthor: boolean,
    agencyId: string | null,
    agencyName: string | null,
    user: UserModel
}