import type { Frame, Scenario, TreeState, TreeNode } from "@codeprism/core";

function createNode(
  id: string,
  value: number,
  x: number,
  y: number,
  left: TreeNode | null,
  right: TreeNode | null,
  status: TreeNode["status"] = "default"
): TreeNode {
  return { id, value, x, y, left, right, status };
}



function buildTreeState(
  tree: (number | null)[],
  marks: Map<string, TreeNode["status"]>,
  nodeId = 1,
  x = 350,
  y = 50,
  spread = 150
): TreeNode | null {
  if (nodeId >= tree.length || tree[nodeId] === null) return null;
  const left = buildTreeState(tree, marks, nodeId * 2, x - spread, y + 60, spread / 2);
  const right = buildTreeState(tree, marks, nodeId * 2 + 1, x + spread, y + 60, spread / 2);
  const n = createNode(String(nodeId), tree[nodeId]!, x, y, left, right, marks.get(String(nodeId)) ?? "default");
  return n;
}

export function* segmentTreeGenerator(): Generator<Frame<TreeState>, void, unknown> {
  const array = [1, 3, 5, 7, 9, 11];
  const n = array.length;
  const size = 4 * n;
  const tree: (number | null)[] = new Array(size).fill(null);

  const build = (node: number, start: number, end: number): number => {
    if (start === end) {
      tree[node] = array[start];
      return tree[node]!;
    }
    const mid = Math.floor((start + end) / 2);
    const leftSum = build(node * 2, start, mid);
    const rightSum = build(node * 2 + 1, mid + 1, end);
    tree[node] = leftSum + rightSum;
    return tree[node]!;
  };

  const query = (node: number, start: number, end: number, qStart: number, qEnd: number): number => {
    if (qStart <= start && end <= qEnd) return tree[node]!;
    if (end < qStart || start > qEnd) return 0;
    const mid = Math.floor((start + end) / 2);
    return query(node * 2, start, mid, qStart, qEnd) + query(node * 2 + 1, mid + 1, end, qStart, qEnd);
  };

  const pointUpdate = (node: number, start: number, end: number, idx: number, val: number): void => {
    if (start === end) {
      tree[node] = val;
      return;
    }
    const mid = Math.floor((start + end) / 2);
    if (idx <= mid) pointUpdate(node * 2, start, mid, idx, val);
    else pointUpdate(node * 2 + 1, mid + 1, end, idx, val);
    tree[node] = tree[node * 2]! + tree[node * 2 + 1]!;
  };

  let step = 0;
  let root = buildTreeState(tree, new Map());
  yield { step: step++, state: { root, operation: "Initialize" }, description: "Segment Tree Initialize，Built from array [1, 3, 5, 7, 9, 11]", highlightLine: 0 };

  build(1, 0, n - 1);
  root = buildTreeState(tree, new Map());
  yield { step: step++, state: { root, operation: "Build complete" }, description: "Segment Tree build complete ✅ Each node stores interval sum", highlightLine: 15 };

  const marks1 = new Map<string, TreeNode["status"]>();
  ["1", "2", "4"].forEach(id => marks1.set(id, "visiting"));
  root = buildTreeState(tree, marks1);
  yield { step: step++, state: { root, operation: "Query [1,4]" }, description: "Range query [1,4]: visit nodes covering interval", highlightLine: 25 };

  const result = query(1, 0, n - 1, 1, 4);
  const marks2 = new Map<string, TreeNode["status"]>();
  ["1", "2", "3", "4", "6"].forEach(id => marks2.set(id, "found"));
  root = buildTreeState(tree, marks2);
  yield { step: step++, state: { root, operation: `Query result = ${result}` }, description: `Range sum [1,4] = ${result}, traversal path highlighted`, highlightLine: 30 };

  const marks3 = new Map<string, TreeNode["status"]>();
  marks3.set("4", "visiting");
  root = buildTreeState(tree, marks3);
  yield { step: step++, state: { root, operation: "Point update" }, description: "Point update: index 2, value 5 → 10", highlightLine: 40 };

  pointUpdate(1, 0, n - 1, 2, 10);
  const marks4 = new Map<string, TreeNode["status"]>();
  ["4", "2", "1"].forEach(id => marks4.set(id, "inserted"));
  root = buildTreeState(tree, marks4);
  yield { step: step++, state: { root, operation: "Update complete" }, description: "Point update complete, ancestors recomputed", highlightLine: 42 };

  const newResult = query(1, 0, n - 1, 1, 4);
  const marks5 = new Map<string, TreeNode["status"]>();
  ["1", "2", "3", "4", "6"].forEach(id => marks5.set(id, "found"));
  root = buildTreeState(tree, marks5);
  yield { step: step++, state: { root, operation: `after update = ${newResult}` }, description: `After update, range sum [1,4] = ${newResult} (was ${result}, +5)`, highlightLine: 45 };

  root = buildTreeState(tree, new Map());
  yield { step: step++, state: { root, operation: "Complete" }, description: `Segment Tree demo complete ✅ Build O(n), query/update O(log n)`, highlightLine: 45 };
}

export const segmentTreeCode = `class SegmentTree {
  private tree: number[];
  private n: number;
  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n);
    this.build(1, 0, this.n - 1, arr);
  }
  private build(node: number, l: number, r: number, arr: number[]): void {
    if (l === r) { this.tree[node] = arr[l]; return; }
    const m = (l + r) >> 1;
    this.build(node * 2, l, m, arr);
    this.build(node * 2 + 1, m + 1, r, arr);
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }
  private q(node: number, l: number, r: number, ql: number, qr: number): number {
    if (ql <= l && r <= qr) return this.tree[node];
    if (r < ql || l > qr) return 0;
    const m = (l + r) >> 1;
    return this.q(node * 2, l, m, ql, qr) + this.q(node * 2 + 1, m + 1, r, ql, qr);
  }
  private u(node: number, l: number, r: number, idx: number, val: number): void {
    if (l === r) { this.tree[node] = val; return; }
    const m = (l + r) >> 1;
    if (idx <= m) this.u(node * 2, l, m, idx, val);
    else this.u(node * 2 + 1, m + 1, r, idx, val);
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1];
  }
  rangeQuery(l: number, r: number): number { return this.q(1, 0, this.n - 1, l, r); }
  pointUpdate(idx: number, val: number): void { this.u(1, 0, this.n - 1, idx, val); }
}`;

export const segmentTreeCodeLines = [
  "class SegmentTree {",
  "  // ← build: O(n)",
  "  build(node, l, r, arr): void {",
  "    if (l === r) { this.tree[node] = arr[l]; return; }",
  "    const m = (l + r) >> 1;",
  "    this.build(node*2, l, m, arr);",
  "    this.build(node*2+1, m+1, r, arr);",
  "    this.tree[node] = this.tree[node*2] + this.tree[node*2+1];",
  "  }",
  "  // ← query: O(log n)",
  "  q(node, l, r, ql, qr): number {",
  "    if (ql <= l && r <= qr) return this.tree[node];",
  "    if (r < ql || l > qr) return 0;",
  "    return this.q(node*2,l,m,ql,qr) + this.q(node*2+1,m+1,r,ql,qr);",
  "  }",
  "  // ← update: O(log n)",
  "  u(node, l, r, idx, val): void {",
  "    if (l === r) { this.tree[node] = val; return; }",
  "    const m = (l + r) >> 1;",
  "    idx <= m ? this.u(node*2,l,m,idx,val) : this.u(node*2+1,m+1,r,idx,val);",
  "    this.tree[node] = this.tree[node*2] + this.tree[node*2+1];",
  "  }",
  "}",
];

export const segmentTreeContent = {
  id: "segment-tree",
  slug: "segment-tree",
  title: "",
  titleKey: "content.structures.segment-tree.title",
  category: "structure" as const,
  subcategory: "tree",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.segment-tree.desc",
  generator: segmentTreeGenerator,
  code: segmentTreeCode,
  language: "TypeScript",
  complexity: { time: "O(log n)", space: "O(n)" },
  tags: [],
  icon: "🌲",
  codeExamples: {
    typescript: {
      code: `class SegmentTree {
  private tree: number[];
  private n: number;

  constructor(arr: number[]) {
    this.n = arr.length;
    this.tree = new Array(4 * this.n);
    this.build(1, 0, this.n - 1, arr);
  }

  private build(node: number, l: number, r: number, arr: number[]): void {
    if (l === r) { this.tree[node] = arr[l]; return; }  // ← leaf node
    const m = (l + r) >> 1;
    this.build(node * 2, l, m, arr);
    this.build(node * 2 + 1, m + 1, r, arr);
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1]; // ← merge
  }

  private q(node: number, l: number, r: number, ql: number, qr: number): number {
    if (ql <= l && r <= qr) return this.tree[node];    // fully covered
    if (r < ql || l > qr) return 0;                     // no overlap
    const m = (l + r) >> 1;
    return this.q(node * 2, l, m, ql, qr) +
           this.q(node * 2 + 1, m + 1, r, ql, qr);
  }

  rangeQuery(l: number, r: number): number {
    return this.q(1, 0, this.n - 1, l, r);
  }

  pointUpdate(idx: number, val: number): void {
    this.u(1, 0, this.n - 1, idx, val);
  }

  private u(node: number, l: number, r: number, idx: number, val: number): void {
    if (l === r) { this.tree[node] = val; return; }
    const m = (l + r) >> 1;
    if (idx <= m) this.u(node * 2, l, m, idx, val);
    else this.u(node * 2 + 1, m + 1, r, idx, val);
    this.tree[node] = this.tree[node * 2] + this.tree[node * 2 + 1]; // ← recompute
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int tree[400000];

void build(int node, int l, int r, int arr[]) {
  if (l == r) { tree[node] = arr[l]; return; }   // ← leaf node
  int m = (l + r) / 2;
  build(node * 2, l, m, arr);
  build(node * 2 + 1, m + 1, r, arr);
  tree[node] = tree[node * 2] + tree[node * 2 + 1]; // ← merge
}

int query(int node, int l, int r, int ql, int qr) {
  if (ql <= l && r <= qr) return tree[node];     // fully covered
  if (r < ql || l > qr) return 0;                 // no overlap
  int m = (l + r) / 2;
  return query(node * 2, l, m, ql, qr) +
         query(node * 2 + 1, m + 1, r, ql, qr);
}

void update(int node, int l, int r, int idx, int val) {
  if (l == r) { tree[node] = val; return; }
  int m = (l + r) / 2;
  if (idx <= m) update(node * 2, l, m, idx, val);
  else update(node * 2 + 1, m + 1, r, idx, val);
  tree[node] = tree[node * 2] + tree[node * 2 + 1]; // ← recompute
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class SegmentTree {
  vector<int> tree;
  int n;
public:
  SegmentTree(vector<int>& arr) : n(arr.size()), tree(4 * arr.size()) {
    build(1, 0, n - 1, arr);
  }

  void build(int node, int l, int r, vector<int>& arr) {
    if (l == r) { tree[node] = arr[l]; return; }  // ← leaf node
    int m = (l + r) / 2;
    build(node * 2, l, m, arr);
    build(node * 2 + 1, m + 1, r, arr);
    tree[node] = tree[node * 2] + tree[node * 2 + 1]; // ← merge
  }

  int query(int node, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[node];
    if (r < ql || l > qr) return 0;
    int m = (l + r) / 2;
    return query(node * 2, l, m, ql, qr) +
           query(node * 2 + 1, m + 1, r, ql, qr);
  }

  void update(int node, int l, int r, int idx, int val) {
    if (l == r) { tree[node] = val; return; }
    int m = (l + r) / 2;
    if (idx <= m) update(node * 2, l, m, idx, val);
    else update(node * 2 + 1, m + 1, r, idx, val);
    tree[node] = tree[node * 2] + tree[node * 2 + 1]; // ← recompute
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self._build(1, 0, self.n - 1, arr)

    def _build(self, node, l, r, arr):
        if l == r:
            self.tree[node] = arr[l]       # ← leaf node
            return
        m = (l + r) // 2
        self._build(node * 2, l, m, arr)
        self._build(node * 2 + 1, m + 1, r, arr)
        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1]  # ← merge

    def _query(self, node, l, r, ql, qr):
        if ql <= l and r <= qr:
            return self.tree[node]         # fully covered
        if r < ql or l > qr:
            return 0                        # no overlap
        m = (l + r) // 2
        return self._query(node * 2, l, m, ql, qr) + \
               self._query(node * 2 + 1, m + 1, r, ql, qr)

    def range_query(self, l, r):
        return self._query(1, 0, self.n - 1, l, r)

    def point_update(self, idx, val):
        self._update(1, 0, self.n - 1, idx, val)

    def _update(self, node, l, r, idx, val):
        if l == r:
            self.tree[node] = val
            return
        m = (l + r) // 2
        if idx <= m:
            self._update(node * 2, l, m, idx, val)
        else:
            self._update(node * 2 + 1, m + 1, r, idx, val)
        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1]  # ← recompute`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `struct SegmentTree {
    tree: Vec<i32>,
    n: usize,
}

impl SegmentTree {
    fn new(arr: &[i32]) -> Self {
        let n = arr.len();
        let mut st = SegmentTree { tree: vec![0; 4 * n], n };
        st.build(1, 0, n - 1, arr);
        st
    }

    fn build(&mut self, node: usize, l: usize, r: usize, arr: &[i32]) {
        if l == r { self.tree[node] = arr[l]; return; }  // ← leaf node
        let m = (l + r) / 2;
        self.build(node * 2, l, m, arr);
        self.build(node * 2 + 1, m + 1, r, arr);
        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1]; // ← merge
    }

    fn query(&self, node: usize, l: usize, r: usize, ql: usize, qr: usize) -> i32 {
        if ql <= l && r <= qr { return self.tree[node]; }
        if r < ql || l > qr { return 0; }
        let m = (l + r) / 2;
        self.query(node * 2, l, m, ql, qr) +
        self.query(node * 2 + 1, m + 1, r, ql, qr)
    }

    fn update(&mut self, node: usize, l: usize, r: usize, idx: usize, val: i32) {
        if l == r { self.tree[node] = val; return; }
        let m = (l + r) / 2;
        if idx <= m { self.update(node * 2, l, m, idx, val); }
        else { self.update(node * 2 + 1, m + 1, r, idx, val); }
        self.tree[node] = self.tree[node * 2] + self.tree[node * 2 + 1]; // ← recompute
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type SegmentTree struct {
  tree []int
  n    int
}

func NewSegmentTree(arr []int) *SegmentTree {
  n := len(arr)
  st := &SegmentTree{tree: make([]int, 4*n), n: n}
  st.build(1, 0, n-1, arr)
  return st
}

func (st *SegmentTree) build(node, l, r int, arr []int) {
  if l == r { st.tree[node] = arr[l]; return } // ← leaf node
  m := (l + r) / 2
  st.build(node*2, l, m, arr)
  st.build(node*2+1, m+1, r, arr)
  st.tree[node] = st.tree[node*2] + st.tree[node*2+1] // ← merge
}

func (st *SegmentTree) query(node, l, r, ql, qr int) int {
  if ql <= l && r <= qr { return st.tree[node] }
  if r < ql || l > qr { return 0 }
  m := (l + r) / 2
  return st.query(node*2, l, m, ql, qr) +
         st.query(node*2+1, m+1, r, ql, qr)
}

func (st *SegmentTree) update(node, l, r, idx, val int) {
  if l == r { st.tree[node] = val; return }
  m := (l + r) / 2
  if idx <= m { st.update(node*2, l, m, idx, val) }
  else { st.update(node*2+1, m+1, r, idx, val) }
  st.tree[node] = st.tree[node*2] + st.tree[node*2+1] // ← recompute
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class SegmentTree {
  private int[] tree;
  private int n;

  SegmentTree(int[] arr) {
    n = arr.length;
    tree = new int[4 * n];
    build(1, 0, n - 1, arr);
  }

  void build(int node, int l, int r, int[] arr) {
    if (l == r) { tree[node] = arr[l]; return; } // ← leaf node
    int m = (l + r) / 2;
    build(node * 2, l, m, arr);
    build(node * 2 + 1, m + 1, r, arr);
    tree[node] = tree[node * 2] + tree[node * 2 + 1]; // ← merge
  }

  int query(int node, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[node];
    if (r < ql || l > qr) return 0;
    int m = (l + r) / 2;
    return query(node * 2, l, m, ql, qr) +
           query(node * 2 + 1, m + 1, r, ql, qr);
  }

  void update(int node, int l, int r, int idx, int val) {
    if (l == r) { tree[node] = val; return; }
    int m = (l + r) / 2;
    if (idx <= m) update(node * 2, l, m, idx, val);
    else update(node * 2 + 1, m + 1, r, idx, val);
    tree[node] = tree[node * 2] + tree[node * 2 + 1]; // ← recompute
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "database-range",
      i18nKey: "content.structures.segment-tree.scenarios.database-range",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL, ClickHouse, TimescaleDB",
    },
    {
      id: "competitive-prog",
      i18nKey: "content.structures.segment-tree.scenarios.competitive-prog",
      domain: "devtools",
      icon: "🏆",
      reference: "LeetCode, Codeforces, CSES Problem Set",
      codeSnippet: {
        language: "typescript",
        code: `// Segment tree: O(log n) range sum query + point update
// Used in competitive programming for range min/max/sum/gcd
const seg = new SegmentTree([1, 3, 5, 7, 9, 11]);
seg.rangeQuery(1, 4);  // sum of indices 1..4 → 24
seg.pointUpdate(2, 10); // update index 2: 5 → 10`,
      },
    },
    {
      id: "interval-tree",
      i18nKey: "content.structures.segment-tree.scenarios.interval-tree",
      domain: "graphics",
      icon: "🎨",
      reference: "GPU rendering, collision detection",
    },
  ] satisfies Scenario[],
};
