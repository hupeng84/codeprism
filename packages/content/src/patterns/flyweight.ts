import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Flyweight Pattern — Frame Generator
 * character rendering scenario - share font data, reduce memory
 */
export function* flyweightGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const factoryPos = { x: 150, y: 150 };
  const charAPos = { x: 350, y: 100 };
  const charBPos = { x: 350, y: 200 };
  const charCPos = { x: 350, y: 300 };
  const rendererPos = { x: 550, y: 200 };

  // Objects
  const factory: PatternObject = {
    id: "factory",
    name: "CharacterFactory",
    type: "FlyweightFactory",
    state: { cached: 2 },
    position: factoryPos,
    status: "idle",
  };

  const charA: PatternObject = {
    id: "charA",
    name: "Character 'A'",
    type: "Flyweight",
    state: { font: "Arial-12px-Bold", used: 5 },
    position: charAPos,
    status: "idle",
  };

  const charB: PatternObject = {
    id: "charB",
    name: "Character 'B'",
    type: "Flyweight",
    state: { font: "Arial-12px-Bold", used: 3 },
    position: charBPos,
    status: "idle",
  };

  const charC: PatternObject = {
    id: "charC",
    name: "Character 'C'",
    type: "Flyweight",
    state: { font: "Arial-12px-Bold", used: 2 },
    position: charCPos,
    status: "idle",
  };

  const renderer: PatternObject = {
    id: "renderer",
    name: "TextRenderer",
    type: "Client",
    state: { text: "ABACAB" },
    position: rendererPos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...factory },
        { ...charA },
        { ...charB },
        { ...charC },
        { ...renderer },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Render 'A' - creates new flyweight
  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "active" },
        { ...charA, status: "idle" },
        { ...charB, status: "idle" },
        { ...charC, status: "idle" },
        { ...renderer, status: "active" },
      ],
      messages: [
        { from: "renderer", to: "factory", method: "getCharacter('A')", args: ["A"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.0" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "active" },
        { ...charA, status: "active" },
        { ...charB, status: "idle" },
        { ...charC, status: "idle" },
        { ...renderer, status: "active" },
      ],
      messages: [
        { from: "factory", to: "charA", method: "createFont()", args: ["Arial-12px-Bold"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.1" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "idle", state: { cached: 1 } },
        { ...charA, status: "highlighted" },
        { ...charB, status: "idle" },
        { ...charC, status: "idle" },
        { ...renderer, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "charA", method: "createFont()", args: ["Arial-12px-Bold"], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.2" },
    highlightLine: 10,
  };

  // Step 4: Render 'B' - creates another flyweight
  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "active" },
        { ...charA, status: "idle" },
        { ...charB, status: "idle" },
        { ...charC, status: "idle" },
        { ...renderer, status: "active" },
      ],
      messages: [
        { from: "renderer", to: "factory", method: "getCharacter('B')", args: ["B"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.3" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "active" },
        { ...charA, status: "idle" },
        { ...charB, status: "active" },
        { ...charC, status: "idle" },
        { ...renderer, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "charB", method: "createFont()", args: ["Arial-12px-Bold"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.4" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "idle", state: { cached: 2 } },
        { ...charA, status: "idle" },
        { ...charB, status: "highlighted" },
        { ...charC, status: "idle" },
        { ...renderer, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "charB", method: "createFont()", args: ["Arial-12px-Bold"], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.5" },
    highlightLine: 10,
  };

  // Step 7: Render 'A' again - reuse flyweight
  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "active" },
        { ...charA, status: "idle" },
        { ...charB, status: "idle" },
        { ...charC, status: "idle" },
        { ...renderer, status: "active" },
      ],
      messages: [
        { from: "renderer", to: "factory", method: "getCharacter('A')", args: ["A"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.6" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "highlighted", state: { cached: 2 } },
        { ...charA, status: "highlighted" },
        { ...charB, status: "idle" },
        { ...charC, status: "idle" },
        { ...renderer, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "charA", method: "reuse from cache", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.7" },
    highlightLine: 15,
  };

  // Step 9: Render 'C' - new flyweight
  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "active" },
        { ...charA, status: "idle" },
        { ...charB, status: "idle" },
        { ...charC, status: "idle" },
        { ...renderer, status: "active" },
      ],
      messages: [
        { from: "renderer", to: "factory", method: "getCharacter('C')", args: ["C"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.8" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "active" },
        { ...charA, status: "idle" },
        { ...charB, status: "idle" },
        { ...charC, status: "active" },
        { ...renderer, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "charC", method: "createFont()", args: ["Arial-12px-Bold"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.9" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "idle", state: { cached: 3 } },
        { ...charA, status: "idle" },
        { ...charB, status: "idle" },
        { ...charC, status: "highlighted" },
        { ...renderer, status: "idle" },
      ],
      messages: [
        { from: "factory", to: "charC", method: "createFont()", args: ["Arial-12px-Bold"], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.10" },
    highlightLine: 10,
  };

  // Step 12: Render remaining 'A', 'C', 'A', 'B'
  yield {
    step: step++,
    state: {
      objects: [
        { ...factory, status: "idle", state: { cached: 3 } },
        { ...charA, status: "idle", state: { font: "Arial-12px-Bold", used: 5 } },
        { ...charB, status: "idle", state: { font: "Arial-12px-Bold", used: 3 } },
        { ...charC, status: "idle", state: { font: "Arial-12px-Bold", used: 2 } },
        { ...renderer, status: "highlighted" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.flyweight.frames.11" },
    highlightLine: 20,
  };
}

/** Code snippet */
export const flyweightCode = `// Flyweight - share intrinsic state
class CharacterFlyweight {
  constructor(
    public char: string,           // ← intrinsic state (shareable)
    private font: string,          // ← intrinsic state (shareable)
    private size: number           // ← intrinsic state (shareable)
  ) {}

  render(extrinsicState: { x: number; y: number }): void {
    // extrinsicState is extrinsic state (not shareable)
    console.log(
      \`Rendering '\${this.char}' at (\${extrinsicState.x}, \${extrinsicState.y}) with \${this.font}\`
    );
  }
}

// FlyweightFactory - manage flyweight pool
class CharacterFactory {
  private cache: Map<string, CharacterFlyweight> = new Map();

  getCharacter(char: string): CharacterFlyweight {
    if (!this.cache.has(char)) {
      this.cache.set(char, new CharacterFlyweight(char, "Arial-12px", 12));
    }
    return this.cache.get(char)!;  // ← return cached flyweight
  }
}

// Usage
const factory = new CharacterFactory();
const text = "ABACAB";
let x = 0;
for (const char of text) {
  const flyweight = factory.getCharacter(char);
  flyweight.render({ x, y: 0 });  // ← extrinsic state passed separately
  x += 10;
}`;

export const flyweightCodeLines = [
  "// Flyweight - share intrinsic state",
  "class CharacterFlyweight {",
  "  constructor(",
  "    public char: string,           // ← intrinsic state (shareable)",
  "    private font: string,          // ← intrinsic state (shareable)",
  "    private size: number           // ← intrinsic state (shareable)",
  "  ) {}",
  "",
  "  render(extrinsicState: { x: number; y: number }): void {",
  "    // extrinsicState is extrinsic state (not shareable)",
  "    console.log(",
  "      `Rendering '${this.char}' at (${extrinsicState.x}, ${extrinsicState.y}) with ${this.font}`",
  "    );",
  "  }",
  "}",
  "",
  "// FlyweightFactory - manage flyweight pool",
  "class CharacterFactory {",
  "  private cache: Map<string, CharacterFlyweight> = new Map();",
  "",
  "  getCharacter(char: string): CharacterFlyweight {",
  "    if (!this.cache.has(char)) {",
  "      this.cache.set(char, new CharacterFlyweight(char, 'Arial-12px', 12));",
  "    }",
  "    return this.cache.get(char)!;  // ← return cached flyweight",
  "  }",
  "}",
  "",
  "// Usage",
  "const factory = new CharacterFactory();",
  "const text = 'ABACAB';",
  "let x = 0;",
  "for (const char of text) {",
  "  const flyweight = factory.getCharacter(char);",
  "  flyweight.render({ x, y: 0 });  // ← extrinsic state passed separately",
  "  x += 10;",
  "}",
];

const flyweightDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "flyweight",
      name: "Flyweight",
      stereotype: "interface",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "extrinsicState: any", returnType: "void" }],
      position: { x: 300, y: 50 },
    },
    {
      id: "concreteFlyweight",
      name: "ConcreteFlyweight",
      stereotype: "class",
      attributes: [{ visibility: "#", name: "intrinsicState", type: "string" }],
      methods: [{ visibility: "+", name: "operation()", params: "extrinsicState: any", returnType: "void" }],
      position: { x: 100, y: 200 },
    },
    {
      id: "flyweightFactory",
      name: "FlyweightFactory",
      stereotype: "class",
      attributes: [{ visibility: "#", name: "flyweights", type: "Map<string, Flyweight>" }],
      methods: [{ visibility: "+", name: "getFlyweight()", params: "key: string", returnType: "Flyweight" }],
      position: { x: 500, y: 200 },
    },
    {
      id: "client",
      name: "Client",
      stereotype: "class",
      attributes: [],
      methods: [],
      position: { x: 300, y: 350 },
    },
  ],
  relationships: [
    { from: "concreteFlyweight", to: "flyweight", type: "implements" },
    { from: "client", to: "flyweightFactory", type: "dependency", label: "uses" },
    { from: "flyweightFactory", to: "flyweight", type: "aggregation", label: "manages" },
  ],
};

export const flyweightContent = {
  id: "flyweight",
  slug: "flyweight",
  title: "",
  titleKey: "content.patterns.flyweight.title",
  category: "pattern" as const,
  subcategory: "structural",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.patterns.flyweight.desc",
  defaultInput: undefined,
  generator: flyweightGenerator,
  code: flyweightCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(n)",
  },
  tags: [],
  icon: "🦋",
  diagram: flyweightDiagram,
  codeExamples: {
    typescript: {
      code: `class CharacterFlyweight {
  constructor(
    public char: string,
    private font: string,
    private size: number
  ) {}

  render(extrinsicState: { x: number; y: number }): void {
    console.log(
      \`Rendering '\${this.char}' at (\${extrinsicState.x}, \${extrinsicState.y})\`
    );
  }
}

class CharacterFactory {
  private cache = new Map<string, CharacterFlyweight>();

  getCharacter(char: string): CharacterFlyweight {
    if (!this.cache.has(char)) {
      this.cache.set(char, new CharacterFlyweight(char, "Arial-12px", 12));
    }
    return this.cache.get(char)!;
  }
}

const factory = new CharacterFactory();
for (const char of "ABACAB") {
  const flyweight = factory.getCharacter(char);
  flyweight.render({ x: 0, y: 0 });
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>
#include <string.h>

typedef struct Flyweight Flyweight;

struct Flyweight {
  char ch;
  const char* font;
  int size;
};

static Flyweight cache[256];
static int cache_count = 0;

Flyweight* get_flyweight(char ch) {
  for (int i = 0; i < cache_count; i++) {
    if (cache[i].ch == ch) return &cache[i];
  }
  cache[cache_count++] = (Flyweight){ch, "Arial-12px", 12};
  return &cache[cache_count - 1];
}

int main(void) {
  char text[] = "ABACAB";
  for (int i = 0; i < strlen(text); i++) {
    Flyweight* fw = get_flyweight(text[i]);
    printf("Rendering '%c'\\n", fw->ch);
  }
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <string>
#include <map>

class CharacterFlyweight {
public:
  char ch;
  std::string font;
  int size;
  CharacterFlyweight(char c, std::string f, int s)
    : ch(c), font(f), size(s) {}
  void render(int x, int y) {
    std::cout << "Rendering '" << ch << "' at (" << x << "," << y << ")\\n";
  }
};

class CharacterFactory {
  std::map<char, CharacterFlyweight> cache;
public:
  CharacterFlyweight* getCharacter(char ch) {
    if (cache.find(ch) == cache.end()) {
      cache[ch] = CharacterFlyweight(ch, "Arial-12px", 12);
    }
    return &cache[ch];
  }
};

int main() {
  CharacterFactory factory;
  std::string text = "ABACAB";
  for (char c : text) {
    factory.getCharacter(c)->render(0, 0);
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class CharacterFlyweight:
    def __init__(self, char, font, size):
        self.char = char
        self.font = font
        self.size = size

    def render(self, x, y):
        print(f"Rendering '{self.char}' at ({x}, {y})")

class CharacterFactory:
    def __init__(self):
        self.cache = {}

    def get_character(self, char):
        if char not in self.cache:
            self.cache[char] = CharacterFlyweight(char, "Arial-12px", 12)
        return self.cache[char]

factory = CharacterFactory()
for c in "ABACAB":
    factory.get_character(c).render(0, 0)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::HashMap;

struct CharacterFlyweight {
    ch: char,
    font: String,
    size: i32,
}

impl CharacterFlyweight {
    fn render(&self, x: i32, y: i32) {
        println!("Rendering '{}' at ({}, {})", self.ch, x, y);
    }
}

struct CharacterFactory {
    cache: HashMap<char, CharacterFlyweight>,
}

impl CharacterFactory {
    fn get_character(&mut self, ch: char) -> &CharacterFlyweight {
        if !self.cache.contains_key(&ch) {
            self.cache.insert(ch, CharacterFlyweight {
                ch,
                font: "Arial-12px".to_string(),
                size: 12,
            });
        }
        self.cache.get(&ch).unwrap()
    }
}

fn main() {
    let mut factory = CharacterFactory { cache: HashMap::new() };
    for c in "ABACAB".chars() {
        factory.get_character(c).render(0, 0);
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type CharacterFlyweight struct {
    Ch   rune
    Font string
    Size int
}

type CharacterFactory struct {
    cache map[rune]CharacterFlyweight
}

func (f *CharacterFactory) GetCharacter(ch rune) *CharacterFlyweight {
    if _, ok := f.cache[ch]; !ok {
        f.cache[ch] = CharacterFlyweight{ch, "Arial-12px", 12}
    }
    return &f.cache[ch]
}

func main() {
    factory := &CharacterFactory{cache: make(map[rune]CharacterFlyweight)}
    for _, c := range "ABACAB" {
        fw := factory.GetCharacter(c)
        fmt.Printf("Rendering '%c'\\n", fw.Ch)
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `import java.util.*;

public class CharacterFlyweight {
    public char ch;
    public String font;
    public int size;

    public CharacterFlyweight(char ch, String font, int size) {
        this.ch = ch;
        this.font = font;
        this.size = size;
    }

    public void render(int x, int y) {
        System.out.println("Rendering '" + ch + "' at (" + x + "," + y + ")");
    }
}

class CharacterFactory {
    private Map<Character, CharacterFlyweight> cache = new HashMap<>();

    public CharacterFlyweight getCharacter(char ch) {
        return cache.computeIfAbsent(ch, c -> new CharacterFlyweight(c, "Arial-12px", 12));
    }
}

public class Main {
    public static void main(String[] args) {
        CharacterFactory factory = new CharacterFactory();
        for (char c : "ABACAB".toCharArray()) {
            factory.getCharacter(c).render(0, 0);
        }
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
      id: "java-integer-cache",
      i18nKey: "content.patterns.flyweight.scenarios.java-integer-cache",
      domain: "library",
      icon: "☕",
      reference: "Java Integer cache, Python small int cache, JavaScript small integers",
      codeSnippet: {
        language: "java",
        code: `// Java caches Integer objects from -128 to 127 (flyweight pool)
Integer a = 127;   // cached instance
Integer b = 127;   // same cached instance
System.out.println(a == b); // true — same flyweight

Integer c = 200;   // not cached, new object
Integer d = 200;
System.out.println(c == d); // false — different objects`,
      },
    },
    {
      id: "font-glyph-cache",
      i18nKey: "content.patterns.flyweight.scenarios.font-glyph-cache",
      domain: "graphics",
      icon: "🎨",
      reference: "Chrome font rendering, FreeType, DirectWrite",
    },
    {
      id: "game-sprite-atlas",
      i18nKey: "content.patterns.flyweight.scenarios.game-sprite-atlas",
      domain: "game-dev",
      icon: "🎮",
      reference: "Unity sprite atlas, Unreal Instanced Static Mesh, Three.js InstancedMesh",
    },
  ] satisfies Scenario[],
};
