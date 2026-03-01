import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const playgroundDir = path.resolve("playground");
const cliPath = path.resolve("dist/index.js");

// Limpa a pasta playground se já existir
if (fs.existsSync(playgroundDir)) {
  try {
    fs.rmSync(playgroundDir, { recursive: true, force: true });
  } catch (err) {
    console.error(
      "\n  Não foi possível limpar playground/.\n" +
        "  Feche qualquer terminal ou processo aberto dentro dessa pasta e tente de novo.\n",
    );
    process.exit(1);
  }
}
fs.mkdirSync(playgroundDir);

// Roda o CLI interativo — gera em playground/app
execSync(`node "${cliPath}" app`, {
  cwd: playgroundDir,
  stdio: "inherit",
});

console.log("\n  Projeto gerado em playground/app");
console.log("  Para testar:\n");
console.log("    cd playground/app");
console.log("    npm run dev\n");
