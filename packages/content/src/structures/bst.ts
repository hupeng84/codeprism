import type { Frame, Scenario, TreeState, TreeNode } from "@codeprism/core";

/**
 * BST — Frame Generator
 * Inserts values one by one into a BST, yielding frames for traversal + insertion.
 */
export function* bstGenerator(): Generator<Frame<TreeState>, void, unknown> {
  const input = [8, 3, 10, 1, 6, 14, 4, 7, 13];
  let root: TreeNode | null = null;
  let step = 0;
  let nodeIdCounter = 0;

  function makeNode(value: number): TreeNode {
    return createNode(`n${nodeIdCounter++}`, value);
  }

  // Empty tree
  yield {
    step: step++,
    state: { root: null, operation: "empty tree" },
    description: "Initial empty tree, ready to insert elements",
    highlightLine: 0,
  };

  for (const value of input) {
    if (!root) {
      root = makeNode(value);
      yield {
        step: step++,
        state: { root: cloneTree(root, value, "inserted"), operation: `Insert root node ${value}` },
        description: `Insert ${value} as root node`,
        highlightLine: 9,
      };
      continue;
    }

    // --- Traverse to find insertion point ---
    const path: { node: TreeNode; dir: "left" | "right" }[] = [];
    let cur: TreeNode = root;
    while (true) {
      if (value < cur.value) {
        if (cur.left) {
          path.push({ node: cur, dir: "left" });
          cur = cur.left;
        } else {
          path.push({ node: cur, dir: "left" });
          break;
        }
      } else {
        if (cur.right) {
          path.push({ node: cur, dir: "right" });
          cur = cur.right;
        } else {
          path.push({ node: cur, dir: "right" });
          break;
        }
      }
    }

    // Yield frames for each step in the traversal path
    for (let i = 0; i < path.length; i++) {
      const { node: visiting } = path[i];
      const isLast = i === path.length - 1;

      yield {
        step: step++,
        state: {
          root: cloneTree(root, visiting.value, "visiting"),
          operation: `Insert ${value}`,
        },
        description: isLast
          ? `${value} < ${visiting.value} → insert on left` as string
          : `Compare ${value} and ${visiting.value}: ${value < visiting.value ? "← go left" : "→ go right"}` as string,
        highlightLine: visiting.value > value ? 11 : 13,
      };
    }

    // --- Perform the actual insertion using known path ---
    const newNode = makeNode(value);
    const { node: parent, dir } = path[path.length - 1];
    if (dir === "left") parent.left = newNode;
    else parent.right = newNode;

    yield {
      step: step++,
      state: {
        root: cloneTree(root, value, "inserted"),
        operation: `${value} inserted`,
      },
      description: `${value} Insert succeeded ✅`,
      highlightLine: 14,
    };
  }

  // Final tree
  yield {
    step: step++,
    state: { root: cloneTree(root, null, "default"), operation: "Build complete" },
    description: `BST build complete ✅ Total ${input.length} nodes`,
    highlightLine: 14,
  };
}

// ── Helpers ──

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

function cloneTree(
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
    status: node.value === markValue ? markStatus : "default",
    left: node.left ? cloneTree(node.left, markValue, markStatus) : null,
    right: node.right ? cloneTree(node.right, markValue, markStatus) : null,
  };
}

// ── Code display ──

export const bstCode = `class BSTNode {
  constructor(
    public value: number,
    public left?: BSTNode,
    public right?: BSTNode,
  ) {}
}

function insert(root: BSTNode | null, value: number): BSTNode {
  if (!root) return new BSTNode(value);   // ← create root node
  if (value < root.value)
    root.left = insert(root.left, value);  // ← recurse left subtree
  else if (value > root.value)
    root.right = insert(root.right, value); // ← recurse right subtree
  return root;
}`;

export const bstCodeLines = [
  "class BSTNode {",
  "  constructor(",
  "    public value: number,",
  "    public left?: BSTNode,",
  "    public right?: BSTNode,",
  "  ) {}",
  "}",
  "",
  "function insert(root: BSTNode | null, value: number): BSTNode {",
  "  if (!root) return new BSTNode(value);   // ← create root node",
  "  if (value < root.value)",
  "    root.left = insert(root.left, value);  // ← recurse left subtree",
  "  else if (value > root.value)",
  "    root.right = insert(root.right, value); // ← recurse right subtree",
  "  return root;",
  "}",
];

// ── Content definition ──

export const bstContent = {
  id: "bst",
  slug: "bst",
  title: "",
  titleKey: "content.structures.bst.title",
  category: "structure" as const,
  subcategory: "tree",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.structures.bst.desc",
  generator: bstGenerator,
  code: bstCode,
  language: "TypeScript",
  complexity: { time: "O(log n) average", space: "O(n)" },
  tags: [],
  icon: "🌳",
  codeExamples: {
    typescript: {
      code: `class BSTNode {
  constructor(
    public value: number,
    public left?: BSTNode,
    public right?: BSTNode,
  ) {}
}

function insert(root: BSTNode | null, value: number): BSTNode {
  if (!root) return new BSTNode(value);   // ← create root node
  if (value < root.value)
    root.left = insert(root.left, value);  // ← recurse left subtree
  else if (value > root.value)
    root.right = insert(root.right, value); // ← recurse right subtree
  return root;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct BSTNode {
  int value;
  struct BSTNode *left, *right;
} BSTNode;

BSTNode* insert(BSTNode* root, int value) {
  if (!root) {
    BSTNode* node = malloc(sizeof(BSTNode)); // ← create node
    node->value = value;
    node->left = node->right = NULL;
    return node;
  }
  if (value < root->value)
    root->left = insert(root->left, value);  // ← recurse left subtree
  else if (value > root->value)
    root->right = insert(root->right, value); // ← recurse right subtree
  return root;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `struct BSTNode {
  int value;
  BSTNode *left, *right;
  BSTNode(int v) : value(v), left(nullptr), right(nullptr) {}
};

BSTNode* insert(BSTNode* root, int value) {
  if (!root) return new BSTNode(value);       // ← create node
  if (value < root->value)
    root->left = insert(root->left, value);   // ← recurse left subtree
  else if (value > root->value)
    root->right = insert(root->right, value); // ← recurse right subtree
  return root;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class BSTNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None

def insert(root, value):
    if not root:                          # ← create node
        return BSTNode(value)
    if value < root.value:
        root.left = insert(root.left, value)   # ← recurse left subtree
    elif value > root.value:
        root.right = insert(root.right, value)  # ← recurse right subtree
    return root`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `#[derive(Debug)]
struct BSTNode {
    value: i32,
    left: Option<Box<BSTNode>>,
    right: Option<Box<BSTNode>>,
}

fn insert(root: &mut Option<Box<BSTNode>>, value: i32) {
    match root {
        None => {                             // ← create node
            *root = Some(Box::new(BSTNode {
                value, left: None, right: None,
            }));
        }
        Some(node) => {
            if value < node.value {
                insert(&mut node.left, value);   // ← recurse left subtree
            } else if value > node.value {
                insert(&mut node.right, value);  // ← recurse right subtree
            }
        }
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type BSTNode struct {
  Value       int
  Left, Right *BSTNode
}

func Insert(root *BSTNode, value int) *BSTNode {
  if root == nil {                            // ← create node
    return &BSTNode{Value: value}
  }
  if value < root.Value {
    root.Left = Insert(root.Left, value)      // ← recurse left subtree
  } else if value > root.Value {
    root.Right = Insert(root.Right, value)    // ← recurse right subtree
  }
  return root
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class BSTNode {
  int value;
  BSTNode left, right;
  BSTNode(int v) { this.value = v; }
}

class BST {
  BSTNode insert(BSTNode root, int value) {
    if (root == null) return new BSTNode(value);  // ← create node
    if (value < root.value)
      root.left = insert(root.left, value);       // ← recurse left subtree
    else if (value > root.value)
      root.right = insert(root.right, value);     // ← recurse right subtree
    return root;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "database-index",
      i18nKey: "content.structures.bst.scenarios.database-index",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL B-tree index, MySQL InnoDB, SQLite",
      codeSnippet: {
        language: "sql",
        code: `-- PostgreSQL uses B-tree (self-balancing BST variant) for indexes
CREATE INDEX idx_users_email ON users (email);
-- Lookups like WHERE email = 'x@y.com' traverse the tree in O(log n)
-- instead of scanning every row (O(n))`,
      },
    },
    {
      id: "filesystem-index",
      i18nKey: "content.structures.bst.scenarios.filesystem-index",
      domain: "system",
      icon: "💾",
      reference: "Linux ext4, NTFS, APFS",
    },
    {
      id: "autocomplete",
      i18nKey: "content.structures.bst.scenarios.autocomplete",
      domain: "devtools",
      icon: "🔍",
      reference: "Eclipse JDT, VS Code, IntelliJ IDEA",
    },
  ] satisfies Scenario[],
};
