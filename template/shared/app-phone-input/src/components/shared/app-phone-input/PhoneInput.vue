<script setup lang="ts">
import type { CountryCode } from "libphonenumber-js";
import type { HTMLAttributes } from "vue";
import { AsYouType, parsePhoneNumber } from "libphonenumber-js";
import { ref, watch, nextTick } from "vue";
import { useFocus } from "@vueuse/core";
import { ChevronsUpDown } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon } from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  type CountryEntry,
  priorityCountries,
  otherCountries,
  findCountryByCode,
} from "./country-data";
import FlagIcon from "./FlagIcon.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultCountry?: CountryCode;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    class?: HTMLAttributes["class"];
    id?: string;
  }>(),
  {
    defaultCountry: "BR",
    placeholder: "",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const popoverOpen = ref(false);
const phoneInputRef = ref<HTMLInputElement | null>(null);
const { focused: phoneInputFocused } = useFocus(phoneInputRef);

const selectedCountry = ref<CountryEntry>(
  findCountryByCode(props.defaultCountry) ?? findCountryByCode("BR")!,
);

const displayValue = ref("");

function initFromModelValue() {
  if (!props.modelValue) {
    displayValue.value = "";
    return;
  }
  try {
    const parsed = parsePhoneNumber(props.modelValue);
    if (parsed) {
      const country = findCountryByCode(parsed.country as CountryCode);
      if (country) {
        selectedCountry.value = country;
      }
      displayValue.value = parsed.formatNational();
    }
  } catch {
    displayValue.value = props.modelValue.replace(`+${selectedCountry.value.dialCode}`, "");
  }
}

initFromModelValue();

watch(
  () => props.modelValue,
  (newVal) => {
    const current = buildE164();
    if (newVal !== current) {
      initFromModelValue();
    }
  },
);

function buildE164(): string {
  const digits = displayValue.value.replace(/\D/g, "");
  if (!digits) return "";
  return `+${selectedCountry.value.dialCode}${digits}`;
}

function formatWithAsYouType(input: string, country: CountryCode): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  const formatter = new AsYouType(country);
  const dialCode = `+${findCountryByCode(country)!.dialCode}`;
  const formatted = formatter.input(`${dialCode}${digits}`);
  let national = formatted.startsWith(dialCode)
    ? formatted.slice(dialCode.length).trim()
    : formatted;
  if (national.startsWith(" ")) national = national.trim();
  return national;
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const raw = target.value;
  const formatted = formatWithAsYouType(raw, selectedCountry.value.code);
  displayValue.value = formatted;
  nextTick(() => {
    target.value = formatted;
  });
  emit("update:modelValue", buildE164());
}

function handleKeyPress(e: KeyboardEvent) {
  if (!/^\d$/.test(e.key)) {
    e.preventDefault();
  }
}

function selectCountry(country: CountryEntry) {
  const prevDigits = displayValue.value.replace(/\D/g, "");
  selectedCountry.value = country;
  if (prevDigits) {
    displayValue.value = formatWithAsYouType(prevDigits, country.code);
  }
  popoverOpen.value = false;
  emit("update:modelValue", buildE164());
  nextTick(() => {
    phoneInputFocused.value = true;
  });
}
</script>

<template>
  <InputGroup
    :data-disabled="disabled || undefined"
    :class="cn(props.class)"
    v-bind="$attrs"
  >
    <InputGroupAddon align="inline-start" class="pr-0 pl-1">
      <Popover v-model:open="popoverOpen">
        <PopoverTrigger as-child>
          <button
            type="button"
            :disabled="disabled || readonly"
            class="flex h-7 cursor-pointer items-center gap-1 rounded-md px-2 text-sm hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FlagIcon :country="selectedCountry.code" />
            <ChevronsUpDown class="text-muted-foreground size-3.5 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-[300px] p-0" :side-offset="8">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandList>
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup heading="Suggested">
                <CommandItem
                  v-for="country in priorityCountries"
                  :key="country.code"
                  :value="country.name"
                  class="gap-2"
                  @select="selectCountry(country)"
                >
                  <FlagIcon :country="country.code" />
                  <span class="flex-1 text-sm">{{ country.name }}</span>
                  <span class="text-foreground/50 text-sm">+{{ country.dialCode }}</span>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="All">
                <CommandItem
                  v-for="country in otherCountries"
                  :key="country.code"
                  :value="country.name"
                  class="gap-2"
                  @select="selectCountry(country)"
                >
                  <FlagIcon :country="country.code" />
                  <span class="flex-1 text-sm">{{ country.name }}</span>
                  <span class="text-foreground/50 text-sm">+{{ country.dialCode }}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </InputGroupAddon>
    <input
      :id="id"
      ref="phoneInputRef"
      type="tel"
      inputmode="numeric"
      data-slot="input-group-control"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :class="cn(
        'flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-base shadow-none outline-none md:text-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:ring-0',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'read-only:bg-transparent read-only:text-muted-foreground read-only:cursor-default',
      )"
      @input="onInput"
      @keypress="handleKeyPress"
    />
  </InputGroup>
</template>
