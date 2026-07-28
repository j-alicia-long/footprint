// Copies agent skills shipped by @j-alicia-long/web-config into .github/skills/
// so they are committed with the repo. Re-run after upgrading web-config.
import { cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules/@j-alicia-long/web-config/skills");
const target = join(root, ".github/skills");

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });
console.log(`Synced skills from web-config into ${target}`);
