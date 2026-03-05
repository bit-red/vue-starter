<script setup lang="ts">
import type { CountryCode } from "libphonenumber-js";
import type { HTMLAttributes } from "vue";
import { Field } from "@tanstack/vue-form";
import AppFormPhoneInput from "../app-phone-input/AppFormPhoneInput.vue";
import { useFieldBinding } from "./composables/use-field-binding";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  form: any;
  name: string;
  schema?: any;
  validators?: Record<string, any>;
  listeners?: Record<string, any>;
  label: string;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
  readonly?: boolean;
  defaultCountry?: CountryCode;
  placeholder?: string;
  id?: string;
  class?: HTMLAttributes["class"];
}>();

const { resolvedValidators, getError, handleChange } = useFieldBinding({
  name: () => props.name,
  schema: () => props.schema,
  validators: () => props.validators,
});
</script>

<template>
  <Field
    :form="form"
    :name="name"
    :validators="resolvedValidators"
    :listeners="listeners"
  >
    <template #default="{ field }">
      <AppFormPhoneInput
        :model-value="field.state.value"
        :error="getError(field.state.meta.errors)"
        :label="label"
        :description="description"
        :disabled="disabled"
        :disabled-reason="disabledReason"
        :readonly="readonly"
        :default-country="defaultCountry"
        :placeholder="placeholder"
        :id="id"
        :class="props.class"
        v-bind="$attrs"
        @update:model-value="(val: any) => handleChange(field, val)"
        @blur="field.handleBlur"
      />
    </template>
  </Field>
</template>
