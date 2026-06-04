import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * Floyd-Warshall — All-Pairs Shortest Path Frame Generator
 * Finds shortest paths between every pair of nodes using dynamic programming.
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

const NODE_INDEX: Record<string, number> = {
  A: 0,
  B: 1,
  C: 2,
  D: 3,
  E: 4,
  F: 5,
  G: 6,
  H: 7,
};

const INDEX_NODE: string[]=["A", "B", "C", "D", "E", "F", "G", "H"];

function resetNodes(): GraphNode[] {
  return NODES.map((n) => ({ ...n, status: "default" as const }));
}

function resetEdges(): GraphEdge[] {
  return EDGES.map((e) => ({ ...e, status: "default" as const }));
}

function formatMatrixRow(dist: number[][], row: number): string {
  return (
    INDEX_NODE[row] +
    ": [" +
    dist[row]
      .map((v) => (v === INF ? "∞" : String(v)).padStart(2))
      .join(", ") +
    "]"
  );
}

function formatMatrixSummary(dist: number[][]): string {
  const lines: string[]=[];
  for (let i = 0; i < dist.length; i++) {
    lines.push(formatMatrixRow(dist, i));
  }
  return "\n  " +lines.join("\n  ");
}

export function* floydWarshallGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  let step = 0;
  const finalized: string[]=[];

  const n = NODES.length;

  // Initialize distance matrix
  const dist: number[][]=[];
  for (let i = 0; i < n; i++) {
    dist[i]=[];
    for (let j = 0; j < n; j++) {
      dist[i][j]=i === j ? 0 : INF;
    }
  }

  // Set direct edge weights
  for (const ed of EDGES) {
    const i = NODE_INDEX[ed.from];
    const j = NODE_INDEX[ed.to];
    dist[i][j]=ed.weight ?? 0;
  }

  yield {
    step: step++,
    state: {
      nodes,
      edges,
      visitedOrder: [],
      operation: `Floyd-Warshall: Init distance matrix${formatMatrixSummary(dist)}`,
    },
    description: "Initialize：diagonal=0, direct edges=weight, others=∞",
    highlightLine: 3,
  };

  // Highlight direct edges
  for (const ed of EDGES) {
    const edge = edges.find((e) => e.from === ed.from && e.to === ed.to)!;
    if (edge) edge.status = "traversed";
  }

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: `Floyd-Warshall: Direct edges already set${formatMatrixSummary(dist)}`,
    },
    description: "Direct edge weights already written",
    highlightLine: 5,
  };

  // Reset edge statuses for main loop
  for (const e of edges) {
    e.status = "default";
  }

  // Floyd-Warshall main loop
  for (let k = 0; k < n; k++) {
    const kNode = INDEX_NODE[k];

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...finalized],
        operation: `Floyd-Warshall: via node ${kNode}  as intermediate(k=${k})`,
      },
      description: `Try all paths via ${kNode} `,
      highlightLine: 8,
    };

    let roundUpdated = false;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        if (dist[i][k] === INF || dist[k][j] === INF) continue;

        const newDist = dist[i][k] +dist[k][j];
        if (newDist < dist[i][j]) {
          dist[i][j]=newDist;
          roundUpdated = true;

          const iNode = INDEX_NODE[i];
          const jNode = INDEX_NODE[j];

          const edge = edges.find((e) => e.from === iNode && e.to === jNode);
          if (edge) edge.status = "traversed";

          yield {
            step: step++,
            state: {
              nodes: nodes.map((n) => ({ ...n })),
              edges: edges.map((e) => ({ ...e })),
              visitedOrder: [...finalized],
              operation: `Floyd-Warshall: dist[${iNode}][${jNode}]=min(${dist[i][j] === newDist ? "∞" : dist[i][j]}, ${dist[i][k]}+${dist[k][j]})=${newDist}`,
            },
            description: `Updated dist[${iNode}][${jNode}]=${newDist}(via ${kNode})`,
            highlightLine: 12,
          };
        }
      }
    }

    if (!roundUpdated) {
      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: [...finalized],
          operation: `Floyd-Warshall: via ${kNode} no update`,
        },
        description: `afternode ${kNode} No path updates`,
        highlightLine: 8,
      };
    }
  }

  // Build final shortest path summary
  const shortestFromA: string[]=[];
  for (let j = 0; j < n; j++) {
    if (j !== 0) {
      shortestFromA.push(`A→${INDEX_NODE[j]}=${dist[0][j]}`);
    }
  }

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...finalized],
      operation: `Floyd-Warshall complete ✅ All-pairs shortest pathsalreadycompute`,
    },
    description: `Floyd-Warshall complete ✅ from A: ${shortestFromA.join(", ")}`,
    highlightLine: 16,
  };
}

export const floydWarshallCode = `function floydWarshall(nodes, edges) {
  const n = nodes.length;
  const dist = Array(n).fill(null)
    .map(() => Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) dist[i][i]=0;
  for (const { from, to, weight } of edges)
    dist[map[from]][map[to]]=weight;

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] +dist[k][j] < dist[i][j])
          dist[i][j]=dist[i][k] +dist[k][j];
      }
    }
  }
  return dist;
}`;

export const floydWarshallCodeLines = [
  "function floydWarshall(nodes, edges) {",
  "  const n = nodes.length;",
  "  const dist = Array(n).fill(null)",
  "    .map(() => Array(n).fill(Infinity));",
  "  for (let i = 0; i < n; i++) dist[i][i]=0;",
  "  for (const { from, to, weight } of edges)",
  "    dist[map[from]][map[to]]=weight;",
  "",
  "  for (let k = 0; k < n; k++) {",
  "    for (let i = 0; i < n; i++) {",
  "      for (let j = 0; j < n; j++) {",
  "        if (dist[i][k] +dist[k][j] < dist[i][j])",
  "          dist[i][j]=dist[i][k] +dist[k][j];",
  "      }",
  "    }",
  "  }",
  "  return dist;",
  "}",
];

export const floydWarshallContent = {
  id: "floyd-warshall",
  slug: "floyd-warshall",
  title: "",
  titleKey: "content.algorithms.floyd-warshall.title",
  category: "graph" as const,
  subcategory: "shortest-path",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.floyd-warshall.desc",
  generator: floydWarshallGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: floydWarshallCode,
  language: "TypeScript",
  complexity: { time: "O(V³)", space: "O(V²)" },
  tags: [],
  icon: "📊",
  codeExamples: {
    typescript: {
      code: `function floydWarshall(n: number, graph: number[][]): number[][] {
  const dist: number[][]=graph.map(row => [...row]);

  for (let i = 0; i < n; i++) dist[i][i]=0;

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] +dist[k][j] < dist[i][j]) {
          dist[i][j]=dist[i][k] +dist[k][j];
        }
      }
    }
  }
  return dist;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void floydWarshall(int n, int** graph, int** dist) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            dist[i][j]=graph[i][j];

    for (int i = 0; i < n; i++) dist[i][i]=0;

    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] +dist[k][j] < dist[i][j]) {
                    dist[i][j]=dist[i][k] +dist[k][j];
                }
            }
        }
    }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void floydWarshall(int n, const vector<vector<int>>& graph, vector<vector<int>>& dist) {
    dist = graph;
    for (int i = 0; i < n; i++) dist[i][i]=0;

    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] +dist[k][j] < dist[i][j]) {
                    dist[i][j]=dist[i][k] +dist[k][j];
                }
            }
        }
    }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def floyd_warshall(n, graph):
    dist = [row[:] for row in graph]
    for i in range(n):
        dist[i][i]=0

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] +dist[k][j] < dist[i][j]:
                    dist[i][j]=dist[i][k] +dist[k][j]
    return dist`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn floyd_warshall(n: usize, graph: &[[i32; 8]; 8]) -> Vec<Vec<i32>> {
    let mut dist: Vec<Vec<i32>> = graph.iter().map(|r| r.to_vec()).collect();

    for i in 0..n { dist[i][i]=0; }

    for k in 0..n {
        for i in 0..n {
            for j in 0..n {
                if dist[i][k] +dist[k][j] < dist[i][j] {
                    dist[i][j]=dist[i][k] +dist[k][j];
                }
            }
        }
    }
    dist
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func floydWarshall(n int, graph [][]int) [][]int {
    dist := make([][]int, n)
    for i := range graph {
        dist[i]=make([]int, n)
        copy(dist[i], graph[i])
    }
    for i := 0; i < n; i++{ dist[i][i]=0 }

    for k := 0; k < n; k++{
        for i := 0; i < n; i++{
            for j := 0; j < n; j++{
                if dist[i][k]+dist[k][j] < dist[i][j] {
                    dist[i][j]=dist[i][k] +dist[k][j]
                }
            }
        }
    }
    return dist
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int[][] floydWarshall(int n, int[][] graph) {
    int[][] dist = new int[n][n];
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) {
            dist[i][j]=graph[i][j];
        }
        dist[i][i]=0;
    }

    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] +dist[k][j] < dist[i][j]) {
                    dist[i][j]=dist[i][k] +dist[k][j];
                }
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
      id: "transitive-closure",
      i18nKey: "content.algorithms.floyd-warshall.scenarios.transitive-closure",
      domain: "database",
      icon: "🗄️",
      reference: "SQL recursive CTE, Neo4j, Apache Spark GraphX",
      codeSnippet: {
        language: "typescript",
        code: `// Transitive closure: "Can user X access resource Y?"
// Floyd-Warshall computes reachability for all pairs in one pass
function transitiveClosure(adj: boolean[][]): boolean[][] {
  const n = adj.length;
  const reach: boolean[][] = adj.map(row => [...row]);
  for (let i = 0; i < n; i++) reach[i][i] = true;
  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        reach[i][j] = reach[i][j] || (reach[i][k] && reach[k][j]);
      }
    }
  }
  return reach;
}`,
      },
    },
    {
      id: "vlsi-design",
      i18nKey: "content.algorithms.floyd-warshall.scenarios.vlsi-design",
      domain: "graphics",
      icon: "🔌",
      reference: "Cadence Allegro, Synopsys IC Compiler, Intel EDA",
    },
    {
      id: "flight-route-planner",
      i18nKey: "content.algorithms.floyd-warshall.scenarios.flight-route-planner",
      domain: "business",
      icon: "✈️",
      reference: "Sabre, Amadeus, Google Flights",
    },
  ] satisfies Scenario[],
};
