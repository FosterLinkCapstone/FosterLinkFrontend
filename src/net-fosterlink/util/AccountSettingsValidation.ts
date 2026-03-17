import type { UserSettingsModel } from "../backend/models/UserSettingsModel";

export type FormState = Omit<UserSettingsModel, "id">;
export type FormErrors = Partial<Record<keyof FormState, string>>;

export const emptyForm = (): FormState => ({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    username: "",
    profilePictureUrl: "",
    emailVerified: false,
});

const str = (v: string | null | undefined): string => v ?? "";

export const validateAccountSettings = (form: FormState): FormErrors => {
    const errors: FormErrors = {};

    const firstName = str(form.firstName);
    if (!firstName.trim())
        errors.firstName = "First name is required.";
    else if (firstName.trim().length > 50)
        errors.firstName = "First name must be 50 characters or fewer.";

    const lastName = str(form.lastName);
    if (!lastName.trim())
        errors.lastName = "Last name is required.";
    else if (lastName.trim().length > 50)
        errors.lastName = "Last name must be 50 characters or fewer.";

    const email = str(form.email);
    if (!email.trim())
        errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.email = "Please enter a valid email address.";
    else if (email.length > 255)
        errors.email = "Email must be 255 characters or fewer.";

    const username = str(form.username);
    if (!username.trim())
        errors.username = "Username is required.";
    else if (username.length < 3)
        errors.username = "Username must be at least 3 characters.";
    else if (username.length > 30)
        errors.username = "Username must be 30 characters or fewer.";
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
        errors.username = "Username may only contain letters, numbers, and underscores.";

    const phone = str(form.phoneNumber);
    const phoneDigits = phone.replace(/\D/g, "");
    if (phone.trim() && phoneDigits.length < 10)
        errors.phoneNumber = "Please enter a complete 10-digit phone number or leave blank.";

    return errors;
};
