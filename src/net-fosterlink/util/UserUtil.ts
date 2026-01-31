import type { UserModel } from "../backend/models/UserModel";

  export const buildProfileUrl = (user: UserModel) => {
    return `/users/${user.id}?username=${encodeURIComponent(user.username)}&fullName=${encodeURIComponent(user.fullName)}&joinDate=${encodeURIComponent(new Date(user.createdAt).toISOString())}${user.profilePictureUrl ? `&profilePicUrl=${encodeURIComponent(user.profilePictureUrl)}` : ''}`;
  }