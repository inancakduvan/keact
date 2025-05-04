#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import glob from 'fast-glob';

const projectRoot = path.resolve(__dirname, '../../../');
const typesPath = path.join(projectRoot, 'types/keact.d.ts');

const regex = /useKeact<([\w\[\]{}|"' ,]+)>\(\s*['"`]([^'"`]+)['"`]/g;

function scanKeactDefinitions() {
  const files = glob.sync('**/*.{ts,tsx}', {
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

  const definitions: Record<string, string> = {};

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');

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

function formatTypes(defs: Record<string, string>) {
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

function updateKeactTypes(defs: Record<string, string>) {
  if (Object.keys(defs).length === 0) {
    console.log('❌ No useKeact definitions found.');
    return;
  }

  // create types dir if not exists
  const dir = path.dirname(typesPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // check if file already has same content
  const newContent = formatTypes(defs);
  if (fs.existsSync(typesPath)) {
    const current = fs.readFileSync(typesPath, 'utf-8');
    if (current === newContent) {
      console.log('✅ KeactTypeRegistry is already up to date.');
      return;
    }
  }

  fs.writeFileSync(typesPath, newContent, 'utf-8');
  console.log(`✅ Updated: types/keact.d.ts`);
}

function main() {
  const defs = scanKeactDefinitions();
  updateKeactTypes(defs);
}

main();
