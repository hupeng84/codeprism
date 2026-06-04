// Test if Mermaid 11 can parse a real pattern diagram
import { JSDOM } from "jsdom";
const dom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.document = dom.window.document;
globalThis.window = dom.window;
globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;

const mermaid = (await import("mermaid")).default;
mermaid.initialize({ startOnLoad: false, theme: "base", securityLevel: "loose" });

// Reconstruct what diagramToMermaid produces for abstract-factory
// Read the diagram from the file
import { readFileSync } from "node:fs";
const content = readFileSync(
  "E:/ai/compubasic/packages/content/src/patterns/abstract-factory.ts",
  "utf8"
);

// Find the diagram block
const diagramMatch = content.match(/const abstractFactoryDiagram: UMLClassDiagram = \{([\s\S]*?)\n\};/);
if (!diagramMatch) {
  console.log("Could not find diagram");
  process.exit(1);
}

// Build a minimal version of diagramToMermaid output
const lines = ["classDiagram", "    direction TB"];

// Hardcode the abstract-factory classes (from the file)
const classNames = [
  "AbstractFactory",
  "ConcreteFactory1",
  "ConcreteFactory2",
  "AbstractProductA",
  "ConcreteProductA1",
  "ConcreteProductA2",
  "AbstractProductB",
  "ConcreteProductB1",
  "ConcreteProductB2",
  "Client",
];
for (const name of classNames) {
  lines.push(`    class ${name} {`);
  lines.push("    }");
}

// Hardcode the relationships from the file
const rels = [
  ["ConcreteFactory1", "<|--", "AbstractFactory"],
  ["ConcreteFactory2", "<|--", "AbstractFactory"],
  ["ConcreteProductA1", "<|--", "AbstractProductA"],
  ["ConcreteProductA2", "<|--", "AbstractProductA"],
  ["ConcreteProductB1", "<|--", "AbstractProductB"],
  ["ConcreteProductB2", "<|--", "AbstractProductB"],
  ["AbstractProductA", "<|..", "AbstractFactory"],
  ["AbstractProductB", "<|..", "AbstractFactory"],
  ["Client", "-->", "AbstractFactory"],
  ["Client", "-->", "AbstractProductA"],
  ["Client", "-->", "AbstractProductB"],
  ["AbstractFactory", "..>", "AbstractProductA"],
  ["AbstractFactory", "..>", "AbstractProductB"],
];
for (const [from, arrow, to] of rels) {
  lines.push(`    ${from} ${arrow} ${to}`);
}

const code = lines.join("\n");
console.log("--- code ---");
console.log(code);
console.log("--- lines ---");
code.split("\n").forEach((l, i) => console.log(`${i + 1}: ${l}`));

try {
  await mermaid.render("test-real", code);
  console.log("\nOK rendered");
} catch (e) {
  console.log("\nFAIL:", e.message.split("\n").slice(0, 3).join(" | "));
}
