import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * Topological Sort — Kahn's Algorithm (BFS-based) Frame Generator
 * Orders vertices in a DAG so that every directed edge (u → v) has u before v.
 * Uses in-degree tracking with a queue.
 */

// ── Graph Data (DAG — same structure as DFS/BFS) ────────────────────────────

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

const EDGES: GraphEdge[]=[
  { from: "A", to: "B", status: "default" },
  { from: "A", to: "C", status: "default" },
  { from: "B", to: "D", status: "default" },
  { from: "B", to: "E", status: "default" },
  { from: "C", to: "E", status: "default" },
  { from: "C", to: "F", status: "default" },
  { from: "E", to: "G", status: "default" },
  { from: "E", to: "H", status: "default" },
];

/** Directed adjacency list */
const ADJ: Record<string, string[]> = {
  A: ["B", "C"],
  B: ["D", "E"],
  C: ["E", "F"],
  D: [],
  E: ["G", "H"],
  F: [],
  G: [],
  H: [],
};

/** Reverse adjacency (incoming edges) for in-degree calculation */
const RADJ: Record<string, string[]> = {
  A: [],
  B: ["A"],
  C: ["A"],
  D: ["B"],
  E: ["B", "C"],
  F: ["C"],
  G: ["E"],
  H: ["E"],
};

function resetNodes(): GraphNode[] {
  return NODES.map((n) => ({ ...n, status: "default" as const }));
}

function resetEdges(): GraphEdge[] {
  return EDGES.map((e) => ({ ...e, status: "default" as const }));
}

// ═══════════════════════════════════════════════════════════════════════════
// TOPOLOGICAL SORT (Kahn's Algorithm)
// ═══════════════════════════════════════════════════════════════════════════

export function* topologicalSortGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  let step = 0;

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: "Topo sort: computeall node in-degrees",
    },
    description: "Init DAG for Topo sort",
    highlightLine: 0,
  };

  // Calculate in-degrees
  const inDegree = new Map<string, number>();
  for (const n of NODES) {
    inDegree.set(n.id, RADJ[n.id].length);
  }

  // Show in-degrees
  const inDegStr = NODES.map((n) => `${n.id}:${inDegree.get(n.id)}`).join("  ");
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: `Topo sort: in-degrees: ${inDegStr}`,
    },
    description: `in-degree: ${inDegStr}`,
    highlightLine: 2,
  };

  // Initialize queue with zero in-degree nodes
  const queue: string[]=[];
  for (const n of NODES) {
    if (inDegree.get(n.id) === 0) {
      queue.push(n.id);
      const node = nodes.find((nd) => nd.id === n.id)!;
      node.status = "current";
    }
  }

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: `Topo sort: in-degree=0 nodes enqueued [${queue.join(", ")}]`,
    },
    description: `in-degree= 0  of nodeEnqueued: ${queue.join(", ")}`,
    highlightLine: 4,
  };

  const sorted: string[]=[];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    sorted.push(currentId);
    const currNode = nodes.find((n) => n.id === currentId)!;
    currNode.status = "visited";

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...sorted],
        operation: `Topo sort: Dequeue ${currentId} → order: [${sorted.join(", ")}]`,
      },
      description: `Dequeue ${currentId}，Current order: ${sorted.join(" → ")}`,
      highlightLine: 6,
    };

    // Process neighbors
    for (const neighbor of ADJ[currentId]) {
      const edge = edges.find((e) => e.from === currentId && e.to === neighbor)!;
      if (edge) edge.status = "traversing";

      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: [...sorted],
          operation: `Topo sort: process edge ${currentId}→${neighbor}，in-degree ${inDegree.get(neighbor)} → ${inDegree.get(neighbor)! - 1}`,
        },
        description: `Reduce in-degree of ${neighbor}  of in-degree`,
        highlightLine: 8,
      };

      const newDeg = inDegree.get(neighbor)! - 1;
      inDegree.set(neighbor, newDeg);
      if (edge) edge.status = "traversed";

      if (newDeg === 0) {
        queue.push(neighbor);
        const nb = nodes.find((n) => n.id === neighbor)!;
        nb.status = "current";

        yield {
          step: step++,
          state: {
            nodes: nodes.map((n) => ({ ...n })),
            edges: edges.map((e) => ({ ...e })),
            visitedOrder: [...sorted],
            operation: `Topo sort: ${neighbor} in-degree=0，Enqueued [${queue.join(", ")}]`,
          },
          description: `${neighbor} in-degree=0, enqueue`,
          highlightLine: 10,
        };
      }
    }
  }

  // Final frame
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...sorted],
      operation: `Topo sort complete ✅ order: ${sorted.join(" → ")}`,
    },
    description: `Topo sort complete ✅ ${sorted.join(" → ")}`,
    highlightLine: 12,
  };
}

export const topoCode = `function topologicalSort(graph: DAG): string[] {
  const inDegree = new Map<string, number>();
  for (const node of graph.nodes)
    inDegree.set(node, inEdges(node).length);  // ← computein-degree

  const queue = graph.nodes.filter(n => inDegree.get(n) === 0);
  const sorted: string[]=[];

  while (queue.length > 0) {
    const node = queue.shift()!;               // ← Dequeuein-degree=0 of node
    sorted.push(node);

    for (const neighbor of graph.adj(node)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0)        // ← in-degree=0 → queue
        queue.push(neighbor);
    }
  }
  return sorted;
}`;

export const topoCodeLines = [
  "function topologicalSort(graph: DAG): string[] {",
  "  const inDegree = new Map<string, number>();",
  "  for (const node of graph.nodes)",
  "    inDegree.set(node, inEdges(node).length);",
  "  const queue = graph.nodes.filter(n => inDegree.get(n) === 0);",
  "  const sorted: string[]=[];",
  "  while (queue.length > 0) {",
  "    const node = queue.shift()!;",
  "    sorted.push(node);",
  "    for (const neighbor of graph.adj(node)) {",
  "      inDegree.set(neighbor, inDegree.get(neighbor) - 1);",
  "      if (inDegree.get(neighbor) === 0)",
  "        queue.push(neighbor);",
  "    }",
  "  }",
  "  return sorted;",
  "}",
];

export const topoContent = {
  id: "topological-sort",
  slug: "topological-sort",
  title: "",
  titleKey: "content.algorithms.topological-sort.title",
  category: "graph" as const,
  subcategory: "ordering",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.topological-sort.desc",
  generator: topologicalSortGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: topoCode,
  language: "TypeScript",
  complexity: { time: "O(V +E)", space: "O(V)" },
  tags: [],
  icon: "📊",
  codeExamples: {
    typescript: {
      code: `function topologicalSort(n: number, adj: number[][]): number[] {
  const inDegree = new Array(n).fill(0);
  for (let u = 0; u < n; u++) {
    for (const v of adj[u]) {
      inDegree[v]++;
    }
  }

  const queue: number[]=[];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) queue.push(i);
  }

  const sorted: number[]=[];
  while (queue.length > 0) {
    const u = queue.shift()!;
    sorted.push(u);

    for (const v of adj[u]) {
      if (--inDegree[v] === 0) {
        queue.push(v);
      }
    }
  }
  return sorted;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void topologicalSort(int n, int** adj, int* inDegree, int* result, int* returnSize) {
    int queue[MAX_N];
    int front = 0, rear = 0;

    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) queue[rear++]=i;
    }

    while (front < rear) {
        int u = queue[front++];
        result[(*returnSize)++]=u;

        for (int v = 0; v < n; v++) {
            if (adj[u][v]) {
                if (--inDegree[v] == 0) {
                    queue[rear++]=v;
                }
            }
        }
    }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `vector<int> topologicalSort(int n, const vector<vector<int>>& adj) {
    vector<int> inDegree(n, 0);
    for (int u = 0; u < n; u++) {
        for (int v : adj[u]) inDegree[v]++;
    }

    queue<int> q;
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) q.push(i);
    }

    vector<int> sorted;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        sorted.push_back(u);

        for (int v : adj[u]) {
            if (--inDegree[v] == 0) q.push(v);
        }
    }
    return sorted;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from collections import deque

def topological_sort(n, adj):
    in_degree = [0] * n
    for u in range(n):
        for v in adj[u]:
            in_degree[v] += 1

    q = deque([i for i in range(n) if in_degree[i] == 0])
    sorted = []

    while q:
        u = q.popleft()
        sorted.append(u)

        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                q.append(v)
    return sorted`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::{HashMap, VecDeque};

fn topological_sort(n: usize, adj: &[Vec<usize>]) -> Vec<usize> {
    let mut in_degree = vec![0; n];
    for u in 0..n {
        for &v in &adj[u] {
            in_degree[v] += 1;
        }
    }

    let mut q = VecDeque::new();
    for i in 0..n {
        if in_degree[i] == 0 {
            q.push_back(i);
        }
    }

    let mut sorted = Vec::new();
    while let Some(u)=q.pop_front() {
        sorted.push(u);
        for &v in &adj[u] {
            in_degree[v] -= 1;
            if in_degree[v] == 0 {
                q.push_back(v);
            }
        }
    }
    sorted
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func topologicalSort(n int, adj [][]int) []int {
    inDegree := make([]int, n)
    for u := 0; u < n; u++{
        for _, v := range adj[u] {
            inDegree[v]++
        }
    }

    queue := make([]int, 0)
    for i := 0; i < n; i++{
        if inDegree[i] == 0 {
            queue = append(queue, i)
        }
    }

    sorted := make([]int, 0)
    for len(queue) > 0 {
        u := queue[0]
        queue = queue[1:]
        sorted = append(sorted, u)

        for _, v := range adj[u] {
            inDegree[v]--
            if inDegree[v] == 0 {
                queue = append(queue, v)
            }
        }
    }
    return sorted
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static List<Integer> topologicalSort(int n, List<List<Integer>> adj) {
    int[] inDegree = new int[n];
    for (int u = 0; u < n; u++) {
        for (int v : adj.get(u)) {
            inDegree[v]++;
        }
    }

    Queue<Integer> q = new LinkedList<>();
    for (int i = 0; i < n; i++) {
        if (inDegree[i] == 0) q.offer(i);
    }

    List<Integer> sorted = new ArrayList<>();
    while (!q.isEmpty()) {
        int u = q.poll();
        sorted.add(u);

        for (int v : adj.get(u)) {
            if (--inDegree[v] == 0) {
                q.offer(v);
            }
        }
    }
    return sorted;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "build-systems",
      i18nKey: "content.algorithms.topological-sort.scenarios.build-systems",
      domain: "devtools",
      icon: "🔨",
      reference: "Make, Maven, Bazel, Webpack, Gradle",
      codeSnippet: {
        language: "typescript",
        code: `// Build dependency resolution — topo sort determines compilation order
// Webpack module graph — ensures dependencies load before dependents
type Module = { id: string; deps: string[] };

function buildOrder(modules: Module[]): string[] {
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  for (const mod of modules) {
    adj.set(mod.id, mod.deps);
    inDegree.set(mod.id, mod.deps.length);
  }
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const dep of adj.get(id) ?? []) {
      const nd = (inDegree.get(dep) ?? 1) - 1;
      inDegree.set(dep, nd);
      if (nd === 0) queue.push(dep);
    }
  }
  return order;
}`,
      },
    },
    {
      id: "package-managers",
      i18nKey: "content.algorithms.topological-sort.scenarios.package-managers",
      domain: "system",
      icon: "📦",
      reference: "npm, pip, apt, Cargo, Yarn",
    },
    {
      id: "course-prerequisites",
      i18nKey: "content.algorithms.topological-sort.scenarios.course-prerequisites",
      domain: "business",
      icon: "🎓",
      reference: "University degree planners, Coursera, edX",
    },
  ] satisfies Scenario[],
};
