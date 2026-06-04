import type { Frame, InteractionState, Scenario, UMLClassDiagram } from "@codeprism/core";

export function* templateMethodGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  const abstractCar = { id: 'abstract', name: 'AbstractCarBuilder', type: 'AbstractClass', state: {}, position: { x: 300, y: 50 }, status: 'idle' as const };
  const sportsCar = { id: 'sports', name: 'SportsCarBuilder', type: 'ConcreteClass', state: {}, position: { x: 100, y: 180 }, status: 'idle' as const };
  const suvCar = { id: 'suv', name: 'SUVBuilder', type: 'ConcreteClass', state: {}, position: { x: 500, y: 180 }, status: 'idle' as const };
  const chassis = { id: 'chassis', name: 'Chassis', type: 'Part', state: {}, position: { x: 200, y: 300 }, status: 'idle' as const };
  const engine = { id: 'engine', name: 'Engine', type: 'Part', state: {}, position: { x: 400, y: 300 }, status: 'idle' as const };

  yield { step: 1, state: { objects: [abstractCar, sportsCar, suvCar, chassis, engine], messages: [] }, description: 'Two car builders use the same template', highlightLine: 1 };
  yield { step: 2, state: { objects: [abstractCar, sportsCar, suvCar, chassis, engine], messages: [{ from: 'sportsCar', to: 'abstractCar', method: 'build()', args: [], status: 'pending' as const }] }, description: 'SportsCarBuilder calls build() template method', highlightLine: 3 };
  yield { step: 3, state: { objects: [{ ...abstractCar, status: 'active' }, sportsCar, suvCar, chassis, engine], messages: [{ from: 'abstractCar', to: 'sportsCar', method: 'buildChassis()', args: [], status: 'pending' as const }] }, description: 'Template method calls buildChassis() step', highlightLine: 4 };
  yield { step: 4, state: { objects: [abstractCar, { ...sportsCar, status: 'active' }, suvCar, chassis, engine], messages: [{ from: 'sportsCar', to: 'chassis', method: 'assemble()', args: [], status: 'pending' as const }] }, description: 'SportsCar builds lightweight chassis', highlightLine: 7 };
  yield { step: 5, state: { objects: [abstractCar, sportsCar, suvCar, { ...chassis, status: 'active' }, engine], messages: [{ from: 'abstractCar', to: 'sportsCar', method: 'buildEngine()', args: [], status: 'pending' as const }] }, description: 'Template method calls buildEngine() step', highlightLine: 5 };
  yield { step: 6, state: { objects: [abstractCar, sportsCar, suvCar, chassis, { ...engine, status: 'active' }], messages: [{ from: 'sportsCar', to: 'engine', method: 'assemble()', args: [], status: 'pending' as const }] }, description: 'SportsCar installs V8 engine', highlightLine: 13 };
  yield { step: 7, state: { objects: [{ ...sportsCar, status: 'highlighted' }, abstractCar, suvCar, chassis, engine], messages: [{ from: 'abstractCar', to: 'sportsCar', method: 'paint()', args: [], status: 'pending' as const }] }, description: 'SportsCar gets custom paint (red)', highlightLine: 15 };
  yield { step: 8, state: { objects: [{ ...sportsCar, status: 'active' }, abstractCar, suvCar, chassis, engine], messages: [{ from: 'abstractCar', to: 'sportsCar', method: 'build()', args: [], status: 'complete' as const }] }, description: 'Sports car assembly complete!', highlightLine: 3 };
}

export const templateMethodCode = `abstract class CarBuilder {
  build(): Car {
    this.buildChassis();
    this.buildEngine();
    this.buildBody();
    return this.getResult();
  }

  protected abstract buildChassis(): void;
  protected abstract buildEngine(): void;

  protected buildBody(): void {
    console.log('Building standard body');
  }

  protected abstract getResult(): Car;
}

class SportsCarBuilder extends CarBuilder {
  protected buildChassis(): void {
    console.log('Building lightweight carbon fiber chassis');
  }

  protected buildEngine(): void {
    console.log('Installing V8 twin-turbo engine');
  }

  protected getResult(): Car {
    return new Car('Sports Car');
  }
}

class SUVBuilder extends CarBuilder {
  protected buildChassis(): void {
    console.log('Building reinforced steel chassis');
  }

  protected buildEngine(): void {
    console.log('Installing V6 diesel engine');
  }

  protected getResult(): Car {
    return new Car('SUV');
  }
}

class Car {
  constructor(public type: string) {}
}

// Usage
const sportsBuilder = new SportsCarBuilder();
const sportsCar = sportsBuilder.build();

const suvBuilder = new SUVBuilder();
const suv = suvBuilder.build();`;

export const templateMethodCodeLines = [
  "abstract class CarBuilder {",
  "  build(): Car {",
  "    this.buildChassis();",
  "    this.buildEngine();",
  "    this.buildBody();",
  "    return this.getResult();",
  "  }",
  "",
  "  protected abstract buildChassis(): void;",
  "  protected abstract buildEngine(): void;",
  "",
  "  protected buildBody(): void {",
  "    console.log('Building standard body');",
  "  }",
  "",
  "  protected abstract getResult(): Car;",
  "}",
  "",
  "class SportsCarBuilder extends CarBuilder {",
  "  protected buildChassis(): void {",
  "    console.log('Building lightweight carbon fiber chassis');",
  "  }",
  "",
  "  protected buildEngine(): void {",
  "    console.log('Installing V8 twin-turbo engine');",
  "  }",
  "",
  "  protected getResult(): Car {",
  "    return new Car('Sports Car');",
  "  }",
  "}",
  "",
  "class SUVBuilder extends CarBuilder {",
  "  protected buildChassis(): void {",
  "    console.log('Building reinforced steel chassis');",
  "  }",
  "",
  "  protected buildEngine(): void {",
  "    console.log('Installing V6 diesel engine');",
  "  }",
  "",
  "  protected getResult(): Car {",
  "    return new Car('SUV');",
  "  }",
  "}",
  "",
  "class Car {",
  "  constructor(public type: string) {}",
  "}",
  "",
  "// Usage",
  "const sportsBuilder = new SportsCarBuilder();",
  "const sportsCar = sportsBuilder.build();",
  "",
  "const suvBuilder = new SUVBuilder();",
  "const suv = suvBuilder.build();",
];

const templateMethodDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "AbstractClass",
      name: "AbstractClass",
      stereotype: "«abstract»",
      attributes: [],
      methods: [
        { visibility: "+", name: "templateMethod", params: "", returnType: "void" },
        { visibility: "+", name: "primitiveOperation1", params: "", returnType: "void" },
        { visibility: "+", name: "primitiveOperation2", params: "", returnType: "void" },
      ],
      position: { x: 350, y: 50 },
    },
    {
      id: "ConcreteClass",
      name: "ConcreteClass",
      attributes: [],
      methods: [
        { visibility: "+", name: "primitiveOperation1", params: "", returnType: "void" },
        { visibility: "+", name: "primitiveOperation2", params: "", returnType: "void" },
      ],
      position: { x: 350, y: 250 },
    },
  ],
  relationships: [
    { from: "ConcreteClass", to: "AbstractClass", type: "extends" },
  ],
};

export const templateMethodContent = {
  id: "template-method",
  slug: "template-method",
  title: "",
  titleKey: "content.patterns.template-method.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.template-method.desc",
  defaultInput: undefined,
  code: templateMethodCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(n)",
  },
  tags: [],
  diagram: templateMethodDiagram,
  icon: "📋",
  codeExamples: {
    typescript: {
      code: `abstract class CarBuilder {
  build(): void {
    this.buildChassis();
    this.buildEngine();
    this.buildBody();
    this.hook();
  }

  protected abstract buildChassis(): void;
  protected abstract buildEngine(): void;
  protected buildBody(): void {
    console.log("Building standard body");
  }
  protected hook(): void {}
}

class SportsCarBuilder extends CarBuilder {
  protected buildChassis(): void {
    console.log("Building lightweight chassis");
  }
  protected buildEngine(): void {
    console.log("Installing V8 engine");
  }
}

class SUVBuilder extends CarBuilder {
  protected buildChassis(): void {
    console.log("Building reinforced chassis");
  }
  protected buildEngine(): void {
    console.log("Installing V6 engine");
  }
}

new SportsCarBuilder().build();
new SUVBuilder().build();`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct {
  void (*buildChassis)();
  void (*buildEngine)();
} CarBuilder;

void build_body() { printf("Building standard body\\n"); }

void build_sports_chassis() { printf("Building lightweight chassis\\n"); }
void build_sports_engine() { printf("Installing V8 engine\\n"); }

void build_suv_chassis() { printf("Building reinforced chassis\\n"); }
void build_suv_engine() { printf("Installing V6 engine\\n"); }

void build(CarBuilder* b) {
  b->buildChassis();
  b->buildEngine();
  build_body();
}

int main(void) {
  CarBuilder sports = {build_sports_chassis, build_sports_engine};
  CarBuilder suv = {build_suv_chassis, build_suv_engine};
  build(&sports);
  build(&suv);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>

class CarBuilder {
public:
  void build() {
    buildChassis();
    buildEngine();
    buildBody();
    hook();
  }
  virtual ~CarBuilder() = default;
protected:
  virtual void buildChassis() = 0;
  virtual void buildEngine() = 0;
  virtual void buildBody() { std::cout << "Building standard body\\n"; }
  virtual void hook() {}
};

class SportsCarBuilder : public CarBuilder {
protected:
  void buildChassis() override { std::cout << "Building lightweight chassis\\n"; }
  void buildEngine() override { std::cout << "Installing V8 engine\\n"; }
};

class SUVBuilder : public CarBuilder {
protected:
  void buildChassis() override { std::cout << "Building reinforced chassis\\n"; }
  void buildEngine() override { std::cout << "Installing V6 engine\\n"; }
};

int main() {
  SportsCarBuilder().build();
  SUVBuilder().build();
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class CarBuilder(ABC):
    def build(self):
        self.build_chassis()
        self.build_engine()
        self.build_body()
        self.hook()

    @abstractmethod
    def build_chassis(self): pass

    @abstractmethod
    def build_engine(self): pass

    def build_body(self):
        print("Building standard body")

    def hook(self): pass

class SportsCarBuilder(CarBuilder):
    def build_chassis(self):
        print("Building lightweight chassis")

    def build_engine(self):
        print("Installing V8 engine")

class SUVBuilder(CarBuilder):
    def build_chassis(self):
        print("Building reinforced chassis")

    def build_engine(self):
        print("Installing V6 engine")

SportsCarBuilder().build()
SUVBuilder().build()`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait CarBuilder {
    fn build(&self) {
        self.build_chassis();
        self.build_engine();
        self.build_body();
    }
    fn build_chassis(&self);
    fn build_engine(&self);
    fn build_body(&self) { println!("Building standard body"); }
}

struct SportsCarBuilder;
impl CarBuilder for SportsCarBuilder {
    fn build_chassis(&self) { println!("Building lightweight chassis"); }
    fn build_engine(&self) { println!("Installing V8 engine"); }
}

struct SUVBuilder;
impl CarBuilder for SUVBuilder {
    fn build_chassis(&self) { println!("Building reinforced chassis"); }
    fn build_engine(&self) { println!("Installing V6 engine"); }
}

fn main() {
    SportsCarBuilder.build();
    SUVBuilder.build();
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type CarBuilder interface {
    Build()
    BuildChassis()
    BuildEngine()
    BuildBody()
}

type BaseCarBuilder struct{}

func (BaseCarBuilder) BuildBody() { fmt.Println("Building standard body") }

type SportsCarBuilder struct{ BaseCarBuilder }

func (SportsCarBuilder) Build() {
    fmt.Println("Building lightweight chassis")
    fmt.Println("Installing V8 engine")
    fmt.Println("Building standard body")
}
func (SportsCarBuilder) BuildChassis() {}
func (SportsCarBuilder) BuildEngine()  {}

func main() {
    SportsCarBuilder{}.Build()
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public class Main {
    static abstract class CarBuilder {
        public final void build() {
            buildChassis();
            buildEngine();
            buildBody();
            hook();
        }
        protected abstract void buildChassis();
        protected abstract void buildEngine();
        protected void buildBody() { System.out.println("Building standard body"); }
        protected void hook() {}
    }

    static class SportsCarBuilder extends CarBuilder {
        protected void buildChassis() { System.out.println("Building lightweight chassis"); }
        protected void buildEngine() { System.out.println("Installing V8 engine"); }
    }

    static class SUVBuilder extends CarBuilder {
        protected void buildChassis() { System.out.println("Building reinforced chassis"); }
        protected void buildEngine() { System.out.println("Installing V6 engine"); }
    }

    public static void main(String[] args) {
        new SportsCarBuilder().build();
        new SUVBuilder().build();
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — frameworks that define skeletons
  // and let user code fill in the steps.
  scenarios: [
    {
      id: "java-servlet",
      i18nKey: "content.patterns.template-method.scenarios.java-servlet",
      domain: "library",
      icon: "☕",
      reference: "Java Servlet API, Jakarta EE, Spring MVC",
      codeSnippet: {
        language: "java",
        code: `// HttpServlet defines the template — subclasses override doGet/doPost
@WebServlet("/api/users")
public class UserServlet extends HttpServlet {
  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    // Called by service() template method
    resp.getWriter().write("Fetching users...");
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
    // Called by service() template method
    resp.getWriter().write("Creating user...");
  }
}`,
      },
    },
    {
      id: "junit-lifecycle",
      i18nKey: "content.patterns.template-method.scenarios.junit-lifecycle",
      domain: "devtools",
      icon: "🧪",
      reference: "JUnit 5, pytest fixtures, Mocha hooks",
    },
    {
      id: "spring-jdbc",
      i18nKey: "content.patterns.template-method.scenarios.spring-jdbc",
      domain: "database",
      icon: "🗄️",
      reference: "Spring JdbcTemplate, Spring Data JDBC, Hibernate Template",
    },
  ] satisfies Scenario[],
};


