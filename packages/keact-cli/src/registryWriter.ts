// src/registryWriter.ts
import fs from "fs";
import path from "path";
import { KeactDefinition } from "./scanner";

const REGISTRY_PATH = path.join(process.cwd(), "types", "keact.d.ts");
const MODULE_PATH = "@/packages/keact";

export function writeKeactRegistry(defs: KeactDefinition[]) {
  // Mevcut key'leri çıkar
  const existing = fs.existsSync(REGISTRY_PATH)
    ? fs.readFileSync(REGISTRY_PATH, "utf-8")
    : "";

  const existingKeys = new Set<string>();
  const regex = /(\w+):\s*([\w<>\[\]{}|'" ]+);?/g;

  let match;
  while ((match = regex.exec(existing)) !== null) {
    existingKeys.add(match[1]);
  }

  const newDefs = defs.filter((d) => !existingKeys.has(d.key));

  if (newDefs.length === 0) {
    console.log("✅ KeactTypeRegistry is already up to date.");
    return;
  }

  const newEntries = newDefs
    .map((d) => `    ${d.key}: ${d.type};`)
    .join("\n");

  let updated = existing;

  if (!updated.includes("declare module")) {
    updated = `import { KeactTypeRegistry } from '${MODULE_PATH}';

declare module '${MODULE_PATH}' {
  interface KeactTypeRegistry {
${newEntries}
  }
}
`;
  } else {
    updated = updated.replace(
      /interface KeactTypeRegistry\s*{([\s\S]*?)}/,
      (match, body) => {
        return `interface KeactTypeRegistry {\n${body.trim()}\n${newEntries}\n  }`;
      }
    );
  }

  fs.mkdirSync(path.dirname(REGISTRY_PATH), { recursive: true });
  fs.writeFileSync(REGISTRY_PATH, updated, "utf-8");

  console.log(`✅ Added ${newDefs.length} new KeactTypeRegistry entries.`);
}
