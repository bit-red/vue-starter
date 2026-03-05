import { watch, type Ref } from "vue";
import { toast } from "vue-sonner";
import { useApiFieldErrorsContext } from "./use-api-field-errors";

interface HttpErrorResponse {
  response?: {
    data?: {
      message?: string;
      error_description?: string;
      errors?: Record<string, string[]>;
      error?: string;
    };
    status: number;
  };
  request?: unknown;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
  raw?: unknown;
}

export interface HandleErrorOptions {
  /** Show toast notification (default: true, but skipped for 422 with field errors) */
  showToast?: boolean;
  /** Custom callback — return false to prevent default toast/field-error handling */
  onError?: (error: ApiError) => boolean | void;
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request.",
  401: "Session expired. Please log in again.",
  403: "You do not have permission for this action.",
  404: "Resource not found.",
  409: "Conflict with existing data.",
  422: "Please check the form fields.",
  429: "Too many attempts. Please wait.",
  500: "Internal server error.",
  502: "Server unavailable.",
  503: "Service temporarily unavailable.",
};

export function useErrorHandler() {
  const fieldErrorsCtx = useApiFieldErrorsContext();

  /**
   * Pure parser — extracts error info from any error.
   * Does NOT show toasts or set field errors.
   */
  function handle(error: unknown): ApiError {
    const httpError = error as HttpErrorResponse;

    if (httpError.response) {
      const data = httpError.response.data;
      const status = httpError.response.status;
      return {
        message:
          data?.message ||
          data?.error_description ||
          STATUS_MESSAGES[status] ||
          "An error occurred.",
        status,
        errors: data?.errors,
        raw: error,
      };
    }

    if (httpError.request) {
      return {
        message: "Connection error. Please check your internet.",
        status: 0,
        raw: error,
      };
    }

    const msg = (error as Error)?.message;
    return {
      message: msg || "An unexpected error occurred.",
      status: 0,
    };
  }

  /**
   * Action-oriented — parses error, sets field errors, shows toast.
   * Automatically integrates with useApiFieldErrors if available.
   */
  function handleError(error: unknown, options: HandleErrorOptions = {}): ApiError {
    const parsed = handle(error);

    // Custom callback can prevent default handling
    if (options.onError?.(parsed) === false) return parsed;

    // Set field errors if validation errors exist and context is available
    const hasFieldErrors = !!(parsed.errors && fieldErrorsCtx);
    if (hasFieldErrors) {
      fieldErrorsCtx!.setErrors(parsed.errors!);
    }

    // Show toast (skip for 422 with field errors by default)
    const showToast = options.showToast ?? !hasFieldErrors;
    if (showToast) {
      toast.error(parsed.message);
    }

    return parsed;
  }

  /**
   * Watch a query error ref and handle errors automatically.
   * Useful for TanStack Query error refs.
   */
  function watchQueryError(error: Ref<Error | null>, options: HandleErrorOptions = {}) {
    watch(error, (err) => {
      if (err) handleError(err, options);
    });
  }

  return { handle, handleError, watchQueryError };
}
