import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Decorator Pattern — Frame Generator
 * Shows a Coffee ordering system where decorators (Milk, Sugar, Whip)
 * wrap a base component and add responsibilities dynamically.
 */
export function* decoratorGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions — stacked top-to-bottom showing the wrapping chain
  const whipPos = { x: 250, y: 60 };
  const sugarPos = { x: 250, y: 145 };
  const milkPos = { x: 250, y: 230 };
  const coffeePos = { x: 250, y: 315 };

  // Base component
  const coffee: PatternObject = {
    id: "coffee",
    name: "SimpleCoffee",
    type: "ConcreteComponent",
    state: { cost: "2.00", desc: "Coffee" },
    position: coffeePos,
    status: "idle",
  };

  // Decorators
  const milkDecorator: PatternObject = {
    id: "milk",
    name: "MilkDecorator",
    type: "Decorator",
    state: { cost: "+0.50", desc: "Coffee, Milk" },
    position: milkPos,
    status: "idle",
  };

  const sugarDecorator: PatternObject = {
    id: "sugar",
    name: "SugarDecorator",
    type: "Decorator",
    state: { cost: "+0.15", desc: "Coffee, Milk, Sugar" },
    position: sugarPos,
    status: "idle",
  };

  const whipDecorator: PatternObject = {
    id: "whip",
    name: "WhipDecorator",
    type: "Decorator",
    state: { cost: "+0.10", desc: "Coffee, Milk, Sugar, Whip" },
    position: whipPos,
    status: "idle",
  };

  // Client
  const client: PatternObject = {
    id: "client",
    name: "Client",
    type: "Client",
    state: {},
    position: { x: 480, y: 60 },
    status: "idle",
  };

  // ── Step 0: Initialize ──
  yield {
    step: step++,
    state: {
      objects: [{ ...coffee }],
      messages: [],
    },
    description: "",
    highlightLine: -1,
    meta: { descriptionKey: "content.patterns.decorator.frames.0" },
  };

  // ── Step 1: Wrap with MilkDecorator ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "active" },
      ],
      messages: [
        { from: "milk", to: "coffee", method: "wraps(coffee)", args: [], status: "active" },
      ],
    },
    description: "",
    highlightLine: 21,
    meta: { descriptionKey: "content.patterns.decorator.frames.1" },
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "idle" },
      ],
      messages: [
        { from: "milk", to: "coffee", method: "wraps(coffee)", args: [], status: "complete" },
      ],
    },
    description: "",
    highlightLine: 21,
    meta: { descriptionKey: "content.patterns.decorator.frames.2" },
  };

  // ── Step 3: Wrap with SugarDecorator ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "idle" },
        { ...sugarDecorator, status: "active" },
      ],
      messages: [
        { from: "milk", to: "coffee", method: "wraps(coffee)", args: [], status: "complete" },
        { from: "sugar", to: "milk", method: "wraps(milk)", args: [], status: "active" },
      ],
    },
    description: "",
    highlightLine: 26,
    meta: { descriptionKey: "content.patterns.decorator.frames.3" },
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "idle" },
        { ...sugarDecorator, status: "idle" },
      ],
      messages: [
        { from: "milk", to: "coffee", method: "wraps(coffee)", args: [], status: "complete" },
        { from: "sugar", to: "milk", method: "wraps(milk)", args: [], status: "complete" },
      ],
    },
    description: "",
    highlightLine: 26,
    meta: { descriptionKey: "content.patterns.decorator.frames.4" },
  };

  // ── Step 5: Wrap with WhipDecorator ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "idle" },
        { ...sugarDecorator, status: "idle" },
        { ...whipDecorator, status: "active" },
        { ...client, status: "idle" },
      ],
      messages: [
        { from: "milk", to: "coffee", method: "wraps(coffee)", args: [], status: "complete" },
        { from: "sugar", to: "milk", method: "wraps(milk)", args: [], status: "complete" },
        { from: "whip", to: "sugar", method: "wraps(sugar)", args: [], status: "active" },
      ],
    },
    description: "",
    highlightLine: 31,
    meta: { descriptionKey: "content.patterns.decorator.frames.5" },
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "idle", state: { cost: "+0.50", desc: "Coffee, Milk" } },
        { ...sugarDecorator, status: "idle", state: { cost: "+0.15", desc: "Coffee, Milk, Sugar" } },
        { ...whipDecorator, status: "idle", state: { cost: "+0.10", desc: "Coffee, Milk, Sugar, Whip" } },
        { ...client, status: "idle" },
      ],
      messages: [
        { from: "milk", to: "coffee", method: "wraps(coffee)", args: [], status: "complete" },
        { from: "sugar", to: "milk", method: "wraps(milk)", args: [], status: "complete" },
        { from: "whip", to: "sugar", method: "wraps(sugar)", args: [], status: "complete" },
      ],
    },
    description: "",
    highlightLine: 31,
  };

  // ── Step 7: Client calls cost() ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "idle" },
        { ...sugarDecorator, status: "idle" },
        { ...whipDecorator, status: "active" },
        { ...client, status: "active" },
      ],
      messages: [
        { from: "client", to: "whip", method: "cost()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.0" },
    highlightLine: 40,
  };

  // ── Step 8: cost() delegates down the chain ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "idle" },
        { ...sugarDecorator, status: "active" },
        { ...whipDecorator, status: "active" },
        { ...client, status: "active" },
      ],
      messages: [
        { from: "whip", to: "sugar", method: "sugar.cost()", args: [], status: "active" },
        { from: "client", to: "whip", method: "cost()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.1" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle" },
        { ...milkDecorator, status: "active" },
        { ...sugarDecorator, status: "active" },
        { ...whipDecorator, status: "active" },
        { ...client, status: "active" },
      ],
      messages: [
        { from: "sugar", to: "milk", method: "milk.cost()", args: [], status: "active" },
        { from: "whip", to: "sugar", method: "sugar.cost()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.2" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "active" },
        { ...milkDecorator, status: "active" },
        { ...sugarDecorator, status: "active" },
        { ...whipDecorator, status: "active" },
        { ...client, status: "active" },
      ],
      messages: [
        { from: "milk", to: "coffee", method: "coffee.cost()", args: [], status: "active" },
        { from: "sugar", to: "milk", method: "milk.cost()", args: [], status: "active" },
        { from: "whip", to: "sugar", method: "sugar.cost()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.3" },
    highlightLine: 15,
  };

  // ── Step 12: Base cost computed ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "highlighted", state: { cost: "2.00", desc: "Coffee" } },
        { ...milkDecorator, status: "active" },
        { ...sugarDecorator, status: "active" },
        { ...whipDecorator, status: "active" },
        { ...client, status: "active" },
      ],
      messages: [
        { from: "milk", to: "coffee", method: "coffee.cost()", args: [], status: "active" },
        { from: "sugar", to: "milk", method: "milk.cost()", args: [], status: "active" },
        { from: "whip", to: "sugar", method: "sugar.cost()", args: [], status: "active" },
        { from: "coffee", to: "milk", method: "→ $2.00", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.4" },
    highlightLine: 8,
  };

  // ── Step 13: Milk adds cost ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle", state: { cost: "2.00", desc: "Coffee" } },
        { ...milkDecorator, status: "highlighted", state: { cost: "= 2.50", desc: "Coffee, Milk" } },
        { ...sugarDecorator, status: "active" },
        { ...whipDecorator, status: "active" },
        { ...client, status: "active" },
      ],
      messages: [
        { from: "milk", to: "sugar", method: "→ $2.50", args: [], status: "active" },
        { from: "sugar", to: "whip", method: "sugar.cost()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.5" },
    highlightLine: 21,
  };

  // ── Step 14: Sugar adds cost ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle", state: { cost: "2.00", desc: "Coffee" } },
        { ...milkDecorator, status: "idle", state: { cost: "= 2.50", desc: "Coffee, Milk" } },
        { ...sugarDecorator, status: "highlighted", state: { cost: "= 2.65", desc: "Coffee, Milk, Sugar" } },
        { ...whipDecorator, status: "active" },
        { ...client, status: "active" },
      ],
      messages: [
        { from: "sugar", to: "whip", method: "→ $2.65", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.6" },
    highlightLine: 26,
  };

  // ── Step 15: Whip adds cost & returns final ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle", state: { cost: "2.00", desc: "Coffee" } },
        { ...milkDecorator, status: "idle", state: { cost: "= 2.50", desc: "Coffee, Milk" } },
        { ...sugarDecorator, status: "idle", state: { cost: "= 2.65", desc: "Coffee, Milk, Sugar" } },
        { ...whipDecorator, status: "highlighted", state: { cost: "= 2.75", desc: "Coffee, Milk, Sugar, Whip" } },
        { ...client, status: "active" },
      ],
      messages: [
        { from: "whip", to: "client", method: "total: $2.75", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.7" },
    highlightLine: 31,
  };

  // ── Step 16: Final result ──
  yield {
    step: step++,
    state: {
      objects: [
        { ...coffee, status: "idle", state: { cost: "2.00", desc: "Coffee" } },
        { ...milkDecorator, status: "idle", state: { cost: "+0.50", desc: "Coffee, Milk" } },
        { ...sugarDecorator, status: "idle", state: { cost: "+0.15", desc: "Coffee, Milk, Sugar" } },
        { ...whipDecorator, status: "highlighted", state: { cost: "= 2.75", desc: "Coffee, Milk, Sugar, Whip" } },
        { ...client, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.decorator.frames.8" },
    highlightLine: 40,
  };
}

// ── Code ──

export const decoratorCode = `// Component interface
interface Coffee {
  cost(): number;
  getDescription(): string;
}

// ConcreteComponent
class SimpleCoffee implements Coffee {
  cost() { return 2.00; }
  getDescription() { return "Coffee"; }
}

// Base Decorator
class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}
  cost() { return this.coffee.cost(); }
  getDescription() { return this.coffee.getDescription(); }
}

// ConcreteDecorators
class MilkDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 0.50; }   // ← adds new responsibility
  getDescription() { return this.coffee.getDescription() + ", Milk"; }
}

class SugarDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 0.15; }
  getDescription() { return this.coffee.getDescription() + ", Sugar"; }
}

class WhipDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 0.10; }
  getDescription() { return this.coffee.getDescription() + ", Whip"; }
}

// Usage
let coffee: Coffee = new SimpleCoffee();          // $2.00
coffee = new MilkDecorator(coffee);               // $2.50
coffee = new SugarDecorator(coffee);              // $2.65
coffee = new WhipDecorator(coffee);               // $2.75
console.log(coffee.cost()); // 2.75`;

export const decoratorCodeLines = [
  "// Component interface",
  "interface Coffee {",
  "  cost(): number;",
  "  getDescription(): string;",
  "}",
  "",
  "// ConcreteComponent",
  "class SimpleCoffee implements Coffee {",
  "  cost() { return 2.00; }",
  "  getDescription() { return \"Coffee\"; }",
  "}",
  "",
  "// Base Decorator",
  "class CoffeeDecorator implements Coffee {",
  "  constructor(protected coffee: Coffee) {}",
  "  cost() { return this.coffee.cost(); }",
  "  getDescription() { return this.coffee.getDescription(); }",
  "}",
  "",
  "// ConcreteDecorators",
  "class MilkDecorator extends CoffeeDecorator {",
  '  cost() { return this.coffee.cost() + 0.50; }   // ← adds new responsibility',
  '  getDescription() { return this.coffee.getDescription() + ", Milk"; }',
  "}",
  "",
  "class SugarDecorator extends CoffeeDecorator {",
  "  cost() { return this.coffee.cost() + 0.15; }",
  '  getDescription() { return this.coffee.getDescription() + ", Sugar"; }',
  "}",
  "",
  "class WhipDecorator extends CoffeeDecorator {",
  "  cost() { return this.coffee.cost() + 0.10; }",
  '  getDescription() { return this.coffee.getDescription() + ", Whip"; }',
  "}",
  "",
  "// Usage",
  "let coffee: Coffee = new SimpleCoffee();          // $2.00",
  "coffee = new MilkDecorator(coffee);               // $2.50",
  "coffee = new SugarDecorator(coffee);              // $2.65",
  "coffee = new WhipDecorator(coffee);               // $2.75",
  "console.log(coffee.cost()); // 2.75",
];

// ── Content ──

const decoratorDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "component",
      name: "Component",
      stereotype: "interface",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 300, y: 50 },
    },
    {
      id: "concreteComponent",
      name: "ConcreteComponent",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 100, y: 200 },
    },
    {
      id: "decorator",
      name: "Decorator",
      stereotype: "interface",
      attributes: [{ visibility: "#", name: "component", type: "Component" }],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 500, y: 200 },
    },
    {
      id: "concreteDecoratorA",
      name: "ConcreteDecoratorA",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 400, y: 350 },
    },
    {
      id: "concreteDecoratorB",
      name: "ConcreteDecoratorB",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 600, y: 350 },
    },
  ],
  relationships: [
    { from: "concreteComponent", to: "component", type: "implements" },
    { from: "decorator", to: "component", type: "implements" },
    { from: "decorator", to: "component", type: "association", label: "wraps" },
    { from: "concreteDecoratorA", to: "decorator", type: "extends" },
    { from: "concreteDecoratorB", to: "decorator", type: "extends" },
  ],
};

export const decoratorContent = {
  id: "decorator",
  slug: "decorator",
  title: "",
  titleKey: "content.patterns.decorator.title",
  category: "pattern" as const,
  subcategory: "structural",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.decorator.desc",
  defaultInput: undefined,
  generator: decoratorGenerator,
  code: decoratorCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  icon: "🔗",
  diagram: decoratorDiagram,
  codeExamples: {
    typescript: {
      code: `interface Coffee {
  cost(): number;
  getDescription(): string;
}

class SimpleCoffee implements Coffee {
  cost() { return 2.00; }
  getDescription() { return "Coffee"; }
}

class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}
  cost() { return this.coffee.cost(); }
  getDescription() { return this.coffee.getDescription(); }
}

class MilkDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 0.50; }
  getDescription() { return this.coffee.getDescription() + ", Milk"; }
}

class SugarDecorator extends CoffeeDecorator {
  cost() { return this.coffee.cost() + 0.15; }
  getDescription() { return this.coffee.getDescription() + ", Sugar"; }
}

let coffee: Coffee = new SimpleCoffee();
coffee = new MilkDecorator(coffee);
coffee = new SugarDecorator(coffee);
console.log(coffee.cost()); // 2.65`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct Coffee Coffee;

struct Coffee {
  double (*cost)(Coffee*);
  const char* (*getDescription)(Coffee*);
};

typedef struct {
  Coffee base;
  Coffee* wrapped;
} Decorator;

double decorator_cost(Coffee* c) {
  return ((Decorator*)c)->wrapped->cost(((Decorator*)c)->wrapped);
}

double simple_cost(Coffee* c) { return 2.0; }
const char* simple_desc(Coffee* c) { return "Coffee"; }

Coffee simple_coffee = { simple_cost, simple_desc };

int main(void) {
  Coffee* coffee = &simple_coffee;
  printf("Cost: %.2f\\n", coffee->cost(coffee));
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

struct Coffee {
  virtual double cost() = 0;
  virtual std::string getDescription() = 0;
  virtual ~Coffee() = default;
};

struct SimpleCoffee : Coffee {
  double cost() override { return 2.00; }
  std::string getDescription() override { return "Coffee"; }
};

struct CoffeeDecorator : Coffee {
  std::unique_ptr<Coffee> coffee;
  CoffeeDecorator(Coffee* c) : coffee(c) {}
  double cost() override { return coffee->cost(); }
  std::string getDescription() override { return coffee->getDescription(); }
};

struct MilkDecorator : CoffeeDecorator {
  MilkDecorator(Coffee* c) : CoffeeDecorator(c) {}
  double cost() override { return coffee->cost() + 0.50; }
  std::string getDescription() override { return coffee->getDescription() + ", Milk"; }
};

int main() {
  std::unique_ptr<Coffee> coffee = std::make_unique<MilkDecorator>(new SimpleCoffee());
  std::cout << coffee->cost() << std::endl;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class Coffee(ABC):
    @abstractmethod
    def cost(self) -> float:
        pass

    @abstractmethod
    def get_description(self) -> str:
        pass

class SimpleCoffee(Coffee):
    def cost(self) -> float:
        return 2.00
    def get_description(self) -> str:
        return "Coffee"

class CoffeeDecorator(Coffee):
    def __init__(self, coffee):
        self.coffee = coffee
    def cost(self) -> float:
        return self.coffee.cost()
    def get_description(self) -> str:
        return self.coffee.get_description()

class MilkDecorator(CoffeeDecorator):
    def cost(self) -> float:
        return self.coffee.cost() + 0.50
    def get_description(self) -> str:
        return self.coffee.get_description() + ", Milk"

coffee = SimpleCoffee()
coffee = MilkDecorator(coffee)
print(coffee.cost())  # 2.50`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Coffee {
    fn cost(&self) -> f64;
    fn description(&self) -> String;
}

struct SimpleCoffee;

impl Coffee for SimpleCoffee {
    fn cost(&self) -> f64 { 2.00 }
    fn description(&self) -> String { "Coffee".to_string() }
}

struct MilkDecorator<T: Coffee> {
    coffee: T,
}

impl<T: Coffee> Coffee for MilkDecorator<T> {
    fn cost(&self) -> f64 { self.coffee.cost() + 0.50 }
    fn description(&self) -> String {
        format!("{}, Milk", self.coffee.description())
    }
}

fn main() {
    let coffee: MilkDecorator<SimpleCoffee> = MilkDecorator { coffee: SimpleCoffee };
    println!("{}", coffee.cost());
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Coffee interface {
    Cost() float64
    Description() string
}

type SimpleCoffee struct{}

func (c SimpleCoffee) Cost() float64 { return 2.00 }
func (c SimpleCoffee) Description() string { return "Coffee" }

type MilkDecorator struct {
    coffee Coffee
}

func (d MilkDecorator) Cost() float64 { return d.coffee.Cost() + 0.50 }
func (d MilkDecorator) Description() string { return d.coffee.Description() + ", Milk" }

func main() {
    var coffee Coffee = SimpleCoffee{}
    coffee = MilkDecorator{coffee: coffee}
    fmt.Println(coffee.Cost())
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface Coffee {
    double cost();
    String getDescription();
}

public class SimpleCoffee implements Coffee {
    public double cost() { return 2.00; }
    public String getDescription() { return "Coffee"; }
}

abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;
    public CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }
}

public class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) { super(coffee); }
    public double cost() { return coffee.cost() + 0.50; }
    public String getDescription() { return coffee.getDescription() + ", Milk"; }
}

public class Main {
    public static void main(String[] args) {
        Coffee coffee = new SimpleCoffee();
        coffee = new MilkDecorator(coffee);
        System.out.println(coffee.cost());
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — anchored to systems the learner
  // can recognize from day-to-day engineering work.
  scenarios: [
    {
      id: "java-io-streams",
      i18nKey: "content.patterns.decorator.scenarios.java-io-streams",
      domain: "library",
      icon: "☕",
      reference: "Java SDK, Python io module, C# Stream",
      codeSnippet: {
        language: "java",
        code: `// Java I/O: BufferedReader wraps InputStreamReader wraps FileInputStream
try (BufferedReader reader = new BufferedReader(
       new InputStreamReader(
         new FileInputStream("data.txt"), StandardCharsets.UTF_8))) {
  String line;
  while ((line = reader.readLine()) != null) {
    System.out.println(line);
  }
}`,
      },
    },
    {
      id: "react-hocs",
      i18nKey: "content.patterns.decorator.scenarios.react-hocs",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "React HOCs, Styled Components, MobX @observable",
    },
    {
      id: "python-decorators",
      i18nKey: "content.patterns.decorator.scenarios.python-decorators",
      domain: "devtools",
      icon: "🐍",
      reference: "Python @property, TypeScript decorators, C# attributes",
    },
  ] satisfies Scenario[],
};
