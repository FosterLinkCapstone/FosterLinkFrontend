import type { UserModel } from "./UserModel";

export interface HiddenFaqModel {
    id: number;
    title: string;
    summary: string;
    createdAt: Date;
    updatedAt: Date | undefined;
    author: UserModel;
    hiddenBy: string;
    hiddenByAuthor: boolean;
}
