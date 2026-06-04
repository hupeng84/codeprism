import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Bridge Pattern — Frame Generator
 * shape + color abstraction separation
 */
export function* bridgeGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const colorImplPos = { x: 300, y: 280 };

  // Objects
  const circle: PatternObject = {
    id: "circle",
    name: "Circle",
    type: "Abstraction",
    state: { color: "none" },
    position: { x: 150, y: 200 },
    status: "idle",
  };

  const square: PatternObject = {
    id: "square",
    name: "Square",
    type: "Abstraction",
    state: { color: "none" },
    position: { x: 350, y: 200 },
    status: "idle",
  };

  const colorBridge: PatternObject = {
    id: "colorBridge",
    name: "ColorImplementor",
    type: "Implementor",
    state: { role: "color abstraction" },
    position: colorImplPos,
    status: "idle",
  };

  const redCircle: PatternObject = {
    id: "redCircle",
    name: "RedCircle",
    type: "RefinedAbstraction",
    state: { shape: "Circle", color: "Red" },
    position: { x: 550, y: 100 },
    status: "idle",
  };

  const blueSquare: PatternObject = {
    id: "blueSquare",
    name: "BlueSquare",
    type: "RefinedAbstraction",
    state: { shape: "Square", color: "Blue" },
    position: { x: 550, y: 250 },
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...circle },
        { ...square },
        { ...colorBridge },
        { ...redCircle },
        { ...blueSquare },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Create Circle with Red color
  yield {
    step: step++,
    state: {
      objects: [
        { ...circle, status: "active" },
        { ...square, status: "idle" },
        { ...colorBridge, status: "idle" },
        { ...redCircle, status: "idle" },
        { ...blueSquare, status: "idle" },
      ],
      messages: [
        { from: "circle", to: "colorBridge", method: "setColor(Red)", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.bridge.frames.0" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...circle, status: "highlighted", state: { color: "Red" } },
        { ...square, status: "idle" },
        { ...colorBridge, status: "active" },
        { ...redCircle, status: "idle" },
        { ...blueSquare, status: "idle" },
      ],
      messages: [
        { from: "colorBridge", to: "redCircle", method: "→ RedCircle", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.bridge.frames.1" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...circle, status: "idle" },
        { ...square, status: "idle" },
        { ...colorBridge, status: "idle" },
        { ...redCircle, status: "highlighted" },
        { ...blueSquare, status: "idle" },
      ],
      messages: [
        { from: "colorBridge", to: "redCircle", method: "→ RedCircle", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.bridge.frames.2" },
    highlightLine: 15,
  };

  // Step 4: Create Square with Blue color
  yield {
    step: step++,
    state: {
      objects: [
        { ...circle, status: "idle" },
        { ...square, status: "active" },
        { ...colorBridge, status: "idle" },
        { ...redCircle, status: "idle" },
        { ...blueSquare, status: "idle" },
      ],
      messages: [
        { from: "square", to: "colorBridge", method: "setColor(Blue)", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.bridge.frames.3" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...circle, status: "idle" },
        { ...square, status: "highlighted", state: { color: "Blue" } },
        { ...colorBridge, status: "active" },
        { ...redCircle, status: "idle" },
        { ...blueSquare, status: "idle" },
      ],
      messages: [
        { from: "colorBridge", to: "blueSquare", method: "→ BlueSquare", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.bridge.frames.4" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...circle, status: "idle" },
        { ...square, status: "idle" },
        { ...colorBridge, status: "idle" },
        { ...redCircle, status: "idle" },
        { ...blueSquare, status: "highlighted" },
      ],
      messages: [
        { from: "colorBridge", to: "blueSquare", method: "→ BlueSquare", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.bridge.frames.5" },
    highlightLine: 15,
  };

  // Step 7: Add new shape (Triangle) without modifying color system
  yield {
    step: step++,
    state: {
      objects: [
        { ...circle, status: "idle" },
        { ...square, status: "idle" },
        { ...colorBridge, status: "idle" },
        { ...redCircle, status: "idle" },
        { ...blueSquare, status: "idle" },
        { id: "greenTriangle", name: "GreenTriangle", type: "RefinedAbstraction", state: { shape: "Triangle", color: "Green" }, position: { x: 200, y: 320 }, status: "idle" } as PatternObject,
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.bridge.frames.6" },
    highlightLine: 25,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...circle, status: "idle" },
        { ...square, status: "idle" },
        { ...colorBridge, status: "idle" },
        { ...redCircle, status: "idle" },
        { ...blueSquare, status: "idle" },
        { id: "greenTriangle", name: "GreenTriangle", type: "RefinedAbstraction", state: { shape: "Triangle", color: "Green" }, position: { x: 200, y: 320 }, status: "highlighted" } as PatternObject,
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.bridge.frames.7" },
    highlightLine: 25,
  };
}

/** Code snippet */
export const bridgeCode = `// Implementor interface - color implementation
interface Color {
  fill(): string;  // ← implementation interface
}

// Concrete Implementors
class RedColor implements Color {
  fill(): string { return "red"; }
}

class BlueColor implements Color {
  fill(): string { return "blue"; }
}

// Abstraction - shape (abstraction)
class Shape {
  constructor(protected color: Color) {}  // ← bridge reference

  draw(): void {
    console.log(\`Drawing \${this.color.fill()} shape\`);
  }
}

// RefinedAbstraction - extended shape
class Circle extends Shape {
  constructor(color: Color) { super(color); }
}

class Square extends Shape {
  constructor(color: Color) { super(color); }
}

// Usage - independent composition
const redCircle = new Circle(new RedColor());
const blueSquare = new Square(new BlueColor());

redCircle.draw();   // Drawing red shape
blueSquare.draw();  // Drawing blue shape

// add new shapes or colors without modifying existing code
class Triangle extends Shape {
  constructor(color: Color) { super(color); }
}`;

export const bridgeCodeLines = [
  "// Implementor interface - color implementation",
  "interface Color {",
  "  fill(): string;  // ← implementation interface",
  "}",
  "",
  "// Concrete Implementors",
  "class RedColor implements Color {",
  "  fill(): string { return 'red'; }",
  "}",
  "",
  "class BlueColor implements Color {",
  "  fill(): string { return 'blue'; }",
  "}",
  "",
  "// Abstraction - shape (abstraction)",
  "class Shape {",
  "  constructor(protected color: Color) {}  // ← bridge reference",
  "",
  "  draw(): void {",
  "    console.log(`Drawing ${this.color.fill()} shape`);",
  "  }",
  "}",
  "",
  "// RefinedAbstraction - extended shape",
  "class Circle extends Shape {",
  "  constructor(color: Color) { super(color); }",
  "}",
  "",
  "class Square extends Shape {",
  "  constructor(color: Color) { super(color); }",
  "}",
  "",
  "// Usage - independent composition",
  "const redCircle = new Circle(new RedColor());",
  "const blueSquare = new Square(new BlueColor());",
  "",
  "redCircle.draw();   // Drawing red shape",
  "blueSquare.draw();  // Drawing blue shape",
  "",
  "// add new shapes or colors without modifying existing code",
  "class Triangle extends Shape {",
  "  constructor(color: Color) { super(color); }",
  "}",
];

const bridgeDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "abstraction",
      name: "Abstraction",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 100, y: 50 },
    },
    {
      id: "refinedAbstraction",
      name: "RefinedAbstraction",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 100, y: 200 },
    },
    {
      id: "implementor",
      name: "Implementor",
      stereotype: "interface",
      attributes: [],
      methods: [{ visibility: "+", name: "operationImpl()", params: "", returnType: "void" }],
      position: { x: 400, y: 50 },
    },
    {
      id: "concreteImplementorA",
      name: "ConcreteImplementorA",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operationImpl()", params: "", returnType: "void" }],
      position: { x: 400, y: 200 },
    },
    {
      id: "concreteImplementorB",
      name: "ConcreteImplementorB",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operationImpl()", params: "", returnType: "void" }],
      position: { x: 600, y: 200 },
    },
  ],
  relationships: [
    { from: "refinedAbstraction", to: "abstraction", type: "extends" },
    { from: "abstraction", to: "implementor", type: "association", label: "has" },
    { from: "concreteImplementorA", to: "implementor", type: "implements" },
    { from: "concreteImplementorB", to: "implementor", type: "implements" },
  ],
};

export const bridgeContent = {
  id: "bridge",
  slug: "bridge",
  title: "",
  titleKey: "content.patterns.bridge.title",
  category: "pattern" as const,
  subcategory: "structural",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.bridge.desc",
  defaultInput: undefined,
  generator: bridgeGenerator,
  code: bridgeCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(1)",
  },
  tags: [],
  icon: "🌉",
  diagram: bridgeDiagram,
  codeExamples: {
    typescript: {
      code: `interface Color {
  fill(): string;
}

class RedColor implements Color {
  fill(): string { return "red"; }
}

class BlueColor implements Color {
  fill(): string { return "blue"; }
}

class Shape {
  constructor(protected color: Color) {}
  draw(): void {
    console.log(\`Drawing \${this.color.fill()} shape\`);
  }
}

class Circle extends Shape {
  constructor(color: Color) { super(color); }
}

class Square extends Shape {
  constructor(color: Color) { super(color); }
}

const redCircle = new Circle(new RedColor());
const blueSquare = new Square(new BlueColor());

redCircle.draw();
blueSquare.draw();`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct Color Color;
typedef struct Shape Shape;

struct Color {
  const char* (*fill)(Color*);
};

struct Shape {
  Color* color;
  void (*draw)(Shape*);
};

const char* red_fill(Color* c) { return "red"; }
const char* blue_fill(Color* c) { return "blue"; }

Color red_color = { red_fill };
Color blue_color = { blue_fill };

void shape_draw(Shape* s) {
  printf("Drawing %s shape\\n", s->color->fill(s->color));
}

int main(void) {
  Shape circle = { &red_color, shape_draw };
  circle.draw(&circle);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

struct Color {
  virtual std::string fill() = 0;
  virtual ~Color() = default;
};

struct RedColor : Color {
  std::string fill() override { return "red"; }
};

struct BlueColor : Color {
  std::string fill() override { return "blue"; }
};

struct Shape {
  std::unique_ptr<Color> color;
  Shape(Color* c) : color(c) {}
  virtual void draw() {
    std::cout << "Drawing " << color->fill() << " shape\\n";
  }
};

struct Circle : Shape {
  Circle(Color* c) : Shape(c) {}
};

int main() {
  std::unique_ptr<Shape> circle = std::make_unique<Circle>(new RedColor());
  circle->draw();
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class Color(ABC):
    @abstractmethod
    def fill(self) -> str:
        pass

class RedColor(Color):
    def fill(self) -> str:
        return "red"

class BlueColor(Color):
    def fill(self) -> str:
        return "blue"

class Shape:
    def __init__(self, color: Color):
        self.color = color

    def draw(self):
        print(f"Drawing {self.color.fill()} shape")

class Circle(Shape):
    pass

red_circle = Circle(RedColor())
red_circle.draw()`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Color {
    fn fill(&self) -> &'static str;
}

struct RedColor;
struct BlueColor;

impl Color for RedColor {
    fn fill(&self) -> &'static str { "red" }
}

impl Color for BlueColor {
    fn fill(&self) -> &'static str { "blue" }
}

trait Drawable {
    fn draw(&self);
}

struct Circle<'a> {
    color: &'a dyn Color,
}

impl<'a> Drawable for Circle<'a> {
    fn draw(&self) {
        println!("Drawing {} shape", self.color.fill());
    }
}

fn main() {
    let red = RedColor;
    let circle = Circle { color: &red };
    circle.draw();
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Color interface {
    Fill() string
}

type RedColor struct{}
func (c RedColor) Fill() string { return "red" }

type BlueColor struct{}
func (c BlueColor) Fill() string { return "blue" }

type Shape struct {
    color Color
}

func (s Shape) Draw() {
    fmt.Printf("Drawing %s shape\\n", s.color.Fill())
}

type Circle struct {
    Shape
}

func main() {
    red := RedColor{}
    circle := Circle{Shape{color: red}}
    circle.Draw()
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface Color {`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "jdbc-drivers",
      i18nKey: "content.patterns.bridge.scenarios.jdbc-drivers",
      domain: "database",
      icon: "🗄️",
      reference: "JDBC, MySQL Connector, PostgreSQL pgJDBC, H2 Database",
      codeSnippet: {
        language: "java",
        code: `// One JDBC API bridges every database driver
Connection conn;
if (usePostgres) {
  conn = DriverManager.getConnection("jdbc:postgresql://...");
} else {
  conn = DriverManager.getConnection("jdbc:mysql://...");
}
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT 1"); // same API, any DB`,
      },
    },
    {
      id: "graphics-api",
      i18nKey: "content.patterns.bridge.scenarios.graphics-api",
      domain: "graphics",
      icon: "🎨",
      reference: "OpenGL, DirectX, Vulkan, WebGL",
    },
    {
      id: "logger-backends",
      i18nKey: "content.patterns.bridge.scenarios.logger-backends",
      domain: "devtools",
      icon: "🔧",
      reference: "SLF4J, Log4j, Winston, Pino",
    },
  ] satisfies Scenario[],
};
