import type { MaskInputOptions } from "maska";

export type MaskPreset =
  | "cpf"
  | "cnpj"
  | "cpf_cnpj"
  | "phone"
  | "cep"
  | "date"
  | "currency"
  | "rg";

export type MaskConfig = MaskInputOptions;

const presets: Record<MaskPreset, MaskConfig> = {
  cpf: { mask: "###.###.###-##" },
  cnpj: { mask: "##.###.###/####-##" },
  cpf_cnpj: { mask: ["###.###.###-##", "##.###.###/####-##"] },
  phone: { mask: ["(##) ####-####", "(##) #####-####"] },
  cep: { mask: "#####-###" },
  date: { mask: "##/##/####" },
  currency: {
    number: {
      locale: "pt-BR",
      fraction: 2,
      unsigned: true,
    },
  },
  rg: { mask: "##.###.###-#" },
};

export function useMaska() {
  function getMaskaConfig(preset: MaskPreset): MaskConfig {
    return presets[preset];
  }

  return { getMaskaConfig };
}
