/**
 * Copies Monaco Editor files from node_modules to public/ after install.
 * This avoids CSP issues with CDN-based loading.
 */
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = join(__dirname, "..", "node_modules", "monaco-editor", "min", "vs");
const dest = join(__dirname, "..", "public", "monaco-editor", "min", "vs");

if (!existsSync(src)) {
  console.error("✗ monaco-editor not found at", src);
  console.error("  Run `pnpm add monaco-editor` first.");
  process.exit(1);
}

function copyRecursive(from, to) {
  if (!existsSync(to)) mkdirSync(to, { recursive: true });
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const s = join(from, entry.name);
    const d = join(to, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(s, d);
    } else {
      copyFileSync(s, d);
    }
  }
}

copyRecursive(src, dest);
console.log("✓ Monaco Editor files copied to public/monaco-editor/");
