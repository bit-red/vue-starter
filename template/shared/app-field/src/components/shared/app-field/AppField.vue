<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Field } from "@tanstack/vue-form";
import type { MaskPreset, MaskConfig } from "@/composables/use-maska";
import AppFormInput from "../app-form-input/AppFormInput.vue";
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
  id?: string;
  class?: HTMLAttributes["class"];
  inputClass?: HTMLAttributes["class"];
  mask?: MaskPreset | MaskConfig;
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
      <AppFormInput
        :model-value="field.state.value"
        :error="getError(field.state.meta.errors)"
        :label="label"
        :description="description"
        :disabled="disabled"
        :disabled-reason="disabledReason"
        :readonly="readonly"
        :id="id"
        :class="props.class"
        :input-class="inputClass"
        :mask="mask"
        v-bind="$attrs"
        @update:model-value="(val: any) => handleChange(field, val)"
        @blur="field.handleBlur"
      >
        <template v-if="$slots.prefix" #prefix>
          <slot name="prefix" />
        </template>
        <template v-if="$slots.suffix" #suffix>
          <slot name="suffix" />
        </template>
      </AppFormInput>
    </template>
  </Field>
</template>
