#!/usr/bin/env tsx
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const projectRoot = path_1.default.resolve(__dirname, '../../../');
const typesPath = path_1.default.join(projectRoot, 'types/keact.d.ts');
const regex = /useKeact<([\w\[\]{}|"' ,]+)>\(\s*['"`]([^'"`]+)['"`]/g;
function scanKeactDefinitions() {
    const files = fast_glob_1.default.sync('**/*.{ts,tsx}', {
        cwd: projectRoot,
        ignore: [
            'node_modules/**',
            '.next/**',
            'dist/**',
            'out/**',
            'types/keact.d.ts',
            'packages/**/dist/**',
        ],
        absolute: true,
    });
    const definitions = {};
    for (const file of files) {
        const content = fs_1.default.readFileSync(file, 'utf-8');
        let match;
        while ((match = regex.exec(content)) !== null) {
            const [_, type, key] = match;
            if (!definitions[key]) {
                definitions[key] = type.trim();
            }
        }
    }
    return definitions;
}
function formatTypes(defs) {
    const lines = Object.entries(defs)
        .map(([key, type]) => `    ${key}: ${type};`)
        .join('\n');
    return `import { KeactTypeRegistry } from '@/packages/keact';

declare module '@/packages/keact' {
  interface KeactTypeRegistry {
${lines}
  }
}
`;
}
function updateKeactTypes(defs) {
    if (Object.keys(defs).length === 0) {
        console.log('❌ No useKeact definitions found.');
        return;
    }
    // create types dir if not exists
    const dir = path_1.default.dirname(typesPath);
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
    // check if file already has same content
    const newContent = formatTypes(defs);
    if (fs_1.default.existsSync(typesPath)) {
        const current = fs_1.default.readFileSync(typesPath, 'utf-8');
        if (current === newContent) {
            console.log('✅ KeactTypeRegistry is already up to date.');
            return;
        }
    }
    fs_1.default.writeFileSync(typesPath, newContent, 'utf-8');
    console.log(`✅ Updated: types/keact.d.ts`);
}
function main() {
    const defs = scanKeactDefinitions();
    updateKeactTypes(defs);
}
main();
