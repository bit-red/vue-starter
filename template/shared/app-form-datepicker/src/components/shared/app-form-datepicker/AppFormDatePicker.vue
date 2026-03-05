<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, useId } from "vue";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import "@/assets/datepicker.css";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTheme } from "@/composables/use-theme";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    label: string;
    description?: string;
    error?: string;
    disabled?: boolean;
    readonly?: boolean;
    id?: string;
    class?: HTMLAttributes["class"];
    placeholder?: string;
    clearable?: boolean;
    autoApply?: boolean;
    range?: boolean;
    multiDates?: boolean;
    monthPicker?: boolean;
    yearPicker?: boolean;
    timePicker?: boolean;
    enableTimePicker?: boolean;
    textInput?: boolean | Record<string, unknown>;
    inline?: boolean;
    inputFormat?: string;
    modelType?: string;
    minDate?: Date | string;
    maxDate?: Date | string;
    teleport?: boolean | string | HTMLElement;
  }>(),
  {
    placeholder: "Select a date",
    clearable: true,
    autoApply: true,
    enableTimePicker: false,
    teleport: "body",
  },
);

const model = defineModel<Date | Date[] | string | string[] | null | undefined>();

const { isDark } = useTheme();

const autoId = useId();
const inputId = computed(() => props.id ?? autoId);

const descriptionId = computed(() =>
  props.description ? `${inputId.value}-description` : undefined,
);
const errorId = computed(() => (props.error ? `${inputId.value}-error` : undefined));

const inputAttrs = computed(() => ({
  id: inputId.value,
  clearable: props.clearable,
}));

const timeConfig = computed(() => ({
  enableTimePicker: props.enableTimePicker,
}));

const resolvedInputFormat = computed(() => {
  if (props.inputFormat) return props.inputFormat;
  if (props.timePicker) return "HH:mm";
  if (props.monthPicker) return "MM/yyyy";
  if (props.yearPicker) return "yyyy";
  if (props.enableTimePicker) return "dd/MM/yyyy HH:mm";
  return "dd/MM/yyyy";
});

const formats = computed(() => ({
  month: "LLL",
  year: "yyyy",
  weekDay: "EEEEEE",
  quarter: "MMMM",
  day: "d",
  input: resolvedInputFormat.value,
}));

const ui = computed(() => (props.error ? { input: "dp-input-error" } : {}));
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
      <VueDatePicker
        v-model="model"
        v-bind="$attrs"
        :dark="isDark"
        :locale="ptBR"
        :placeholder="placeholder"
        :input-attrs="inputAttrs"
        :auto-apply="autoApply"
        :range="range"
        :multi-dates="multiDates"
        :month-picker="monthPicker"
        :year-picker="yearPicker"
        :time-picker="timePicker"
        :time-config="timeConfig"
        :text-input="textInput"
        :inline="inline"
        :formats="formats"
        :model-type="modelType"
        :min-date="minDate"
        :max-date="maxDate"
        :disabled="disabled"
        :readonly="readonly"
        :teleport="teleport"
        :ui="ui"
        :aria-labels="{ input: label }"
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
