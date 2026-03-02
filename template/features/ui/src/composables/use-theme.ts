import { useColorMode, usePreferredDark } from "@vueuse/core";
import { computed } from "vue";

type Theme = "light" | "dark" | "auto";

const mode = useColorMode({
  storageKey: "app-theme",
  emitAuto: true,
  selector: "html",
  attribute: "class",
  initialValue: "auto",
});

const preferredDark = usePreferredDark();

export function useTheme() {
  const isDark = computed(() => {
    if (mode.value === "auto") return preferredDark.value;
    return mode.value === "dark";
  });

  function setTheme(theme: Theme) {
    mode.value = theme;
  }

  function toggle() {
    mode.value = isDark.value ? "light" : "dark";
  }

  return {
    theme: mode,
    isDark,
    setTheme,
    toggle,
  };
}
