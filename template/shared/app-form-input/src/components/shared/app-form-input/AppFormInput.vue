<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, useId } from "vue";
import { vMaska } from "maska/vue";
import { cn } from "@/lib/utils";
import { useMaska, type MaskPreset, type MaskConfig } from "@/composables/use-maska";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  label: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  disabledReason?: string;
  readonly?: boolean;
  id?: string;
  class?: HTMLAttributes["class"];
  inputClass?: HTMLAttributes["class"];
  mask?: MaskPreset | MaskConfig;
}>();

const { getMaskaConfig } = useMaska();

const maskDirectiveValue = computed(() => {
  if (props.mask == null) return undefined;
  if (typeof props.mask === "string") return getMaskaConfig(props.mask);
  return props.mask;
});

const model = defineModel<string | number>();

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

const inputBindings = computed(() => ({
  id: inputId.value,
  disabled: props.disabled,
  readonly: props.readonly,
  "aria-invalid": (!!props.error || undefined) as true | undefined,
  "aria-describedby": ariaDescribedBy.value,
}));

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
      <!--
        Disabled tooltip: wraps the input in a tooltip to explain why it's disabled.
        The wrapper div is needed because disabled inputs don't fire mouse events.
      -->
      <TooltipProvider v-if="showTooltip" :delay-duration="200">
        <Tooltip>
          <TooltipTrigger as-child>
            <div class="w-full">
              <InputGroup
                v-if="$slots.prefix || $slots.suffix"
                :data-disabled="disabled || undefined"
              >
                <InputGroupAddon v-if="$slots.prefix" align="inline-start">
                  <slot name="prefix" />
                </InputGroupAddon>
                <InputGroupInput
                  v-model="model"
                  v-maska="maskDirectiveValue"
                  v-bind="{ ...inputBindings, ...$attrs }"
                  :class="inputClass"
                />
                <InputGroupAddon v-if="$slots.suffix" align="inline-end">
                  <slot name="suffix" />
                </InputGroupAddon>
              </InputGroup>
              <Input
                v-else
                v-model="model"
                v-maska="maskDirectiveValue"
                v-bind="{ ...inputBindings, ...$attrs }"
                :class="inputClass"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>{{ disabledReason }}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Standard rendering (no tooltip) -->
      <template v-else>
        <InputGroup
          v-if="$slots.prefix || $slots.suffix"
          :data-disabled="disabled || undefined"
        >
          <InputGroupAddon v-if="$slots.prefix" align="inline-start">
            <slot name="prefix" />
          </InputGroupAddon>
          <InputGroupInput
            v-model="model"
            v-maska="maskDirectiveValue"
            v-bind="{ ...inputBindings, ...$attrs }"
            :class="inputClass"
          />
          <InputGroupAddon v-if="$slots.suffix" align="inline-end">
            <slot name="suffix" />
          </InputGroupAddon>
        </InputGroup>
        <Input
          v-else
          v-model="model"
          v-maska="maskDirectiveValue"
          v-bind="{ ...inputBindings, ...$attrs }"
          :class="inputClass"
        />
      </template>

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
