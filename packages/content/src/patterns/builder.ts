import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Builder Pattern — Frame Generator
 * house building scenario - Director, Builder, ConcreteBuilder
 */
export function* builderGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const directorPos = { x: 150, y: 200 };
  const builderPos = { x: 350, y: 200 };
  const housePos = { x: 550, y: 200 };

  // Objects
  const director: PatternObject = {
    id: "director",
    name: "ConstructionDirector",
    type: "Director",
    state: { currentBuilder: "HouseBuilder" },
    position: directorPos,
    status: "idle",
  };

  const houseBuilder: PatternObject = {
    id: "builder",
    name: "HouseBuilder",
    type: "Builder",
    state: { foundation: false, walls: false, roof: false },
    position: builderPos,
    status: "idle",
  };

  const house: PatternObject = {
    id: "house",
    name: "House",
    type: "Product",
    state: { type: "Basic House" },
    position: housePos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...director },
        { ...houseBuilder },
        { ...house },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Director receives order
  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "active" },
        { ...houseBuilder, status: "idle" },
        { ...house, status: "idle" },
      ],
      messages: [
        { from: "director", to: "builder", method: "buildHouse()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.0" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "active" },
        { ...houseBuilder, status: "active" },
        { ...house, status: "idle" },
      ],
      messages: [
        { from: "director", to: "builder", method: "buildFoundation()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.1" },
    highlightLine: 8,
  };

  // Step 3: Build foundation
  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "active" },
        { ...houseBuilder, status: "highlighted", state: { foundation: true, walls: false, roof: false } },
        { ...house, status: "idle" },
      ],
      messages: [
        { from: "builder", to: "house", method: "foundation = concrete", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.2" },
    highlightLine: 9,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "active" },
        { ...houseBuilder, status: "active" },
        { ...house, status: "idle" },
      ],
      messages: [
        { from: "director", to: "builder", method: "buildWalls()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.3" },
    highlightLine: 10,
  };

  // Step 5: Build walls
  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "active" },
        { ...houseBuilder, status: "highlighted", state: { foundation: true, walls: true, roof: false } },
        { ...house, status: "idle" },
      ],
      messages: [
        { from: "builder", to: "house", method: "walls = brick", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.4" },
    highlightLine: 11,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "active" },
        { ...houseBuilder, status: "active" },
        { ...house, status: "idle" },
      ],
      messages: [
        { from: "director", to: "builder", method: "buildRoof()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.5" },
    highlightLine: 12,
  };

  // Step 7: Build roof
  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "active" },
        { ...houseBuilder, status: "highlighted", state: { foundation: true, walls: true, roof: true } },
        { ...house, status: "idle" },
      ],
      messages: [
        { from: "builder", to: "house", method: "roof = tiles", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.6" },
    highlightLine: 13,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "idle" },
        { ...houseBuilder, status: "active" },
        { ...house, status: "idle" },
      ],
      messages: [
        { from: "director", to: "builder", method: "getResult()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.7" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "idle" },
        { ...houseBuilder, status: "idle" },
        { ...house, status: "highlighted", state: { type: "Basic House", foundation: "concrete", walls: "brick", roof: "tiles" } },
      ],
      messages: [
        { from: "builder", to: "house", method: "→ House", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.8" },
    highlightLine: 16,
  };

  // Step 10: Switch to IglooBuilder
  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "active" },
        { ...houseBuilder, status: "idle", state: { type: "IglooBuilder" } },
        { ...house, status: "idle", state: { type: "Igloo" } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.9" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...director, status: "idle" },
        { ...houseBuilder, status: "idle", state: { type: "IglooBuilder" } },
        { ...house, status: "highlighted", state: { type: "Igloo", foundation: "ice", walls: "ice blocks", roof: "ice dome" } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.builder.frames.10" },
    highlightLine: 20,
  };
}

/** Code snippet */
export const builderCode = `// Builder interface
interface HouseBuilder {
  buildFoundation(): void;  // ← build foundation
  buildWalls(): void;       // ← build walls
  buildRoof(): void;        // ← build roof
  getResult(): House;       // ← return final product
}

// ConcreteBuilder
class HouseBuilder implements HouseBuilder {
  private house = new House();

  buildFoundation(): void {
    console.log("Building concrete foundation");
    this.house.foundation = "concrete";
  }

  buildWalls(): void {
    console.log("Building brick walls");
    this.house.walls = "brick";
  }

  buildRoof(): void {
    console.log("Building tile roof");
    this.house.roof = "tiles";
  }

  getResult(): House {
    return this.house;
  }
}

// Director - direct construction order
class ConstructionDirector {
  construct(builder: HouseBuilder): House {
    builder.buildFoundation();  // ← fixed order
    builder.buildWalls();
    builder.buildRoof();
    return builder.getResult();
  }
}

// Usage
const director = new ConstructionDirector();
const builder = new HouseBuilder();
const house = director.construct(builder);  // ← build via Director`;

export const builderCodeLines = [
  "// Builder interface",
  "interface HouseBuilder {",
  "  buildFoundation(): void;  // ← build foundation",
  "  buildWalls(): void;       // ← build walls",
  "  buildRoof(): void;        // ← build roof",
  "  getResult(): House;       // ← return final product",
  "}",
  "",
  "// ConcreteBuilder",
  "class HouseBuilder implements HouseBuilder {",
  "  private house = new House();",
  "",
  "  buildFoundation(): void {",
  "    console.log('Building concrete foundation');",
  "    this.house.foundation = 'concrete';",
  "  }",
  "",
  "  buildWalls(): void {",
  "    console.log('Building brick walls');",
  "    this.house.walls = 'brick';",
  "  }",
  "",
  "  buildRoof(): void {",
  "    console.log('Building tile roof');",
  "    this.house.roof = 'tiles';",
  "  }",
  "",
  "  getResult(): House {",
  "    return this.house;",
  "  }",
  "}",
  "",
  "// Director - direct construction order",
  "class ConstructionDirector {",
  "  construct(builder: HouseBuilder): House {",
  "    builder.buildFoundation();  // ← fixed order",
  "    builder.buildWalls();",
  "    builder.buildRoof();",
  "    return builder.getResult();",
  "  }",
  "}",
  "",
  "// Usage",
  "const director = new ConstructionDirector();",
  "const builder = new HouseBuilder();",
  "const house = director.construct(builder);  // ← build via Director",
];

const builderDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "builder",
      name: "Builder",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "buildPartA", params: "", returnType: "void" },
        { visibility: "+", name: "buildPartB", params: "", returnType: "void" },
        { visibility: "+", name: "getResult", params: "", returnType: "Product" },
      ],
      position: { x: 80, y: 80 },
    },
    {
      id: "concreteBuilder",
      name: "ConcreteBuilder",
      attributes: [],
      methods: [
        { visibility: "+", name: "buildPartA", params: "", returnType: "void" },
        { visibility: "+", name: "buildPartB", params: "", returnType: "void" },
        { visibility: "+", name: "getResult", params: "", returnType: "Product" },
      ],
      position: { x: 80, y: 240 },
    },
    {
      id: "director",
      name: "Director",
      attributes: [],
      methods: [
        { visibility: "+", name: "construct", params: "", returnType: "void" },
      ],
      position: { x: 300, y: 80 },
    },
    {
      id: "product",
      name: "Product",
      attributes: [],
      methods: [],
      position: { x: 300, y: 240 },
    },
  ],
  relationships: [
    { from: "concreteBuilder", to: "builder", type: "implements" },
    { from: "director", to: "builder", type: "association", label: "uses" },
  ],
};

export const builderContent = {
  id: "builder",
  slug: "builder",
  title: "",
  titleKey: "content.patterns.builder.title",
  category: "pattern" as const,
  subcategory: "creational",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.builder.desc",
  defaultInput: undefined,
  generator: builderGenerator,
  code: builderCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  icon: "🏗️",
  diagram: builderDiagram,
  codeExamples: {
    typescript: {
      code: `interface HouseBuilder {
  buildFoundation(): void;
  buildWalls(): void;
  buildRoof(): void;
  getResult(): House;
}

class House {}

class HouseBuilder implements HouseBuilder {
  private house = new House();

  buildFoundation(): void { console.log("Building foundation"); }
  buildWalls(): void { console.log("Building walls"); }
  buildRoof(): void { console.log("Building roof"); }
  getResult(): House { return this.house; }
}

class ConstructionDirector {
  construct(builder: HouseBuilder): House {
    builder.buildFoundation();
    builder.buildWalls();
    builder.buildRoof();
    return builder.getResult();
  }
}

const director = new ConstructionDirector();
const builder = new HouseBuilder();
const house = director.construct(builder);`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct House House;

typedef struct Builder Builder;
struct Builder {
  void (*buildFoundation)(Builder*);
  void (*buildWalls)(Builder*);
  void (*buildRoof)(Builder*);
  House* (*getResult)(Builder*);
};

struct House { int rooms; };

void builder_build_foundation(Builder* b) { printf("Building foundation\\n"); }
void builder_build_walls(Builder* b) { printf("Building walls\\n"); }
void builder_build_roof(Builder* b) { printf("Building roof\\n"); }
House* builder_get_result(Builder* b) { static House h; h.rooms = 4; return &h; }

Builder create_builder(void) {
  return (Builder){
    builder_build_foundation,
    builder_build_walls,
    builder_build_roof,
    builder_get_result
  };
}

void construct(Builder* builder) {
  builder->buildFoundation(builder);
  builder->buildWalls(builder);
  builder->buildRoof(builder);
}

int main(void) {
  Builder b = create_builder();
  construct(&b);
  House* h = b.getResult(&b);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

class House {};

class HouseBuilder {
public:
  virtual void buildFoundation() = 0;
  virtual void buildWalls() = 0;
  virtual void buildRoof() = 0;
  virtual House getResult() = 0;
  virtual ~HouseBuilder() = default;
};

class ConcreteHouseBuilder : public HouseBuilder {
  House house;
public:
  void buildFoundation() override { std::cout << "Building foundation\\n"; }
  void buildWalls() override { std::cout << "Building walls\\n"; }
  void buildRoof() override { std::cout << "Building roof\\n"; }
  House getResult() override { return house; }
};

class ConstructionDirector {
public:
  House construct(HouseBuilder& builder) {
    builder.buildFoundation();
    builder.buildWalls();
    builder.buildRoof();
    return builder.getResult();
  }
};

int main() {
  ConcreteHouseBuilder builder;
  ConstructionDirector director;
  House h = director.construct(builder);
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class House:
    def __init__(self):
        self.rooms = 4

class HouseBuilder(ABC):
    @abstractmethod
    def build_foundation(self):
        pass

    @abstractmethod
    def build_walls(self):
        pass

    @abstractmethod
    def build_roof(self):
        pass

    @abstractmethod
    def get_result(self) -> House:
        pass

class ConcreteHouseBuilder(HouseBuilder):
    def __init__(self):
        self.house = House()

    def build_foundation(self):
        print("Building foundation")

    def build_walls(self):
        print("Building walls")

    def build_roof(self):
        print("Building roof")

    def get_result(self) -> House:
        return self.house

class ConstructionDirector:
    def construct(self, builder: HouseBuilder) -> House:
        builder.build_foundation()
        builder.build_walls()
        builder.build_roof()
        return builder.get_result()

director = ConstructionDirector()
builder = ConcreteHouseBuilder()
house = director.construct(builder)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait HouseBuilder {
    fn build_foundation(&mut self);
    fn build_walls(&mut self);
    fn build_roof(&mut self);
    fn get_result(&mut self) -> House;
}

struct House { rooms: i32 }

struct ConcreteHouseBuilder;

impl HouseBuilder for ConcreteHouseBuilder {
    fn build_foundation(&mut self) { println!("Building foundation"); }
    fn build_walls(&mut self) { println!("Building walls"); }
    fn build_roof(&mut self) { println!("Building roof"); }
    fn get_result(&mut self) -> House { House { rooms: 4 } }
}

fn construct(builder: &mut impl HouseBuilder) -> House {
    builder.build_foundation();
    builder.build_walls();
    builder.build_roof();
    builder.get_result()
}

fn main() {
    let mut builder = ConcreteHouseBuilder;
    let _house = construct(&mut builder);
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type House struct{ rooms int }

type Builder interface {
    BuildFoundation()
    BuildWalls()
    BuildRoof()
    GetResult() House
}

type ConcreteHouseBuilder struct{ house House }

func (b *ConcreteHouseBuilder) BuildFoundation() { fmt.Println("Building foundation") }
func (b *ConcreteHouseBuilder) BuildWalls() { fmt.Println("Building walls") }
func (b *ConcreteHouseBuilder) BuildRoof() { fmt.Println("Building roof") }
func (b *ConcreteHouseBuilder) GetResult() House { return b.house }

func construct(builder Builder) House {
    builder.BuildFoundation()
    builder.BuildWalls()
    builder.BuildRoof()
    return builder.GetResult()
}

func main() {
    var builder Builder = &ConcreteHouseBuilder{}
    house := construct(builder)
    fmt.Println(house)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface HouseBuilder {
    void buildFoundation();
    void buildWalls();
    void buildRoof();
    House getResult();
}

class House {
    public int rooms;
}

class ConcreteHouseBuilder implements HouseBuilder {
    private House house = new House();

    public void buildFoundation() { System.out.println("Building foundation"); }
    public void buildWalls() { System.out.println("Building walls"); }
    public void buildRoof() { System.out.println("Building roof"); }
    public House getResult() { return house; }
}

class ConstructionDirector {
    public House construct(HouseBuilder builder) {
        builder.buildFoundation();
        builder.buildWalls();
        builder.buildRoof();
        return builder.getResult();
    }
}

public class Main {
    public static void main(String[] args) {
        HouseBuilder builder = new ConcreteHouseBuilder();
        ConstructionDirector director = new ConstructionDirector();
        House house = director.construct(builder);
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
      id: "okhttp-request",
      i18nKey: "content.patterns.builder.scenarios.okhttp-request",
      domain: "network",
      icon: "🌐",
      reference: "OkHttp, Retrofit, Apache HttpClient 5",
      codeSnippet: {
        language: "java",
        code: `// OkHttp Request.Builder — fluent Builder pattern
Request request = new Request.Builder()
    .url("https://api.example.com/users")
    .header("Authorization", "Bearer " + token)
    .get()
    .build();

// Each chained call sets one part of the product;
// build() returns the immutable configured Request.`,
      },
    },
    {
      id: "java-string-builder",
      i18nKey: "content.patterns.builder.scenarios.java-string-builder",
      domain: "library",
      icon: "🔧",
      reference: "Java StringBuilder, .NET StringBuilder, C++ std::ostringstream",
    },
    {
      id: "lombok-builder",
      i18nKey: "content.patterns.builder.scenarios.lombok-builder",
      domain: "devtools",
      icon: "🚀",
      reference: "Lombok, Immutables, Kotlin copy(), Java Records",
    },
  ] satisfies Scenario[],
};
