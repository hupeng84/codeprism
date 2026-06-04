import type { Frame, ListState, ListNode, Scenario } from "@codeprism/core";

/**
 * Queue — Frame Generator
 * Simulates enqueue/dequeue/front operations, yielding frames for each step.
 */
export function* queueGenerator(): Generator<Frame<ListState>, void, unknown> {
  const nodes: ListNode[] = [];
  let step = 0;
  let nodeIdCounter = 0;

  function makeNode(value: number, status: ListNode["status"] = "default"): ListNode {
    return { id: `n${nodeIdCounter++}`, value, status };
  }

  // Helper: emit current state
  function emit(
    operation: string,
    desc: string,
    highlightLine: number,
    activeNodeId?: string,
  ): Frame<ListState> {
    return {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({
          ...n,
          status: n.id === activeNodeId ? "active" : "default",
        })),
        operation,
        orientation: "horizontal",
      },
      description: desc,
      highlightLine,
    };
  }

  // ── 1. enqueue 10 ──
  nodes.push(makeNode(10));
  yield emit("Enqueue 10", "Add 10 to queue rear → [10]", 4);

  // ── 2. enqueue 20 ──
  nodes.push(makeNode(20));
  yield emit("Enqueue 20", "Add 20 to queue rear → [10, 20]", 4);

  // ── 3. enqueue 30 ──
  nodes.push(makeNode(30));
  yield emit("Enqueue 30", "Add 30 to queue rear → [10, 20, 30]", 4);

  // ── 4. front — View front ──
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n, i) => ({
        ...n,
        status: i === 0 ? "found" : "default",
      })),
      operation: "View front",
      orientation: "horizontal",
    },
    description: "Peek front element: 10 (no deletion)",
    highlightLine: 10,
  };

  // ── 5. dequeue (10) ──
  // Mark front as highlighted first
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n, i) => ({
        ...n,
        status: i === 0 ? "highlighted" : "default",
      })),
      operation: "dequeue 10",
      orientation: "horizontal",
    },
    description: "Ready to remove front element 10 ⚡",
    highlightLine: 7,
  };
  // Remove front
  nodes.shift();
  yield emit("dequeue 10", "10 dequeued → [20, 30]", 8);

  // ── 6. enqueue 40 ──
  nodes.push(makeNode(40));
  yield emit("Enqueue 40", "Add 40 to queue rear → [20, 30, 40]", 4);

  // ── 7. dequeue (20) ──
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n, i) => ({
        ...n,
        status: i === 0 ? "highlighted" : "default",
      })),
      operation: "dequeue 20",
      orientation: "horizontal",
    },
    description: "Ready to remove front element 20 ⚡",
    highlightLine: 7,
  };
  nodes.shift();
  yield emit("dequeue 20", "20 dequeued → [30, 40]", 8);

  // ── 8. dequeue (30) ──
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n, i) => ({
        ...n,
        status: i === 0 ? "highlighted" : "default",
      })),
      operation: "dequeue 30",
      orientation: "horizontal",
    },
    description: "Ready to remove front element 30 ⚡",
    highlightLine: 7,
  };
  nodes.shift();
  yield emit("dequeue 30", "30 dequeued → [40]", 8);

  // Final state
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n, status: "default" })),
      operation: "Operation complete",
      orientation: "horizontal",
    },
    description: "Queue operations complete ✅ Remaining: [40]",
    highlightLine: 15,
  };
}

// ── Code display ──

export const queueCodeLines = [
  "class Queue {",
  "  private items: number[] = [];",
  "",
  "  enqueue(value: number): void {",
  "    this.items.push(value);            // ← enqueue: add to rear",
  "  }",
  "",
  "  dequeue(): number | undefined {",
  "    return this.items.shift();         // ← dequeue: remove from front",
  "  }",
  "",
  "  front(): number | undefined {",
  "    return this.items[0];              // ← peek front element",
  "  }",
  "",
  "  isEmpty(): boolean {",
  "    return this.items.length === 0;",
  "  }",
  "}",
];

// ── Content definition ──

export const queueContent = {
  id: "queue",
  slug: "queue",
  title: "",
  titleKey: "content.structures.queue.title",
  category: "structure" as const,
  subcategory: "linear",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.structures.queue.desc",
  generator: queueGenerator,
  code: queueCodeLines.join("\n"),
  language: "TypeScript",
  complexity: { time: "O(1) enqueue/dequeue", space: "O(n)" },
  tags: [],
  icon: "📋",
  codeExamples: {
    typescript: {
      code: `class Queue {
  private items: number[] = [];

  enqueue(value: number): void {
    this.items.push(value);              // ← enqueue: add to rear
  }

  dequeue(): number | undefined {
    return this.items.shift();           // ← dequeue: remove from front
  }

  front(): number | undefined {
    return this.items[0];                // ← peek front element
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
  int front, rear;
} Queue;

void initQueue(Queue* q) { q->front = q->rear = 0; }

void enqueue(Queue* q, int value) {
  q->items[q->rear++] = value;           // ← enqueue: add to rear
}

int dequeue(Queue* q) {
  return q->items[q->front++];           // ← dequeue: remove from front
}

int front(Queue* q) {
  return q->items[q->front];             // ← peek front element
}

int isEmpty(Queue* q) {
  return q->front == q->rear;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class Queue {
  deque<int> items;
public:
  void enqueue(int value) {
    items.push_back(value);              // ← enqueue: add to rear
  }
  int dequeue() {
    int val = items.front();
    items.pop_front();                   // ← dequeue: remove from front
    return val;
  }
  int front() {
    return items.front();                // ← peek front element
  }
  bool isEmpty() {
    return items.empty();
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, value):
        self.items.append(value)          # ← enqueue: add to rear

    def dequeue(self):
        return self.items.popleft()       # ← dequeue: remove from front

    def front(self):
        return self.items[0]              # ← peek front element

    def is_empty(self):
        return len(self.items) == 0`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::VecDeque;

struct Queue {
    items: VecDeque<i32>,
}

impl Queue {
    fn new() -> Self { Queue { items: VecDeque::new() } }

    fn enqueue(&mut self, value: i32) {
        self.items.push_back(value);      // ← enqueue: add to rear
    }

    fn dequeue(&mut self) -> Option<i32> {
        self.items.pop_front()            // ← dequeue: remove from front
    }

    fn front(&self) -> Option<&i32> {
        self.items.front()                // ← peek front element
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type Queue struct {
  items []int
}

func (q *Queue) Enqueue(value int) {
  q.items = append(q.items, value)        // ← enqueue: add to rear
}

func (q *Queue) Dequeue() (int, bool) {
  if len(q.items) == 0 { return 0, false }
  val := q.items[0]
  q.items = q.items[1:]                   // ← dequeue: remove from front
  return val, true
}

func (q *Queue) Front() (int, bool) {
  if len(q.items) == 0 { return 0, false }
  return q.items[0], true                // ← peek front element
}

func (q *Queue) IsEmpty() bool {
  return len(q.items) == 0
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class Queue {
  private int[] items;
  private int front, rear;

  Queue(int capacity) {
    items = new int[capacity];
    front = rear = 0;
  }

  void enqueue(int value) {
    items[rear++] = value;                // ← enqueue: add to rear
  }

  int dequeue() {
    return items[front++];                // ← dequeue: remove from front
  }

  int front() {
    return items[front];                  // ← peek front element
  }

  boolean isEmpty() {
    return front == rear;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "bfs-traversal",
      i18nKey: "content.structures.queue.scenarios.bfs-traversal",
      domain: "system",
      icon: "🔄",
      reference: "Linux kernel scheduler, OS BFS page scan",
    },
    {
      id: "job-queue",
      i18nKey: "content.structures.queue.scenarios.job-queue",
      domain: "concurrency",
      icon: "⚙️",
      reference: "Sidekiq, Celery, Bull",
      codeSnippet: {
        language: "typescript",
        code: `// Sidekiq (Ruby) uses Redis lists as job queues
// producer: LPUSH queue_name job_payload
// consumer: BRPOP queue_name 0  (blocking pop)
// FIFO ordering ensures jobs execute in submission order`,
      },
    },
    {
      id: "message-queue",
      i18nKey: "content.structures.queue.scenarios.message-queue",
      domain: "data-pipeline",
      icon: "📨",
      reference: "Apache Kafka, RabbitMQ, Amazon SQS",
    },
  ] satisfies Scenario[],
};
