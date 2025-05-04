"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeKeactRegistry = writeKeactRegistry;
// src/registryWriter.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const REGISTRY_PATH = path_1.default.join(process.cwd(), "types", "keact.d.ts");
const MODULE_PATH = "@/packages/keact";
function writeKeactRegistry(defs) {
    // Mevcut key'leri çıkar
    const existing = fs_1.default.existsSync(REGISTRY_PATH)
        ? fs_1.default.readFileSync(REGISTRY_PATH, "utf-8")
        : "";
    const existingKeys = new Set();
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
    }
    else {
        updated = updated.replace(/interface KeactTypeRegistry\s*{([\s\S]*?)}/, (match, body) => {
            return `interface KeactTypeRegistry {\n${body.trim()}\n${newEntries}\n  }`;
        });
    }
    fs_1.default.mkdirSync(path_1.default.dirname(REGISTRY_PATH), { recursive: true });
    fs_1.default.writeFileSync(REGISTRY_PATH, updated, "utf-8");
    console.log(`✅ Added ${newDefs.length} new KeactTypeRegistry entries.`);
}
