import type { UserModel } from "./UserModel";

export interface AdminThreadForUserModel {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string | null;
    author: UserModel;
    hidden: boolean;
    userDeleted: boolean;
    locked: boolean;
    verified: boolean;
    hiddenBy: string | null;
}
