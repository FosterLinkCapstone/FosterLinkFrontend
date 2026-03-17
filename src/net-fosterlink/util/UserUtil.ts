  // FE/F-04: Only the non-identifying userId is embedded in the URL.
  // PII fields (fullName, profilePicUrl, joinDate) were removed to prevent
  // personal data appearing in browser history, server logs, and referrer headers.
  // The profile page fetches authoritative data from the server after mount.
  export const buildProfileUrl = (user: { id: number | string }) => {
    return `/users/${user.id}`;
  }