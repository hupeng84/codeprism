import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * Prim / Kruskal — Minimum Spanning Tree Frame Generators
 * Prim: grows MST from a start node by always picking the cheapest crossing edge.
 * Kruskal: sorts all edges and greedily adds the cheapest that doesn't form a cycle.
 */

// ── Graph Data ──────────────────────────────────────────────────────────────

const NODES: GraphNode[]=[
  { id: "A", label: "A", value: 0, x: 350, y: 40, status: "default" },
  { id: "B", label: "B", value: 1, x: 200, y: 120, status: "default" },
  { id: "C", label: "C", value: 2, x: 500, y: 120, status: "default" },
  { id: "D", label: "D", value: 3, x: 100, y: 220, status: "default" },
  { id: "E", label: "E", value: 4, x: 300, y: 220, status: "default" },
  { id: "F", label: "F", value: 5, x: 480, y: 220, status: "default" },
  { id: "G", label: "G", value: 6, x: 200, y: 320, status: "default" },
  { id: "H", label: "H", value: 7, x: 400, y: 320, status: "default" },
];

interface WeightedEdge extends GraphEdge {
  weight: number;
}

/** Undirected weighted edges (stored once, algorithm treats both directions) */
const EDGES: WeightedEdge[]=[
  { from: "A", to: "B", weight: 4, status: "default" },
  { from: "A", to: "C", weight: 2, status: "default" },
  { from: "B", to: "D", weight: 5, status: "default" },
  { from: "B", to: "E", weight: 10, status: "default" },
  { from: "C", to: "E", weight: 3, status: "default" },
  { from: "C", to: "F", weight: 8, status: "default" },
  { from: "E", to: "G", weight: 7, status: "default" },
  { from: "E", to: "H", weight: 2, status: "default" },
  { from: "D", to: "G", weight: 1, status: "default" },
  { from: "G", to: "H", weight: 6, status: "default" },
];

/** Undirected adjacency: both directions */
const UNDIR_ADJ: Record<string, { neighbor: string; weight: number }[]> = {};
for (const e of EDGES) {
  if (!UNDIR_ADJ[e.from]) UNDIR_ADJ[e.from]=[];
  if (!UNDIR_ADJ[e.to]) UNDIR_ADJ[e.to]=[];
  UNDIR_ADJ[e.from].push({ neighbor: e.to, weight: e.weight });
  UNDIR_ADJ[e.to].push({ neighbor: e.from, weight: e.weight });
}

function resetNodes(): GraphNode[] {
  return NODES.map((n) => ({ ...n, status: "default" as const }));
}

function resetEdges(): WeightedEdge[] {
  return EDGES.map((e) => ({ ...e, status: "default" as const }));
}

// ── Union-Find helper (for Kruskal) ─────────────────────────────────────────

function makeUF(size: number) {
  const parent = Array.from({ length: size }, (_, i) => i);
  const rank = new Array<number>(size).fill(0);
  function find(x: number): number {
    if (parent[x] !== x) parent[x]=find(parent[x]);
    return parent[x];
  }
  function union(a: number, b: number): boolean {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra]=rb;
    else if (rank[ra] > rank[rb]) parent[rb]=ra;
    else {
      parent[rb]=ra;
      rank[ra]++;
    }
    return true;
  }
  return { find, union };
}

// ═══════════════════════════════════════════════════════════════════════════
// PRIM
// ═══════════════════════════════════════════════════════════════════════════

export function* primGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  const inMST = new Set<string>();
  const mstEdges: string[]=[]; // edge keys "A-B"
  let step = 0;

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: "Prim: from node A, build MST",
    },
    description: "Init graph, Prim from A",
    highlightLine: 0,
  };

  // Start from A
  inMST.add("A");
  const nodeA = nodes.find((n) => n.id === "A")!;
  nodeA.status = "current";

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: ["A"],
      operation: "Prim: add A to MST",
    },
    description: "Add start node A to MST",
    highlightLine: 2,
  };

  const mstNodeOrder: string[]=["A"];

  while (inMST.size < NODES.length) {
    // Find min weight edge crossing the cut
    let bestWeight = Infinity;
    let bestFrom = "";
    let bestTo = "";

    for (const nodeId of inMST) {
      for (const { neighbor, weight } of UNDIR_ADJ[nodeId]) {
        if (!inMST.has(neighbor) && weight < bestWeight) {
          bestWeight = weight;
          bestFrom = nodeId;
          bestTo = neighbor;
        }
      }
    }

    if (bestTo === "") break; // no more edges

    // Highlight the candidate edge
    const edge = edges.find(
      (e) =>
        (e.from === bestFrom && e.to === bestTo) ||
        (e.from === bestTo && e.to === bestFrom),
    )!;
    edge.status = "traversing";

    const nextNode = nodes.find((n) => n.id === bestTo)!;
    nextNode.status = "visiting";

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...mstNodeOrder],
        operation: `Prim: Selectminimumedge ${bestFrom}→${bestTo}(weight ${bestWeight})`,
      },
      description: `Select min weight crossing edge ${bestFrom}→${bestTo}(${bestWeight})`,
      highlightLine: 6,
    };

    // Add to MST
    inMST.add(bestTo);
    mstNodeOrder.push(bestTo);
    edge.status = "traversed";
    nextNode.status = "current";
    mstEdges.push(`${bestFrom}-${bestTo}`);

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...mstNodeOrder],
        operation: `Prim: Add ${bestTo} → MST (weight: ${calcMSTWeight(mstEdges)})`,
      },
      description: `node ${bestTo} Add MST`,
      highlightLine: 8,
    };

    // Mark previous current as visited
    for (const n of nodes) {
      if (n.id !== bestTo && n.status === "current") {
        n.status = "visited";
      }
    }
  }

  // Final frame
  const totalWeight = calcMSTWeight(mstEdges);
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...mstNodeOrder],
      operation: `Prim MST done ✅ weight: ${totalWeight} order: ${mstNodeOrder.join(" → ")}`,
    },
    description: `Prim done ✅ weight: ${totalWeight}`,
    highlightLine: 10,
  };
}

function calcMSTWeight(mstEdges: string[]): number {
  let w = 0;
  for (const key of mstEdges) {
    const [a, b]=key.split("-");
    const e = EDGES.find(
      (e) =>
        (e.from === a && e.to === b) || (e.from === b && e.to === a),
    );
    if (e) w += e.weight;
  }
  return w;
}

export const primCode = `function prim(graph: WeightedGraph, start: string): Edge[] {
  const inMST = new Set<string>([start]);   // ← Nodes already in MST
  const mst: Edge[]=[];

  while (inMST.size < graph.nodes.length) {
    let best = { weight: Infinity };        // ← Find minimum crossing edge
    for (const node of inMST) {
      for (const { to, weight } of graph.edges(node)) {
        if (!inMST.has(to) && weight < best.weight)
          best = { from: node, to, weight };
      }
    }
    inMST.add(best.to);                     // ← Add new node
    mst.push(best);
  }
  return mst;
}`;

export const primCodeLines = [
  "function prim(graph: WeightedGraph, start: string): Edge[] {",
  "  const inMST = new Set<string>([start]);",
  "  const mst: Edge[]=[];",
  "  while (inMST.size < graph.nodes.length) {",
  "    let best = { weight: Infinity };",
  "    for (const node of inMST) {",
  "      for (const { to, weight } of graph.edges(node)) {",
  "        if (!inMST.has(to) && weight < best.weight)",
  "          best = { from: node, to, weight };",
  "      }",
  "    }",
  "    inMST.add(best.to);",
  "    mst.push(best);",
  "  }",
  "  return mst;",
  "}",
];

export const primContent = {
  id: "prim",
  slug: "prim",
  title: "",
  titleKey: "content.algorithms.prim.title",
  category: "graph" as const,
  subcategory: "mst",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.prim.desc",
  generator: primGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: primCode,
  language: "TypeScript",
  complexity: { time: "O((V +E) log V)", space: "O(V)" },
  tags: [],
  icon: "🌳",
  codeExamples: {
    typescript: {
      code: `function prim(graph: Map<string, [string, number][]>, start: string): [string, string, number][] {
  const inMST = new Set<string>([start]);
  const mst: [string, string, number][]=[];

  while (inMST.size < graph.size) {
    let best: [number, string, string]=[Infinity, "", ""];

    for (const node of inMST) {
      for (const [to, weight] of graph.get(node) ?? []) {
        if (!inMST.has(to) && weight < best[0]) {
          best = [weight, node, to];
        }
      }
    }

    inMST.add(best[1]);
    inMST.add(best[2]);
    mst.push([best[1], best[2], best[0]]);
  }
  return mst;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void prim(int n, int** graph, int start, int* inMST, int* mstEdges, int* mstSize) {
    memset(inMST, 0, n * sizeof(int));
    inMST[start]=1;

    for (int count = 0; count < n - 1; count++) {
        int minWeight = INT_MAX, u = -1, v = -1;
        for (int i = 0; i < n; i++) {
            if (inMST[i]) {
                for (int j = 0; j < n; j++) {
                    if (!inMST[j] && graph[i][j] && graph[i][j] < minWeight) {
                        minWeight = graph[i][j];
                        u = i; v = j;
                    }
                }
            }
        }
        inMST[v]=1;
        mstEdges[(*mstSize)++]=u * n +v;
    }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void prim(int n, const vector<vector<int>>& graph, int start, vector<pair<int,int>>& mst) {
    vector<int> inMST(n, 0);
    inMST[start]=1;

    while (mst.size() < n - 1) {
        int minWeight = INT_MAX, u = -1, v = -1;
        for (int i = 0; i < n; i++) {
            if (inMST[i]) {
                for (int j = 0; j < n; j++) {
                    if (!inMST[j] && graph[i][j] && graph[i][j] < minWeight) {
                        minWeight = graph[i][j];
                        u = i; v = j;
                    }
                }
            }
        }
        inMST[v]=1;
        mst.push_back({u, v});
    }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def prim(n, graph, start):
    in_mst = [False] * n
    in_mst[start]=True
    mst = []

    while len(mst) < n - 1:
        min_weight = float('inf')
        u, v = -1, -1
        for i in range(n):
            if in_mst[i]:
                for j in range(n):
                    if not in_mst[j] and graph[i][j] and graph[i][j] < min_weight:
                        min_weight = graph[i][j]
                        u, v = i, j
        in_mst[v]=True
        mst.append((u, v, min_weight))
    return mst`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn prim(n: usize, graph: &[[i32; 8]; 8], start: usize) -> Vec<(usize, usize, i32)> {
    let mut in_mst = vec![false; n];
    in_mst[start]=true;
    let mut mst = Vec::new();

    while mst.len() < n - 1 {
        let mut min_weight = i32::MAX;
        let mut u = 0;
        let mut v = 0;
        for i in 0..n {
            if in_mst[i] {
                for j in 0..n {
                    if !in_mst[j] && graph[i][j] != 0 && graph[i][j] < min_weight {
                        min_weight = graph[i][j];
                        u = i;
                        v = j;
                    }
                }
            }
        }
        in_mst[v]=true;
        mst.push((u, v, min_weight));
    }
    mst
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func prim(n int, graph [][]int, start int) [][3]int {
    inMST := make([]bool, n)
    inMST[start]=true
    mst := [][3]int{}

    for len(mst) < n-1 {
        minWeight := int(^uint(0) >> 1)
        var u, v int
        for i := 0; i < n; i++{
            if inMST[i] {
                for j := 0; j < n; j++{
                    if !inMST[j] && graph[i][j] != 0 && graph[i][j] < minWeight {
                        minWeight = graph[i][j]
                        u, v = i, j
                    }
                }
            }
        }
        inMST[v]=true
        mst = append(mst, [3]int{u, v, minWeight})
    }
    return mst
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static List<int[]> prim(int n, int[][] graph, int start) {
    List<int[]> mst = new ArrayList<>();
    boolean[] inMST = new boolean[n];
    inMST[start]=true;

    while (mst.size() < n - 1) {
        int minWeight = Integer.MAX_VALUE;
        int u = -1, v = -1;
        for (int i = 0; i < n; i++) {
            if (inMST[i]) {
                for (int j = 0; j < n; j++) {
                    if (!inMST[j] && graph[i][j] != 0 && graph[i][j] < minWeight) {
                        minWeight = graph[i][j];
                        u = i;
                        v = j;
                    }
                }
            }
        }
        inMST[v]=true;
        mst.add(new int[]{u, v, minWeight});
    }
    return mst;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "fiber-optic-network",
      i18nKey: "content.algorithms.prim.scenarios.fiber-optic-network",
      domain: "network",
      icon: "🌐",
      reference: "Verizon FiOS, Google Fiber, AT&T backbone",
      codeSnippet: {
        language: "typescript",
        code: `// ISP network design — Prim's MST finds minimum fiber-optic cable layout
// connecting all neighborhoods with the least total trenching cost
type Node = string;
type Edge = [Node, Node, number];

function designFiberNetwork(
  neighborhoods: Node[],
  availableCables: Edge[]
): Edge[] {
  const adj = new Map<Node, [Node, number][]>();
  for (const [a, b, cost] of availableCables) {
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push([b, cost]);
    adj.get(b)!.push([a, cost]);
  }
  const inMST = new Set<Node>([neighborhoods[0]]);
  const mst: Edge[] = [];
  while (inMST.size < neighborhoods.length) {
    let best: Edge | null = null;
    for (const node of inMST) {
      for (const [to, cost] of adj.get(node) ?? []) {
        if (!inMST.has(to) && (!best || cost < best[2])) {
          best = [node, to, cost];
        }
      }
    }
    if (!best) break;
    inMST.add(best[1]);
    mst.push(best);
  }
  return mst;
}`,
      },
    },
    {
      id: "cluster-analysis",
      i18nKey: "content.algorithms.prim.scenarios.cluster-analysis",
      domain: "ai-ml",
      icon: "🧬",
      reference: "scikit-learn, Single-linkage clustering, Deng Cai",
    },
    {
      id: "power-grid",
      i18nKey: "content.algorithms.prim.scenarios.power-grid",
      domain: "business",
      icon: "⚡",
      reference: "National Grid, Tesla Supercharger network, Siemens",
    },
  ] satisfies Scenario[],
};

// ═══════════════════════════════════════════════════════════════════════════
// KRUSKAL
// ═══════════════════════════════════════════════════════════════════════════

export function* kruskalGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  let step = 0;

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: "Kruskal: sort all edges by weight",
    },
    description: "Init graph, Kruskal sort edges",
    highlightLine: 0,
  };

  // Sort edges by weight
  const sorted = [...edges].sort((a, b) => a.weight - b.weight);

  // Show sorted edges
  const sortedStr = sorted.map((e) => `${e.from}→${e.to}(${e.weight})`).join(", ");
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: `Kruskal: After sorting: ${sortedStr}`,
    },
    description: `Edges sorted: ${sortedStr}`,
    highlightLine: 2,
  };

  // Union-Find
  const nodeIds = NODES.map((n) => n.id);
  const idIndex = new Map(nodeIds.map((id, i) => [id, i]));
  const uf = makeUF(nodeIds.length);

  const mstEdgesList: string[]=[];
  const mstNodeOrder: string[]=[];

  for (const e of sorted) {
    const ui = idIndex.get(e.from)!;
    const vi = idIndex.get(e.to)!;

    // Highlight current edge being considered
    const edgeObj = edges.find(
      (ed) => ed.from === e.from && ed.to === e.to,
    )!;
    edgeObj.status = "traversing";

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...mstNodeOrder],
        operation: `Kruskal: Check edge ${e.from}→${e.to}(weight ${e.weight})`,
      },
      description: `checkedge ${e.from}→${e.to}(weight ${e.weight})cycle?`,
      highlightLine: 6,
    };

    if (uf.find(ui) !== uf.find(vi)) {
      // No cycle — add to MST
      uf.union(ui, vi);
      edgeObj.status = "traversed";
      mstEdgesList.push(`${e.from}-${e.to}`);

      if (!mstNodeOrder.includes(e.from)) mstNodeOrder.push(e.from);
      if (!mstNodeOrder.includes(e.to)) mstNodeOrder.push(e.to);

      // Mark both nodes
      const nf = nodes.find((n) => n.id === e.from)!;
      const nt = nodes.find((n) => n.id === e.to)!;
      if (nf.status === "default") nf.status = "current";
      if (nt.status === "default") nt.status = "current";

      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: [...mstNodeOrder],
          operation: `Kruskal: addedge ${e.from}→${e.to}(no cycle) MST weight: ${calcMSTWeight(mstEdgesList)}`,
        },
        description: `edge ${e.from}→${e.to} Add MST(No cycle formed)`,
        highlightLine: 8,
      };

      // Mark as visited if degree is enough
      if (nf.status === "current") nf.status = "visited";
      if (nt.status === "current") nt.status = "visited";
    } else {
      // Cycle — reject
      edgeObj.status = "default";

      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: [...mstNodeOrder],
          operation: `Kruskal: Skip edge ${e.from}→${e.to}(cycle)`,
        },
        description: `edge ${e.from}→${e.to} forms cycle, skip`,
        highlightLine: 10,
      };
    }

    if (mstEdgesList.length === NODES.length - 1) break;
  }

  const totalWeight = calcMSTWeight(mstEdgesList);
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...mstNodeOrder],
      operation: `Kruskal MST done ✅ weight: ${totalWeight}  edges: ${mstEdgesList.length}`,
    },
    description: `Kruskal complete ✅ MST weight: ${totalWeight}`,
    highlightLine: 14,
  };
}

export const kruskalCode = `function kruskal(graph: WeightedGraph): Edge[] {
  const sorted = graph.allEdges
    .sort((a, b) => a.weight - b.weight);    // ← Sort by weight
  const uf = new UnionFind(graph.nodes.length);
  const mst: Edge[]=[];

  for (const edge of sorted) {
    if (uf.find(edge.u) !== uf.find(edge.v)) { // ← Check if cycle forms
      uf.union(edge.u, edge.v);                // ← union
      mst.push(edge);                          // ← Add MST
    }
    // skip(cycle)
  }
  return mst;
}`;

export const kruskalCodeLines = [
  "function kruskal(graph: WeightedGraph): Edge[] {",
  "  const sorted = graph.allEdges",
  "    .sort((a, b) => a.weight - b.weight);",
  "  const uf = new UnionFind(graph.nodes.length);",
  "  const mst: Edge[]=[];",
  "  for (const edge of sorted) {",
  "    if (uf.find(edge.u) !== uf.find(edge.v)) {",
  "      uf.union(edge.u, edge.v);",
  "      mst.push(edge);",
  "    }",
  "  }",
  "  return mst;",
  "}",
];

export const kruskalContent = {
  id: "kruskal",
  slug: "kruskal",
  title: "Kruskal Algorithm",
  titleKey: "content.algorithms.kruskal.title",
  category: "graph" as const,
  subcategory: "mst",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.kruskal.desc",
  generator: kruskalGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: kruskalCode,
  language: "TypeScript",
  complexity: { time: "O(E log E)", space: "O(V)" },
  tags: ["graph", "MST", "greedy", "union-find"],
  icon: "🌿",
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
    if (this.parent[x] !== x) this.parent[x]=this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;
    if (this.rank[ra] < this.rank[rb]) this.parent[ra]=rb;
    else if (this.rank[ra] > this.rank[rb]) this.parent[rb]=ra;
    else { this.parent[rb]=ra; this.rank[ra]++; }
    return true;
  }
}

function kruskal(n: number, edges: [number, number, number][]): [number, number, number][] {
  edges.sort((a, b) => a[2] - b[2]);
  const uf = new UnionFind(n);
  const mst: [number, number, number][]=[];

  for (const [u, v, w] of edges) {
    if (uf.union(u, v)) {
      mst.push([u, v, w]);
    }
  }
  return mst;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int find(int parent[], int x) {
    if (parent[x] != x) parent[x]=find(parent, parent[x]);
    return parent[x];
}

void union(int parent[], int rank[], int x, int y) {
    int px = find(parent, x), py = find(parent, y);
    if (px == py) return;
    if (rank[px] < rank[py]) parent[px]=py;
    else if (rank[px] > rank[py]) parent[py]=px;
    else { parent[py]=px; rank[px]++; }
}

void kruskal(int n, int edges[][3], int edgeCount, int mst[][3], int* mstSize) {
    qsort(edges, edgeCount, sizeof(int[3]), cmp);
    int parent[MAX_N], rank[MAX_N];
    for (int i = 0; i < n; i++) { parent[i]=i; rank[i]=0; }
    *mstSize = 0;

    for (int i = 0; i < edgeCount && *mstSize < n - 1; i++) {
        int u = edges[i][0], v = edges[i][1], w = edges[i][2];
        if (find(parent, u) != find(parent, v)) {
            union(parent, rank, u, v);
            mst[*mstSize][0]=u;
            mst[*mstSize][1]=v;
            mst[*mstSize][2]=w;
            (*mstSize)++;
        }
    }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `struct UnionFind {
    vector<int> parent, rank;
    UnionFind(int n) : parent(n), rank(n, 0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x] != x) parent[x]=find(parent[x]);
        return parent[x];
    }
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;
        if (rank[a] < rank[b]) swap(a, b);
        parent[b]=a;
        if (rank[a] == rank[b]) rank[a]++;
        return true;
    }
};

vector<array<int,3>> kruskal(int n, vector<array<int,3>>& edges) {
    sort(edges.begin(), edges.end(), [](auto& a, auto& b){ return a[2] < b[2]; });
    UnionFind uf(n);
    vector<array<int,3>> mst;

    for (auto& e : edges) {
        if (uf.unite(e[0], e[1])) {
            mst.push_back(e);
        }
    }
    return mst;
}`,
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
            self.parent[x]=self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        pa, pb = self.find(a), self.find(b)
        if pa == pb: return False
        if self.rank[pa] < self.rank[pb]:
            pa, pb = pb, pa
        self.parent[pb]=pa
        if self.rank[pa] == self.rank[pb]:
            self.rank[pa] += 1
        return True

def kruskal(n, edges):
    edges.sort(key=lambda x: x[2])
    uf = UnionFind(n)
    mst = []

    for u, v, w in edges:
        if uf.union(u, v):
            mst.append((u, v, w))
    return mst`,
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
        let parent = (0..n).collect();
        let rank = vec![0; n];
        Self { parent, rank }
    }
    fn find(&mut self, x: usize) -> usize {
        if self.parent[x] != x {
            self.parent[x]=self.find(self.parent[x]);
        }
        self.parent[x]
    }
    fn union(&mut self, a: usize, b: usize) -> bool {
        let ra = self.find(a);
        let rb = self.find(b);
        if ra == rb { return false; }
        if self.rank[ra] < self.rank[rb] {
            self.parent[ra]=rb;
        } else if self.rank[ra] > self.rank[rb] {
            self.parent[rb]=ra;
        } else {
            self.parent[rb]=ra;
            self.rank[ra] += 1;
        }
        true
    }
}

fn kruskal(n: usize, edges: &[(usize, usize, i32)]) -> Vec<(usize, usize, i32)> {
    let mut sorted = edges.to_vec();
    sorted.sort_by_key(|e| e.2);
    let mut uf = UnionFind::new(n);
    let mut mst = Vec::new();

    for &(u, v, w) in &sorted {
        if uf.union(u, v) {
            mst.push((u, v, w));
        }
    }
    mst
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type UnionFind struct {
    parent []int
    rank   []int
}

func NewUF(n int) *UnionFind {
    parent := make([]int, n)
    rank := make([]int, n)
    for i := range parent {
        parent[i]=i
    }
    return &UnionFind{parent, rank}
}

func (uf *UnionFind) Find(x int) int {
    if uf.parent[x] != x {
        uf.parent[x]=uf.Find(uf.parent[x])
    }
    return uf.parent[x]
}

func (uf *UnionFind) Union(a, b int) bool {
    ra, rb := uf.Find(a), uf.Find(b)
    if ra == rb { return false }
    if uf.rank[ra] < uf.rank[rb] {
        uf.parent[ra]=rb
    } else if uf.rank[ra] > uf.rank[rb] {
        uf.parent[rb]=ra
    } else {
        uf.parent[rb]=ra
        uf.rank[ra]++
    }
    return true
}

func kruskal(n int, edges [][3]int) [][3]int {
    sort.Slice(edges, func(i, j int) bool { return edges[i][2] < edges[j][2] })
    uf := NewUF(n)
    mst := [][3]int{}

    for _, e := range edges {
        if uf.Union(e[0], e[1]) {
            mst = append(mst, e)
        }
    }
    return mst
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `static class UnionFind {
    int[] parent, rank;
    UnionFind(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i]=i;
    }
    int find(int x) {
        if (parent[x] != x) parent[x]=find(parent[x]);
        return parent[x];
    }
    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) parent[ra]=rb;
        else if (rank[ra] > rank[rb]) parent[rb]=ra;
        else { parent[rb]=ra; rank[ra]++; }
        return true;
    }
}

public static List<int[]> kruskal(int n, int[][] edges) {
    Arrays.sort(edges, Comparator.comparingInt(e -> e[2]));
    UnionFind uf = new UnionFind(n);
    List<int[]> mst = new ArrayList<>();

    for (int[] e : edges) {
        if (uf.union(e[0], e[1])) {
            mst.add(e);
        }
    }
    return mst;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "lan-wiring",
      i18nKey: "content.algorithms.kruskal.scenarios.lan-wiring",
      domain: "network",
      icon: "🖥️",
      reference: "Cisco Ethernet, structured cabling, IEEE 802.3",
      codeSnippet: {
        language: "typescript",
        code: `// Office LAN cabling — Kruskal's MST connects all rooms with minimum cable length
function wireOfficeLAN(
  rooms: number,
  cables: [number, number, number][]
): [number, number, number][] {
  cables.sort((a, b) => a[2] - b[2]); // sort by cost
  const parent = Array.from({ length: rooms }, (_, i) => i);
  const rank = new Array(rooms).fill(0);
  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a: number, b: number): boolean {
    const ra = find(a), rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else { parent[rb] = ra; rank[ra]++; }
    return true;
  }
  const mst: [number, number, number][] = [];
  for (const [u, v, w] of cables) {
    if (union(u, v)) mst.push([u, v, w]);
    if (mst.length === rooms - 1) break;
  }
  return mst;
}`,
      },
    },
    {
      id: "image-segmentation",
      i18nKey: "content.algorithms.kruskal.scenarios.image-segmentation",
      domain: "graphics",
      icon: "🎨",
      reference: "Felzenszwalb segmentation, OpenCV, Adobe Photoshop",
    },
    {
      id: "phylogenetic-tree",
      i18nKey: "content.algorithms.kruskal.scenarios.phylogenetic-tree",
      domain: "ai-ml",
      icon: "🧬",
      reference: "BLAST, NCBI, IQ-TREE, MrBayes",
    },
  ] satisfies Scenario[],
};
