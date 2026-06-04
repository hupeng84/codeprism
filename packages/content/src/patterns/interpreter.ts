import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Interpreter Pattern — Frame Generator
 * arithmetic expression interpreter scenario
 */
export function* interpreterGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const contextPos = { x: 100, y: 200 };
  const expressionPos = { x: 300, y: 200 };
  const resultPos = { x: 500, y: 200 };

  // Objects
  const context: PatternObject = {
    id: "context",
    name: "Context",
    type: "Context",
    state: { variables: { a: 10, b: 3 } },
    position: contextPos,
    status: "idle",
  };

  const expression: PatternObject = {
    id: "expression",
    name: "a + b * 2",
    type: "Expression",
    state: { type: "AddExpression" },
    position: expressionPos,
    status: "idle",
  };

  const result: PatternObject = {
    id: "result",
    name: "Result",
    type: "Value",
    state: { value: 16 },
    position: resultPos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...context },
        { ...expression },
        { ...result },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Parse expression
  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "active" },
        { ...expression, status: "idle" },
        { ...result, status: "idle" },
      ],
      messages: [
        { from: "expression", to: "context", method: "lookup('a')", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.0" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "highlighted" },
        { ...expression, status: "idle" },
        { ...result, status: "idle" },
      ],
      messages: [
        { from: "expression", to: "context", method: "lookup('a') = 10", args: [], status: "complete" },
      ],
    },
    description: "Context.lookup('a') = 10",
    highlightLine: 6,
  };

  // Step 3: Get variable b
  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "active" },
        { ...expression, status: "idle" },
        { ...result, status: "idle" },
      ],
      messages: [
        { from: "expression", to: "context", method: "lookup('b')", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.1" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "highlighted" },
        { ...expression, status: "idle" },
        { ...result, status: "idle" },
      ],
      messages: [
        { from: "expression", to: "context", method: "lookup('b') = 3", args: [], status: "complete" },
      ],
    },
    description: "Context.lookup('b') = 3",
    highlightLine: 6,
  };

  // Step 5: Evaluate multiplication first (b * 2)
  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "idle" },
        { ...expression, status: "active" },
        { ...result, status: "idle" },
      ],
      messages: [
        { from: "expression", to: "expression", method: "b * 2 = 3 * 2", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.2" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "idle" },
        { ...expression, status: "highlighted" },
        { ...result, status: "idle" },
      ],
      messages: [
        { from: "expression", to: "expression", method: "b * 2 = 6", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.3" },
    highlightLine: 11,
  };

  // Step 7: Evaluate addition (a + result)
  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "idle" },
        { ...expression, status: "active" },
        { ...result, status: "idle" },
      ],
      messages: [
        { from: "expression", to: "expression", method: "a + 6 = 10 + 6", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.4" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "idle" },
        { ...expression, status: "active" },
        { ...result, status: "active" },
      ],
      messages: [
        { from: "expression", to: "result", method: "→ 16", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.5" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "idle" },
        { ...expression, status: "idle" },
        { ...result, status: "highlighted", state: { value: 16 } },
      ],
      messages: [
        { from: "expression", to: "result", method: "→ 16", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.6" },
    highlightLine: 16,
  };

  // Step 10: Evaluate another expression
  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "idle", state: { variables: { x: 5, y: 2 } } },
        { ...expression, status: "idle", state: { expression: "x - y" } },
        { ...result, status: "idle", state: { value: 3 } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.7" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...context, status: "idle" },
        { ...expression, status: "idle" },
        { ...result, status: "highlighted", state: { value: 3 } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.interpreter.frames.8" },
    highlightLine: 20,
  };
}

/** Code snippet */
export const interpreterCode = `// Abstract Expression
interface Expression {
  interpret(context: Context): number;  // ← interpret method
}

// Terminal Expression - variable
class Variable implements Expression {
  constructor(private name: string) {}

  interpret(context: Context): number {
    return context.get(this.name);  // ← get value from context
  }
}

// Non-terminal Expression - addition
class AddExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  interpret(context: Context): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

// Non-terminal Expression - multiplication
class MultiplyExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  interpret(context: Context): number {
    return this.left.interpret(context) * this.right.interpret(context);
  }
}

// Context - store variable values
class Context {
  private vars: Map<string, number> = new Map();

  set(name: string, value: number): void {
    this.vars.set(name, value);
  }

  get(name: string): number {
    return this.vars.get(name) ?? 0;
  }
}

// Usage: a + b * 2
//   context = { a: 10, b: 3 }
//   result = 16`;

export const interpreterCodeLines = [
  "// Abstract Expression",
  "interface Expression {",
  "  interpret(context: Context): number;  // ← interpret method",
  "}",
  "",
  "// Terminal Expression - variable",
  "class Variable implements Expression {",
  "  constructor(private name: string) {}",
  "",
  "  interpret(context: Context): number {",
  "    return context.get(this.name);  // ← get value from context",
  "  }",
  "}",
  "",
  "// Non-terminal Expression - addition",
  "class AddExpression implements Expression {",
  "  constructor(private left: Expression, private right: Expression) {}",
  "",
  "  interpret(context: Context): number {",
  "    return this.left.interpret(context) + this.right.interpret(context);",
  "  }",
  "}",
  "",
  "// Non-terminal Expression - multiplication",
  "class MultiplyExpression implements Expression {",
  "  constructor(private left: Expression, private right: Expression) {}",
  "",
  "  interpret(context: Context): number {",
  "    return this.left.interpret(context) * this.right.interpret(context);",
  "  }",
  "}",
  "",
  "// Context - store variable values",
  "class Context {",
  "  private vars: Map<string, number> = new Map();",
  "",
  "  set(name: string, value: number): void {",
  "    this.vars.set(name, value);",
  "  }",
  "",
  "  get(name: string): number {",
  "    return this.vars.get(name) ?? 0;",
  "  }",
  "}",
  "",
  "// Usage: a + b * 2",
  "//   context = { a: 10, b: 3 }",
  "//   result = 16",
];

const interpreterDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Context",
      name: "Context",
      attributes: [
        { visibility: "-", name: "variables", type: "Map<string, number>" },
      ],
      methods: [
        { visibility: "+", name: "lookup", params: "name: string", returnType: "number" },
      ],
      position: { x: 150, y: 50 },
    },
    {
      id: "AbstractExpression",
      name: "AbstractExpression",
      stereotype: "interface",
      attributes: [],
      methods: [
        { visibility: "+", name: "interpret", params: "context: Context", returnType: "void" },
      ],
      position: { x: 500, y: 50 },
    },
    {
      id: "TerminalExpression",
      name: "TerminalExpression",
      attributes: [],
      methods: [
        { visibility: "+", name: "interpret", params: "context: Context", returnType: "void" },
      ],
      position: { x: 350, y: 250 },
    },
    {
      id: "NonterminalExpression",
      name: "NonterminalExpression",
      attributes: [],
      methods: [
        { visibility: "+", name: "interpret", params: "context: Context", returnType: "void" },
      ],
      position: { x: 650, y: 250 },
    },
  ],
  relationships: [
    { from: "TerminalExpression", to: "AbstractExpression", type: "implements" },
    { from: "NonterminalExpression", to: "AbstractExpression", type: "implements" },
    { from: "NonterminalExpression", to: "AbstractExpression", type: "aggregation", label: "contains" },
  ],
};

export const interpreterContent = {
  id: "interpreter",
  slug: "interpreter",
  title: "",
  titleKey: "content.patterns.interpreter.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.patterns.interpreter.desc",
  defaultInput: undefined,
  generator: interpreterGenerator,
  code: interpreterCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  diagram: interpreterDiagram,
  icon: "📝",
  codeExamples: {
    typescript: {
      code: `interface Expression {
  interpret(context: Context): number;
}

class Context {
  private vars: Map<string, number> = new Map();
  set(name: string, value: number): void { this.vars.set(name, value); }
  get(name: string): number { return this.vars.get(name) ?? 0; }
}

class Variable implements Expression {
  constructor(private name: string) {}
  interpret(context: Context): number { return context.get(this.name); }
}

class AddExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(context: Context): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

class MultiplyExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  interpret(context: Context): number {
    return this.left.interpret(context) * this.right.interpret(context);
  }
}

const ctx = new Context();
ctx.set("a", 10);
ctx.set("b", 3);
// (a + b) * 2 = 26
const expr = new MultiplyExpression(
  new AddExpression(new Variable("a"), new Variable("b")),
  new Variable("b")
);
console.log(expr.interpret(ctx));`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct Context {
  int vars[26];
} Context;

void context_set(Context* ctx, char name, int value) {
  ctx->vars[name - 'a'] = value;
}

int context_get(Context* ctx, char name) {
  return ctx->vars[name - 'a'];
}

int main(void) {
  Context ctx = {0};
  context_set(&ctx, 'a', 10);
  context_set(&ctx, 'b', 3);
  int a = context_get(&ctx, 'a');
  int b = context_get(&ctx, 'b');
  printf("%d\\n", (a + b) * 2);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <map>

class Context {
  std::map<char, int> vars;
public:
  void set(char name, int value) { vars[name] = value; }
  int get(char name) { return vars.count(name) ? vars[name] : 0; }
};

class Expression {
public:
  virtual int interpret(Context& ctx) = 0;
  virtual ~Expression() = default;
};

class Variable : public Expression {
  char name;
public:
  Variable(char n) : name(n) {}
  int interpret(Context& ctx) override { return ctx.get(name); }
};

class AddExpression : public Expression {
  Expression *left, *right;
public:
  AddExpression(Expression* l, Expression* r) : left(l), right(r) {}
  int interpret(Context& ctx) override { return left->interpret(ctx) + right->interpret(ctx); }
};

int main() {
  Context ctx;
  ctx.set('a', 10);
  ctx.set('b', 3);
  Expression* expr = new AddExpression(new Variable('a'), new Variable('b'));
  std::cout << expr->interpret(ctx) << std::endl;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class Context:
    def __init__(self):
        self.vars = {}

    def set(self, name, value):
        self.vars[name] = value

    def get(self, name):
        return self.vars.get(name, 0)

class Expression:
    def interpret(self, ctx):
        raise NotImplementedError

class Variable(Expression):
    def __init__(self, name):
        self.name = name

    def interpret(self, ctx):
        return ctx.get(self.name)

class AddExpression(Expression):
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def interpret(self, ctx):
        return self.left.interpret(ctx) + self.right.interpret(ctx)

ctx = Context()
ctx.set("a", 10)
ctx.set("b", 3)
expr = AddExpression(Variable("a"), Variable("b"))
print(expr.interpret(ctx))`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::HashMap;

struct Context {
    vars: HashMap<char, i32>,
}

impl Context {
    fn new() -> Context { Context { vars: HashMap::new() } }
    fn set(&mut self, name: char, value: i32) { self.vars.insert(name, value); }
    fn get(&self, name: char) -> i32 { *self.vars.get(&name).unwrap_or(&0) }
}

trait Expression {
    fn interpret(&self, ctx: &Context) -> i32;
}

struct Variable(char);

impl Expression for Variable {
    fn interpret(&self, ctx: &Context) -> i32 { ctx.get(self.0) }
}

struct AddExpression<'a>(Box<dyn Expression + 'a>, Box<dyn Expression + 'a>);

impl Expression for AddExpression<'_> {
    fn interpret(&self, ctx: &Context) -> i32 {
        self.0.interpret(ctx) + self.1.interpret(ctx)
    }
}

fn main() {
    let mut ctx = Context::new();
    ctx.set('a', 10);
    ctx.set('b', 3);
    let expr = AddExpression(Box::new(Variable('a')), Box::new(Variable('b')));
    println!("{}", expr.interpret(&ctx));
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Context struct {
    vars map[byte]int
}

func NewContext() *Context { return &Context{vars: make(map[byte]int)} }
func (c *Context) Set(name byte, value int) { c.vars[name] = value }
func (c *Context) Get(name byte) int { return c.vars[name] }

type Expression interface {
    Interpret(*Context) int
}

type Variable byte

func (v Variable) Interpret(ctx *Context) int { return ctx.Get(byte(v)) }

type AddExpression struct {
    left, right Expression
}

func (a AddExpression) Interpret(ctx *Context) int {
    return a.left.Interpret(ctx) + a.right.Interpret(ctx)
}

func main() {
    ctx := NewContext()
    ctx.Set('a', 10)
    ctx.Set('b', 3)
    expr := AddExpression{Variable('a'), Variable('b')}
    fmt.Println(expr.Interpret(ctx))
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `import java.util.*;

public class Context {
    private Map<Character, Integer> vars = new HashMap<>();
    public void set(char name, int value) { vars.put(name, value); }
    public int get(char name) { return vars.getOrDefault(name, 0); }
}

interface Expression { int interpret(Context ctx); }

class Variable implements Expression {
    private char name;
    public Variable(char name) { this.name = name; }
    public int interpret(Context ctx) { return ctx.get(name); }
}

class AddExpression implements Expression {
    private Expression left, right;
    public AddExpression(Expression l, Expression r) { left = l; right = r; }
    public int interpret(Context ctx) { return left.interpret(ctx) + right.interpret(ctx); }
}

public class Main {
    public static void main(String[] args) {
        Context ctx = new Context();
        ctx.set('a', 10);
        ctx.set('b', 3);
        Expression expr = new AddExpression(new Variable('a'), new Variable('b'));
        System.out.println(expr.interpret(ctx));
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — concrete production systems
  // that use the Interpreter pattern to evaluate structured languages.
  scenarios: [
    {
      id: "sql-parser",
      i18nKey: "content.patterns.interpreter.scenarios.sql-parser",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL pg_query, SQL.js, DuckDB",
    },
    {
      id: "regex-engine",
      i18nKey: "content.patterns.interpreter.scenarios.regex-engine",
      domain: "library",
      icon: "📦",
      reference: "PCRE, JavaScript RegExp, Python re",
      codeSnippet: {
        language: "javascript",
        code: `// JavaScript RegExp — literal + group + quantifier expressions
const pattern = /^(\\w+)@(\\w+\\.\\w+)$/;
const matcher = pattern.exec("alice@example.com");
// matcher[1] = "alice"       (group 1 — username)
// matcher[2] = "example.com" (group 2 — domain)`,
      },
    },
    {
      id: "spel-expression",
      i18nKey: "content.patterns.interpreter.scenarios.spel-expression",
      domain: "business",
      icon: "💼",
      reference: "Spring SpEL, Java Expression Language, Apache EL",
    },
  ] satisfies Scenario[],
};
