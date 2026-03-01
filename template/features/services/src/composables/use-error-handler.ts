import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export function useErrorHandler() {
  function handle(error: unknown): ApiError {
    const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

    if (axiosError.response) {
      return {
        message: axiosError.response.data?.message || "An error occurred.",
        status: axiosError.response.status,
        errors: axiosError.response.data?.errors,
      };
    }

    if (axiosError.request) {
      return {
        message: "Network error. Please check your connection.",
        status: 0,
      };
    }

    return {
      message: axiosError.message || "An unexpected error occurred.",
      status: 0,
    };
  }

  return { handle };
}
