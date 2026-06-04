import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * Bellman-Ford — Single-Source Shortest Path Frame Generator
 * Finds shortest paths from a source node by relaxing all edges V-1 times.
 * Can detect negative cycles (none present in this graph).
 */

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
  { from: "A", to: "B", weight: 4, status: "default" },
  { from: "A", to: "C", weight: 2, status: "default" },
  { from: "B", to: "D", weight: 5, status: "default" },
  { from: "B", to: "E", weight: 10, status: "default" },
  { from: "C", to: "E", weight: 3, status: "default" },
  { from: "C", to: "F", weight: 8, status: "default" },
  { from: "D", to: "G", weight: 1, status: "default" },
  { from: "E", to: "G", weight: 7, status: "default" },
  { from: "E", to: "H", weight: 2, status: "default" },
  { from: "G", to: "H", weight: 6, status: "default" },
];

const INF = Infinity;

function resetNodes(): GraphNode[] {
  return NODES.map((n) => ({ ...n, status: "default" as const }));
}

function resetEdges(): GraphEdge[] {
  return EDGES.map((e) => ({ ...e, status: "default" as const }));
}

function formatDist(dist: Record<string, number>): string {
  return (
    "{" +
    Object.entries(dist)
      .map(([k, v]) => `${k}:${v === INF ? "∞" : v}`)
      .join(", ") +
    "}"
  );
}

export function* bellmanFordGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  let step = 0;

  // Initialize distances
  const dist: Record<string, number> = {};
  for (const n of NODES) {
    dist[n.id]=INF;
  }
  dist["A"]=0;

  yield {
    step: step++,
    state: {
      nodes,
      edges,
      visitedOrder: [],
      operation: `Bellman-Ford: Initialize dist = ${formatDist(dist)}`,
    },
    description: "Initialize: source A distance = 0，others = ∞",
    highlightLine: 3,
  };

  const V = NODES.length;
  const finalized: string[]=[];

  // V-1 rounds of edge relaxation
  for (let round = 0; round < V - 1; round++) {
    let roundUpdated = false;

    for (const ed of EDGES) {
      const edge = edges.find((e) => e.from === ed.from && e.to === ed.to)!;
      if (edge) edge.status = "traversing";

      const fromDist = dist[ed.from];
      const weight = ed.weight ?? 0;
      const toDist = dist[ed.to];

      if (fromDist +weight < toDist) {
        dist[ed.to]=fromDist +weight;
        roundUpdated = true;
        if (edge) edge.status = "traversed";

        yield {
          step: step++,
          state: {
            nodes: nodes.map((n) => ({ ...n })),
            edges: edges.map((e) => ({ ...e })),
            visitedOrder: [...finalized],
            operation: `Bellman-Ford: Round  ${round +1} : relax edge ${ed.from}→${ed.to} (weight=${weight})，dist[${ed.to}]=${dist[ed.to]}`,
          },
          description: `Round  ${round +1} : relax edge ${ed.from}→${ed.to}，distanceto ${dist[ed.to]}`,
          highlightLine: 8,
        };
      } else {
        if (edge) edge.status = "default";
      }
    }

    // Track which nodes have been finalized
    for (const n of NODES) {
      if (dist[n.id] < INF && !finalized.includes(n.id)) {
        finalized.push(n.id);
      }
    }

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...finalized],
        operation: `Bellman-Ford: Round  ${round +1}  round complete${roundUpdated ? "" : "(no update)"} | dist = ${formatDist(dist)}`,
      },
      description: `Round  ${round +1} relaxation complete${roundUpdated ? "" : "(no update)"}`,
      highlightLine: 5,
    };

    // Early termination if no updates
    if (!roundUpdated) break;
  }

  // Check for negative cycles (V-th round)
  let hasNegativeCycle = false;
  for (const ed of EDGES) {
    const weight = ed.weight ?? 0;
    if (dist[ed.from] +weight < dist[ed.to]) {
      hasNegativeCycle = true;
      break;
    }
  }

  if (hasNegativeCycle) {
    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...finalized],
        operation: "Bellman-Ford: Negative cycle detected ⚠️",
      },
      description: "Negative cycle detected，No shortest path exists",
      highlightLine: 12,
    };
  }

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...finalized],
      operation: `Bellman-Ford complete ✅ dist = ${formatDist(dist)}`,
    },
    description: `Bellman-Ford complete ✅ Shortest distance: A=0, B=4, C=2, D=9, E=5, F=10, G=10, H=7`,
    highlightLine: 12,
  };
}

export const bellmanFordCode = `function bellmanFord(nodes, edges, start) {
  const dist = {};
  for (const node of nodes) dist[node]=Infinity;
  dist[start]=0;

  for (let i = 0; i < nodes.length - 1; i++) {
    for (const { from, to, weight } of edges) {
      if (dist[from] +weight < dist[to]) {
        dist[to]=dist[from] +weight;
      }
    }
  }
  return dist;
}`;

export const bellmanFordCodeLines = [
  "function bellmanFord(nodes, edges, start) {",
  "  const dist = {};",
  "  for (const node of nodes) dist[node]=Infinity;",
  "  dist[start]=0;",
  "",
  "  for (let i = 0; i < nodes.length - 1; i++) {",
  "    for (const { from, to, weight } of edges) {",
  "      if (dist[from] +weight < dist[to]) {",
  "        dist[to]=dist[from] +weight;",
  "      }",
  "    }",
  "  }",
  "  return dist;",
  "}",
];

export const bellmanFordContent = {
  id: "bellman-ford",
  slug: "bellman-ford",
  title: "",
  titleKey: "content.algorithms.bellman-ford.title",
  category: "graph" as const,
  subcategory: "shortest-path",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.bellman-ford.desc",
  generator: bellmanFordGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: bellmanFordCode,
  language: "TypeScript",
  complexity: { time: "O(V × E)", space: "O(V)" },
  tags: [],
  icon: "🔄",
  codeExamples: {
    typescript: {
      code: `function bellmanFord(edges: [string, string, number][], n: number, start: string) {
  const dist: Record<string, number> = {};
  for (let i = 0; i < n; i++) dist[i]=Infinity;
  dist[start]=0;

  for (let i = 0; i < n - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] +w < dist[v]) {
        dist[v]=dist[u] +w;
      }
    }
  }
  return dist;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void bellmanFord(int n, int** graph, int start, int* dist) {
    for (int i = 0; i < n; i++)
        dist[i]=INT_MAX;
    dist[start]=0;

    for (int i = 0; i < n - 1; i++) {
        for (int u = 0; u < n; u++) {
            for (int v = 0; v < n; v++) {
                if (graph[u][v] && dist[u] +graph[u][v] < dist[v]) {
                    dist[v]=dist[u] +graph[u][v];
                }
            }
        }
    }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void bellmanFord(int n, const vector<vector<int>>& graph, int start, vector<int>& dist) {
    dist.assign(n, INT_MAX);
    dist[start]=0;

    for (int i = 0; i < n - 1; i++) {
        for (int u = 0; u < n; u++) {
            for (int v = 0; v < n; v++) {
                if (graph[u][v] && dist[u] +graph[u][v] < dist[v]) {
                    dist[v]=dist[u] +graph[u][v];
                }
            }
        }
    }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def bellman_ford(n, edges, start):
    dist = [float('inf')] * n
    dist[start]=0

    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] +w < dist[v]:
                dist[v]=dist[u] +w
    return dist`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn bellman_ford(n: usize, edges: &[(usize, usize, i32)], start: usize) -> Vec<i32> {
    let mut dist = vec![i32::MAX; n];
    dist[start]=0;

    for _ in 0..n - 1 {
        for &(u, v, w) in edges {
            if dist[u] != i32::MAX && dist[u] +w < dist[v] {
                dist[v]=dist[u] +w;
            }
        }
    }
    dist
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func bellmanFord(n int, edges [][3]int, start int) []int {
    dist := make([]int, n)
    for i := range dist {
        dist[i]=int(^uint(0) >> 1)
    }
    dist[start]=0

    for i := 0; i < n-1; i++{
        for _, e := range edges {
            u, v, w := e[0], e[1], e[2]
            if dist[u] != int(^uint(0)>>1) && dist[u]+w < dist[v] {
                dist[v]=dist[u] +w
            }
        }
    }
    return dist
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int[] bellmanFord(int n, int[][] edges, int start) {
    int[] dist = new int[n];
    Arrays.fill(dist, Integer.MAX_VALUE);
    dist[start]=0;

    for (int i = 0; i < n - 1; i++) {
        for (int[] e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if (dist[u] != Integer.MAX_VALUE && dist[u] +w < dist[v]) {
                dist[v]=dist[u] +w;
            }
        }
    }
    return dist;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "arbitrage-detection",
      i18nKey: "content.algorithms.bellman-ford.scenarios.arbitrage-detection",
      domain: "business",
      icon: "💱",
      reference: "Forex trading platforms, Crypto exchanges, QuantConnect",
      codeSnippet: {
        language: "typescript",
        code: `// Currency arbitrage — Bellman-Ford detects negative cycles
// where negative log exchange rates form a profit loop
function findArbitrage(rates: number[][]): number[] | null {
  const n = rates.length;
  const logRates: [number, number, number][] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        // Use negative log to turn "product > 1" into "sum < 0"
        logRates.push([i, j, -Math.log(rates[i][j])]);
      }
    }
  }
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  dist[0] = 0;
  for (let i = 0; i < n - 1; i++) {
    for (const [u, v, w] of logRates) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
  }
  // V-th pass — if any edge relaxes, negative cycle exists
  for (const [u, v, w] of logRates) {
    if (dist[u] + w < dist[v]) {
      return [u, v]; // arbitrage opportunity detected
    }
  }
  return null;
}`,
      },
    },
    {
      id: "distance-vector-routing",
      i18nKey: "content.algorithms.bellman-ford.scenarios.distance-vector-routing",
      domain: "network",
      icon: "🖧",
      reference: "RIP, IGRP, Cisco routers",
    },
    {
      id: "apollo-guidance",
      i18nKey: "content.algorithms.bellman-ford.scenarios.apollo-guidance",
      domain: "system",
      icon: "🚀",
      reference: "Apollo Guidance Computer, NASA mission planning",
    },
  ] satisfies Scenario[],
};
