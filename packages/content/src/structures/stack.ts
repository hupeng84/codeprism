import type { Frame, ListNode, ListState, Scenario } from "@codeprism/core";

/**
 * Stack — Frame Generator
 * Simulates push, pop, peek operations on an array-based stack,
 * yielding a frame for each step with the current stack state.
 */
export function* stackGenerator(): Generator<Frame<ListState>, void, unknown> {
  let nodeIdCounter = 0;
  let step = 0;
  const stack: ListNode[] = [];

  // ── 1. Empty stack ──
  yield {
    step: step++,
    state: { nodes: [], operation: "empty stack", orientation: "vertical" },
    description: "Initialize empty stack, ready for operations",
    highlightLine: 0,
  };

  // ── 2. push 10 ──
  {
    const node: ListNode = { id: `n${nodeIdCounter++}`, value: 10, status: "found" };
    stack.push(node);
    yield {
      step: step++,
      state: { nodes: stack.map((n) => ({ ...n })), operation: "push 10", orientation: "vertical" },
      description: "Push 10 to stack top",
      highlightLine: 3,
    };
    node.status = "default";
  }

  // ── 3. push 20 ──
  {
    const node: ListNode = { id: `n${nodeIdCounter++}`, value: 20, status: "found" };
    stack.push(node);
    yield {
      step: step++,
      state: { nodes: stack.map((n) => ({ ...n })), operation: "push 20", orientation: "vertical" },
      description: "Push 20 to stack top",
      highlightLine: 3,
    };
    node.status = "default";
  }

  // ── 4. push 30 ──
  {
    const node: ListNode = { id: `n${nodeIdCounter++}`, value: 30, status: "found" };
    stack.push(node);
    yield {
      step: step++,
      state: { nodes: stack.map((n) => ({ ...n })), operation: "push 30", orientation: "vertical" },
      description: "Push 30 to stack top",
      highlightLine: 3,
    };
    node.status = "default";
  }

  // ── 5. peek (top = 30) ──
  {
    stack[stack.length - 1].status = "highlighted";
    yield {
      step: step++,
      state: { nodes: stack.map((n) => ({ ...n })), operation: "peek → 30", orientation: "vertical" },
      description: "Peek top element: 30 (unchanged)",
      highlightLine: 9,
    };
    stack[stack.length - 1].status = "default";
  }

  // ── 6. pop → 30 ──
  {
    stack[stack.length - 1].status = "active";
    yield {
      step: step++,
      state: { nodes: stack.map((n) => ({ ...n })), operation: "pop → 30", orientation: "vertical" },
      description: "Pop: remove top element 30",
      highlightLine: 6,
    };
    stack.pop();
  }

  // ── 7. push 40 ──
  {
    const node: ListNode = { id: `n${nodeIdCounter++}`, value: 40, status: "found" };
    stack.push(node);
    yield {
      step: step++,
      state: { nodes: stack.map((n) => ({ ...n })), operation: "push 40", orientation: "vertical" },
      description: "Push 40 to stack top",
      highlightLine: 3,
    };
    node.status = "default";
  }

  // ── 8. pop → 40 ──
  {
    stack[stack.length - 1].status = "active";
    yield {
      step: step++,
      state: { nodes: stack.map((n) => ({ ...n })), operation: "pop → 40", orientation: "vertical" },
      description: "Pop: remove top element 40",
      highlightLine: 6,
    };
    stack.pop();
  }

  // ── 9. pop → 20 ──
  {
    stack[stack.length - 1].status = "active";
    yield {
      step: step++,
      state: { nodes: stack.map((n) => ({ ...n })), operation: "pop → 20", orientation: "vertical" },
      description: "Pop: remove top element 20",
      highlightLine: 6,
    };
    stack.pop();
  }

  // ── 10. Final state ──
  yield {
    step: step++,
    state: { nodes: stack.map((n) => ({ ...n })), operation: "Operation complete", orientation: "vertical" },
    description: "Stack demo complete ✅ Remaining: 10",
    highlightLine: 0,
  };
}

// ── Code display ──

export const stackCode = `class Stack {
  private items: number[] = [];
  push(value: number): void {
    this.items.push(value);  // push element
  }
  pop(): number | undefined {
    return this.items.pop();  // pop element
  }
  peek(): number | undefined {
    return this.items[this.items.length - 1];  // peek top
  }
}`;

export const stackCodeLines = [
  "class Stack {",
  "  private items: number[] = [];",
  "  push(value: number): void {",
  "    this.items.push(value);  // push element",
  "  }",
  "  pop(): number | undefined {",
  "    return this.items.pop();  // pop element",
  "  }",
  "  peek(): number | undefined {",
  "    return this.items[this.items.length - 1];  // peek top",
  "  }",
  "}",
];

// ── Content definition ──

export const stackContent = {
  id: "stack",
  slug: "stack",
  title: "",
  titleKey: "content.structures.stack.title",
  category: "structure" as const,
  subcategory: "stack",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.structures.stack.desc",
  generator: stackGenerator,
  code: stackCode,
  language: "TypeScript",
  complexity: { time: "O(1)", space: "O(n)" },
  tags: [],
  icon: "📚",
  codeExamples: {
    typescript: {
      code: `class Stack {
  private items: number[] = [];
  push(value: number): void {
    this.items.push(value);              // ← push element
  }
  pop(): number | undefined {
    return this.items.pop();             // ← pop element
  }
  peek(): number | undefined {
    return this.items[this.items.length - 1]; // ← peek top
  }
  isEmpty(): boolean {
    return this.items.length === 0;
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct {
  int items[1000];
  int top;
} Stack;

void initStack(Stack* s) { s->top = -1; }

void push(Stack* s, int value) {
  s->items[++s->top] = value;            // ← push element
}

int pop(Stack* s) {
  return s->items[s->top--];             // ← pop element
}

int peek(Stack* s) {
  return s->items[s->top];               // ← peek top
}

int isEmpty(Stack* s) {
  return s->top == -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class Stack {
  vector<int> items;
public:
  void push(int value) {
    items.push_back(value);              // ← push element
  }
  int pop() {
    int val = items.back();
    items.pop_back();                    // ← pop element
    return val;
  }
  int peek() {
    return items.back();                 // ← peek top
  }
  bool isEmpty() {
    return items.empty();
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class Stack:
    def __init__(self):
        self.items = []

    def push(self, value):
        self.items.append(value)          # ← push element

    def pop(self):
        return self.items.pop()           # ← pop element

    def peek(self):
        return self.items[-1]             # ← peek top

    def is_empty(self):
        return len(self.items) == 0`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `struct Stack {
    items: Vec<i32>,
}

impl Stack {
    fn new() -> Self { Stack { items: Vec::new() } }

    fn push(&mut self, value: i32) {
        self.items.push(value);           // ← push element
    }

    fn pop(&mut self) -> Option<i32> {
        self.items.pop()                  // ← pop element
    }

    fn peek(&self) -> Option<&i32> {
        self.items.last()                 // ← peek top
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type Stack struct {
  items []int
}

func (s *Stack) Push(value int) {
  s.items = append(s.items, value)        // ← push element
}

func (s *Stack) Pop() (int, bool) {
  if len(s.items) == 0 { return 0, false }
  val := s.items[len(s.items)-1]
  s.items = s.items[:len(s.items)-1]      // ← pop element
  return val, true
}

func (s *Stack) Peek() (int, bool) {
  if len(s.items) == 0 { return 0, false }
  return s.items[len(s.items)-1], true   // ← peek top
}

func (s *Stack) IsEmpty() bool {
  return len(s.items) == 0
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class Stack {
  private int[] items;
  private int top;

  Stack(int capacity) {
    items = new int[capacity];
    top = -1;
  }

  void push(int value) {
    items[++top] = value;                // ← push element
  }

  int pop() {
    return items[top--];                  // ← pop element
  }

  int peek() {
    return items[top];                    // ← peek top
  }

  boolean isEmpty() {
    return top == -1;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "call-stack",
      i18nKey: "content.structures.stack.scenarios.call-stack",
      domain: "system",
      icon: "⚙️",
      reference: "V8 engine, JVM, Go runtime",
      codeSnippet: {
        language: "javascript",
        code: `// Each function call pushes a frame onto the call stack
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2); // stack frames
}
// Stack overflow when recursion depth exceeds the limit
// V8 default: ~15,000 frames for Node.js`,
      },
    },
    {
      id: "expression-eval",
      i18nKey: "content.structures.stack.scenarios.expression-eval",
      domain: "devtools",
      icon: "🧮",
      reference: "JavaScript parser, Python eval, Ruby MRI",
    },
    {
      id: "browser-back",
      i18nKey: "content.structures.stack.scenarios.browser-back",
      domain: "library",
      icon: "🌐",
      reference: "Chrome, Firefox, Safari",
    },
  ] satisfies Scenario[],
};
