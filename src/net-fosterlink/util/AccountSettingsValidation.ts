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

export const validateAccountSettings = (form: FormState): FormErrors => {
    const errors: FormErrors = {};

    if (!form.firstName.trim())
        errors.firstName = "First name is required.";
    else if (form.firstName.trim().length > 50)
        errors.firstName = "First name must be 50 characters or fewer.";

    if (!form.lastName.trim())
        errors.lastName = "Last name is required.";
    else if (form.lastName.trim().length > 50)
        errors.lastName = "Last name must be 50 characters or fewer.";

    if (!form.email.trim())
        errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errors.email = "Please enter a valid email address.";
    else if (form.email.length > 255)
        errors.email = "Email must be 255 characters or fewer.";

    if (!form.username.trim())
        errors.username = "Username is required.";
    else if (form.username.length < 3)
        errors.username = "Username must be at least 3 characters.";
    else if (form.username.length > 30)
        errors.username = "Username must be 30 characters or fewer.";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
        errors.username = "Username may only contain letters, numbers, and underscores.";

    const phoneDigits = form.phoneNumber.replace(/\D/g, "");
    if (!form.phoneNumber.trim())
        errors.phoneNumber = "Phone number is required.";
    else if (phoneDigits.length < 10)
        errors.phoneNumber = "Please enter a complete 10-digit phone number.";

    return errors;
};
