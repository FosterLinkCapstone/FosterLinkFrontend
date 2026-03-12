import type { UserModel } from "./UserModel";
import type { PaginatedResponse } from "./api/PaginatedResponse";

export type GetAdminThreadsForUserResponse = PaginatedResponse<AdminThreadForUserModel>;

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
