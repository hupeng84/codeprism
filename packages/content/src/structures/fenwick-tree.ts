import type { Frame, Scenario, TreeState, TreeNode } from "@codeprism/core";

function makeNode(id: string, value: number, x: number, y: number, left: TreeNode | null, right: TreeNode | null, status: TreeNode["status"] = "default"): TreeNode {
  return { id, value, x, y, left, right, status };
}

function buildTreeNode(tree: number[], marks: Map<string, TreeNode["status"]>, idx: number, x: number, y: number, spread: number): TreeNode | null {
  if (idx >= tree.length || tree[idx] === 0) return null;
  const left = buildTreeNode(tree, marks, idx * 2, x - spread, y + 60, spread / 2);
  const right = buildTreeNode(tree, marks, idx * 2 + 1, x + spread, y + 60, spread / 2);
  return makeNode(String(idx), tree[idx], x, y, left, right, marks.get(String(idx)) ?? "default");
}

export function* fenwickTreeGenerator(): Generator<Frame<TreeState>, void, unknown> {
  const array = [1, 3, 5, 7, 9, 11];
  const n = array.length;
  const bit: number[] = new Array(4 * n).fill(0);

  for (let i = 0; i < n; i++) bit[i + 1] = array[i];
  for (let i = 1; i <= n; i++) {
    const j = i + (i & -i);
    if (j < 4 * n) bit[j] += bit[i];
  }

  let step = 0;
  let root = buildTreeNode(bit, new Map(), 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: "Initialize" }, description: "Fenwick Tree built from [1, 3, 5, 7, 9, 11], each position stores cumulative sum", highlightLine: 0 };

  const prefixSum = (idx: number): number => {
    let s = 0;
    while (idx > 0) { s += bit[idx]; idx -= idx & -idx; }
    return s;
  };

  const update = (idx: number, delta: number) => {
    while (idx <= n) { bit[idx] += delta; idx += idx & -idx; }
  };

  const pathNodes = (idx: number): string[] => {
    const path: string[] = [];
    let t = idx;
    while (t > 0) { path.push(String(t)); t -= t & -t; }
    return path;
  };

  const m1 = new Map<string, TreeNode["status"]>();
  pathNodes(4).forEach(id => m1.set(id, "visiting"));
  root = buildTreeNode(bit, m1, 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: "Prefix sum query" }, description: "Prefix sum query @4：walk up tree: idx -= idx & -idx", highlightLine: 10 };

  const ps4 = prefixSum(4);
  const m2 = new Map<string, TreeNode["status"]>();
  ["1", "2", "4"].forEach(id => m2.set(id, "found"));
  root = buildTreeNode(bit, m2, 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: `sum(4)=${ps4}` }, description: `Prefix sum @4 = ${ps4}, path: 4 → 0`, highlightLine: 15 };

  root = buildTreeNode(bit, new Map(), 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: "Range sum [2,5]" }, description: "Range sum [2,5] = prefix(5) - prefix(1)", highlightLine: 20 };

  const rr = prefixSum(5) - prefixSum(1);
  const m3 = new Map<string, TreeNode["status"]>();
  ["1", "2", "4", "5"].forEach(id => m3.set(id, "found"));
  root = buildTreeNode(bit, m3, 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: `[2,5]=${rr}` }, description: `Range sum [2,5] = ${rr}`, highlightLine: 25 };

  const m4 = new Map<string, TreeNode["status"]>();
  m4.set("3", "visiting");
  root = buildTreeNode(bit, m4, 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: "Point update" }, description: "Point update: index 3, add +10", highlightLine: 30 };

  update(3, 10);
  const upPath: string[] = [];
  for (let t = 3; t <= n; t += t & -t) upPath.push(String(t));
  const m5 = new Map<string, TreeNode["status"]>();
  upPath.forEach(id => m5.set(id, "inserted"));
  root = buildTreeNode(bit, m5, 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: "Update complete" }, description: "Update complete, affected nodes highlighted", highlightLine: 32 };

  const newPs5 = prefixSum(5);
  const m6 = new Map<string, TreeNode["status"]>();
  pathNodes(5).forEach(id => m6.set(id, "found"));
  root = buildTreeNode(bit, m6, 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: `sum(5)=${newPs5}` }, description: `After update, prefix sum @5 = ${newPs5}(+10)`, highlightLine: 35 };

  root = buildTreeNode(bit, new Map(), 1, 350, 50, 150);
  yield { step: step++, state: { root, operation: "Complete" }, description: "Fenwick Tree demo complete ✅ Build O(n), query/update O(log n)", highlightLine: 40 };
}

export const fenwickTreeCode = `class FenwickTree {
  private bit: number[];
  private n: number;
  constructor(arr: number[]) {
    this.n = arr.length;
    this.bit = new Array(this.n + 1).fill(0);
    for (let i = 0; i < this.n; i++) this.bit[i + 1] = arr[i];
    for (let i = 1; i <= this.n; i++) {
      const j = i + (i & -i);
      if (j <= this.n) this.bit[j] += this.bit[i];
    }
  }
  prefixSum(idx: number): number {
    let s = 0;
    while (idx > 0) { s += this.bit[idx]; idx -= idx & -idx; }
    return s;
  }
  update(idx: number, delta: number): void {
    while (idx <= this.n) { this.bit[idx] += delta; idx += idx & -idx; }
  }
  rangeSum(l: number, r: number): number { return this.prefixSum(r) - this.prefixSum(l - 1); }
}`;

export const fenwickTreeCodeLines = [
  "class FenwickTree {",
  "  // ← 1-indexed BIT array",
  "  // ← build: O(n)",
  "  build(arr): void {",
  "    for (let i=0;i<n;i++) bit[i+1]=arr[i];",
  "    for (let i=1;i<=n;i++) {",
  "      const j = i + (i & -i);  // ← parent index",
  "      if (j <= n) bit[j] += bit[i];",
  "    }",
  "  }",
  "  // ← prefix sum: O(log n)",
  "  prefixSum(idx): number {",
  "    let s = 0;",
  "    while (idx > 0) { s += bit[idx]; idx -= idx & -idx; }",
  "    return s;",
  "  }",
  "  // ← update: O(log n)",
  "  update(idx, delta): void {",
  "    while (idx <= n) { bit[idx] += delta; idx += idx & -idx; }",
  "  }",
  "}",
];

export const fenwickTreeContent = {
  id: "fenwick-tree",
  slug: "fenwick-tree",
  title: "",
  titleKey: "content.structures.fenwick-tree.title",
  category: "structure" as const,
  subcategory: "tree",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.fenwick-tree.desc",
  generator: fenwickTreeGenerator,
  code: fenwickTreeCode,
  language: "TypeScript",
  complexity: { time: "O(log n)", space: "O(n)" },
  tags: [],
  icon: "🌲",
  codeExamples: {
    typescript: {
      code: `class FenwickTree {
  private bit: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.bit = new Array(this.n + 1).fill(0);
    for (let i = 0; i < this.n; i++) this.bit[i + 1] = arr[i];
    for (let i = 1; i <= this.n; i++) {
      const j = i + (i & -i);             // ← parent index
      if (j <= this.n) this.bit[j] += this.bit[i];
    }
  }

  prefixSum(idx: number): number {
    let s = 0;
    while (idx > 0) { s += this.bit[idx]; idx -= idx & -idx; } // ← walk up
    return s;
  }

  update(idx: number, delta: number): void {
    while (idx <= this.n) { this.bit[idx] += delta; idx += idx & -idx; } // ← update
  }

  rangeSum(l: number, r: number): number {
    return this.prefixSum(r) - this.prefixSum(l - 1);
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int bit[100001];
int n;

void build(int arr[], int size) {
  n = size;
  for (int i = 0; i < n; i++) bit[i + 1] = arr[i];
  for (int i = 1; i <= n; i++) {
    int j = i + (i & -i);                 // ← parent index
    if (j <= n) bit[j] += bit[i];
  }
}

int prefixSum(int idx) {
  int s = 0;
  while (idx > 0) { s += bit[idx]; idx -= idx & -idx; } // ← walk up
  return s;
}

void update(int idx, int delta) {
  while (idx <= n) { bit[idx] += delta; idx += idx & -idx; } // ← update
}

int rangeSum(int l, int r) {
  return prefixSum(r) - prefixSum(l - 1);
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class FenwickTree {
  vector<int> bit;
  int n;
public:
  FenwickTree(vector<int>& arr) : n(arr.size()), bit(n + 1, 0) {
    for (int i = 0; i < n; i++) bit[i + 1] = arr[i];
    for (int i = 1; i <= n; i++) {
      int j = i + (i & -i);              // ← parent index
      if (j <= n) bit[j] += bit[i];
    }
  }

  int prefixSum(int idx) {
    int s = 0;
    while (idx > 0) { s += bit[idx]; idx -= idx & -idx; } // ← walk up
    return s;
  }

  void update(int idx, int delta) {
    while (idx <= n) { bit[idx] += delta; idx += idx & -idx; } // ← update
  }

  int rangeSum(int l, int r) {
    return prefixSum(r) - prefixSum(l - 1);
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class FenwickTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.bit = [0] * (self.n + 1)
        for i in range(self.n):
            self.bit[i + 1] = arr[i]
        for i in range(1, self.n + 1):
            j = i + (i & -i)              # ← parent index
            if j <= self.n:
                self.bit[j] += self.bit[i]

    def prefix_sum(self, idx):
        s = 0
        while idx > 0:
            s += self.bit[idx]
            idx -= idx & -idx              # ← walk up
        return s

    def update(self, idx, delta):
        while idx <= self.n:
            self.bit[idx] += delta
            idx += idx & -idx              # ← update

    def range_sum(self, l, r):
        return self.prefix_sum(r) - self.prefix_sum(l - 1)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `struct FenwickTree {
    bit: Vec<i32>,
    n: usize,
}

impl FenwickTree {
    fn new(arr: &[i32]) -> Self {
        let n = arr.len();
        let mut bit = vec![0; n + 1];
        for i in 0..n { bit[i + 1] = arr[i]; }
        for i in 1..=n {
            let j = i + (i & (!i + 1));   // ← parent index
            if j <= n { bit[j] += bit[i]; }
        }
        FenwickTree { bit, n }
    }

    fn prefix_sum(&self, mut idx: usize) -> i32 {
        let mut s = 0;
        while idx > 0 { s += self.bit[idx]; idx &= idx - 1; } // ← walk up
        s
    }

    fn update(&mut self, mut idx: usize, delta: i32) {
        while idx <= self.n {
            self.bit[idx] += delta;
            idx += idx & (!idx + 1);       // ← update
        }
    }

    fn range_sum(&self, l: usize, r: usize) -> i32 {
        self.prefix_sum(r) - self.prefix_sum(l - 1)
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type FenwickTree struct {
  bit []int
  n   int
}

func NewFenwickTree(arr []int) *FenwickTree {
  n := len(arr)
  bit := make([]int, n+1)
  for i := 0; i < n; i++ { bit[i+1] = arr[i] }
  for i := 1; i <= n; i++ {
    j := i + (i & -i)                    // ← parent index
    if j <= n { bit[j] += bit[i] }
  }
  return &FenwickTree{bit: bit, n: n}
}

func (ft *FenwickTree) PrefixSum(idx int) int {
  s := 0
  for idx > 0 { s += ft.bit[idx]; idx -= idx & -idx } // ← walk up
  return s
}

func (ft *FenwickTree) Update(idx, delta int) {
  for idx <= ft.n { ft.bit[idx] += delta; idx += idx & -idx } // ← update
}

func (ft *FenwickTree) RangeSum(l, r int) int {
  return ft.PrefixSum(r) - ft.PrefixSum(l-1)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class FenwickTree {
  private int[] bit;
  private int n;

  FenwickTree(int[] arr) {
    n = arr.length;
    bit = new int[n + 1];
    for (int i = 0; i < n; i++) bit[i + 1] = arr[i];
    for (int i = 1; i <= n; i++) {
      int j = i + (i & -i);               // ← parent index
      if (j <= n) bit[j] += bit[i];
    }
  }

  int prefixSum(int idx) {
    int s = 0;
    while (idx > 0) { s += bit[idx]; idx -= idx & -idx; } // ← walk up
    return s;
  }

  void update(int idx, int delta) {
    while (idx <= n) { bit[idx] += delta; idx += idx & -idx; } // ← update
  }

  int rangeSum(int l, int r) {
    return prefixSum(r) - prefixSum(l - 1);
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "prefix-sum",
      i18nKey: "content.structures.fenwick-tree.scenarios.prefix-sum",
      domain: "devtools",
      icon: "📊",
      reference: "Competitive programming, algorithmic trading",
    },
    {
      id: "bit-range-update",
      i18nKey: "content.structures.fenwick-tree.scenarios.bit-range-update",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL, ClickHouse column stores",
      codeSnippet: {
        language: "typescript",
        code: `// Fenwick Tree (BIT): simpler than segment tree for prefix sums
// Build: O(n), Query/Update: O(log n)
const bit = new FenwickTree([1, 3, 5, 7, 9, 11]);
bit.prefixSum(4);  // sum of first 4 elements → 16
bit.update(3, 10); // add 10 to index 3
bit.rangeSum(2, 5); // sum indices 2..5`,
      },
    },
    {
      id: "competitive-bit",
      i18nKey: "content.structures.fenwick-tree.scenarios.competitive-bit",
      domain: "library",
      icon: "⚡",
      reference: "C++ BIT template, Python fenwick-tree library",
    },
  ] satisfies Scenario[],
};
