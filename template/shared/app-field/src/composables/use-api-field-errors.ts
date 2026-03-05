import { ref, provide, inject, type InjectionKey } from "vue";
import { useFormValidation } from "./use-form-validation";
import type { ValidationError } from "@tanstack/vue-form";

export interface ApiFieldErrorsContext {
  fieldError: (name: string, formErrors: ValidationError[]) => string | undefined;
  clearFieldError: (name: string) => void;
  setErrors: (errors: Record<string, string[]>) => void;
  clearErrors: () => void;
}

export const API_FIELD_ERRORS_KEY: InjectionKey<ApiFieldErrorsContext> =
  Symbol("api-field-errors");

export function useApiFieldErrors() {
  const apiFieldErrors = ref<Record<string, string[]>>({});
  const { getFieldError } = useFormValidation();

  function setErrors(errors: Record<string, string[]>) {
    apiFieldErrors.value = errors;
  }

  function clearErrors() {
    apiFieldErrors.value = {};
  }

  function fieldError(name: string, formErrors: ValidationError[]): string | undefined {
    return getFieldError(formErrors) || apiFieldErrors.value[name]?.[0];
  }

  function clearFieldError(name: string) {
    if (apiFieldErrors.value[name]) {
      const { [name]: _, ...rest } = apiFieldErrors.value;
      apiFieldErrors.value = rest;
    }
  }

  const ctx: ApiFieldErrorsContext = { fieldError, clearFieldError, setErrors, clearErrors };
  provide(API_FIELD_ERRORS_KEY, ctx);

  return { apiFieldErrors, setErrors, clearErrors, fieldError, clearFieldError };
}

export function useApiFieldErrorsContext() {
  return inject(API_FIELD_ERRORS_KEY, null);
}
