import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const playgroundDir = path.resolve("playground");
const cliPath = path.resolve("dist/index.js");
const appDir = path.join(playgroundDir, "app");

// Limpa a pasta playground se já existir
if (fs.existsSync(playgroundDir)) {
  try {
    fs.rmSync(playgroundDir, { recursive: true, force: true });
  } catch {
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

// Instala dependências e inicia dev server
console.log("\n  Installing dependencies...\n");
execSync("npm install", { cwd: appDir, stdio: "inherit" });

console.log("\n  Starting dev server...\n");
execSync("npm run dev", { cwd: appDir, stdio: "inherit" });
