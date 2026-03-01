import * as p from "@clack/prompts";
import pc from "picocolors";
import { runPrompts } from "./prompts.js";
import { generateProject } from "./generator.js";

async function main(): Promise<void> {
  p.intro(pc.bgCyan(pc.black(" create-bitred-vue ")));

  const argv = process.argv.slice(2);
  const options = await runPrompts(argv);

  if (!options) {
    process.exit(0);
  }

  await generateProject(options);

  p.outro(
    `Done! Now run:\n\n  ${pc.cyan(`cd ${options.projectName}`)}\n  ${pc.cyan("npm install")}\n  ${pc.cyan("npm run dev")}`,
  );
}

main().catch((err) => {
  p.log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
