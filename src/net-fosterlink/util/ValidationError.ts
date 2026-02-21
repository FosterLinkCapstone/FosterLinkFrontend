export interface FieldError {
    field: string;
    message: string;
}

export interface ValidationErrorResponse {
    status: number;
    error: string;
    errors: FieldError[];
}

export function isValidationError(response: any): response is ValidationErrorResponse {
    return (
        response &&
        response.status === 400 &&
        response.error === "Validation Failed" &&
        Array.isArray(response.errors)
    );
}

export function formatValidationErrors(errors: FieldError[]): string {
    if (errors.length === 0) {
        return "Validation failed";
    }
    
    if (errors.length === 1) {
        return errors[0].message;
    }
    
    // Multiple errors - format as a list
    return errors.map(e => `• ${e.message}`).join("\n");
}

export function extractValidationError(errorResponse: any): string | undefined {
    if (errorResponse?.data && isValidationError(errorResponse.data)) {
        return formatValidationErrors(errorResponse.data.errors);
    }
    return undefined;
}

export function getValidationErrors(errorResponse: any): FieldError[] | undefined {
    if (errorResponse?.data && isValidationError(errorResponse.data)) {
        return errorResponse.data.errors;
    }
    return undefined;
}
