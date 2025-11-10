import type { UserModel } from "../UserModel";

export interface UserInfoResponse {
    found: boolean,
    user: UserModel | undefined
}