import { computed } from "vue";
import { useApiFieldErrorsContext } from "@/composables/use-api-field-errors";
import { useFormValidation } from "@/composables/use-form-validation";
import type { ValidationError } from "@tanstack/vue-form";

interface FieldBindingOptions {
  name: () => string;
  schema?: () => any;
  validators?: () => Record<string, any> | undefined;
}

export function useFieldBinding(options: FieldBindingOptions) {
  const ctx = useApiFieldErrorsContext();
  const { getFieldError } = useFormValidation();

  const resolvedValidators = computed(() => {
    const custom = options.validators?.();
    if (custom) return custom;
    const s = options.schema?.();
    if (s) return { onBlur: s, onSubmit: s };
    return undefined;
  });

  function getError(formErrors: ValidationError[]): string | undefined {
    if (ctx) return ctx.fieldError(options.name(), formErrors);
    return getFieldError(formErrors);
  }

  function handleChange(field: { handleChange: (val: any) => void }, value: any) {
    field.handleChange(value);
    ctx?.clearFieldError(options.name());
  }

  return { resolvedValidators, getError, handleChange };
}
