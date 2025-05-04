"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanKeactDefinitions = scanKeactDefinitions;
// src/scanner.ts
const ts_morph_1 = require("ts-morph");
function scanKeactDefinitions(projectPath) {
    const project = new ts_morph_1.Project({
        tsConfigFilePath: `${projectPath}/tsconfig.json`,
    });
    const definitions = [];
    const sourceFiles = project.getSourceFiles("**/*.{ts,tsx}");
    for (const sourceFile of sourceFiles) {
        const calls = sourceFile.getDescendantsOfKind(ts_morph_1.SyntaxKind.CallExpression);
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
