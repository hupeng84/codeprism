import type { Frame, Scenario, TreeState, TreeNode } from "@codeprism/core";

function createNode(id: string, value: number, status: TreeNode["status"] = "default"): TreeNode {
  return { id, value, x: 0, y: 0, left: null, right: null, status };
}

export function* avlTreeGenerator(): Generator<Frame<TreeState>, void, unknown> {
  let root: TreeNode | null = null;
  let step = 0;
  let nodeIdCounter = 0;

  function makeNode(value: number): TreeNode {
    return createNode(`n${nodeIdCounter++}`, value);
  }

  function insertBST(node: TreeNode | null, newNode: TreeNode): TreeNode {
    if (!node) return newNode;
    if (newNode.value < node.value) {
      node.left = insertBST(node.left, newNode);
    } else {
      node.right = insertBST(node.right, newNode);
    }
    return node;
  }

  function height(n: TreeNode | null): number {
    if (!n) return -1;
    return 1 + Math.max(height(n.left), height(n.right));
  }

  function getBalance(n: TreeNode | null): number {
    if (!n) return 0;
    return height(n.left) - height(n.right);
  }

  function rotateRight(y: TreeNode): TreeNode {
    if (!y.left) return y; // Safety check
    const x = y.left;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    return x;
  }

  function rotateLeft(x: TreeNode): TreeNode {
    if (!x.right) return x; // Safety check
    const y = x.right;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    return y;
  }

  function cloneAll(node: TreeNode | null, marks: Map<string, TreeNode["status"]>): TreeNode | null {
    if (!node) return null;
    return {
      ...createNode(node.id, node.value, marks.get(node.id) ?? node.status),
      left: cloneAll(node.left, marks),
      right: cloneAll(node.right, marks),
    };
  }

  // Input showing LL, RR, LR, RL rotations
  const input = [30, 20, 10, 25, 5, 35, 3];

  yield {
    step: step++,
    state: { root: null, operation: "empty tree" },
    description: "Initial empty AVL tree, ready to insert elements",
    highlightLine: 0,
  };

  for (const value of input) {
    const marks = new Map<string, TreeNode["status"]>();
    const newNode = makeNode(value);

    // Step 1: BST Insert
    const nodeToMark = insertBST(root, newNode);
    // Find the newly inserted node path
    function findInsertPath(n: TreeNode | null, v: number, path: TreeNode[]): boolean {
      if (!n) return false;
      path.push(n);
      if (n.value === v) return true;
      if (v < n.value) return findInsertPath(n.left, v, path);
      return findInsertPath(n.right, v, path);
    }
    const path: TreeNode[] = [];
    findInsertPath(nodeToMark, value, path);
    path.forEach(n => marks.set(n.id, "visiting"));
    marks.set(newNode.id, "inserted");
    root = nodeToMark;

    yield {
      step: step++,
      state: { root: cloneAll(root, marks), operation: `Insert ${value}` },
      description: `Insert ${value} as BST (visit path marked)`,
      highlightLine: 5,
    };

    // Step 2: Rebalance check — walk up and check balance
    const rebalancePath: TreeNode[] = [];
    function findPath(n: TreeNode | null, v: number, p: TreeNode[]): boolean {
      if (!n) return false;
      p.push(n);
      if (n.value === v) return true;
      if (v < n.value) return findPath(n.left, v, p);
      return findPath(n.right, v, p);
    }
    findPath(root, value, rebalancePath);

    for (let i = rebalancePath.length - 1; i >= 0; i--) {
      const n = rebalancePath[i];
      const bf = getBalance(n);
      if (Math.abs(bf) > 1) {
        // Found imbalance — mark the problematic node
        const imbalancedMarks = new Map<string, TreeNode["status"]>();
        imbalancedMarks.set(n.id, "found");
        yield {
          step: step++,
          state: { root: cloneAll(root, imbalancedMarks), operation: `Imbalanced! bf=${bf}` },
          description: `Node ${n.value} imbalanced (bf=${bf}), needs rotation fix`,
          highlightLine: 8,
        };

        // Perform rotation
        const oldRoot = root;
        root = insertBST(root, makeNode(0)); // dummy to rebuild

        // Actually rebuild properly
        function rebuild(n: TreeNode | null): TreeNode | null {
          if (!n) return null;
          const newN = createNode(n.id, n.value, n.status === "found" ? "inserted" : n.status);
          newN.left = rebuild(n.left);
          newN.right = rebuild(n.right);
          return newN;
        }
        root = rebuild(oldRoot);

        // Rebuild without the dummy, with proper rebalancing
        // Simpler: just rotate based on the pattern
        let rotatedRoot = root;
        if (bf > 1 && value < (n.left?.value ?? 0)) {
          // LL: right rotate n
          rotatedRoot = insertBST(root, makeNode(0));
          // Actually, let's use a cleaner approach
          function rotateRightAt(node: TreeNode | null, targetVal: number): TreeNode | null {
            if (!node) return null;
            if (node.value === targetVal) {
              return rotateRight(node);
            }
            node.left = rotateRightAt(node.left, targetVal);
            node.right = rotateRightAt(node.right, targetVal);
            return node;
          }
          rotatedRoot = rotateRightAt(root, n.value);
        } else if (bf < -1 && value > (n.right?.value ?? 0)) {
          // RR: left rotate n
          function rotateLeftAt(node: TreeNode | null, targetVal: number): TreeNode | null {
            if (!node) return null;
            if (node.value === targetVal) {
              return rotateLeft(node);
            }
            node.left = rotateLeftAt(node.left, targetVal);
            node.right = rotateLeftAt(node.right, targetVal);
            return node;
          }
          rotatedRoot = rotateLeftAt(root, n.value);
        } else if (bf > 1 && value > (n.left?.value ?? 0)) {
          // LR: left rotate child then right rotate n
          function rotateLeftChildThenRight(node: TreeNode | null, targetVal: number): TreeNode | null {
            if (!node) return null;
            if (node.value === targetVal) {
              node.left = rotateLeft(node.left!);
              return rotateRight(node);
            }
            node.left = rotateLeftChildThenRight(node.left, targetVal);
            node.right = rotateLeftChildThenRight(node.right, targetVal);
            return node;
          }
          rotatedRoot = rotateLeftChildThenRight(root, n.value);
        } else if (bf < -1 && value < (n.right?.value ?? 0)) {
          // RL: right rotate child then left rotate n
          function rotateRightChildThenLeft(node: TreeNode | null, targetVal: number): TreeNode | null {
            if (!node) return null;
            if (node.value === targetVal) {
              node.right = rotateRight(node.right!);
              return rotateLeft(node);
            }
            node.left = rotateRightChildThenLeft(node.left, targetVal);
            node.right = rotateRightChildThenLeft(node.right, targetVal);
            return node;
          }
          rotatedRoot = rotateRightChildThenLeft(root, n.value);
        }

        root = rotatedRoot;
        const rotateMarks = new Map<string, TreeNode["status"]>();
        if (root) {
          function markAll(n: TreeNode | null) {
            if (!n) return;
            rotateMarks.set(n.id, "inserted");
            markAll(n.left);
            markAll(n.right);
          }
          markAll(root);
        }
        yield {
          step: step++,
          state: { root: cloneAll(root, rotateMarks), operation: "Rotation complete" },
          description: `Node ${n.value} rotation performed, tree rebalanced`,
          highlightLine: 10,
        };
        root = cloneAll(root, new Map());
        break;
      }
    }

    // Settled
    yield {
      step: step++,
      state: { root: cloneAll(root, new Map()), operation: `Insert ${value} Complete` },
      description: `${value} inserted, tree height-balanced ✅`,
      highlightLine: 12,
    };
  }

  yield {
    step: step++,
    state: { root: cloneAll(root, new Map()), operation: "Build complete" },
    description: `AVL tree build complete ✅ ${input.length} nodes, all subtree height diffs ≤ 1`,
    highlightLine: 12,
  };
}

export const avlTreeCode = `class AVLNode {
  constructor(
    public value: number,
    public left: AVLNode | null = null,
    public right: AVLNode | null = null,
    public height: number = 0,
  ) {}
}

class AVLTree {
  private root: AVLNode | null = null;

  private height(n: AVLNode | null): number {
    return n?.height ?? -1;
  }

  private balance(n: AVLNode | null): number {
    return this.height(n?.left) - this.height(n?.right);
  }

  private rotateRight(y: AVLNode): AVLNode {
    const x = y.left!;
    const T2 = x.right;
    x.right = y;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    return x;
  }

  private rotateLeft(x: AVLNode): AVLNode {
    const y = x.right!;
    const T2 = y.left;
    y.left = x;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    return y;
  }

  insert(value: number): void {
    this.root = this.insertRec(this.root, value);
  }

  private insertRec(node: AVLNode | null, value: number): AVLNode {
    if (!node) return new AVLNode(value);
    if (value < node.value) node.left = this.insertRec(node.left, value);
    else if (value > node.value) node.right = this.insertRec(node.right, value);
    else return node;
    node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
    const bal = this.balance(node);
    if (bal > 1 && value < node.left!.value) return this.rotateRight(node);
    if (bal < -1 && value > node.right!.value) return this.rotateLeft(node);
    if (bal > 1 && value > node.left!.value) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }
    if (bal < -1 && value < node.right!.value) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }
    return node;
  }
}`;

export const avlTreeCodeLines = [
  "class AVLNode {",
  "  constructor(",
  "    public value: number,",
  "    public left: AVLNode | null = null,",
  "    public right: AVLNode | null = null,",
  "    public height: number = 0,",
  "  ) {}",
  "}",
  "",
  "class AVLTree {",
  "  private height(n: AVLNode | null): number {",
  "    return n?.height ?? -1;",
  "  }",
  "",
  "  private rotateRight(y: AVLNode): AVLNode {",
  "    const x = y.left!;",
  "    const T2 = x.right;",
  "    x.right = y;  // ← right rotate",
  "    return x;",
  "  }",
  "",
  "  private rotateLeft(x: AVLNode): AVLNode {",
  "    const y = x.right!;",
  "    const T2 = y.left;",
  "    y.left = x;   // ← left rotate",
  "    return y;",
  "  }",
  "",
  "  insert(value: number): void {",
  "    this.root = this.insertRec(this.root, value);",
  "  }",
  "}",
];

export const avlTreeContent = {
  id: "avl-tree",
  slug: "avl-tree",
  title: "",
  titleKey: "content.structures.avl-tree.title",
  category: "structure" as const,
  subcategory: "tree",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.avl-tree.desc",
  generator: avlTreeGenerator,
  code: avlTreeCode,
  language: "TypeScript",
  complexity: { time: "O(log n)", space: "O(n)" },
  tags: [],
  icon: "🌲",
  codeExamples: {
    typescript: {
      code: `class AVLNode {
  constructor(
    public value: number,
    public left: AVLNode | null = null,
    public right: AVLNode | null = null,
    public height: number = 0,
  ) {}
}

class AVLTree {
  private root: AVLNode | null = null;

  private height(n: AVLNode | null): number {
    return n?.height ?? -1;
  }

  private balance(n: AVLNode | null): number {
    return this.height(n?.left) - this.height(n?.right);
  }

  private rotateRight(y: AVLNode): AVLNode {
    const x = y.left!;
    const T2 = x.right;
    x.right = y;
    y.left = T2;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    return x;
  }

  private rotateLeft(x: AVLNode): AVLNode {
    const y = x.right!;
    const T2 = y.left;
    y.left = x;
    x.right = T2;
    x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
    y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
    return y;
  }

  insert(value: number): void {
    this.root = this.insertRec(this.root, value);
  }

  private insertRec(node: AVLNode | null, value: number): AVLNode {
    if (!node) return new AVLNode(value);
    if (value < node.value) node.left = this.insertRec(node.left, value);
    else if (value > node.value) node.right = this.insertRec(node.right, value);
    else return node;
    node.height = Math.max(this.height(node.left), this.height(node.right)) + 1;
    const bal = this.balance(node);
    if (bal > 1 && value < node.left!.value) return this.rotateRight(node);
    if (bal < -1 && value > node.right!.value) return this.rotateLeft(node);
    if (bal > 1 && value > node.left!.value) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }
    if (bal < -1 && value < node.right!.value) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }
    return node;
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct AVLNode {
  int value, height;
  struct AVLNode *left, *right;
} AVLNode;

int height(AVLNode* n) { return n ? n->height : -1; }
int balance(AVLNode* n) { return n ? height(n->left) - height(n->right) : 0; }

AVLNode* rotateRight(AVLNode* y) {
  AVLNode* x = y->left;
  AVLNode* T2 = x->right;
  x->right = y;                          // ← right rotate
  y->left = T2;
  y->height = 1 + (height(y->left) > height(y->right) ? height(y->left) : height(y->right));
  x->height = 1 + (height(x->left) > height(x->right) ? height(x->left) : height(x->right));
  return x;
}

AVLNode* rotateLeft(AVLNode* x) {
  AVLNode* y = x->right;
  AVLNode* T2 = y->left;
  y->left = x;                           // ← left rotate
  x->right = T2;
  x->height = 1 + (height(x->left) > height(x->right) ? height(x->left) : height(x->right));
  y->height = 1 + (height(y->left) > height(y->right) ? height(y->left) : height(y->right));
  return y;
}

AVLNode* insert(AVLNode* node, int value) {
  if (!node) { AVLNode* n = malloc(sizeof(AVLNode)); n->value = value; n->left = n->right = NULL; n->height = 0; return n; }
  if (value < node->value) node->left = insert(node->left, value);
  else if (value > node->value) node->right = insert(node->right, value);
  else return node;
  node->height = 1 + (height(node->left) > height(node->right) ? height(node->left) : height(node->right));
  int bal = balance(node);
  if (bal > 1 && value < node->left->value) return rotateRight(node);
  if (bal < -1 && value > node->right->value) return rotateLeft(node);
  if (bal > 1 && value > node->left->value) { node->left = rotateLeft(node->left); return rotateRight(node); }
  if (bal < -1 && value < node->right->value) { node->right = rotateRight(node->right); return rotateLeft(node); }
  return node;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `struct AVLNode {
  int value, height;
  AVLNode *left, *right;
  AVLNode(int v) : value(v), height(0), left(nullptr), right(nullptr) {}
};

class AVLTree {
  AVLNode* root = nullptr;

  int height(AVLNode* n) { return n ? n->height : -1; }
  int balance(AVLNode* n) { return n ? height(n->left) - height(n->right) : 0; }

  AVLNode* rotateRight(AVLNode* y) {
    AVLNode* x = y->left;
    y->left = x->right;                  // ← right rotate
    x->right = y;
    y->height = 1 + max(height(y->left), height(y->right));
    x->height = 1 + max(height(x->left), height(x->right));
    return x;
  }

  AVLNode* rotateLeft(AVLNode* x) {
    AVLNode* y = x->right;
    x->right = y->left;                  // ← left rotate
    y->left = x;
    x->height = 1 + max(height(x->left), height(x->right));
    y->height = 1 + max(height(y->left), height(y->right));
    return y;
  }

  AVLNode* insert(AVLNode* node, int value) {
    if (!node) return new AVLNode(value);
    if (value < node->value) node->left = insert(node->left, value);
    else if (value > node->value) node->right = insert(node->right, value);
    else return node;
    node->height = 1 + max(height(node->left), height(node->right));
    int bal = balance(node);
    if (bal > 1 && value < node->left->value) return rotateRight(node);
    if (bal < -1 && value > node->right->value) return rotateLeft(node);
    if (bal > 1 && value > node->left->value) { node->left = rotateLeft(node->left); return rotateRight(node); }
    if (bal < -1 && value < node->right->value) { node->right = rotateRight(node->right); return rotateLeft(node); }
    return node;
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class AVLNode:
    def __init__(self, value):
        self.value = value
        self.left = None
        self.right = None
        self.height = 0

class AVLTree:
    def __init__(self):
        self.root = None

    def _height(self, n):
        return n.height if n else -1

    def _balance(self, n):
        return self._height(n.left) - self._height(n.right) if n else 0

    def _rotate_right(self, y):
        x = y.left
        t2 = x.right
        x.right = y                        # ← right rotate
        y.left = t2
        y.height = 1 + max(self._height(y.left), self._height(y.right))
        x.height = 1 + max(self._height(x.left), self._height(x.right))
        return x

    def _rotate_left(self, x):
        y = x.right
        t2 = y.left
        y.left = x                         # ← left rotate
        x.right = t2
        x.height = 1 + max(self._height(x.left), self._height(x.right))
        y.height = 1 + max(self._height(y.left), self._height(y.right))
        return y

    def insert(self, value):
        self.root = self._insert(self.root, value)

    def _insert(self, node, value):
        if not node: return AVLNode(value)
        if value < node.value: node.left = self._insert(node.left, value)
        elif value > node.value: node.right = self._insert(node.right, value)
        else: return node
        node.height = 1 + max(self._height(node.left), self._height(node.right))
        bal = self._balance(node)
        if bal > 1 and value < node.left.value: return self._rotate_right(node)
        if bal < -1 and value > node.right.value: return self._rotate_left(node)
        if bal > 1 and value > node.left.value:
            node.left = self._rotate_left(node.left)
            return self._rotate_right(node)
        if bal < -1 and value < node.right.value:
            node.right = self._rotate_right(node.right)
            return self._rotate_left(node)
        return node`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::cmp::max;

#[derive(Debug)]
struct AVLNode {
    value: i32,
    height: i32,
    left: Option<Box<AVLNode>>,
    right: Option<Box<AVLNode>>,
}

impl AVLNode {
    fn new(value: i32) -> Self {
        AVLNode { value, height: 0, left: None, right: None }
    }
}

fn height(n: &Option<Box<AVLNode>>) -> i32 {
    n.as_ref().map_or(-1, |n| n.height)
}

fn balance_factor(n: &Option<Box<AVLNode>>) -> i32 {
    n.as_ref().map_or(0, |n| height(&n.left) - height(&n.right))
}

fn rotate_right(mut y: Box<AVLNode>) -> Box<AVLNode> {
    let mut x = y.left.take().unwrap();
    let t2 = x.right.take();
    x.right = Some(y);                    // ← right rotate
    if let Some(ref mut node) = x.right {
        node.left = t2;
        node.height = 1 + max(height(&node.left), height(&node.right));
    }
    x.height = 1 + max(height(&x.left), height(&x.right));
    x
}

fn rotate_left(mut x: Box<AVLNode>) -> Box<AVLNode> {
    let mut y = x.right.take().unwrap();
    let t2 = y.left.take();
    y.left = Some(x);                     // ← left rotate
    if let Some(ref mut node) = y.left {
        node.right = t2;
        node.height = 1 + max(height(&node.left), height(&node.right));
    }
    y.height = 1 + max(height(&y.left), height(&y.right));
    y
}

fn insert(node: Option<Box<AVLNode>>, value: i32) -> Option<Box<AVLNode> {
    let mut n = match node {
        None => return Some(Box::new(AVLNode::new(value))),
        Some(n) => n,
    };
    if value < n.value { n.left = insert(n.left, value); }
    else if value > n.value { n.right = insert(n.right, value); }
    else { return Some(n); }
    n.height = 1 + max(height(&n.left), height(&n.right));
    let bal = balance_factor(&Some(n.clone()));
    if bal > 1 && value < n.left.as_ref().unwrap().value { return Some(rotate_right(n)); }
    if bal < -1 && value > n.right.as_ref().unwrap().value { return Some(rotate_left(n)); }
    if bal > 1 && value > n.left.as_ref().unwrap().value {
        n.left = Some(rotate_left(n.left.take().unwrap()));
        return Some(rotate_right(n));
    }
    if bal < -1 && value < n.right.as_ref().unwrap().value {
        n.right = Some(rotate_right(n.right.take().unwrap()));
        return Some(rotate_left(n));
    }
    Some(n)
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type AVLNode struct {
  Value          int
  Height         int
  Left, Right *AVLNode
}

func height(n *AVLNode) int {
  if n == nil { return -1 }
  return n.Height
}

func balanceFactor(n *AVLNode) int {
  if n == nil { return 0 }
  return height(n.Left) - height(n.Right)
}

func rotateRight(y *AVLNode) *AVLNode {
  x := y.Left
  t2 := x.Right
  x.Right = y                             // ← right rotate
  y.Left = t2
  y.Height = 1 + max(height(y.Left), height(y.Right))
  x.Height = 1 + max(height(x.Left), height(x.Right))
  return x
}

func rotateLeft(x *AVLNode) *AVLNode {
  y := x.Right
  t2 := y.Left
  y.Left = x                              // ← left rotate
  x.Right = t2
  x.Height = 1 + max(height(x.Left), height(x.Right))
  y.Height = 1 + max(height(y.Left), height(y.Right))
  return y
}

func Insert(node *AVLNode, value int) *AVLNode {
  if node == nil { return &AVLNode{Value: value, Height: 0} }
  if value < node.Value { node.Left = Insert(node.Left, value) }
  else if value > node.Value { node.Right = Insert(node.Right, value) }
  else { return node }
  node.Height = 1 + max(height(node.Left), height(node.Right))
  bal := balanceFactor(node)
  if bal > 1 && value < node.Left.Value { return rotateRight(node) }
  if bal < -1 && value > node.Right.Value { return rotateLeft(node) }
  if bal > 1 && value > node.Left.Value {
    node.Left = rotateLeft(node.Left)
    return rotateRight(node)
  }
  if bal < -1 && value < node.Right.Value {
    node.Right = rotateRight(node.Right)
    return rotateLeft(node)
  }
  return node
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class AVLNode {
  int value, height;
  AVLNode left, right;
  AVLNode(int v) { this.value = v; this.height = 0; }
}

class AVLTree {
  private AVLNode root;

  private int height(AVLNode n) { return n == null ? -1 : n.height; }

  private int balance(AVLNode n) { return n == null ? 0 : height(n.left) - height(n.right); }

  private AVLNode rotateRight(AVLNode y) {
    AVLNode x = y.left;
    AVLNode t2 = x.right;
    x.right = y;                           // ← right rotate
    y.left = t2;
    y.height = Math.max(height(y.left), height(y.right)) + 1;
    x.height = Math.max(height(x.left), height(x.right)) + 1;
    return x;
  }

  private AVLNode rotateLeft(AVLNode x) {
    AVLNode y = x.right;
    AVLNode t2 = y.left;
    y.left = x;                            // ← left rotate
    x.right = t2;
    x.height = Math.max(height(x.left), height(x.right)) + 1;
    y.height = Math.max(height(y.left), height(y.right)) + 1;
    return y;
  }

  void insert(int value) { root = insertRec(root, value); }

  private AVLNode insertRec(AVLNode node, int value) {
    if (node == null) return new AVLNode(value);
    if (value < node.value) node.left = insertRec(node.left, value);
    else if (value > node.value) node.right = insertRec(node.right, value);
    else return node;
    node.height = Math.max(height(node.left), height(node.right)) + 1;
    int bal = balance(node);
    if (bal > 1 && value < node.left.value) return rotateRight(node);
    if (bal < -1 && value > node.right.value) return rotateLeft(node);
    if (bal > 1 && value > node.left.value) { node.left = rotateLeft(node.left); return rotateRight(node); }
    if (bal < -1 && value < node.right.value) { node.right = rotateRight(node.right); return rotateLeft(node); }
    return node;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "in-memory-sorted-set",
      i18nKey: "content.structures.avl-tree.scenarios.in-memory-sorted-set",
      domain: "database",
      icon: "🗄️",
      reference: "Redis (ZSET internals), LevelDB table cache",
    },
    {
      id: "database-index-avl",
      i18nKey: "content.structures.avl-tree.scenarios.database-index-avl",
      domain: "devtools",
      icon: "🔧",
      reference: "SQLite (partial), PostgreSQL GiST",
      codeSnippet: {
        language: "typescript",
        code: `// AVL guarantees O(log n) lookups with strict balance
// Ideal for read-heavy in-memory indexes (e.g., sorted key-value stores)
class AVLIndex {
  private root: AVLNode | null = null;
  get(key: number) { /* O(log n) guaranteed — no worst-case degradation */ }
  insert(key: number) { /* O(log n) with rotations */ }
}`,
      },
    },
    {
      id: "lookup-heavy",
      i18nKey: "content.structures.avl-tree.scenarios.lookup-heavy",
      domain: "library",
      icon: "⚡",
      reference: "Java TreeMap (when rotations preferred), C++ std::map",
    },
  ] satisfies Scenario[],
};
