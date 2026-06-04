import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Prototype Pattern — Frame Generator
 * document cloning scenario - Prototype interface, ConcretePrototype
 */
export function* prototypeGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const originalPos = { x: 200, y: 150 };
  const prototypePos = { x: 400, y: 150 };
  const clone1Pos = { x: 300, y: 280 };
  const clone2Pos = { x: 500, y: 280 };

  // Objects
  const original: PatternObject = {
    id: "original",
    name: "Document",
    type: "ConcretePrototype",
    state: { title: "", pages: 10, author: "John" },
    position: originalPos,
    status: "idle",
  };

  const prototype: PatternObject = {
    id: "prototype",
    name: "DocumentPrototype",
    type: "Prototype",
    state: { role: "clone source" },
    position: prototypePos,
    status: "idle",
  };

  const clone1: PatternObject = {
    id: "clone1",
    name: "Document Copy 1",
    type: "Clone",
    state: { title: "original document", pages: 10 },
    position: clone1Pos,
    status: "idle",
  };

  const clone2: PatternObject = {
    id: "clone2",
    name: "Document Copy 2",
    type: "Clone",
    state: { title: "original document", pages: 10 },
    position: clone2Pos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...original },
        { ...prototype },
        { ...clone1 },
        { ...clone2 },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Create prototype from original
  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "active" },
        { ...prototype, status: "idle" },
        { ...clone1, status: "idle" },
        { ...clone2, status: "idle" },
      ],
      messages: [
        { from: "prototype", to: "original", method: "clone()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.0" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle" },
        { ...prototype, status: "highlighted" },
        { ...clone1, status: "idle" },
        { ...clone2, status: "idle" },
      ],
      messages: [
        { from: "prototype", to: "original", method: "clone()", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.1" },
    highlightLine: 5,
  };

  // Step 3: Clone document - first copy
  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle" },
        { ...prototype, status: "active" },
        { ...clone1, status: "idle" },
        { ...clone2, status: "idle" },
      ],
      messages: [
        { from: "prototype", to: "clone1", method: "new Document(original)", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.2" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle" },
        { ...prototype, status: "active" },
        { ...clone1, status: "highlighted" },
        { ...clone2, status: "idle" },
      ],
      messages: [
        { from: "prototype", to: "clone1", method: "copy fields", args: ["title", "pages", "author"], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.3" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle" },
        { ...prototype, status: "idle" },
        { ...clone1, status: "highlighted", state: { title: "original document", pages: 10, author: "John" } },
        { ...clone2, status: "idle" },
      ],
      messages: [
        { from: "prototype", to: "clone1", method: "→ copy1 completed", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.4" },
    highlightLine: 15,
  };

  // Step 6: Clone document - second copy
  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle" },
        { ...prototype, status: "active" },
        { ...clone1, status: "idle" },
        { ...clone2, status: "idle" },
      ],
      messages: [
        { from: "prototype", to: "clone2", method: "clone() again", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.5" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle" },
        { ...prototype, status: "active" },
        { ...clone1, status: "idle" },
        { ...clone2, status: "highlighted" },
      ],
      messages: [
        { from: "prototype", to: "clone2", method: "copy fields", args: ["title", "pages", "author"], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.6" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle" },
        { ...prototype, status: "idle" },
        { ...clone1, status: "idle", state: { title: "original document" } },
        { ...clone2, status: "highlighted", state: { title: "original document", pages: 10, author: "John" } },
      ],
      messages: [
        { from: "prototype", to: "clone2", method: "→ copy2 completed", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.7" },
    highlightLine: 15,
  };

  // Step 9: Modify clone to verify independence
  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle" },
        { ...prototype, status: "idle" },
        { ...clone1, status: "highlighted", state: { title: "copy1-modified", pages: 20, author: "Jane" } },
        { ...clone2, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.8" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...original, status: "idle", state: { title: "original document", pages: 10, author: "John" } },
        { ...prototype, status: "idle" },
        { ...clone1, status: "idle", state: { title: "copy1-modified", pages: 20, author: "Jane" } },
        { ...clone2, status: "idle", state: { title: "original document", pages: 10, author: "John" } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.prototype.frames.9" },
    highlightLine: 20,
  };
}

/** Code snippet */
export const prototypeCode = `// Prototype interface
interface DocumentPrototype {
  clone(): DocumentPrototype;  // ← clone method
}

// ConcretePrototype
class Document implements DocumentPrototype {
  constructor(
    public title: string,
    public pages: number,
    public author: string
  ) {}

  clone(): DocumentPrototype {
    // ← shallow or deep copy
    return new Document(this.title, this.pages, this.author);
  }
}

// Usage
const original = new Document("original document", 10, "John");
const copy1 = original.clone();        // ← clone copy 1
const copy2 = original.clone();        // ← clone copy 2

// modifying copy does not affect original
copy1.title = "copy1-modified";
console.log(original.title);  // "original document"(unchanged)`;

export const prototypeCodeLines = [
  "// Prototype interface",
  "interface DocumentPrototype {",
  "  clone(): DocumentPrototype;  // ← clone method",
  "}",
  "",
  "// ConcretePrototype",
  "class Document implements DocumentPrototype {",
  "  constructor(",
  "    public title: string,",
  "    public pages: number,",
  "    public author: string",
  "  ) {}",
  "",
  "  clone(): DocumentPrototype {",
  "    // ← shallow or deep copy",
  "    return new Document(this.title, this.pages, this.author);",
  "  }",
  "}",
  "",
  "// Usage",
  "const original = new Document('original document', 10, 'John');",
  "const copy1 = original.clone();        // ← clone copy 1",
  "const copy2 = original.clone();        // ← clone copy 2",
  "",
  "// modifying copy does not affect original",
  "copy1.title = 'copy1-modified';",
  "console.log(original.title);  // 'original document'(unchanged)",
];

const prototypeDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "prototype",
      name: "Prototype",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "clone", params: "", returnType: "Prototype" },
      ],
      position: { x: 300, y: 80 },
    },
    {
      id: "concretePrototype1",
      name: "ConcretePrototype1",
      attributes: [],
      methods: [
        { visibility: "+", name: "clone", params: "", returnType: "ConcretePrototype1" },
      ],
      position: { x: 80, y: 240 },
    },
    {
      id: "concretePrototype2",
      name: "ConcretePrototype2",
      attributes: [],
      methods: [
        { visibility: "+", name: "clone", params: "", returnType: "ConcretePrototype2" },
      ],
      position: { x: 300, y: 240 },
    },
    {
      id: "client",
      name: "Client",
      attributes: [],
      methods: [],
      position: { x: 520, y: 240 },
    },
  ],
  relationships: [
    { from: "concretePrototype1", to: "prototype", type: "implements" },
    { from: "concretePrototype2", to: "prototype", type: "implements" },
    { from: "client", to: "prototype", type: "dependency", label: "uses" },
  ],
};

export const prototypeContent = {
  id: "prototype",
  slug: "prototype",
  title: "",
  titleKey: "content.patterns.prototype.title",
  category: "pattern" as const,
  subcategory: "creational",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.prototype.desc",
  defaultInput: undefined,
  generator: prototypeGenerator,
  code: prototypeCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  icon: "📄",
  diagram: prototypeDiagram,
  codeExamples: {
    typescript: {
      code: `interface DocumentPrototype {
  clone(): DocumentPrototype;
}

class Document implements DocumentPrototype {
  constructor(
    public title: string,
    public pages: number,
    public author: string
  ) {}

  clone(): DocumentPrototype {
    return new Document(this.title, this.pages, this.author);
  }
}

const original = new Document("original document", 10, "John");
const copy1 = original.clone();
const copy2 = original.clone();

copy1.title = "copy1-modified";
console.log(original.title);  // "original document"(unchanged)`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <string.h>
#include <stdlib.h>

typedef struct Document Document;

struct Document {
  char title[100];
  int pages;
  char author[100];
};

Document* document_clone(Document* doc) {
  Document* copy = malloc(sizeof(Document));
  strcpy(copy->title, doc->title);
  copy->pages = doc->pages;
  strcpy(copy->author, doc->author);
  return copy;
}

int main(void) {
  Document original = {"original document", 10, "John"};
  Document* copy1 = document_clone(&original);
  Document* copy2 = document_clone(&original);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <string>
#include <iostream>

class Document {
public:
  std::string title;
  int pages;
  std::string author;

  Document(std::string t, int p, std::string a)
    : title(t), pages(p), author(a) {}

  Document* clone() const {
    return new Document(title, pages, author);
  }
};

int main() {
  Document original("original document", 10, "John");
  Document* copy1 = original.clone();
  Document* copy2 = original.clone();

  copy1->title = "copy1-modified";
  std::cout << original.title << std::endl;  // "original document"
  return 0;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `import copy

class Document:
    def __init__(self, title, pages, author):
        self.title = title
        self.pages = pages
        self.author = author

    def clone(self):
        return copy.deepcopy(self)

original = Document("original document", 10, "John")
copy1 = original.clone()
copy2 = original.clone()

copy1.title = "copy1-modified"
print(original.title)  # "original document"(unchanged)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `#[derive(Clone)]
struct Document {
    title: String,
    pages: i32,
    author: String,
}

fn main() {
    let original = Document {
        title: "original document".to_string(),
        pages: 10,
        author: "John".to_string(),
    };
    let copy1 = original.clone();
    let copy2 = original.clone();

    // Note: Rust requires mutability to modify
    println!("{}", original.title);
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Document struct {
    Title  string
    Pages  int
    Author string
}

func (d Document) Clone() *Document {
    return &Document{
        Title:  d.Title,
        Pages:  d.Pages,
        Author: d.Author,
    }
}

func main() {
    original := Document{"original document", 10, "John"}
    copy1 := original.Clone()
    copy2 := original.Clone()

    copy1.Title = "copy1-modified"
    fmt.Println(original.Title)  // "original document"
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public class Document implements Cloneable {`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "java-cloneable",
      i18nKey: "content.patterns.prototype.scenarios.java-cloneable",
      domain: "library",
      icon: "☕",
      reference: "Java SDK (Cloneable), Kotlin data class copy(), C# ICloneable",
    },
    {
      id: "js-structured-clone",
      i18nKey: "content.patterns.prototype.scenarios.js-structured-clone",
      domain: "system",
      icon: "🌐",
      reference: "HTML Standard (structuredClone), postMessage, IndexedDB",
      codeSnippet: {
        language: "javascript",
        code: `// Deep-clone any serializable object, even cross-realm
const original = { user: { name: "Alice", tags: ["admin"] } };
const clone = structuredClone(original);
clone.user.name = "Bob";
console.log(original.user.name); // "Alice" — immutable`,
      },
    },
    {
      id: "react-children-clone",
      i18nKey: "content.patterns.prototype.scenarios.react-children-clone",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "React, React.cloneElement(), React.Children API",
    },
  ] satisfies Scenario[],
};
