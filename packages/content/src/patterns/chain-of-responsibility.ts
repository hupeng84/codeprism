import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Chain of Responsibility Pattern — Frame Generator
 * support ticket escalation chain
 */
export function* chainOfResponsibilityGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const ticketPos = { x: 200, y: 200 };
  const level1Pos = { x: 350, y: 100 };
  const level2Pos = { x: 350, y: 200 };
  const level3Pos = { x: 350, y: 300 };
  const managerPos = { x: 550, y: 200 };

  // Objects
  const ticket: PatternObject = {
    id: "ticket",
    name: "SupportTicket",
    type: "Request",
    state: { priority: "high", issue: "system crash" },
    position: ticketPos,
    status: "idle",
  };

  const level1: PatternObject = {
    id: "level1",
    name: "Level1Support",
    type: "Handler",
    state: { canHandle: "simple" },
    position: level1Pos,
    status: "idle",
  };

  const level2: PatternObject = {
    id: "level2",
    name: "Level2Support",
    type: "Handler",
    state: { canHandle: "technical" },
    position: level2Pos,
    status: "idle",
  };

  const level3: PatternObject = {
    id: "level3",
    name: "Level3Support",
    type: "Handler",
    state: { canHandle: "complex" },
    position: level3Pos,
    status: "idle",
  };

  const manager: PatternObject = {
    id: "manager",
    name: "Manager",
    type: "FinalHandler",
    state: { canHandle: "anything" },
    position: managerPos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket },
        { ...level1 },
        { ...level2 },
        { ...level3 },
        { ...manager },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Ticket arrives at Level1
  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "active" },
        { ...level1, status: "active" },
        { ...level2, status: "idle" },
        { ...level3, status: "idle" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "ticket", to: "level1", method: "handle(severity=high)", args: ["high"], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.0" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "idle" },
        { ...level1, status: "highlighted" },
        { ...level2, status: "idle" },
        { ...level3, status: "idle" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "level1", to: "level1", method: "canHandle(high)?", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.1" },
    highlightLine: 9,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "idle" },
        { ...level1, status: "active" },
        { ...level2, status: "idle" },
        { ...level3, status: "idle" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "level1", to: "level2", method: "passToNext()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.2" },
    highlightLine: 10,
  };

  // Step 4: Level2 handles
  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "idle" },
        { ...level1, status: "idle" },
        { ...level2, status: "active" },
        { ...level3, status: "idle" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "level1", to: "level2", method: "handle(severity=high)", args: ["high"], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.3" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "idle" },
        { ...level1, status: "idle" },
        { ...level2, status: "highlighted" },
        { ...level3, status: "idle" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "level2", to: "level2", method: "canHandle(high)?", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.4" },
    highlightLine: 16,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "idle" },
        { ...level1, status: "idle" },
        { ...level2, status: "active" },
        { ...level3, status: "idle" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "level2", to: "level3", method: "passToNext()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.5" },
    highlightLine: 17,
  };

  // Step 7: Level3 handles
  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "idle" },
        { ...level1, status: "idle" },
        { ...level2, status: "idle" },
        { ...level3, status: "active" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "level2", to: "level3", method: "handle(severity=high)", args: ["high"], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.6" },
    highlightLine: 22,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "idle" },
        { ...level1, status: "idle" },
        { ...level2, status: "idle" },
        { ...level3, status: "highlighted" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "level3", to: "level3", method: "canHandle(high)?", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.7" },
    highlightLine: 23,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "idle" },
        { ...level1, status: "idle" },
        { ...level2, status: "idle" },
        { ...level3, status: "highlighted" },
        { ...manager, status: "idle" },
      ],
      messages: [
        { from: "level3", to: "ticket", method: "resolved()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.8" },
    highlightLine: 24,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...ticket, status: "highlighted", state: { status: "RESOLVED" } },
        { ...level1, status: "idle" },
        { ...level2, status: "idle" },
        { ...level3, status: "idle" },
        { ...manager, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.chain-of-responsibility.frames.9" },
    highlightLine: 25,
  };
}

/** Code snippet */
export const chainOfResponsibilityCode = `// Handler interface
abstract class SupportHandler {
  protected nextHandler: SupportHandler | null = null;

  setNext(handler: SupportHandler): SupportHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(severity: string): void {
    if (this.canHandle(severity)) {
      this.resolve();  // ← handle request
    } else if (this.nextHandler) {
      this.nextHandler.handle(severity);  // ← pass to next
    }
  }

  protected abstract canHandle(severity: string): boolean;
  protected abstract resolve(): void;
}

// ConcreteHandlers
class Level1Support extends SupportHandler {
  protected canHandle(s: string): boolean {
    return s === "low";  // ← only handle low priority
  }

  protected resolve(): void {
    console.log("Level1 resolved simple issue");
  }
}

class Level2Support extends SupportHandler {
  protected canHandle(s: string): boolean {
    return s === "medium";  // ← handle medium priority
  }

  protected resolve(): void {
    console.log("Level2 resolved technical issue");
  }
}

class Level3Support extends SupportHandler {
  protected canHandle(s: string): boolean {
    return s === "high";  // ← handle high priority
  }

  protected resolve(): void {
    console.log("Level3 resolved critical issue");
  }
}

// Usage
const l1 = new Level1Support();
const l2 = new Level2Support();
const l3 = new Level3Support();
l1.setNext(l2).setNext(l3);

l1.handle("high");  // Level3 process`;

export const chainOfResponsibilityCodeLines = [
  "// Handler interface",
  "abstract class SupportHandler {",
  "  protected nextHandler: SupportHandler | null = null;",
  "",
  "  setNext(handler: SupportHandler): SupportHandler {",
  "    this.nextHandler = handler;",
  "    return handler;",
  "  }",
  "",
  "  handle(severity: string): void {",
  "    if (this.canHandle(severity)) {",
  "      this.resolve();  // ← handle request",
  "    } else if (this.nextHandler) {",
  "      this.nextHandler.handle(severity);  // ← pass to next",
  "    }",
  "  }",
  "",
  "  protected abstract canHandle(severity: string): boolean;",
  "  protected abstract resolve(): void;",
  "}",
  "",
  "// ConcreteHandlers",
  "class Level1Support extends SupportHandler {",
  "  protected canHandle(s: string): boolean {",
  "    return s === 'low';  // ← only handle low priority",
  "  }",
  "",
  "  protected resolve(): void {",
  "    console.log('Level1 resolved simple issue');",
  "  }",
  "}",
  "",
  "class Level2Support extends SupportHandler {",
  "  protected canHandle(s: string): boolean {",
  "    return s === 'medium';  // ← handle medium priority",
  "  }",
  "",
  "  protected resolve(): void {",
  "    console.log('Level2 resolved technical issue');",
  "  }",
  "}",
  "",
  "class Level3Support extends SupportHandler {",
  "  protected canHandle(s: string): boolean {",
  "    return s === 'high';  // ← handle high priority",
  "  }",
  "",
  "  protected resolve(): void {",
  "    console.log('Level3 resolved critical issue');",
  "  }",
  "}",
  "",
  "// Usage",
  "const l1 = new Level1Support();",
  "const l2 = new Level2Support();",
  "const l3 = new Level3Support();",
  "l1.setNext(l2).setNext(l3);",
  "",
  "l1.handle('high');  // Level3 process",
];

const chainOfResponsibilityDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Handler",
      name: "Handler",
      stereotype: "interface",
      attributes: [],
      methods: [
        { visibility: "+", name: "setNext", params: "handler: Handler", returnType: "Handler" },
        { visibility: "+", name: "handle", params: "severity: string", returnType: "void" },
      ],
      position: { x: 400, y: 50 },
    },
    {
      id: "ConcreteHandlerA",
      name: "ConcreteHandlerA",
      attributes: [],
      methods: [
        { visibility: "+", name: "handle", params: "severity: string", returnType: "void" },
      ],
      position: { x: 150, y: 200 },
    },
    {
      id: "ConcreteHandlerB",
      name: "ConcreteHandlerB",
      attributes: [],
      methods: [
        { visibility: "+", name: "handle", params: "severity: string", returnType: "void" },
      ],
      position: { x: 400, y: 200 },
    },
    {
      id: "ConcreteHandlerC",
      name: "ConcreteHandlerC",
      attributes: [],
      methods: [
        { visibility: "+", name: "handle", params: "severity: string", returnType: "void" },
      ],
      position: { x: 650, y: 200 },
    },
  ],
  relationships: [
    { from: "ConcreteHandlerA", to: "Handler", type: "implements" },
    { from: "ConcreteHandlerB", to: "Handler", type: "implements" },
    { from: "ConcreteHandlerC", to: "Handler", type: "implements" },
    { from: "Handler", to: "Handler", type: "association", label: "next" },
  ],
};

export const chainOfResponsibilityContent = {
  id: "chain-of-responsibility",
  slug: "chain-of-responsibility",
  title: "",
  titleKey: "content.patterns.chain-of-responsibility.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.chain-of-responsibility.desc",
  defaultInput: undefined,
  generator: chainOfResponsibilityGenerator,
  code: chainOfResponsibilityCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  diagram: chainOfResponsibilityDiagram,
  icon: "🔗",
  codeExamples: {
    typescript: {
      code: `abstract class SupportHandler {
  protected nextHandler: SupportHandler | null = null;

  setNext(handler: SupportHandler): SupportHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(severity: string): void {
    if (this.canHandle(severity)) {
      this.resolve();
    } else if (this.nextHandler) {
      this.nextHandler.handle(severity);
    }
  }

  protected abstract canHandle(s: string): boolean;
  protected abstract resolve(): void;
}

class Level1Support extends SupportHandler {
  protected canHandle(s: string): boolean { return s === "low"; }
  protected resolve(): void { console.log("Level1 resolved"); }
}

class Level2Support extends SupportHandler {
  protected canHandle(s: string): boolean { return s === "medium"; }
  protected resolve(): void { console.log("Level2 resolved"); }
}

class Level3Support extends SupportHandler {
  protected canHandle(s: string): boolean { return s === "high"; }
  protected resolve(): void { console.log("Level3 resolved"); }
}

const l1 = new Level1Support();
const l2 = new Level2Support();
const l3 = new Level3Support();
l1.setNext(l2).setNext(l3);

l1.handle("high");`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct Handler Handler;

typedef void (*HandlerFunc)(Handler*, const char*);

struct Handler {
  Handler* next;
  HandlerFunc handle;
};

void handler_handle(Handler* h, const char* severity) {
  printf("Handler processing: %s\\n", severity);
}

void set_next(Handler* h, Handler* next) {
  h->next = next;
}

int main(void) {
  Handler h1 = { NULL, handler_handle };
  Handler h2 = { NULL, handler_handle };
  set_next(&h1, &h2);
  h1.handle(&h1, "high");
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

class SupportHandler {
protected:
  std::unique_ptr<SupportHandler> nextHandler;
public:
  SupportHandler* setNext(std::unique_ptr<SupportHandler> h) {
    nextHandler = std::move(h);
    return nextHandler.get();
  }
  virtual void handle(const std::string& severity) {
    if (nextHandler) nextHandler->handle(severity);
  }
  virtual void resolve() = 0;
  virtual ~SupportHandler() = default;
};

class Level1Support : public SupportHandler {
public:
  void handle(const std::string& severity) override {
    if (severity == "low") resolve();
    else if (nextHandler) nextHandler->handle(severity);
  }
  void resolve() override { std::cout << "Level1 resolved\\n"; }
};

int main() {
  auto l1 = std::make_unique<Level1Support>();
  l1->handle("low");
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class SupportHandler(ABC):
    def __init__(self):
        self._next_handler = None

    def set_next(self, handler):
        self._next_handler = handler
        return handler

    def handle(self, severity):
        if self.can_handle(severity):
            self.resolve()
        elif self._next_handler:
            self._next_handler.handle(severity)

    @abstractmethod
    def can_handle(self, s):
        pass

    @abstractmethod
    def resolve(self):
        pass

class Level1Support(SupportHandler):
    def can_handle(self, s):
        return s == "low"
    def resolve(self):
        print("Level1 resolved")

l1 = Level1Support()
l1.handle("low")`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait SupportHandler {
    fn set_next(&mut self, next: Box<dyn SupportHandler>) -> &mut Box<dyn SupportHandler>;
    fn handle(&mut self, severity: &str);
    fn can_handle(&self, s: &str) -> bool;
    fn resolve(&self);
}

struct Level1Support {
    next: Option<Box<dyn SupportHandler>>,
}

impl SupportHandler for Level1Support {
    fn set_next(&mut self, next: Box<dyn SupportHandler>) -> &mut Box<dyn SupportHandler> {
        self.next = Some(next);
        self.next.as_mut().unwrap()
    }

    fn handle(&mut self, severity: &str) {
        if self.can_handle(severity) {
            self.resolve();
        } else if let Some(ref mut n) = self.next {
            n.handle(severity);
        }
    }

    fn can_handle(&self, s: &str) -> bool { s == "low" }
    fn resolve(&self) { println!("Level1 resolved"); }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type SupportHandler interface {
    SetNext(SupportHandler) SupportHandler
    Handle(string)
    CanHandle(string) bool
    Resolve()
}

type Level1Support struct {
    next SupportHandler
}

func (h *Level1Support) SetNext(next SupportHandler) SupportHandler {
    h.next = next
    return h.next
}

func (h *Level1Support) Handle(s string) {
    if h.CanHandle(s) {
        h.Resolve()
    } else if h.next != nil {
        h.next.Handle(s)
    }
}

func (h *Level1Support) CanHandle(s string) bool { return s == "low" }
func (h *Level1Support) Resolve() { fmt.Println("Level1 resolved") }

func main() {
    var h SupportHandler = &Level1Support{}
    h.Handle("low")
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public abstract class SupportHandler {
    protected SupportHandler nextHandler;

    public SupportHandler setNext(SupportHandler h) {
        this.nextHandler = h;
        return h;
    }

    public void handle(String severity) {
        if (canHandle(severity)) {
            resolve();
        } else if (nextHandler != null) {
            nextHandler.handle(severity);
        }
    }

    protected abstract boolean canHandle(String s);
    protected abstract void resolve();
}

class Level1Support extends SupportHandler {
    protected boolean canHandle(String s) { return s.equals("low"); }
    protected void resolve() { System.out.println("Level1 resolved"); }
}

public class Main {
    public static void main(String[] args) {
        SupportHandler l1 = new Level1Support();
        l1.handle("low");
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
      id: "servlet-filters",
      i18nKey: "content.patterns.chain-of-responsibility.scenarios.servlet-filters",
      domain: "system",
      icon: "🔒",
      reference: "Java Servlet API, Jakarta EE, Tomcat",
      codeSnippet: {
        language: "java",
        code: `// Servlet filters form a chain — each can handle or pass along the request
@WebFilter("/*")
public class AuthFilter implements Filter {
  public void doFilter(ServletRequest req, ServletResponse res,
                       FilterChain chain) throws IOException, ServletException {
    if (isAuthenticated(req)) {
      chain.doFilter(req, res); // pass to next filter in chain
    } else {
      ((HttpServletResponse) res).sendError(401);
    }
  }
}`,
      },
    },
    {
      id: "express-middleware",
      i18nKey: "content.patterns.chain-of-responsibility.scenarios.express-middleware",
      domain: "library",
      icon: "📦",
      reference: "Express, Koa, Fastify, Hapi",
    },
    {
      id: "okhttp-interceptors",
      i18nKey: "content.patterns.chain-of-responsibility.scenarios.okhttp-interceptors",
      domain: "network",
      icon: "🔄",
      reference: "OkHttp, Retrofit, Axios, gRPC interceptors",
    },
  ] satisfies Scenario[],
};
