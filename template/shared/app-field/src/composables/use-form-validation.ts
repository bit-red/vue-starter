import type { ValidationError } from "@tanstack/vue-form";

/**
 * Extracts the first error message from a TanStack Form field's error array.
 */
export function useFormValidation() {
  function getFieldError(errors: ValidationError[]): string | undefined {
    const first = errors[0];
    if (!first) return undefined;
    return typeof first === "string" ? first : String(first);
  }

  function hasErrors(errors: ValidationError[]): boolean {
    return errors.length > 0;
  }

  return { getFieldError, hasErrors };
}
