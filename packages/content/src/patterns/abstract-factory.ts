import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Abstract Factory Pattern — Frame Generator
 * UI theme factory scenario - create cross-platform UI components
 */
export function* abstractFactoryGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const clientPos = { x: 100, y: 200 };
  const factoryPos = { x: 300, y: 200 };
  const buttonPos = { x: 480, y: 120 };
  const checkboxPos = { x: 480, y: 200 };
  const dropdownPos = { x: 480, y: 280 };

  // Objects
  const client: PatternObject = {
    id: "client",
    name: "Application",
    type: "Client",
    state: { os: "Windows" },
    position: clientPos,
    status: "idle",
  };

  const factory: PatternObject = {
    id: "factory",
    name: "GUIFactory",
    type: "AbstractFactory",
    state: { type: "WindowsFactory" },
    position: factoryPos,
    status: "idle",
  };

  const button: PatternObject = {
    id: "button",
    name: "Button",
    type: "Product",
    state: { style: "Windows" },
    position: buttonPos,
    status: "idle",
  };

  const checkbox: PatternObject = {
    id: "checkbox",
    name: "Checkbox",
    type: "Product",
    state: { style: "Windows" },
    position: checkboxPos,
    status: "idle",
  };

  const dropdown: PatternObject = {
    id: "dropdown",
    name: "Dropdown",
    type: "Product",
    state: { style: "Windows" },
    position: dropdownPos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...client },
        { ...factory },
        { ...button },
        { ...checkbox },
        { ...dropdown },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Application requests Windows factory
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...factory, status: "idle" },
        { ...button, status: "idle" },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "client", to: "factory", method: "createFactory('Windows')", args: ["Windows"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.0" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...factory, status: "highlighted", state: { type: "WindowsFactory" } },
        { ...button, status: "idle" },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "client", to: "factory", method: "createFactory('Windows')", args: ["Windows"], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.1" },
    highlightLine: 11,
  };

  // Step 3: Create Button
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "active" },
        { ...button, status: "idle" },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "client", to: "factory", method: "createButton()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.2" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "active" },
        { ...button, status: "active" },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "button", method: "new WindowsButton()", args: [], status: "active" },
      ],
    },
    description: "WindowsFactory.createButton() → WindowsButton",
    highlightLine: 16,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "idle" },
        { ...button, status: "highlighted", state: { style: "Windows" } },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "button", method: "new WindowsButton()", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.3" },
    highlightLine: 17,
  };

  // Step 6: Create Checkbox
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "active" },
        { ...button, status: "idle" },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "client", to: "factory", method: "createCheckbox()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.4" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "active" },
        { ...button, status: "idle" },
        { ...checkbox, status: "active" },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "checkbox", method: "new WindowsCheckbox()", args: [], status: "active" },
      ],
    },
    description: "WindowsFactory.createCheckbox() → WindowsCheckbox",
    highlightLine: 21,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "idle" },
        { ...button, status: "idle" },
        { ...checkbox, status: "highlighted", state: { style: "Windows" } },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "checkbox", method: "new WindowsCheckbox()", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.5" },
    highlightLine: 22,
  };

  // Step 9: Create Dropdown
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "active" },
        { ...button, status: "idle" },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "idle" },
      ],
      messages: [
        { from: "client", to: "factory", method: "createDropdown()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.6" },
    highlightLine: 25,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "active" },
        { ...button, status: "idle" },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "active" },
      ],
      messages: [
        { from: "factory", to: "dropdown", method: "new WindowsDropdown()", args: [], status: "active" },
      ],
    },
    description: "WindowsFactory.createDropdown() → WindowsDropdown",
    highlightLine: 26,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "idle" },
        { ...button, status: "idle" },
        { ...checkbox, status: "idle" },
        { ...dropdown, status: "highlighted", state: { style: "Windows" } },
      ],
      messages: [
        { from: "factory", to: "dropdown", method: "new WindowsDropdown()", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.7" },
    highlightLine: 27,
  };

  // Step 12: Switch to Mac Factory
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...factory, status: "highlighted", state: { type: "MacFactory" } },
        { ...button, status: "idle", state: { style: "Mac" } },
        { ...checkbox, status: "idle", state: { style: "Mac" } },
        { ...dropdown, status: "idle", state: { style: "Mac" } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.8" },
    highlightLine: 30,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...factory, status: "idle" },
        { ...button, status: "idle", state: { style: "Mac" } },
        { ...checkbox, status: "idle", state: { style: "Mac" } },
        { ...dropdown, status: "idle", state: { style: "Mac" } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.abstract-factory.frames.9" },
    highlightLine: 30,
  };
}

/** Code snippet */
export const abstractFactoryCode = `// Abstract Factory
interface GUIFactory {
  createButton(): Button;      // ← create button
  createCheckbox(): Checkbox; // ← create checkbox
}

// Concrete Factory 1
class WindowsFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();  // ← Windows style button
  }

  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }
}

// Concrete Factory 2
class MacFactory implements GUIFactory {
  createButton(): Button {
    return new MacButton();      // ← Mac style button
  }

  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }
}

// Abstract Products
interface Button {
  render(): void;
}

interface Checkbox {
  render(): void;
}

// Concrete Products
class WindowsButton implements Button {
  render(): void { console.log("Windows Button"); }
}

class MacButton implements Button {
  render(): void { console.log("Mac Button"); }
}

// Client
class Application {
  constructor(private factory: GUIFactory) {}

  renderUI(): void {
    const btn = this.factory.createButton();
    const cb = this.factory.createCheckbox();
    btn.render();
    cb.render();
  }
}

// Usage
const factory = new WindowsFactory();  // ← select factory
const app = new Application(factory);
app.renderUI();`;

export const abstractFactoryCodeLines = [
  "// Abstract Factory",
  "interface GUIFactory {",
  "  createButton(): Button;      // ← create button",
  "  createCheckbox(): Checkbox; // ← create checkbox",
  "}",
  "",
  "// Concrete Factory 1",
  "class WindowsFactory implements GUIFactory {",
  "  createButton(): Button {",
  "    return new WindowsButton();  // ← Windows style button",
  "  }",
  "",
  "  createCheckbox(): Checkbox {",
  "    return new WindowsCheckbox();",
  "  }",
  "}",
  "",
  "// Concrete Factory 2",
  "class MacFactory implements GUIFactory {",
  "  createButton(): Button {",
  "    return new MacButton();      // ← Mac style button",
  "  }",
  "",
  "  createCheckbox(): Checkbox {",
  "    return new MacCheckbox();",
  "  }",
  "}",
  "",
  "// Abstract Products",
  "interface Button {",
  "  render(): void;",
  "}",
  "",
  "interface Checkbox {",
  "  render(): void;",
  "}",
  "",
  "// Concrete Products",
  "class WindowsButton implements Button {",
  "  render(): void { console.log('Windows Button'); }",
  "}",
  "",
  "class MacButton implements Button {",
  "  render(): void { console.log('Mac Button'); }",
  "}",
  "",
  "// Client",
  "class Application {",
  "  constructor(private factory: GUIFactory) {}",
  "",
  "  renderUI(): void {",
  "    const btn = this.factory.createButton();",
  "    const cb = this.factory.createCheckbox();",
  "    btn.render();",
  "    cb.render();",
  "  }",
  "}",
  "",
  "// Usage",
  "const factory = new WindowsFactory();  // ← select factory",
  "const app = new Application(factory);",
  "app.renderUI();",
];

const abstractFactoryDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "abstractFactory",
      name: "AbstractFactory",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "createProductA", params: "", returnType: "AbstractProductA" },
        { visibility: "+", name: "createProductB", params: "", returnType: "AbstractProductB" },
      ],
      position: { x: 300, y: 80 },
    },
    {
      id: "concreteFactory1",
      name: "ConcreteFactory1",
      attributes: [],
      methods: [
        { visibility: "+", name: "createProductA", params: "", returnType: "ProductA1" },
        { visibility: "+", name: "createProductB", params: "", returnType: "ProductB1" },
      ],
      position: { x: 80, y: 240 },
    },
    {
      id: "concreteFactory2",
      name: "ConcreteFactory2",
      attributes: [],
      methods: [
        { visibility: "+", name: "createProductA", params: "", returnType: "ProductA2" },
        { visibility: "+", name: "createProductB", params: "", returnType: "ProductB2" },
      ],
      position: { x: 300, y: 240 },
    },
    {
      id: "abstractProductA",
      name: "AbstractProductA",
      stereotype: "«interface»",
      attributes: [],
      methods: [],
      position: { x: 80, y: 400 },
    },
    {
      id: "abstractProductB",
      name: "AbstractProductB",
      stereotype: "«interface»",
      attributes: [],
      methods: [],
      position: { x: 300, y: 400 },
    },
    {
      id: "productA1",
      name: "ProductA1",
      attributes: [],
      methods: [],
      position: { x: 80, y: 560 },
    },
    {
      id: "productA2",
      name: "ProductA2",
      attributes: [],
      methods: [],
      position: { x: 190, y: 560 },
    },
    {
      id: "productB1",
      name: "ProductB1",
      attributes: [],
      methods: [],
      position: { x: 300, y: 560 },
    },
    {
      id: "productB2",
      name: "ProductB2",
      attributes: [],
      methods: [],
      position: { x: 410, y: 560 },
    },
  ],
  relationships: [
    { from: "concreteFactory1", to: "abstractFactory", type: "implements" },
    { from: "concreteFactory2", to: "abstractFactory", type: "implements" },
    { from: "productA1", to: "abstractProductA", type: "implements" },
    { from: "productA2", to: "abstractProductA", type: "implements" },
    { from: "productB1", to: "abstractProductB", type: "implements" },
    { from: "productB2", to: "abstractProductB", type: "implements" },
    { from: "abstractFactory", to: "abstractProductA", type: "dependency" },
    { from: "abstractFactory", to: "abstractProductB", type: "dependency" },
  ],
};

export const abstractFactoryContent = {
  id: "abstract-factory",
  slug: "abstract-factory",
  title: "",
  titleKey: "content.patterns.abstract-factory.title",
  category: "pattern" as const,
  subcategory: "creational",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.abstract-factory.desc",
  defaultInput: undefined,
  generator: abstractFactoryGenerator,
  code: abstractFactoryCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  icon: "🏭",
  diagram: abstractFactoryDiagram,
  codeExamples: {
    typescript: {
      code: `interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

interface Button { render(): void; }
interface Checkbox { render(): void; }

class WindowsFactory implements GUIFactory {
  createButton(): Button { return new WindowsButton(); }
  createCheckbox(): Checkbox { return new WindowsCheckbox(); }
}

class MacFactory implements GUIFactory {
  createButton(): Button { return new MacButton(); }
  createCheckbox(): Checkbox { return new MacCheckbox(); }
}

class WindowsButton implements Button {
  render(): void { console.log("Windows Button"); }
}

class Application {
  constructor(private factory: GUIFactory) {}
  renderUI(): void {
    const btn = this.factory.createButton();
    btn.render();
  }
}

const factory = new WindowsFactory();
const app = new Application(factory);
app.renderUI();`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct Button Button;
typedef struct Checkbox Checkbox;

typedef struct Factory Factory;
struct Factory {
  Button* (*createButton)(void);
  Checkbox* (*createCheckbox)(void);
};

struct Button { void (*render)(Button*); };
struct Checkbox { void (*render)(Checkbox*); };

Button* windows_create_button(void) {
  printf("Windows Button\\n");
  return NULL;
}

Factory windows_factory = { windows_create_button, NULL };

int main(void) {
  Factory* factory = &windows_factory;
  factory->createButton();
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

struct Button { virtual ~Button() = default; virtual void render() = 0; };
struct Checkbox { virtual ~Checkbox() = default; virtual void render() = 0; };

struct WindowsButton : Button {
  void render() override { std::cout << "Windows Button\\n"; }
};

struct GUIFactory {
  virtual std::unique_ptr<Button> createButton() = 0;
  virtual std::unique_ptr<Checkbox> createCheckbox() = 0;
  virtual ~GUIFactory() = default;
};

struct WindowsFactory : GUIFactory {
  std::unique_ptr<Button> createButton() override {
    return std::make_unique<WindowsButton>();
  }
  std::unique_ptr<Checkbox> createCheckbox() override { return nullptr; }
};

int main() {
  std::unique_ptr<GUIFactory> factory = std::make_unique<WindowsFactory>();
  auto btn = factory->createButton();
  btn->render();
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class Button(ABC):
    @abstractmethod
    def render(self):
        pass

class Checkbox(ABC):
    @abstractmethod
    def render(self):
        pass

class WindowsButton(Button):
    def render(self):
        print("Windows Button")

class MacButton(Button):
    def render(self):
        print("Mac Button")

class GUIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button:
        pass

    @abstractmethod
    def create_checkbox(self) -> Checkbox:
        pass

class WindowsFactory(GUIFactory):
    def create_button(self) -> Button:
        return WindowsButton()
    def create_checkbox(self) -> Checkbox:
        return None

class Application:
    def __init__(self, factory: GUIFactory):
        self.factory = factory

    def render_ui(self):
        btn = self.factory.create_button()
        btn.render()

factory = WindowsFactory()
app = Application(factory)
app.render_ui()`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Button { fn render(&self); }
trait Checkbox { fn render(&self); }

struct WindowsButton;
struct MacButton;

impl Button for WindowsButton {
    fn render(&self) { println!("Windows Button"); }
}

trait GUIFactory {
    fn create_button(&self) -> Box<dyn Button>;
    fn create_checkbox(&self) -> Box<dyn Checkbox>;
}

struct WindowsFactory;

impl GUIFactory for WindowsFactory {
    fn create_button(&self) -> Box<dyn Button> {
        Box::new(WindowsButton)
    }
    fn create_checkbox(&self) -> Box<dyn Checkbox> {
        todo!()
    }
}

fn main() {
    let factory = WindowsFactory;
    let btn = factory.create_button();
    btn.render();
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Button interface { Render() }
type Checkbox interface { Render() }

type WindowsButton struct{}
func (b WindowsButton) Render() { fmt.Println("Windows Button") }

type GUIFactory interface {
    CreateButton() Button
    CreateCheckbox() Checkbox
}

type WindowsFactory struct{}

func (WindowsFactory) CreateButton() Button { return WindowsButton{} }
func (WindowsFactory) CreateCheckbox() Checkbox { return nil }

type Application struct{ factory GUIFactory }

func (a Application) RenderUI() {
    btn := a.factory.CreateButton()
    btn.Render()
}

func main() {
    var factory GUIFactory = WindowsFactory{}
    app := Application{factory: factory}
    app.RenderUI()
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface Button { void render(); }
public interface Checkbox { void render(); }

public class WindowsButton implements Button {
    public void render() { System.out.println("Windows Button"); }
}

public interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

public class WindowsFactory implements GUIFactory {
    public Button createButton() { return new WindowsButton(); }
    public Checkbox createCheckbox() { return null; }
}

public class Application {
    private GUIFactory factory;
    public Application(GUIFactory factory) { this.factory = factory; }
    public void renderUI() {
        Button btn = factory.createButton();
        btn.render();
    }
}

public class Main {
    public static void main(String[] args) {
        GUIFactory factory = new WindowsFactory();
        Application app = new Application(factory);
        app.renderUI();
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
      id: "swing-laf",
      i18nKey: "content.patterns.abstract-factory.scenarios.swing-laf",
      domain: "ui-framework",
      icon: "🎨",
      reference: "Java Swing, UIManager, Metal/Windows/Motif/Nimbus L&F",
      codeSnippet: {
        language: "java",
        code: `// Swing UIManager — Abstract Factory for Look-and-Feel families
UIManager.setLookAndFeel(
    "javax.swing.plaf.metal.MetalLookAndFeel");

// Each L&F family (Metal, Windows, Motif, Nimbus) acts as
// a concrete factory creating styled Button, TextField, Menu, etc.
JButton btn = new JButton("Click");  // → Metal-styled button`,
      },
    },
    {
      id: "jdbc-driver-family",
      i18nKey: "content.patterns.abstract-factory.scenarios.jdbc-driver-family",
      domain: "database",
      icon: "🛢️",
      reference: "JDBC, PostgreSQL, MySQL, Oracle, SQL Server drivers",
    },
    {
      id: "dotnet-db-provider",
      i18nKey: "content.patterns.abstract-factory.scenarios.dotnet-db-provider",
      domain: "system",
      icon: "📦",
      reference: ".NET, DbProviderFactory, Entity Framework, Dapper",
    },
  ] satisfies Scenario[],
};
