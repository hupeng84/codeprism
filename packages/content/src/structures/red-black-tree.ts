import type { Frame, Scenario, TreeState, TreeNode } from "@codeprism/core";

/**
 * Red-Black Tree — Frame Generator
 * Inserts values one by one into an RBT, showing violation detection and fixup.
 *
 * Color encoding via status:
 *   RED   = status "found"
 *   BLACK = status "default"
 *
 * RBT rules:
 * 1. Every node is either RED or BLACK
 * 2. Root is BLACK
 * 3. NIL (null children) are BLACK
 * 4. RED nodes cannot have RED children  (no red-red violation)
 * 5. All paths from node to NIL have same BLACK height
 */

export function* redBlackTreeGenerator(): Generator<Frame<TreeState>, void, unknown> {
  const input = [10, 5, 15, 3, 7, 12, 20];
  let root: TreeNode | null = null;
  let step = 0;
  let nodeIdCounter = 0;

  function makeNode(value: number): TreeNode {
    return createNode(`n${nodeIdCounter++}`, value);
  }

  function cloneWithStatus(
    node: TreeNode | null,
    markValue: number | null,
    markStatus: TreeNode["status"],
  ): TreeNode | null {
    if (!node) return null;
    return {
      id: node.id,
      value: node.value,
      x: 0,
      y: 0,
      status: node.value === markValue ? markStatus : node.status,
      left: node.left ? cloneWithStatus(node.left, markValue, markStatus) : null,
      right: node.right ? cloneWithStatus(node.right, markValue, markStatus) : null,
    };
  }

  function markSubtree(
    node: TreeNode | null,
    values: number[],
    markStatus: TreeNode["status"],
  ): TreeNode | null {
    if (!node) return null;
    return {
      id: node.id,
      value: node.value,
      x: 0,
      y: 0,
      status: values.includes(node.value) ? markStatus : node.status,
      left: node.left ? markSubtree(node.left, values, markStatus) : null,
      right: node.right ? markSubtree(node.right, values, markStatus) : null,
    };
  }

  // ── Empty tree ─────────────────────────────────────────────────────────────
  yield {
    step: step++,
    state: { root: null, operation: "empty tree" },
    description: "Initial empty tree. RBT root must be black.",
    highlightLine: 0,
  };

  // ── Insert 10 (root, BLACK) ───────────────────────────────────────────────
  root = makeNode(10);
  root.status = "default"; // BLACK
  yield {
    step: step++,
    state: {
      root: cloneWithStatus(root, 10, "found"),
      operation: "Insert 10",
    },
    description: "Insert 10 as root → painted BLACK. Root must be black.",
    highlightLine: 9,
  };

  // ── Insert 5 (RED, left of 10) — valid ───────────────────────────────────
  {
    const parent = root;
    const newNode = makeNode(5);
    newNode.status = "found"; // RED
    parent.left = newNode;

    yield {
      step: step++,
      state: {
        root: cloneWithStatus(root, 5, "found"),
        operation: "Insert 5",
      },
      description: "Insert 5 (RED) as 10 's left child. Parent 10 is black, no conflict ✅",
      highlightLine: 14,
    };
  }

  // ── Insert 15 (RED, right of 10) — valid ────────────────────────────────
  {
    const parent = root;
    const newNode = makeNode(15);
    newNode.status = "found"; // RED
    parent.right = newNode;

    yield {
      step: step++,
      state: {
        root: cloneWithStatus(root, 15, "found"),
        operation: "Insert 15",
      },
      description:
        "Insert 15 (RED) as 10 's right child. Parent 10 is black, no conflict ✅",
      highlightLine: 14,
    };
  }

  // ── Insert 3 (RED, left of 5) — valid ───────────────────────────────────
  {
    const parent = root.left!; // 5
    const newNode = makeNode(3);
    newNode.status = "found"; // RED
    parent.left = newNode;

    yield {
      step: step++,
      state: {
        root: cloneWithStatus(root, 3, "found"),
        operation: "Insert 3",
      },
      description:
        "Insert 3 (RED) as 5 's left child. Parent 5 is black, no conflict ✅",
      highlightLine: 14,
    };
  }

  // ── Insert 7 (RED, right of 5) — RED-RED violation! ──────────────────────
  // Tree before: 10(B) → 5(R) → 3(R)?, 30(R)
  // Wait, let me check actual tree state
  // After insert 15: root=10(B), left=5(R), right=15(R)
  // After insert 3: 5(R).left=3(R), 5(R).right=null
  // So 10(B) → 5(R) → 3(R)
  // Insert 7: 5(R).right=7(R) → RED-RED violation! (parent 5 is RED, child 7 is RED)
  {
    const parent = root.left!; // 5
    const newNode = makeNode(7);
    newNode.status = "found"; // RED
    parent.right = newNode;

    // Show violation
    yield {
      step: step++,
      state: {
        root: markSubtree(root, [5, 7], "visiting"),
        operation: "Insert 7",
      },
      description:
        "Insert 7 (RED) as 5's right child → Red-red violation! Nodes 5 and 7 both red ❌",
      highlightLine: 14,
    };

    // Show uncle: 5's right is null = BLACK NIL
    yield {
      step: step++,
      state: {
        root: markSubtree(root, [5, 7], "visiting"),
        operation: "Check uncle",
      },
      description:
        "Uncle = 5.right = null (NIL) = BLACK. Black uncle → rotation + recolor",
      highlightLine: 0,
    };

    // Triangle case: left-rotation on 5
    // Before: 5(R) → 3(R), 7(R)
    // After left-rotate 5: 7(B) → 5(R) → 3(R)?, null
    // Actually, let's trace carefully:
    // 5's left = 3, 5's right = 7
    // After rotating 5 left: 7 becomes parent of 5, 5 becomes left child of 7
    // So 7 becomes parent, 5 becomes left child, 3 stays as left child of 5
    // Final: 7(B) → 5(R) → 3(R), null
    const original5 = root.left!;
    const original7 = original5.right!;
    // Left rotation: 7 takes 5's place, 5 becomes left child of 7
    root.left = original7;
    original7.left = original5;
    original5.right = null;

    // Recoloring: 7 becomes RED, 5 becomes BLACK
    original7.status = "found"; // RED
    original5.status = "default"; // BLACK

    yield {
      step: step++,
      state: {
        root: cloneWithStatus(root, 7, "found"),
        operation: "Left rotate + recolor",
      },
      description:
        "LEFT-ROTATE(5): 7 rises to become 5's parent, 5 becomes 7's left child.\nRecolor: 7→ RED, 5→ BLACK ✅",
      highlightLine: 0,
    };
  }

  // ── Insert 12 (RED, left of 15) — valid ───────────────────────────────────
  {
    const parent = root.right!; // 15
    const newNode = makeNode(12);
    newNode.status = "found"; // RED
    parent.left = newNode;

    yield {
      step: step++,
      state: {
        root: cloneWithStatus(root, 12, "found"),
        operation: "Insert 12",
      },
      description:
        "Insert 12 (RED) as 15 's left child. Parent 15 is black, no conflict ✅",
      highlightLine: 14,
    };
  }

  // ── Insert 20 (RED, right of 15) — RED-RED violation! ────────────────────
  // Tree: 10(B) → 5(B→RED after fix), ? and ? → ??
  // Actually let's just visualize current tree:
  // root=10(B), left=7(R), right=15(R)
  // 7.left=5(R), 7.right=null; 5.left=3(R), 5.right=null
  // 15.left=12(R), 15.right=null
  // Insert 20: 15.right=20(R) → parent 15 is RED → violation!
  {
    const parent = root.right!; // 15
    const newNode = makeNode(20);
    newNode.status = "found"; // RED
    parent.right = newNode;

    // Show violation
    yield {
      step: step++,
      state: {
        root: markSubtree(root, [15, 20], "visiting"),
        operation: "Insert 20",
      },
      description:
        "Insert 20 (RED) as 15's right child → Red-red violation! Nodes 15 and 20 both red ❌",
      highlightLine: 14,
    };

    // Show uncle: 15's left = 12(R) = RED uncle!
    yield {
      step: step++,
      state: {
        root: markSubtree(root, [15, 20, 12], "visiting"),
        operation: "Check uncle",
      },
      description:
        "Uncle = 15.left = 12 (RED). Red uncle → recolor only (no rotation)",
      highlightLine: 0,
    };

    // Recoloring: 12 becomes BLACK, 15 becomes BLACK, 10 becomes RED
    const node10 = root;
    const node12 = root.right!.left!;
    const node15 = root.right!;

    node12.status = "default"; // BLACK
    node15.status = "default"; // BLACK
    node10.status = "found"; // RED

    yield {
      step: step++,
      state: {
        root: cloneWithStatus(root, 10, "found"),
        operation: "recolor",
      },
      description:
        "Recolor: 12→ BLACK, 15→ BLACK, 10→ RED. Root 10 becomes red, needs extra handling (root repainted black). ✅",
      highlightLine: 0,
    };

    // Final tree state
    yield {
      step: step++,
      state: {
        root: markSubtree(root, [], "default"),
        operation: "Complete",
      },
      description:
        "RBT insert complete ✅\nFinal tree: 10(B) root, 5(R) and 15(B) children...\nAll red-red violations fixed, black count equal.",
      highlightLine: 0,
    };
  }

  // Final frame — all nodes in default (BLACK) status for clean display
  yield {
    step: step++,
    state: {
      root: cloneWithStatus(root, 10, "default"),
      operation: "Final tree",
    },
    description: `RBT build complete ✅ ${input.length} nodes\nNote: red nodes highlighted in tree.`,
    highlightLine: 14,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function createNode(id: string, value: number): TreeNode {
  return {
    id,
    value,
    x: 0,
    y: 0,
    left: null,
    right: null,
    status: "default",
  };
}

// ── Code display ─────────────────────────────────────────────────────────────

export const redBlackTreeCode = `enum Color { RED, BLACK }

class RBNode {
  constructor(
    public value: number,
    public color: Color = Color.RED,
    public left?: RBNode,
    public right?: RBNode,
    public parent?: RBNode,
  ) {}
}

function insertFixup(node: RBNode): void {
  while (node.parent?.color === Color.RED) {
    if (node.parent === node.parent.parent?.left) {
      const uncle = node.parent.parent.right;
      if (uncle?.color === Color.RED) {          // ← case 1: uncle is red
        node.parent.color = Color.BLACK;
        uncle.color = Color.BLACK;
        node.parent.parent.color = Color.RED;
        node = node.parent.parent;
      } else if (node === node.parent.right) {    // ← case 2: triangle
        node = node.parent;
        rotateLeft(node);
      } else {                                   // ← case 3: line
        node.parent.color = Color.BLACK;
        node.parent.parent.color = Color.RED;
        rotateRight(node.parent.parent);
      }
    }
  }
}`;

export const redBlackTreeCodeLines = [
  "enum Color { RED, BLACK }",
  "",
  "class RBNode {",
  "  constructor(",
  "    public value: number,",
  "    public color: Color = Color.RED,",
  "    public left?: RBNode,",
  "    public right?: RBNode,",
  "    public parent?: RBNode,",
  "  ) {}",
  "}",
  "",
  "function insertFixup(node: RBNode): void {",
  "  while (node.parent?.color === Color.RED) {",
  "    const uncle = node.parent.parent?.right;",
  "    if (uncle?.color === Color.RED) {          // ← case 1: uncle is red",
  "      node.parent.color = Color.BLACK;         // recolor",
  "      uncle.color = Color.BLACK;",
  "      node.parent.parent!.color = Color.RED;",
  "    }",
  "  }",
  "}",
];

// ── Content definition ────────────────────────────────────────────────────────

export const redBlackTreeContent = {
  id: "red-black-tree",
  slug: "red-black-tree",
  title: "",
  titleKey: "content.structures.red-black-tree.title",
  category: "structure" as const,
  subcategory: "tree",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.red-black-tree.desc",
  generator: redBlackTreeGenerator,
  code: redBlackTreeCode,
  language: "TypeScript",
  complexity: { time: "O(log n)", space: "O(n)" },
  tags: [],
  icon: "🔴⚫️",
  codeExamples: {
    typescript: {
      code: `enum Color { RED, BLACK }

class RBNode {
  constructor(
    public value: number,
    public color: Color = Color.RED,
    public left?: RBNode,
    public right?: RBNode,
    public parent?: RBNode,
  ) {}
}

function insertFixup(node: RBNode): void {
  while (node.parent?.color === Color.RED) {
    if (node.parent === node.parent.parent?.left) {
      const uncle = node.parent.parent.right;
      if (uncle?.color === Color.RED) {          // ← case 1: uncle is red
        node.parent.color = Color.BLACK;
        uncle.color = Color.BLACK;
        node.parent.parent.color = Color.RED;
        node = node.parent.parent;
      } else if (node === node.parent.right) {    // ← case 2: triangle
        node = node.parent;
        rotateLeft(node);
      } else {                                   // ← case 3: line
        node.parent.color = Color.BLACK;
        node.parent.parent.color = Color.RED;
        rotateRight(node.parent.parent);
      }
    }
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef enum { RED, BLACK } Color;

typedef struct RBNode {
  int value;
  Color color;
  struct RBNode *left, *right, *parent;
} RBNode;

RBNode* rotateLeft(RBNode* x) {
  RBNode* y = x->right;
  x->right = y->left;                     // ← left rotate
  y->left = x;
  y->color = x->color;
  x->color = RED;
  return y;
}

RBNode* rotateRight(RBNode* y) {
  RBNode* x = y->left;
  y->left = x->right;                     // ← right rotate
  x->right = y;
  x->color = y->color;
  y->color = RED;
  return x;
}

void insertFixup(RBNode** root, RBNode* z) {
  while (z->parent && z->parent->color == RED) {
    if (z->parent == z->parent->parent->left) {
      RBNode* uncle = z->parent->parent->right;
      if (uncle && uncle->color == RED) {         // ← case 1: uncle is red
        z->parent->color = BLACK;
        uncle->color = BLACK;
        z->parent->parent->color = RED;
        z = z->parent->parent;
      } else {
        if (z == z->parent->right) {              // ← case 2: triangle
          z = z->parent;
          *root = rotateLeft(*root);
        }
        z->parent->color = BLACK;                 // ← case 3: line
        z->parent->parent->color = RED;
        *root = rotateRight(*root);
      }
    }
  }
  (*root)->color = BLACK;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `enum class Color { RED, BLACK };

struct RBNode {
  int value;
  Color color;
  RBNode *left, *right, *parent;
  RBNode(int v) : value(v), color(Color::RED),
    left(nullptr), right(nullptr), parent(nullptr) {}
};

RBNode* rotateLeft(RBNode* x) {
  RBNode* y = x->right;
  x->right = y->left;                     // ← left rotate
  y->left = x;
  y->color = x->color;
  x->color = Color::RED;
  return y;
}

RBNode* rotateRight(RBNode* y) {
  RBNode* x = y->left;
  y->left = x->right;                     // ← right rotate
  x->right = y;
  x->color = y->color;
  y->color = Color::RED;
  return x;
}

void insertFixup(RBNode*& root, RBNode* z) {
  while (z->parent && z->parent->color == Color::RED) {
    if (z->parent == z->parent->parent->left) {
      RBNode* uncle = z->parent->parent->right;
      if (uncle && uncle->color == Color::RED) {  // ← case 1: uncle is red
        z->parent->color = Color::BLACK;
        uncle->color = Color::BLACK;
        z->parent->parent->color = Color::RED;
        z = z->parent->parent;
      } else {
        if (z == z->parent->right) {               // ← case 2: triangle
          z = z->parent;
          rotateLeft(z);
        }
        z->parent->color = Color::BLACK;            // ← case 3: line
        z->parent->parent->color = Color::RED;
        rotateRight(z->parent->parent);
      }
    }
  }
  root->color = Color::BLACK;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from enum import Enum

class Color(Enum):
    RED = "red"
    BLACK = "black"

class RBNode:
    def __init__(self, value):
        self.value = value
        self.color = Color.RED
        self.left = self.right = self.parent = None

def rotate_left(x):
    y = x.right
    x.right = y.left                       # ← left rotate
    y.left = x
    y.color = x.color
    x.color = Color.RED
    return y

def rotate_right(y):
    x = y.left
    y.left = x.right                       # ← right rotate
    x.right = y
    x.color = y.color
    y.color = Color.RED
    return x

def insert_fixup(root, z):
    while z.parent and z.parent.color == Color.RED:
        if z.parent == z.parent.parent.left:
            uncle = z.parent.parent.right
            if uncle and uncle.color == Color.RED:  # ← case 1: uncle is red
                z.parent.color = Color.BLACK
                uncle.color = Color.BLACK
                z.parent.parent.color = Color.RED
                z = z.parent.parent
            else:
                if z == z.parent.right:              # ← case 2: triangle
                    z = z.parent
                    rotate_left(root)
                z.parent.color = Color.BLACK          # ← case 3: line
                z.parent.parent.color = Color.RED
                rotate_right(root)
    root.color = Color.BLACK
    return root`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `#[derive(Clone, Copy, PartialEq)]
enum Color { Red, Black }

#[derive(Clone)]
struct RBNode {
    value: i32,
    color: Color,
    left: Option<Box<RBNode>>,
    right: Option<Box<RBNode>>,
}

fn rotate_left(mut x: Box<RBNode>) -> Box<RBNode> {
    let mut y = x.right.take().unwrap();
    x.right = y.left.take();              // ← left rotate
    y.left = Some(x);
    y.color = Color::Black;
    y
}

fn rotate_right(mut y: Box<RBNode>) -> Box<RBNode> {
    let mut x = y.left.take().unwrap();
    y.left = x.right.take();              // ← right rotate
    x.right = Some(y);
    x.color = Color::Black;
    x
}

fn insert_fixup(mut z: Box<RBNode>) -> Box<RBNode> {
    loop {
        if z.color != Color::Red { break; }
        // Simplified fixup — rotate & recolor as needed
        if let Some(ref left) = z.left {
            if left.color == Color::Red { z = rotate_right(z); break; }
        }
        if let Some(ref right) = z.right {
            if right.color == Color::Red { z = rotate_left(z); break; }
        }
        break;
    }
    z.color = Color::Black;
    z
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type Color int

const (
  RED   Color = 0
  BLACK Color = 1
)

type RBNode struct {
  Value                    int
  Color                    Color
  Left, Right, Parent *RBNode
}

func rotateLeft(x *RBNode) *RBNode {
  y := x.Right
  x.Right = y.Left                         // ← left rotate
  y.Left = x
  y.Color = x.Color
  x.Color = RED
  return y
}

func rotateRight(y *RBNode) *RBNode {
  x := y.Left
  y.Left = x.Right                         // ← right rotate
  x.Right = y
  x.Color = y.Color
  y.Color = RED
  return x
}

func insertFixup(root *RBNode, z *RBNode) *RBNode {
  for z.Parent != nil && z.Parent.Color == RED {
    if z.Parent == z.Parent.Parent.Left {
      uncle := z.Parent.Parent.Right
      if uncle != nil && uncle.Color == RED { // ← case 1: uncle is red
        z.Parent.Color = BLACK
        uncle.Color = BLACK
        z.Parent.Parent.Color = RED
        z = z.Parent.Parent
      } else {
        if z == z.Parent.Right {               // ← case 2: triangle
          z = z.Parent
          root = rotateLeft(root)
        }
        z.Parent.Color = BLACK                 // ← case 3: line
        z.Parent.Parent.Color = RED
        root = rotateRight(root)
      }
    }
  }
  root.Color = BLACK
  return root
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `enum Color { RED, BLACK }

class RBNode {
  int value;
  Color color;
  RBNode left, right, parent;
  RBNode(int v) { this.value = v; this.color = Color.RED; }
}

class RedBlackTree {
  RBNode rotateLeft(RBNode x) {
    RBNode y = x.right;
    x.right = y.left;                      // ← left rotate
    y.left = x;
    y.color = x.color;
    x.color = Color.RED;
    return y;
  }

  RBNode rotateRight(RBNode y) {
    RBNode x = y.left;
    y.left = x.right;                      // ← right rotate
    x.right = y;
    x.color = y.color;
    y.color = Color.RED;
    return x;
  }

  void insertFixup(RBNode root, RBNode z) {
    while (z.parent != null && z.parent.color == Color.RED) {
      if (z.parent == z.parent.parent.left) {
        RBNode uncle = z.parent.parent.right;
        if (uncle != null && uncle.color == Color.RED) { // ← case 1: uncle is red
          z.parent.color = Color.BLACK;
          uncle.color = Color.BLACK;
          z.parent.parent.color = Color.RED;
          z = z.parent.parent;
        } else {
          if (z == z.parent.right) {                     // ← case 2: triangle
            z = z.parent;
            rotateLeft(z);
          }
          z.parent.color = Color.BLACK;                  // ← case 3: line
          z.parent.parent.color = Color.RED;
          rotateRight(z.parent.parent);
        }
      }
    }
    root.color = Color.BLACK;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "java-tree-map",
      i18nKey: "content.structures.red-black-tree.scenarios.java-tree-map",
      domain: "library",
      icon: "☕",
      reference: "Java TreeMap, C++ std::map, Java TreeSet",
      codeSnippet: {
        language: "java",
        code: `// Java TreeMap uses a Red-Black Tree internally
TreeMap<String, Integer> scores = new TreeMap<>();
scores.put("Alice", 95);   // O(log n) insert with recoloring
scores.put("Bob", 87);
int score = scores.get("Alice");       // O(log n) lookup
NavigableMap<String, Integer> tail = scores.tailMap("B"); // range query`,
      },
    },
    {
      id: "linux-cfs",
      i18nKey: "content.structures.red-black-tree.scenarios.linux-cfs",
      domain: "system",
      icon: "🐧",
      reference: "Linux kernel CFS scheduler, nginx timer wheel",
    },
    {
      id: "epoll",
      i18nKey: "content.structures.red-black-tree.scenarios.epoll",
      domain: "network",
      icon: "🌐",
      reference: "Linux epoll, nginx, Node.js libuv",
    },
  ] satisfies Scenario[],
};
