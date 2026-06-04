import type { Frame, Scenario, TreeState, TreeNode } from "@codeprism/core";

function makeNode(id: string, value: number, x: number, y: number, left: TreeNode | null, right: TreeNode | null, status: TreeNode["status"] = "default"): TreeNode {
  return { id, value, x, y, left, right, status };
}

function buildForestRoot(parents: number[], marks: Map<string, TreeNode["status"]>): TreeNode | null {
  const n = parents.length;
  function makeTree(idx: number, x: number, y: number, spread: number): TreeNode | null {
    if (idx < 0 || idx >= n) return null;
    const children: TreeNode[] = [];
    for (let i = 0; i < n; i++) {
      if (parents[i] === idx && i !== idx) {
        const child = makeTree(i, x + (children.length - children.length / 2) * spread, y + 60, spread / Math.max(children.length, 2));
        if (child) children.push(child);
      }
    }
    return makeNode(String(idx), idx, x, y, children[0] ?? null, children[1] ?? null, marks.get(String(idx)) ?? "default");
  }
  for (let i = 0; i < n; i++) {
    if (parents[i] === i) return makeTree(i, 350, 50, 150);
  }
  return null;
}

export function* unionFindGenerator(): Generator<Frame<TreeState>, void, unknown> {
  const parent: number[] = [0, 1, 2, 3, 4];
  const rank: number[] = [0, 0, 0, 0, 0];

  function find(x: number): number {
    if (parent[x] !== x) {
      parent[x] = find(parent[x]);
    }
    return parent[x];
  }

  function union(x: number, y: number): void {
    const px = find(x), py = find(y);
    if (px === py) return;
    if (rank[px] < rank[py]) parent[px] = py;
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
  }

  let step = 0;
  let root = buildForestRoot(parent, new Map());
  yield { step: step++, state: { root, operation: "Initialize" }, description: "UF init: 5 independent elements, each is its own root", highlightLine: 0 };

  union(0, 1);
  root = buildForestRoot(parent, new Map([["0", "inserted"], ["1", "inserted"]]));
  yield { step: step++, state: { root, operation: "Union(0,1)" }, description: "Union(0,1): merge sets {0} and {1}, root of 0 becomes parent of 1", highlightLine: 10 };

  union(1, 2);
  root = buildForestRoot(parent, new Map([["0", "visiting"], ["1", "inserted"], ["2", "inserted"]]));
  yield { step: step++, state: { root, operation: "Union(1,2)" }, description: "Union(1,2): after path compression 1→0, then 2→0, forming chain", highlightLine: 12 };

  const m1 = new Map<string, TreeNode["status"]>([["0", "found"], ["1", "visiting"], ["2", "visiting"]]);
  root = buildForestRoot(parent, m1);
  yield { step: step++, state: { root, operation: `Find(2) = ${find(2)}` }, description: `Find(2) = ${find(2)}: path compression makes all nodes point directly to root 0`, highlightLine: 5 };

  union(3, 4);
  root = buildForestRoot(parent, new Map([["3", "inserted"], ["4", "inserted"]]));
  yield { step: step++, state: { root, operation: "Union(3,4)" }, description: "Union(3,4): merge sets {3} and {4}", highlightLine: 15 };

  union(1, 3);
  root = buildForestRoot(parent, new Map([["0", "found"], ["1", "visiting"], ["2", "visiting"], ["3", "inserted"], ["4", "inserted"]]));
  yield { step: step++, state: { root, operation: "Union(1,3)" }, description: "Union(1,3): merge {0,1,2} and {3,4} into one set", highlightLine: 17 };

  const m2 = new Map<string, TreeNode["status"]>([["0", "found"], ["1", "found"]]);
  root = buildForestRoot(parent, m2);
  yield { step: step++, state: { root, operation: `Find(0) = ${find(0)}` }, description: `Find(0) = ${find(0)}: element 0 is its own root, path compressed`, highlightLine: 5 };

  root = buildForestRoot(parent, new Map());
  yield { step: step++, state: { root, operation: "Complete" }, description: "UF demo complete ✅ Find/Union amortized O(α(n)), α = inverse Ackermann", highlightLine: 20 };
}

export const unionFindCode = `class UnionFind {
  parent: number[];
  rank: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x: number): number {
    if (this.parent[x] !== x)
      this.parent[x] = this.find(this.parent[x]);  // ← path compression
    return this.parent[x];
  }
  union(x: number, y: number): void {
    const px = this.find(x), py = this.find(y);
    if (px === py) return;
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;  // ← union by rank
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
  }
}`;

export const unionFindCodeLines = [
  "class UnionFind {",
  "  parent: number[];",
  "  rank: number[];",
  "  // ← find: O(α(n)) with path compression",
  "  find(x): number {",
  "    if (this.parent[x] !== x)",
  "      this.parent[x] = this.find(this.parent[x]);  // ← path compression",
  "    return this.parent[x];",
  "  }",
  "  // ← union: O(α(n)) with union by rank",
  "  union(x, y): void {",
  "    const px = this.find(x), py = this.find(y);",
  "    if (px === py) return;",
  "    if (this.rank[px] < this.rank[py]) this.parent[px] = py;",
  "    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;",
  "    else { this.parent[py] = px; this.rank[px]++; }",
  "  }",
  "}",
];

export const unionFindContent = {
  id: "union-find",
  slug: "union-find",
  title: "",
  titleKey: "content.structures.union-find.title",
  category: "structure" as const,
  subcategory: "tree",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.union-find.desc",
  generator: unionFindGenerator,
  code: unionFindCode,
  language: "TypeScript",
  complexity: { time: "O(α(n))", space: "O(n)" },
  tags: [],
  icon: "🌲",
  codeExamples: {
    typescript: {
      code: `class UnionFind {
  parent: number[];
  rank: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }

  find(x: number): number {
    if (this.parent[x] !== x)
      this.parent[x] = this.find(this.parent[x]); // ← path compression
    return this.parent[x];
  }

  union(x: number, y: number): void {
    const px = this.find(x), py = this.find(y);
    if (px === py) return;
    if (this.rank[px] < this.rank[py]) this.parent[px] = py;  // ← union by rank
    else if (this.rank[px] > this.rank[py]) this.parent[py] = px;
    else { this.parent[py] = px; this.rank[px]++; }
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct {
  int* parent;
  int* rank;
  int n;
} UnionFind;

UnionFind* create(int n) {
  UnionFind* uf = malloc(sizeof(UnionFind));
  uf->n = n;
  uf->parent = malloc(n * sizeof(int));
  uf->rank = calloc(n, sizeof(int));
  for (int i = 0; i < n; i++) uf->parent[i] = i;
  return uf;
}

int find(UnionFind* uf, int x) {
  if (uf->parent[x] != x)
    uf->parent[x] = find(uf, uf->parent[x]); // ← path compression
  return uf->parent[x];
}

void unionSets(UnionFind* uf, int x, int y) {
  int px = find(uf, x), py = find(uf, y);
  if (px == py) return;
  if (uf->rank[px] < uf->rank[py]) uf->parent[px] = py;   // ← union by rank
  else if (uf->rank[px] > uf->rank[py]) uf->parent[py] = px;
  else { uf->parent[py] = px; uf->rank[px]++; }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class UnionFind {
  vector<int> parent, rank;
public:
  UnionFind(int n) : parent(n), rank(n, 0) {
    iota(parent.begin(), parent.end(), 0);
  }

  int find(int x) {
    if (parent[x] != x)
      parent[x] = find(parent[x]);        // ← path compression
    return parent[x];
  }

  void unite(int x, int y) {
    int px = find(x), py = find(y);
    if (px == py) return;
    if (rank[px] < rank[py]) parent[px] = py;  // ← union by rank
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # ← path compression
        return self.parent[x]

    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px == py: return
        if self.rank[px] < self.rank[py]:               # ← union by rank
            self.parent[px] = py
        elif self.rank[px] > self.rank[py]:
            self.parent[py] = px
        else:
            self.parent[py] = px
            self.rank[px] += 1`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `struct UnionFind {
    parent: Vec<usize>,
    rank: Vec<usize>,
}

impl UnionFind {
    fn new(n: usize) -> Self {
        UnionFind { parent: (0..n).collect(), rank: vec![0; n] }
    }

    fn find(&mut self, x: usize) -> usize {
        if self.parent[x] != x {
            self.parent[x] = self.find(self.parent[x]); // ← path compression
        }
        self.parent[x]
    }

    fn union(&mut self, x: usize, y: usize) {
        let px = self.find(x);
        let py = self.find(y);
        if px == py { return; }
        if self.rank[px] < self.rank[py] {              // ← union by rank
            self.parent[px] = py;
        } else if self.rank[px] > self.rank[py] {
            self.parent[py] = px;
        } else {
            self.parent[py] = px;
            self.rank[px] += 1;
        }
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type UnionFind struct {
  parent []int
  rank   []int
}

func NewUnionFind(n int) *UnionFind {
  parent := make([]int, n)
  for i := range parent { parent[i] = i }
  return &UnionFind{parent: parent, rank: make([]int, n)}
}

func (uf *UnionFind) Find(x int) int {
  if uf.parent[x] != x {
    uf.parent[x] = uf.Find(uf.parent[x]) // ← path compression
  }
  return uf.parent[x]
}

func (uf *UnionFind) Union(x, y int) {
  px, py := uf.Find(x), uf.Find(y)
  if px == py { return }
  if uf.rank[px] < uf.rank[py] {          // ← union by rank
    uf.parent[px] = py
  } else if uf.rank[px] > uf.rank[py] {
    uf.parent[py] = px
  } else {
    uf.parent[py] = px
    uf.rank[px]++
  }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class UnionFind {
  int[] parent, rank;

  UnionFind(int n) {
    parent = new int[n];
    rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
  }

  int find(int x) {
    if (parent[x] != x)
      parent[x] = find(parent[x]);        // ← path compression
    return parent[x];
  }

  void union(int x, int y) {
    int px = find(x), py = find(y);
    if (px == py) return;
    if (rank[px] < rank[py]) parent[px] = py;  // ← union by rank
    else if (rank[px] > rank[py]) parent[py] = px;
    else { parent[py] = px; rank[px]++; }
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "kruskal-mst",
      i18nKey: "content.structures.union-find.scenarios.kruskal-mst",
      domain: "system",
      icon: "🗺️",
      reference: "Graph algorithms, network optimization",
      codeSnippet: {
        language: "typescript",
        code: `// Kruskal's MST uses Union-Find for cycle detection
// Sort edges by weight, then for each edge (u,v):
//   if find(u) !== find(v): union(u, v) — add to MST
// Amortized O(α(n)) per operation, α ≈ 4 in practice`,
      },
    },
    {
      id: "network-connectivity",
      i18nKey: "content.structures.union-find.scenarios.network-connectivity",
      domain: "network",
      icon: "🌐",
      reference: "OSPF, network routing protocols",
    },
    {
      id: "social-network",
      i18nKey: "content.structures.union-find.scenarios.social-network",
      domain: "business",
      icon: "👥",
      reference: "LinkedIn, Facebook friend suggestions",
    },
  ] satisfies Scenario[],
};
