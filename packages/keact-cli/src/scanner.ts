// src/scanner.ts
import { Project, SyntaxKind } from 'ts-morph';

export type KeactDefinition = {
  key: string;
  type: string;
};

export function scanKeactDefinitions(projectPath: string): KeactDefinition[] {
  const project = new Project({
    tsConfigFilePath: `${projectPath}/tsconfig.json`,
  });

  const definitions: KeactDefinition[] = [];

  const sourceFiles = project.getSourceFiles("**/*.{ts,tsx}");

  for (const sourceFile of sourceFiles) {
    const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const call of calls) {
      const expression = call.getExpression().getText();

      if (expression === "useKeact") {
        const typeArg = call.getTypeArguments()[0]?.getText(); // string
        const keyArg = call.getArguments()[0]?.getText().replace(/['"`]/g, ""); // 'username'

        if (typeArg && keyArg) {
          definitions.push({
            key: keyArg,
            type: typeArg,
          });
        }
      }
    }
  }

  return definitions;
}
