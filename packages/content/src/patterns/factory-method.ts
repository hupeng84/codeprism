import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Factory Method Pattern — Frame Generator
 * document creation scenario - Creator, ConcreteCreator, Product
 */
export function* factoryMethodGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const creatorPos = { x: 150, y: 150 };
  const concreteCreatorPos = { x: 350, y: 150 };
  const productPos = { x: 550, y: 150 };

  // Objects
  const creator: PatternObject = {
    id: "creator",
    name: "DocumentCreator",
    type: "Creator",
    state: { factoryMethod: "createDocument()" },
    position: creatorPos,
    status: "idle",
  };

  const concreteCreator: PatternObject = {
    id: "concreteCreator",
    name: "ReportCreator",
    type: "ConcreteCreator",
    state: { type: "Report" },
    position: concreteCreatorPos,
    status: "idle",
  };

  const report: PatternObject = {
    id: "report",
    name: "Report",
    type: "Product",
    state: { title: "", pages: 15 },
    position: productPos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...creator },
        { ...concreteCreator },
        { ...report },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Client calls factory method
  yield {
    step: step++,
    state: {
      objects: [
        { ...creator, status: "active" },
        { ...concreteCreator, status: "idle" },
        { ...report, status: "idle" },
      ],
      messages: [
        { from: "creator", to: "concreteCreator", method: "createDocument()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.factory-method.frames.0" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...creator, status: "active" },
        { ...concreteCreator, status: "highlighted" },
        { ...report, status: "idle" },
      ],
      messages: [
        { from: "creator", to: "concreteCreator", method: "createDocument()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.factory-method.frames.1" },
    highlightLine: 10,
  };

  // Step 3: Create product
  yield {
    step: step++,
    state: {
      objects: [
        { ...creator, status: "active" },
        { ...concreteCreator, status: "active" },
        { ...report, status: "active" },
      ],
      messages: [
        { from: "concreteCreator", to: "report", method: "new Report()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.factory-method.frames.2" },
    highlightLine: 12,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...creator, status: "idle" },
        { ...concreteCreator, status: "idle" },
        { ...report, status: "highlighted", state: { title: "quarterly report", pages: 15 } },
      ],
      messages: [
        { from: "concreteCreator", to: "report", method: "new Report()", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.factory-method.frames.3" },
    highlightLine: 13,
  };

  // Step 5: Return product to client
  yield {
    step: step++,
    state: {
      objects: [
        { ...creator, status: "idle" },
        { ...concreteCreator, status: "idle" },
        { ...report, status: "idle" },
      ],
      messages: [
        { from: "concreteCreator", to: "creator", method: "return Report", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.factory-method.frames.4" },
    highlightLine: 14,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...creator, status: "idle" },
        { ...concreteCreator, status: "idle" },
        { ...report, status: "highlighted" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.factory-method.frames.5" },
    highlightLine: 14,
  };

  // Step 7: Switch to different creator
  yield {
    step: step++,
    state: {
      objects: [
        { ...creator, status: "idle", state: { factoryMethod: "createDocument()" } },
        { ...concreteCreator, status: "idle", state: { type: "InvoiceCreator" } },
        { ...report, status: "idle", state: { type: "Invoice", title: "invoice", amount: 1000 } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.factory-method.frames.6" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...creator, status: "idle" },
        { ...concreteCreator, status: "idle", state: { type: "InvoiceCreator" } },
        { ...report, status: "highlighted", state: { type: "Invoice", title: "invoice", amount: 1000 } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.factory-method.frames.7" },
    highlightLine: 20,
  };
}

/** Code snippet */
export const factoryMethodCode = `// Product interface
interface Document {
  render(): void;  // ← product interface
}

// Concrete Products
class Report implements Document {
  constructor(public title: string, public pages: number) {}
  render(): void { console.log(\`Rendering Report: \${this.title}\`); }
}

class Invoice implements Document {
  constructor(public amount: number) {}
  render(): void { console.log(\`Rendering Invoice: $\${this.amount}\`); }
}

// Creator - declare factory method
abstract class DocumentCreator {
  // ← factory method, implemented by subclass
  abstract createDocument(): Document;

  // business logic using the product
  openDocument(): void {
    const doc = this.createDocument();  // ← call factory method
    doc.render();
  }
}

// ConcreteCreator - implement factory method
class ReportCreator extends DocumentCreator {
  createDocument(): Document {
    return new Report("quarterly report", 15);  // ← create Report
  }
}

class InvoiceCreator extends DocumentCreator {
  createDocument(): Document {
    return new Invoice(1000);  // ← create Invoice
  }
}

// Usage
const creator = new ReportCreator();
creator.openDocument();  // create and render report`;

export const factoryMethodCodeLines = [
  "// Product interface",
  "interface Document {",
  "  render(): void;  // ← product interface",
  "}",
  "",
  "// Concrete Products",
  "class Report implements Document {",
  "  constructor(public title: string, public pages: number) {}",
  "  render(): void { console.log(`Rendering Report: ${this.title}`); }",
  "}",
  "",
  "class Invoice implements Document {",
  "  constructor(public amount: number) {}",
  "  render(): void { console.log(`Rendering Invoice: $${this.amount}`); }",
  "}",
  "",
  "// Creator - declare factory method",
  "abstract class DocumentCreator {",
  "  // ← factory method, implemented by subclass",
  "  abstract createDocument(): Document;",
  "",
  "  // business logic using the product",
  "  openDocument(): void {",
  "    const doc = this.createDocument();  // ← call factory method",
  "    doc.render();",
  "  }",
  "}",
  "",
  "// ConcreteCreator - implement factory method",
  "class ReportCreator extends DocumentCreator {",
  "  createDocument(): Document {",
  "    return new Report('quarterly report', 15);  // ← create Report",
  "  }",
  "}",
  "",
  "class InvoiceCreator extends DocumentCreator {",
  "  createDocument(): Document {",
  "    return new Invoice(1000);  // ← create Invoice",
  "  }",
  "}",
  "",
  "// Usage",
  "const creator = new ReportCreator();",
  "creator.openDocument();  // create and render report",
];

const factoryMethodDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "creator",
      name: "Creator",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "factoryMethod", params: "", returnType: "Product" },
      ],
      position: { x: 80, y: 80 },
    },
    {
      id: "concreteCreator",
      name: "ConcreteCreator",
      attributes: [],
      methods: [
        { visibility: "+", name: "factoryMethod", params: "", returnType: "ConcreteProduct" },
      ],
      position: { x: 80, y: 240 },
    },
    {
      id: "product",
      name: "Product",
      stereotype: "«interface»",
      attributes: [],
      methods: [],
      position: { x: 300, y: 80 },
    },
    {
      id: "concreteProduct",
      name: "ConcreteProduct",
      attributes: [],
      methods: [],
      position: { x: 300, y: 240 },
    },
  ],
  relationships: [
    { from: "concreteCreator", to: "creator", type: "implements" },
    { from: "concreteProduct", to: "product", type: "implements" },
  ],
};

export const factoryMethodContent = {
  id: "factory-method",
  slug: "factory-method",
  title: "",
  titleKey: "content.patterns.factory-method.title",
  category: "pattern" as const,
  subcategory: "creational",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.factory-method.desc",
  defaultInput: undefined,
  generator: factoryMethodGenerator,
  code: factoryMethodCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(n)",
  },
  tags: [],
  icon: "🏭",
  diagram: factoryMethodDiagram,
  codeExamples: {
    typescript: {
      code: `interface Document {
  render(): void;
}

class Report implements Document {
  constructor(public title: string, public pages: number) {}
  render(): void { console.log(\`Rendering Report: \${this.title}\`); }
}

class Invoice implements Document {
  constructor(public amount: number) {}
  render(): void { console.log(\`Rendering Invoice: $\${this.amount}\`); }
}

abstract class DocumentCreator {
  abstract createDocument(): Document;

  openDocument(): void {
    const doc = this.createDocument();
    doc.render();
  }
}

class ReportCreator extends DocumentCreator {
  createDocument(): Document {
    return new Report("quarterly report", 15);
  }
}

class InvoiceCreator extends DocumentCreator {
  createDocument(): Document {
    return new Invoice(1000);
  }
}

const creator = new ReportCreator();
creator.openDocument();`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Document Document;

struct Document {
  void (*render)(Document*);
};

void report_render(Document* doc) { printf("Rendering Report\\n"); }
void invoice_render(Document* doc) { printf("Rendering Invoice\\n"); }

Document* create_report(void) {
  Document* doc = malloc(sizeof(Document));
  doc->render = report_render;
  return doc;
}

Document* create_invoice(void) {
  Document* doc = malloc(sizeof(Document));
  doc->render = invoice_render;
  return doc;
}

// Factory function pointer
typedef Document* (*CreatorFunc)(void);

Document* create_document(CreatorFunc factory) {
  return factory();
}

int main(void) {
  Document* doc = create_document(create_report);
  doc->render(doc);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <memory>
#include <iostream>

struct Document {
  virtual ~Document() = default;
  virtual void render() = 0;
};

class Report : public Document {
public:
  void render() override { std::cout << "Rendering Report\\n"; }
};

class Invoice : public Document {
public:
  void render() override { std::cout << "Rendering Invoice\\n"; }
};

class DocumentCreator {
public:
  virtual std::unique_ptr<Document> createDocument() = 0;
  void openDocument() { auto doc = createDocument(); doc->render(); }
  virtual ~DocumentCreator() = default;
};

class ReportCreator : public DocumentCreator {
public:
  std::unique_ptr<Document> createDocument() override {
    return std::make_unique<Report>();
  }
};

int main() {
  std::unique_ptr<DocumentCreator> creator = std::make_unique<ReportCreator>();
  creator->openDocument();
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class Document(ABC):
    @abstractmethod
    def render(self):
        pass

class Report(Document):
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
    def render(self):
        print(f"Rendering Report: {self.title}")

class Invoice(Document):
    def __init__(self, amount):
        self.amount = amount
    def render(self):
        print(f"Rendering Invoice: {self.amount}")

class DocumentCreator(ABC):
    @abstractmethod
    def create_document(self) -> Document:
        pass

    def open_document(self):
        doc = self.create_document()
        doc.render()

class ReportCreator(DocumentCreator):
    def create_document(self):
        return Report("quarterly report", 15)

class InvoiceCreator(DocumentCreator):
    def create_document(self):
        return Invoice(1000)

creator = ReportCreator()
creator.open_document()`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Document {
    fn render(&self);
}

struct Report { title: String }
struct Invoice { amount: f64 }

impl Document for Report {
    fn render(&self) { println!("Rendering Report: {}", self.title); }
}

impl Document for Invoice {
    fn render(&self) { println!("Rendering Invoice: {}", self.amount); }
}

trait DocumentCreator {
    fn create_document(&self) -> Box<dyn Document>;
}

struct ReportCreator;
struct InvoiceCreator;

impl DocumentCreator for ReportCreator {
    fn create_document(&self) -> Box<dyn Document> {
        Box::new(Report { title: "quarterly report".to_string() })
    }
}

fn open_document(creator: &impl DocumentCreator) {
    let doc = creator.create_document();
    doc.render();
}

fn main() {
    let creator = ReportCreator;
    open_document(&creator);
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Document interface {
    Render()
}

type Report struct{ title string }
type Invoice struct{ amount float64 }

func (r Report) Render() { fmt.Printf("Rendering Report: %s\\n", r.title) }
func (i Invoice) Render() { fmt.Printf("Rendering Invoice: %f\\n", i.amount) }

type Creator interface {
    CreateDocument() Document
}

type ReportCreator struct{}
type InvoiceCreator struct{}

func (r ReportCreator) CreateDocument() Document { return Report{"quarterly report"} }
func (i InvoiceCreator) CreateDocument() Document { return Invoice{1000} }

func openDocument(c Creator) {
    doc := c.CreateDocument()
    doc.Render()
}

func main() {
    var c Creator = ReportCreator{}
    openDocument(c)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface Document {
    void render();
}

public class Report implements Document {
    private String title;
    private int pages;
    public Report(String title, int pages) { this.title = title; this.pages = pages; }
    public void render() { System.out.println("Rendering Report: " + title); }
}

public class Invoice implements Document {
    private double amount;
    public Invoice(double amount) { this.amount = amount; }
    public void render() { System.out.println("Rendering Invoice: " + amount); }
}

public abstract class DocumentCreator {
    public abstract Document createDocument();
    public void openDocument() { createDocument().render(); }
}

public class ReportCreator extends DocumentCreator {
    public Document createDocument() { return new Report("quarterly report", 15); }
}

public class InvoiceCreator extends DocumentCreator {
    public Document createDocument() { return new Invoice(1000); }
}

public class Main {
    public static void main(String[] args) {
        DocumentCreator creator = new ReportCreator();
        creator.openDocument();
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — anchored to production systems
  // that developers encounter in their daily work.
  scenarios: [
    {
      id: "jdbc-driver-manager",
      i18nKey: "content.patterns.factory-method.scenarios.jdbc-driver-manager",
      domain: "database",
      icon: "🗄️",
      reference: "JDBC, PostgreSQL Driver, MySQL Driver, H2",
      codeSnippet: {
        language: "java",
        code: `// JDBC DriverManager — classic Factory Method
// getConnection() delegates to the right driver subclass
Connection conn = DriverManager.getConnection(
    "jdbc:postgresql://localhost:5432/mydb", user, pass);
// DriverManager inspects the URL prefix ("postgresql")
// and creates the matching driver — PostgreSQL, MySQL, H2, etc.`,
      },
    },
    {
      id: "react-create-element",
      i18nKey: "content.patterns.factory-method.scenarios.react-create-element",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "React, Vue createApp, Angular ViewContainerRef",
    },
    {
      id: "java-number-format",
      i18nKey: "content.patterns.factory-method.scenarios.java-number-format",
      domain: "library",
      icon: "☕",
      reference: "Java SDK, NumberFormat, Calendar, java.time",
    },
  ] satisfies Scenario[],
};
