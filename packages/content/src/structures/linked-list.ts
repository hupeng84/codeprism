import type { Frame, Scenario, ListState, ListNode } from "@codeprism/core";

/**
 * Linked List — Frame Generator
 * Inserts values one by one at tail, then searches for 8, then deletes 3.
 */
export function* linkedListGenerator(): Generator<Frame<ListState>, void, unknown> {
  const input = [5, 3, 8, 1, 9, 2, 7];
  let step = 0;
  let nodeIdCounter = 0;
  const nodes: ListNode[] = [];

  // ── Empty list ──
  yield {
    step: step++,
    state: { nodes: [], operation: "empty list", orientation: "horizontal" },
    description: "Initial empty list, ready to insert elements",
    highlightLine: 0,
  };

  // ── Insert each value at tail ──
  for (const value of input) {
    if (nodes.length === 0) {
      // Insert as head
      nodes.push({ id: `n${nodeIdCounter++}`, value, status: "highlighted" });
      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          operation: `Insert ${value}`,
          orientation: "horizontal",
        },
        description: `Insert ${value} as head node (first node)`,
        highlightLine: 10,
      };
      nodes[0]!.status = "default";
    } else {
      // Traverse to tail — show the last node as active
      const tailIdx = nodes.length - 1;
      const traverseNodes: ListNode[] = nodes.map((n, i) => ({
        ...n,
        status: i === tailIdx ? "active" : "default",
      }));
      yield {
        step: step++,
        state: {
          nodes: traverseNodes,
          operation: `traverse to tailInsert ${value}`,
          orientation: "horizontal",
        },
        description: `Traverse to list tail (node ${nodes[tailIdx]!.value}), ready to insert ${value}`,
        highlightLine: 12,
      };

      // Insert at tail
      nodes.push({ id: `n${nodeIdCounter++}`, value, status: "highlighted" });
      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n, status: "default" as const })),
          operation: `${value} inserted`,
          orientation: "horizontal",
        },
        description: `${value} inserted at list tail ✅`,
        highlightLine: 13,
      };
    }
  }

  // ── Search for value 8 ──
  const searchValue = 8;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    const isTarget = node.value === searchValue;

    const searchNodes: ListNode[] = nodes.map((n, idx) => ({
      ...n,
      status: idx === i ? (isTarget ? "found" : "active") : "default",
    }));

    yield {
      step: step++,
      state: {
        nodes: searchNodes,
        operation: `Search ${searchValue}`,
        orientation: "horizontal",
      },
      description: isTarget
        ? `Search ${searchValue}: found! At index ${i} ✅`
        : `Search ${searchValue}: current node ${node.value}, continue search`,
      highlightLine: isTarget ? 20 : 19,
    };

    if (isTarget) break;
  }

  // ── Delete node with value 3 ──
  const deleteValue = 3;
  const deleteIdx = nodes.findIndex((n) => n.value === deleteValue);

  // Traverse to find the node to delete
  for (let i = 0; i <= deleteIdx; i++) {
    const isTarget = i === deleteIdx;
    const deleteNodes: ListNode[] = nodes.map((n, idx) => ({
      ...n,
      status: idx === i ? (isTarget ? "found" : "active") : "default",
    }));

    yield {
      step: step++,
      state: {
        nodes: deleteNodes,
        operation: `Delete ${deleteValue}`,
        orientation: "horizontal",
      },
      description: isTarget
        ? `Found node to delete: ${deleteValue}`
        : `: Traverse list to find ${deleteValue}: current node ${nodes[i]!.value}`,
      highlightLine: isTarget ? 32 : 30,
    };
  }

  // Remove the node
  nodes.splice(deleteIdx, 1);
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n, status: "default" })),
      operation: `${deleteValue} deleted`,
      orientation: "horizontal",
    },
    description: `Node ${deleteValue} deleted ✅`,
    highlightLine: 32,
  };

  // ── Final state ──
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n, status: "default" })),
      operation: "Operation complete",
      orientation: "horizontal",
    },
    description: `Linked list complete ✅ Total ${nodes.length} nodes`,
    highlightLine: 32,
  };
}

// ── Code display ──

export const linkedListCode = `class Node {
  constructor(
    public value: number,
    public next: Node | null = null
  ) {}
}

function insertAtTail(head: Node | null, value: number): Node {
  const newNode = new Node(value);
  if (!head) return newNode;             // empty list
  let cur: Node = head;
  while (cur.next) cur = cur.next;       // traverse to tail
  cur.next = newNode;                    // insert at tail
  return head;
}

function search(head: Node | null, value: number): boolean {
  let cur = head;
  while (cur) {
    if (cur.value === value) return true; // found
    cur = cur.next;
  }
  return false;
}

function deleteNode(head: Node | null, value: number): Node | null {
  if (!head) return null;
  if (head.value === value) return head.next;
  let cur: Node = head;
  while (cur.next && cur.next.value !== value)
    cur = cur.next;
  if (cur.next) cur.next = cur.next.next;
  return head;
}`;

export const linkedListCodeLines = [
  "class Node {",
  "  constructor(",
  "    public value: number,",
  "    public next: Node | null = null",
  "  ) {}",
  "}",
  "",
  "function insertAtTail(head: Node | null, value: number): Node {",
  "  const newNode = new Node(value);",
  "  if (!head) return newNode;             // empty list",
  "  let cur: Node = head;",
  "  while (cur.next) cur = cur.next;       // traverse to tail",
  "  cur.next = newNode;                    // insert at tail",
  "  return head;",
  "}",
  "",
  "function search(head: Node | null, value: number): boolean {",
  "  let cur = head;",
  "  while (cur) {",
  "    if (cur.value === value) return true; // found",
  "    cur = cur.next;",
  "  }",
  "  return false;",
  "}",
  "",
  "function deleteNode(head: Node | null, value: number): Node | null {",
  "  if (!head) return null;",
  "  if (head.value === value) return head.next;",
  "  let cur: Node = head;",
  "  while (cur.next && cur.next.value !== value)",
  "    cur = cur.next;",
  "  if (cur.next) cur.next = cur.next.next;",
  "  return head;",
  "}",
];

// ── Content definition ──

export const linkedListContent = {
  id: "linked-list",
  slug: "linked-list",
  title: "",
  titleKey: "content.structures.linked-list.title",
  category: "structure" as const,
  subcategory: "linear",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.structures.linked-list.desc",
  generator: linkedListGenerator,
  code: linkedListCode,
  language: "TypeScript",
  complexity: { time: "O(n) access", space: "O(n)" },
  tags: [],
  icon: "🔗",
  codeExamples: {
    typescript: {
      code: `class Node {
  constructor(
    public value: number,
    public next: Node | null = null
  ) {}
}

function insertAtTail(head: Node | null, value: number): Node {
  const newNode = new Node(value);
  if (!head) return newNode;             // empty list
  let cur: Node = head;
  while (cur.next) cur = cur.next;       // traverse to tail
  cur.next = newNode;                    // insert at tail
  return head;
}

function search(head: Node | null, value: number): boolean {
  let cur = head;
  while (cur) {
    if (cur.value === value) return true; // found
    cur = cur.next;
  }
  return false;
}

function deleteNode(head: Node | null, value: number): Node | null {
  if (!head) return null;
  if (head.value === value) return head.next;
  let cur: Node = head;
  while (cur.next && cur.next.value !== value)
    cur = cur.next;
  if (cur.next) cur.next = cur.next.next;
  return head;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct Node {
  int value;
  struct Node *next;
} Node;

Node* insertAtTail(Node* head, int value) {
  Node* newNode = malloc(sizeof(Node));
  newNode->value = value;
  newNode->next = NULL;
  if (!head) return newNode;             // empty list
  Node* cur = head;
  while (cur->next) cur = cur->next;     // traverse to tail
  cur->next = newNode;                   // insert at tail
  return head;
}

int search(Node* head, int value) {
  Node* cur = head;
  while (cur) {
    if (cur->value == value) return 1;   // found
    cur = cur->next;
  }
  return 0;
}

Node* deleteNode(Node* head, int value) {
  if (!head) return NULL;
  if (head->value == value) return head->next;
  Node* cur = head;
  while (cur->next && cur->next->value != value)
    cur = cur->next;
  if (cur->next) cur->next = cur->next->next;
  return head;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `struct Node {
  int value;
  Node* next;
  Node(int v) : value(v), next(nullptr) {}
};

Node* insertAtTail(Node* head, int value) {
  Node* newNode = new Node(value);
  if (!head) return newNode;             // empty list
  Node* cur = head;
  while (cur->next) cur = cur->next;     // traverse to tail
  cur->next = newNode;                   // insert at tail
  return head;
}

bool search(Node* head, int value) {
  Node* cur = head;
  while (cur) {
    if (cur->value == value) return true; // found
    cur = cur->next;
  }
  return false;
}

Node* deleteNode(Node* head, int value) {
  if (!head) return nullptr;
  if (head->value == value) return head->next;
  Node* cur = head;
  while (cur->next && cur->next->value != value)
    cur = cur->next;
  if (cur->next) cur->next = cur->next->next;
  return head;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

def insert_at_tail(head, value):
    new_node = Node(value)
    if not head:                          # empty list
        return new_node
    cur = head
    while cur.next:                       # traverse to tail
        cur = cur.next
    cur.next = new_node                   # insert at tail
    return head

def search(head, value):
    cur = head
    while cur:
        if cur.value == value:            # found
            return True
        cur = cur.next
    return False

def delete_node(head, value):
    if not head: return None
    if head.value == value: return head.next
    cur = head
    while cur.next and cur.next.value != value:
        cur = cur.next
    if cur.next:
        cur.next = cur.next.next
    return head`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `#[derive(Debug)]
struct Node {
    value: i32,
    next: Option<Box<Node>>,
}

fn insert_at_tail(mut head: Option<Box<Node>>, value: i32) -> Option<Box<Node>> {
    let new_node = Box::new(Node { value, next: None });
    if head.is_none() {                    // empty list
        return Some(new_node);
    }
    let mut cur = head.as_mut().unwrap();
    while cur.next.is_some() {             // traverse to tail
        cur = cur.next.as_mut().unwrap();
    }
    cur.next = Some(new_node);             // insert at tail
    head
}

fn search(mut head: Option<&Node>, value: i32) -> bool {
    let mut cur = head;
    while let Some(node) = cur {
        if node.value == value { return true; }  // found
        cur = node.next.as_deref();
    }
    false
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type Node struct {
  Value int
  Next  *Node
}

func InsertAtTail(head *Node, value int) *Node {
  newNode := &Node{Value: value}
  if head == nil {                        // empty list
    return newNode
  }
  cur := head
  for cur.Next != nil {                   // traverse to tail
    cur = cur.Next
  }
  cur.Next = newNode                      // insert at tail
  return head
}

func Search(head *Node, value int) bool {
  cur := head
  for cur != nil {
    if cur.Value == value { return true }  // found
    cur = cur.Next
  }
  return false
}

func DeleteNode(head *Node, value int) *Node {
  if head == nil { return nil }
  if head.Value == value { return head.Next }
  cur := head
  for cur.Next != nil && cur.Next.Value != value {
    cur = cur.Next
  }
  if cur.Next != nil { cur.Next = cur.Next.Next }
  return head
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class Node {
  int value;
  Node next;
  Node(int v) { this.value = v; }
}

class LinkedList {
  Node insertAtTail(Node head, int value) {
    Node newNode = new Node(value);
    if (head == null) return newNode;     // empty list
    Node cur = head;
    while (cur.next != null) cur = cur.next; // traverse to tail
    cur.next = newNode;                   // insert at tail
    return head;
  }

  boolean search(Node head, int value) {
    Node cur = head;
    while (cur != null) {
      if (cur.value == value) return true; // found
      cur = cur.next;
    }
    return false;
  }

  Node deleteNode(Node head, int value) {
    if (head == null) return null;
    if (head.value == value) return head.next;
    Node cur = head;
    while (cur.next != null && cur.next.value != value)
      cur = cur.next;
    if (cur.next != null) cur.next = cur.next.next;
    return head;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "lru-cache-impl",
      i18nKey: "content.structures.linked-list.scenarios.lru-cache-impl",
      domain: "library",
      icon: "📦",
      reference: "Java LinkedHashMap, C++ std::list",
      codeSnippet: {
        language: "typescript",
        code: `// Doubly-linked list powers LRU eviction
class DoublyLinkedNode {
  constructor(
    public key: number,
    public value: number,
    public prev: DoublyLinkedNode | null = null,
    public next: DoublyLinkedNode | null = null,
  ) {}
}
// Move-to-front: O(1) splice — remove node, insert after head`,
      },
    },
    {
      id: "hash-chaining",
      i18nKey: "content.structures.linked-list.scenarios.hash-chaining",
      domain: "system",
      icon: "🔗",
      reference: "Java HashMap, Go map, Python dict",
    },
    {
      id: "undo-redo",
      i18nKey: "content.structures.linked-list.scenarios.undo-redo",
      domain: "devtools",
      icon: "↩️",
      reference: "VS Code, Vim, Google Docs",
    },
  ] satisfies Scenario[],
};
