import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Adapter Pattern — Frame Generator
 * legacy printer adapter scenario - Adapter wraps legacy interface
 */
export function* adapterGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const clientPos = { x: 100, y: 200 };
  const adapterPos = { x: 300, y: 200 };
  const legacyPos = { x: 500, y: 200 };

  // Objects
  const client: PatternObject = {
    id: "client",
    name: "ModernPrinter",
    type: "Client",
    state: { needs: "USBPrint()" },
    position: clientPos,
    status: "idle",
  };

  const adapter: PatternObject = {
    id: "adapter",
    name: "LegacyPrinterAdapter",
    type: "Adapter",
    state: { wraps: "OldPrinter" },
    position: adapterPos,
    status: "idle",
  };

  const legacyPrinter: PatternObject = {
    id: "legacy",
    name: "OldPrinter",
    type: "Adaptee",
    state: { interface: "ParallelPort" },
    position: legacyPos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...client },
        { ...adapter },
        { ...legacyPrinter },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Client tries to use legacy printer directly
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...adapter, status: "idle" },
        { ...legacyPrinter, status: "idle" },
      ],
      messages: [
        { from: "client", to: "legacy", method: "USBPrint()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.0" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "highlighted" },
        { ...adapter, status: "idle" },
        { ...legacyPrinter, status: "idle" },
      ],
      messages: [
        { from: "client", to: "legacy", method: "USBPrint()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.1" },
    highlightLine: 5,
  };

  // Step 3: Create adapter
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...adapter, status: "active" },
        { ...legacyPrinter, status: "idle" },
      ],
      messages: [
        { from: "adapter", to: "legacy", method: "wraps OldPrinter", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.2" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...adapter, status: "highlighted" },
        { ...legacyPrinter, status: "idle" },
      ],
      messages: [
        { from: "adapter", to: "legacy", method: "wraps OldPrinter", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.3" },
    highlightLine: 11,
  };

  // Step 5: Client uses adapter
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...adapter, status: "idle" },
        { ...legacyPrinter, status: "idle" },
      ],
      messages: [
        { from: "client", to: "adapter", method: "USBPrint()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.4" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...adapter, status: "highlighted" },
        { ...legacyPrinter, status: "idle" },
      ],
      messages: [
        { from: "client", to: "adapter", method: "USBPrint()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.5" },
    highlightLine: 16,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...adapter, status: "active" },
        { ...legacyPrinter, status: "active" },
      ],
      messages: [
        { from: "adapter", to: "legacy", method: "ParallelPrint()", args: [], status: "pending" },
      ],
    },
    description: "Adapter.translate() → OldPrinter.ParallelPrint()",
    highlightLine: 17,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...adapter, status: "highlighted" },
        { ...legacyPrinter, status: "highlighted" },
      ],
      messages: [
        { from: "adapter", to: "legacy", method: "ParallelPrint()", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.6" },
    highlightLine: 18,
  };

  // Step 9: Second print operation
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...adapter, status: "idle" },
        { ...legacyPrinter, status: "idle" },
      ],
      messages: [
        { from: "client", to: "adapter", method: "USBPrint()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.7" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...adapter, status: "idle" },
        { ...legacyPrinter, status: "highlighted" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.adapter.frames.8" },
    highlightLine: 20,
  };
}

/** Code snippet */
export const adapterCode = `// Target interface - client expected interface
interface USBPrinter {
  USBPrint(content: string): void;  // ← client expected interface
}

// Adaptee - legacy interface to adapt
class OldPrinter {
  ParallelPrint(content: string): void {
    // ← old interface, incompatible
    console.log(\`Printing via Parallel Port: \${content}\`);
  }
}

// Adapter - adapter, wraps Adaptee
class LegacyPrinterAdapter implements USBPrinter {
  constructor(private oldPrinter: OldPrinter) {}

  USBPrint(content: string): void {
    // ← implements target interface, calls old interface internally
    this.oldPrinter.ParallelPrint(content);  // ← convert call
  }
}

// Client - client code uses USBPrinter interface
function printDocument(printer: USBPrinter): void {
  printer.USBPrint("Hello World");  // ← unified interface call
}

// Usage
const legacy = new OldPrinter();
const adapter = new LegacyPrinterAdapter(legacy);
printDocument(adapter);  // use old printer via adapter`;

export const adapterCodeLines = [
  "// Target interface - client expected interface",
  "interface USBPrinter {",
  "  USBPrint(content: string): void;  // ← client expected interface",
  "}",
  "",
  "// Adaptee - legacy interface to adapt",
  "class OldPrinter {",
  "  ParallelPrint(content: string): void {",
  "    // ← old interface, incompatible",
  "    console.log(`Printing via Parallel Port: ${content}`);",
  "  }",
  "}",
  "",
  "// Adapter - adapter, wraps Adaptee",
  "class LegacyPrinterAdapter implements USBPrinter {",
  "  constructor(private oldPrinter: OldPrinter) {}",
  "",
  "  USBPrint(content: string): void {",
  "    // ← implements target interface, calls old interface internally",
  "    this.oldPrinter.ParallelPrint(content);  // ← convert call",
  "  }",
  "}",
  "",
  "// Client - client code uses USBPrinter interface",
  "function printDocument(printer: USBPrinter): void {",
  "  printer.USBPrint('Hello World');  // ← unified interface call",
  "}",
  "",
  "// Usage",
  "const legacy = new OldPrinter();",
  "const adapter = new LegacyPrinterAdapter(legacy);",
  "printDocument(adapter);  // use old printer via adapter",
];

const adapterDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "client",
      name: "Client",
      stereotype: "class",
      attributes: [],
      methods: [],
      position: { x: 100, y: 50 },
    },
    {
      id: "target",
      name: "Target",
      stereotype: "interface",
      attributes: [],
      methods: [{ visibility: "+", name: "request()", params: "", returnType: "void" }],
      position: { x: 300, y: 50 },
    },
    {
      id: "adapter",
      name: "Adapter",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "request()", params: "", returnType: "void" }],
      position: { x: 300, y: 200 },
    },
    {
      id: "adaptee",
      name: "Adaptee",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "specificRequest()", params: "", returnType: "void" }],
      position: { x: 500, y: 200 },
    },
  ],
  relationships: [
    { from: "adapter", to: "target", type: "implements" },
    { from: "adapter", to: "adaptee", type: "association", label: "adapts" },
    { from: "client", to: "target", type: "dependency", label: "uses" },
  ],
};

export const adapterContent = {
  id: "adapter",
  slug: "adapter",
  title: "",
  titleKey: "content.patterns.adapter.title",
  category: "pattern" as const,
  subcategory: "structural",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.adapter.desc",
  defaultInput: undefined,
  generator: adapterGenerator,
  code: adapterCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(1)",
  },
  tags: [],
  icon: "🔌",
  diagram: adapterDiagram,
  codeExamples: {
    typescript: {
      code: `interface USBPrinter {
  USBPrint(content: string): void;
}

class OldPrinter {
  ParallelPrint(content: string): void {
    console.log(\`Printing via Parallel Port: \${content}\`);
  }
}

class LegacyPrinterAdapter implements USBPrinter {
  constructor(private oldPrinter: OldPrinter) {}

  USBPrint(content: string): void {
    this.oldPrinter.ParallelPrint(content);
  }
}

const legacy = new OldPrinter();
const adapter = new LegacyPrinterAdapter(legacy);
adapter.USBPrint("Hello World");`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct USBPrinter USBPrinter;
typedef struct OldPrinter OldPrinter;

struct USBPrinter {
  void (*print)(USBPrinter*, const char*);
};

struct OldPrinter {
  void (*parallel_print)(OldPrinter*, const char*);
};

void old_printer_print(OldPrinter* p, const char* content) {
  printf("Printing via Parallel Port: %s\\n", content);
}

USBPrinter* create_adapter(void) {
  static USBPrinter adapter;
  return &adapter;
}

int main(void) {
  printf("Adapter pattern in C\\n");
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>

class USBPrinter {
public:
  virtual void USBPrint(const std::string& content) = 0;
  virtual ~USBPrinter() = default;
};

class OldPrinter {
public:
  void ParallelPrint(const std::string& content) {
    std::cout << "Printing via Parallel Port: " << content << std::endl;
  }
};

class LegacyPrinterAdapter : public USBPrinter {
  OldPrinter* oldPrinter;
public:
  LegacyPrinterAdapter(OldPrinter* p) : oldPrinter(p) {}

  void USBPrint(const std::string& content) override {
    oldPrinter->ParallelPrint(content);
  }
};

int main() {
  OldPrinter legacy;
  USBPrinter* adapter = new LegacyPrinterAdapter(&legacy);
  adapter->USBPrint("Hello World");
  delete adapter;
  return 0;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class OldPrinter:
    def parallel_print(self, content):
        print(f"Printing via Parallel Port: {content}")

class USBPrinter:
    def usb_print(self, content):
        raise NotImplementedError

class LegacyPrinterAdapter(USBPrinter):
    def __init__(self, old_printer):
        self.old_printer = old_printer

    def usb_print(self, content):
        self.old_printer.parallel_print(content)

legacy = OldPrinter()
adapter = LegacyPrinterAdapter(legacy)
adapter.usb_print("Hello World")`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait USBPrinter {
    fn usb_print(&self, content: &str);
}

struct OldPrinter;

impl OldPrinter {
    fn parallel_print(&self, content: &str) {
        println!("Printing via Parallel Port: {}", content);
    }
}

struct LegacyPrinterAdapter<'a> {
    old_printer: &'a OldPrinter,
}

impl<'a> USBPrinter for LegacyPrinterAdapter<'a> {
    fn usb_print(&self, content: &str) {
        self.old_printer.parallel_print(content);
    }
}

fn main() {
    let legacy = OldPrinter;
    let adapter = LegacyPrinterAdapter { old_printer: &legacy };
    adapter.usb_print("Hello World");
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type USBPrinter interface {
    USBPrint(string)
}

type OldPrinter struct{}

func (p OldPrinter) ParallelPrint(content string) {
    fmt.Printf("Printing via Parallel Port: %s\\n", content)
}

type LegacyPrinterAdapter struct {
    oldPrinter *OldPrinter
}

func (a LegacyPrinterAdapter) USBPrint(content string) {
    a.oldPrinter.ParallelPrint(content)
}

func main() {
    legacy := &OldPrinter{}
    var printer USBPrinter = LegacyPrinterAdapter{oldPrinter: legacy}
    printer.USBPrint("Hello World")
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface USBPrinter {`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "slf4j-facade",
      i18nKey: "content.patterns.adapter.scenarios.slf4j-facade",
      domain: "library",
      icon: "📦",
      reference: "SLF4J, Logback, Log4j, java.util.logging",
    },
    {
      id: "java-io-streams",
      i18nKey: "content.patterns.adapter.scenarios.java-io-streams",
      domain: "system",
      icon: "☕",
      reference: "Java SDK (InputStreamReader), Apache Commons IO",
      codeSnippet: {
        language: "java",
        code: `// InputStreamReader adapts byte stream → character stream
InputStream raw = System.in;                          // byte stream
Reader reader = new InputStreamReader(raw, "UTF-8");  // adapter
BufferedReader br = new BufferedReader(reader);
String line = br.readLine();                           // char-based API`,
      },
    },
    {
      id: "stripe-sdk",
      i18nKey: "content.patterns.adapter.scenarios.stripe-sdk",
      domain: "business",
      icon: "💼",
      reference: "Stripe API, Square SDK, PayPal SDK",
    },
  ] satisfies Scenario[],
};
