<script setup lang="ts">
import type { CountryCode } from "libphonenumber-js";
import type { HTMLAttributes } from "vue";
import { computed, useId } from "vue";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PhoneInput from "./PhoneInput.vue";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  label: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  disabledReason?: string;
  readonly?: boolean;
  defaultCountry?: CountryCode;
  placeholder?: string;
  id?: string;
  class?: HTMLAttributes["class"];
}>();

const model = defineModel<string>();

const autoId = useId();
const inputId = computed(() => props.id ?? autoId);

const descriptionId = computed(() =>
  props.description ? `${inputId.value}-description` : undefined,
);
const errorId = computed(() => (props.error ? `${inputId.value}-error` : undefined));

const ariaDescribedBy = computed(() => {
  const ids = [descriptionId.value, errorId.value].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
});

const showTooltip = computed(() => props.disabled && props.disabledReason);
</script>

<template>
  <Field
    orientation="vertical"
    :data-invalid="!!error || undefined"
    :data-disabled="disabled || undefined"
    :data-readonly="readonly || undefined"
    :class="cn(props.class, 'gap-1')"
  >
    <FieldLabel :for="inputId">{{ label }}</FieldLabel>
    <FieldContent class="gap-0.5">
      <TooltipProvider v-if="showTooltip" :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="w-full">
              <PhoneInput
                :id="inputId"
                v-model="model"
                :default-country="defaultCountry"
                :placeholder="placeholder"
                :disabled="disabled"
                :readonly="readonly"
                :aria-invalid="(!!error || undefined) as true | undefined"
                :aria-describedby="ariaDescribedBy"
                v-bind="$attrs"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>{{ disabledReason }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PhoneInput
        v-else
        :id="inputId"
        v-model="model"
        :default-country="defaultCountry"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :aria-invalid="(!!error || undefined) as true | undefined"
        :aria-describedby="ariaDescribedBy"
        v-bind="$attrs"
      />

      <FieldDescription v-if="description" :id="descriptionId" class="pl-1 pt-1 text-xs">
        {{ description }}
      </FieldDescription>
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <FieldError v-if="error" :id="errorId" class="pl-1 text-xs">{{ error }}</FieldError>
      </Transition>
    </FieldContent>
  </Field>
</template>
