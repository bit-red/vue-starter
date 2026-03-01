import { ref, watch } from "vue";

type ColorMode = "light" | "dark" | "system";

const STORAGE_KEY = "color-mode";

function getSystemPreference(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyMode(mode: ColorMode) {
  const resolved = mode === "system" ? getSystemPreference() : mode;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

const mode = ref<ColorMode>((localStorage.getItem(STORAGE_KEY) as ColorMode) || "system");

applyMode(mode.value);

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (mode.value === "system") applyMode("system");
});

watch(mode, (val) => {
  localStorage.setItem(STORAGE_KEY, val);
  applyMode(val);
});

export function useColorMode() {
  function toggle() {
    mode.value = mode.value === "dark" ? "light" : "dark";
  }

  return { mode, toggle };
}
