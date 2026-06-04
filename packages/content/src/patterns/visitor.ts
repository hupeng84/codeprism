import type { Frame, InteractionState, Scenario, UMLClassDiagram } from "@codeprism/core";

export function* visitorGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  const shop = { id: 'shop', name: 'Shop', type: 'Element', state: { name: 'Best Store' }, position: { x: 300, y: 50 }, status: 'idle' as const };
  const item1 = { id: 'item1', name: 'Laptop $1000', type: 'Item', state: { price: 1000 }, position: { x: 150, y: 150 }, status: 'idle' as const };
  const item2 = { id: 'item2', name: 'Phone $800', type: 'Item', state: { price: 800 }, position: { x: 300, y: 150 }, status: 'idle' as const };
  const item3 = { id: 'item3', name: 'Tablet $600', type: 'Item', state: { price: 600 }, position: { x: 450, y: 150 }, status: 'idle' as const };
  const visitor = { id: 'visitor', name: 'BulkDiscountVisitor', type: 'Visitor', state: { discount: 0 }, position: { x: 300, y: 280 }, status: 'idle' as const };

  yield { step: 1, state: { objects: [shop, item1, item2, item3, visitor], messages: [] }, description: 'Shop with 3 items, visitor ready to calculate discounts', highlightLine: 1 };
  yield { step: 2, state: { objects: [shop, item1, item2, item3, visitor], messages: [{ from: 'shop', to: 'visitor', method: 'accept(visitor)', args: [], status: 'pending' as const }] }, description: 'Shop accepts the BulkDiscountVisitor', highlightLine: 2 };
  yield { step: 3, state: { objects: [{ ...shop, status: 'active' }, item1, item2, item3, visitor], messages: [{ from: 'shop', to: 'visitor', method: 'accept(visitor)', args: [], status: 'active' as const }] }, description: 'Shop.accept() called on visitor', highlightLine: 3 };
  yield { step: 4, state: { objects: [shop, item1, item2, item3, visitor], messages: [{ from: 'visitor', to: 'item1', method: 'visit(item)', args: ['Laptop'], status: 'pending' as const }] }, description: 'Visitor visits each item - starting with Laptop', highlightLine: 7 };
  yield { step: 5, state: { objects: [shop, { ...item1, status: 'active' }, item2, item3, visitor], messages: [{ from: 'visitor', to: 'item1', method: 'visit(item)', args: ['Laptop'], status: 'active' as const }] }, description: 'Laptop visited - adds to total: $1000', highlightLine: 8 };
  yield { step: 6, state: { objects: [shop, item1, item2, item3, visitor], messages: [{ from: 'visitor', to: 'item2', method: 'visit(item)', args: ['Phone'], status: 'pending' as const }] }, description: 'Visitor visits Phone: $800', highlightLine: 7 };
  yield { step: 7, state: { objects: [shop, item1, item2, item3, visitor], messages: [{ from: 'visitor', to: 'item3', method: 'visit(item)', args: ['Tablet'], status: 'pending' as const }] }, description: 'Visitor visits Tablet: $600', highlightLine: 7 };
  yield { step: 8, state: { objects: [shop, item1, item2, item3, { ...visitor, status: 'active' }], messages: [] }, description: 'All items visited - calculating bulk discount on total $2400', highlightLine: 10 };
}

export const visitorCode = `interface Visitor {
  visit(item: Item): void;
}

interface Element {
  accept(visitor: Visitor): void;
}

class Item implements Element {
  constructor(
    public name: string,
    public price: number
  ) {}

  accept(visitor: Visitor): void {
    visitor.visit(this);
  }
}

class Shop implements Element {
  private items: Item[] = [];

  addItem(item: Item): void {
    this.items.push(item);
  }

  accept(visitor: Visitor): void {
    this.items.forEach(item => item.accept(visitor));
  }
}

class BulkDiscountVisitor implements Visitor {
  private total = 0;

  visit(item: Item): void {
    this.total += item.price;
    console.log(\`Visited \${item.name}: $\${item.price}\`);
  }

  getTotal(): number {
    return this.total;
  }

  getDiscountedTotal(discountPercent: number): number {
    return this.total * (1 - discountPercent / 100);
  }
}

// Usage
const shop = new Shop();
shop.addItem(new Item('Laptop', 1000));
shop.addItem(new Item('Phone', 800));
shop.addItem(new Item('Tablet', 600));

const visitor = new BulkDiscountVisitor();
shop.accept(visitor);

console.log(\`Total: $\${visitor.getTotal()}\`);
console.log(\`With 10% discount: $\${visitor.getDiscountedTotal(10)}\`);`;

export const visitorCodeLines = [
  "interface Visitor {",
  "  visit(item: Item): void;",
  "}",
  "",
  "interface Element {",
  "  accept(visitor: Visitor): void;",
  "}",
  "",
  "class Item implements Element {",
  "  constructor(",
  "    public name: string,",
  "    public price: number",
  "  ) {}",
  "",
  "  accept(visitor: Visitor): void {",
  "    visitor.visit(this);",
  "  }",
  "}",
  "",
  "class Shop implements Element {",
  "  private items: Item[] = [];",
  "",
  "  addItem(item: Item): void {",
  "    this.items.push(item);",
  "  }",
  "",
  "  accept(visitor: Visitor): void {",
  "    this.items.forEach(item => item.accept(visitor));",
  "  }",
  "}",
  "",
  "class BulkDiscountVisitor implements Visitor {",
  "  private total = 0;",
  "",
  "  visit(item: Item): void {",
  "    this.total += item.price;",
  "    console.log(`Visited ${item.name}: $${item.price}`);",
  "  }",
  "",
  "  getTotal(): number {",
  "    return this.total;",
  "  }",
  "",
  "  getDiscountedTotal(discountPercent: number): number {",
  "    return this.total * (1 - discountPercent / 100);",
  "  }",
  "}",
  "",
  "// Usage",
  "const shop = new Shop();",
  "shop.addItem(new Item('Laptop', 1000));",
  "shop.addItem(new Item('Phone', 800));",
  "shop.addItem(new Item('Tablet', 600));",
  "",
  "const visitor = new BulkDiscountVisitor();",
  "shop.accept(visitor);",
  "",
  "console.log(`Total: $${visitor.getTotal()}`);",
  "console.log(`With 10% discount: $${visitor.getDiscountedTotal(10)}`);",
];

const visitorDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Visitor",
      name: "Visitor",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "visitConcreteElementA", params: "element: ConcreteElementA", returnType: "void" },
        { visibility: "+", name: "visitConcreteElementB", params: "element: ConcreteElementB", returnType: "void" },
      ],
      position: { x: 150, y: 50 },
    },
    {
      id: "ConcreteVisitor1",
      name: "ConcreteVisitor1",
      attributes: [],
      methods: [
        { visibility: "+", name: "visitConcreteElementA", params: "element: ConcreteElementA", returnType: "void" },
        { visibility: "+", name: "visitConcreteElementB", params: "element: ConcreteElementB", returnType: "void" },
      ],
      position: { x: 100, y: 250 },
    },
    {
      id: "ConcreteVisitor2",
      name: "ConcreteVisitor2",
      attributes: [],
      methods: [
        { visibility: "+", name: "visitConcreteElementA", params: "element: ConcreteElementA", returnType: "void" },
        { visibility: "+", name: "visitConcreteElementB", params: "element: ConcreteElementB", returnType: "void" },
      ],
      position: { x: 350, y: 250 },
    },
    {
      id: "Element",
      name: "Element",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "accept", params: "visitor: Visitor", returnType: "void" },
      ],
      position: { x: 550, y: 50 },
    },
    {
      id: "ConcreteElementA",
      name: "ConcreteElementA",
      attributes: [],
      methods: [
        { visibility: "+", name: "accept", params: "visitor: Visitor", returnType: "void" },
      ],
      position: { x: 500, y: 250 },
    },
    {
      id: "ConcreteElementB",
      name: "ConcreteElementB",
      attributes: [],
      methods: [
        { visibility: "+", name: "accept", params: "visitor: Visitor", returnType: "void" },
      ],
      position: { x: 750, y: 250 },
    },
  ],
  relationships: [
    { from: "ConcreteVisitor1", to: "Visitor", type: "implements" },
    { from: "ConcreteVisitor2", to: "Visitor", type: "implements" },
    { from: "ConcreteElementA", to: "Element", type: "implements" },
    { from: "ConcreteElementB", to: "Element", type: "implements" },
    { from: "Element", to: "Visitor", type: "dependency", label: "accepts" },
  ],
};

export const visitorContent = {
  id: "visitor",
  slug: "visitor",
  title: "",
  titleKey: "content.patterns.visitor.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.patterns.visitor.desc",
  defaultInput: undefined,
  code: visitorCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  diagram: visitorDiagram,
  icon: "👤",
  codeExamples: {
    typescript: {
      code: `interface Visitor {
  visit(item: Item): void;
}

interface Element {
  accept(visitor: Visitor): void;
}

class Item implements Element {
  constructor(public name: string, public price: number) {}
  accept(visitor: Visitor): void { visitor.visit(this); }
}

class Shop implements Element {
  private items: Item[] = [];
  addItem(item: Item): void { this.items.push(item); }
  accept(visitor: Visitor): void {
    this.items.forEach(item => item.accept(visitor));
  }
}

class PriceReporter implements Visitor {
  private total = 0;
  visit(item: Item): void {
    this.total += item.price;
    console.log(\`\${item.name}: $\${item.price}\`);
  }
  getTotal(): number { return this.total; }
}

const shop = new Shop();
shop.addItem(new Item("Laptop", 1000));
shop.addItem(new Item("Phone", 800));
const reporter = new PriceReporter();
shop.accept(reporter);
console.log("Total:", reporter.getTotal());`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct Item {
  const char* name;
  double price;
} Item;

typedef struct Visitor {
  void (*visit)(struct Visitor*, struct Item*);
  double total;
} Visitor;

void price_report_visit(Visitor* v, Item* item) {
  v->total += item->price;
  printf("%s: $%.2f\\n", item->name, item->price);
}

void shop_accept(Item items[], int count, Visitor* v) {
  for (int i = 0; i < count; i++) v->visit(v, &items[i]);
}

int main(void) {
  Item items[] = {{"Laptop", 1000}, {"Phone", 800}};
  Visitor v = {price_report_visit, 0};
  shop_accept(items, 2, &v);
  printf("Total: $%.2f\\n", v.total);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <vector>
#include <memory>

class Visitor;

class Item {
public:
  virtual ~Item() = default;
  virtual void accept(Visitor& v) = 0;
  virtual double getPrice() const = 0;
  virtual std::string getName() const = 0;
};

class ConcreteItem : public Item {
  std::string name;
  double price;
public:
  ConcreteItem(const std::string& n, double p) : name(n), price(p) {}
  void accept(Visitor& v) override;
  double getPrice() const override { return price; }
  std::string getName() const override { return name; }
};

class Visitor {
public:
  virtual ~Visitor() = default;
  virtual void visit(Item& item) = 0;
};

void ConcreteItem::accept(Visitor& v) { v.visit(*this); }

class PriceReporter : public Visitor {
  double total = 0;
public:
  void visit(Item& item) override {
    total += item.getPrice();
    std::cout << item.getName() << ": $" << item.getPrice() << "\\n";
  }
  double getTotal() const { return total; }
};

int main() {
  std::vector<std::unique_ptr<Item>> items;
  items.push_back(std::make_unique<ConcreteItem>("Laptop", 1000));
  items.push_back(std::make_unique<ConcreteItem>("Phone", 800));
  PriceReporter reporter;
  for (auto& item : items) item->accept(reporter);
  std::cout << "Total: $" << reporter.getTotal() << "\\n";
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class Visitor(ABC):
    @abstractmethod
    def visit(self, item): pass

class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def accept(self, visitor):
        visitor.visit(self)

class Shop:
    def __init__(self):
        self.items = []

    def add_item(self, item):
        self.items.append(item)

    def accept(self, visitor):
        for item in self.items:
            item.accept(visitor)

class PriceReporter(Visitor):
    def __init__(self):
        self.total = 0

    def visit(self, item):
        self.total += item.price
        print(f"{item.name}: \${item.price}")

shop = Shop()
shop.add_item(Item("Laptop", 1000))
shop.add_item(Item("Phone", 800))
reporter = PriceReporter()
shop.accept(reporter)
print(f"Total: \${reporter.total}")`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::fmt;

trait Visitor {
    fn visit(&mut self, item: &Item);
}

struct Item {
    name: String,
    price: f64,
}

struct Shop {
    items: Vec<Item>,
}

impl Shop {
    fn accept(&self, visitor: &mut dyn Visitor) {
        for item in &self.items {
            visitor.visit(item);
        }
    }
}

struct PriceReporter {
    total: f64,
}

impl Visitor for PriceReporter {
    fn visit(&mut self, item: &Item) {
        self.total += item.price;
        println!("{}: \${}", item.name, item.price);
    }
}

impl fmt::Debug for PriceReporter {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "Total: \${}", self.total)
    }
}

fn main() {
    let shop = Shop {
        items: vec![
            Item { name: "Laptop".to_string(), price: 1000.0 },
            Item { name: "Phone".to_string(), price: 800.0 },
        ],
    };
    let mut reporter = PriceReporter { total: 0.0 };
    shop.accept(&mut reporter);
    println!("{:?}", reporter);
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Visitor interface {
    Visit(*Item)
}

type Item struct {
    Name  string
    Price float64
}

type Shop struct {
    items []*Item
}

func (s *Shop) AddItem(item *Item) { s.items = append(s.items, item) }
func (s *Shop) Accept(v Visitor) {
    for _, item := range s.items {
        v.Visit(item)
    }
}

type PriceReporter struct {
    Total float64
}

func (v *PriceReporter) Visit(item *Item) {
    v.Total += item.Price
    fmt.Printf("%s: $%.2f\\n", item.Name, item.Price)
}

func main() {
    shop := &Shop{}
    shop.AddItem(&Item{Name: "Laptop", Price: 1000})
    shop.AddItem(&Item{Name: "Phone", Price: 800})
    reporter := &PriceReporter{}
    shop.Accept(reporter)
    fmt.Printf("Total: $%.2f\\n", reporter.Total)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `import java.util.*;

interface Visitor {
    void visit(Item item);
}

class Item {
    String name;
    double price;
    Item(String name, double price) { this.name = name; this.price = price; }
    void accept(Visitor v) { v.visit(this); }
}

class Shop {
    private List<Item> items = new ArrayList<>();
    void addItem(Item item) { items.add(item); }
    void accept(Visitor v) {
        for (Item item : items) item.accept(v);
    }
}

class PriceReporter implements Visitor {
    double total = 0;
    public void visit(Item item) {
        total += item.price;
        System.out.println(item.name + ": $" + item.price);
    }
}

public class Main {
    public static void main(String[] args) {
        Shop shop = new Shop();
        shop.addItem(new Item("Laptop", 1000));
        shop.addItem(new Item("Phone", 800));
        PriceReporter reporter = new PriceReporter();
        shop.accept(reporter);
        System.out.println("Total: $" + reporter.total);
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — where separating algorithms from
  // object structure shines.
  scenarios: [
    {
      id: "java-annotation-processor",
      i18nKey: "content.patterns.visitor.scenarios.java-annotation-processor",
      domain: "devtools",
      icon: "☕",
      reference: "javax.lang.model, Lombok, MapStruct",
    },
    {
      id: "files-walk-file-tree",
      i18nKey: "content.patterns.visitor.scenarios.files-walk-file-tree",
      domain: "system",
      icon: "🗂️",
      reference: "Java NIO Files, Node.js fs.walk, Python os.walk",
      codeSnippet: {
        language: "java",
        code: `// Java NIO file tree traversal with FileVisitor
Files.walkFileTree(Paths.get("/app"), new SimpleFileVisitor<>() {
  @Override
  public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
    System.out.println("File: " + file);
    return FileVisitResult.CONTINUE;
  }

  @Override
  public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
    System.out.println("Entering: " + dir);
    return FileVisitResult.CONTINUE;
  }
});`,
      },
    },
  ] satisfies Scenario[],
};
