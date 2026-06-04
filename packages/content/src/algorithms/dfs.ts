import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * DFS — Depth-First Search Frame Generator
 * Traverses a graph using a stack (or recursion), going as deep as possible
 * before backtracking.
 */

// Fixed graph layout for visualization
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

function resetNodes(): GraphNode[] {
  return NODES.map((n) => ({ ...n, status: "default" as const }));
}

function resetEdges(): GraphEdge[] {
  return EDGES.map((e) => ({ ...e, status: "default" as const }));
}

export function* dfsGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  const visited = new Set<string>();
  const visitOrder: string[]=[];
  let step = 0;

  yield {
    step: step++,
    state: { nodes, edges, visitedOrder: [], operation: "DFS: from node A start traversal" },
    description: "Initial graph, starting from node A DFS traversal",
    highlightLine: 0,
  };

  function* visit(nodeId: string, depth: number): Generator<Frame<GraphState>, void, unknown> {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    visitOrder.push(nodeId);

    const node = nodes.find((n) => n.id === nodeId)!;
    node.status = "current";

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...visitOrder],
        operation: `DFS: Visit node ${nodeId}(depth ${depth})`,
      },
      description: `Visit node ${nodeId}`,
      highlightLine: 4,
    };

    node.status = "visiting";

    for (const neighbor of ADJ[nodeId]) {
      const edge = edges.find((e) => e.from === nodeId && e.to === neighbor)!;
      if (edge) edge.status = "traversing";

      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: [...visitOrder],
          operation: `DFS: Explore edge ${nodeId} → ${neighbor}`,
        },
        description: `explorefrom ${nodeId} to ${neighbor}  of edge`,
        highlightLine: 6,
      };

      if (!visited.has(neighbor)) {
        if (edge) edge.status = "traversed";
        yield* visit(neighbor, depth +1);
      } else {
        if (edge) edge.status = "default";
      }
    }

    node.status = "visited";
    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...visitOrder],
        operation: `DFS: ${nodeId} All neighbors explored, backtrack`,
      },
      description: `node ${nodeId} backtrack`,
      highlightLine: 10,
    };
  }

  yield* visit("A", 0);

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...visitOrder],
      operation: `DFS traversal complete ✅ Visit order: ${visitOrder.join(" → ")}`,
    },
    description: `DFS complete ✅ order: ${visitOrder.join(" → ")}`,
    highlightLine: 14,
  };
}

export const dfsCode = `function dfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const result: string[]=[];

  function visit(node: string) {
    if (visited.has(node)) return;
    visited.add(node);
    result.push(node);                     // ← Visit node

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor))          // ← recurseexploreunvisitedneighbor
        visit(neighbor);
    }
  }

  visit(start);
  return result;
}`;

export const dfsCodeLines = [
  "function dfs(graph: Map<string, string[]>, start: string): string[] {",
  "  const visited = new Set<string>();",
  "  const result: string[]=[];",
  "  function visit(node: string) {",
  "    if (visited.has(node)) return;",
  "    visited.add(node);",
  "    result.push(node);",
  "    for (const neighbor of graph.get(node) ?? []) {",
  "      if (!visited.has(neighbor))",
  "        visit(neighbor);",
  "    }",
  "  }",
  "  visit(start);",
  "  return result;",
  "}",
];

export const dfsContent = {
  id: "dfs",
  slug: "dfs",
  title: "",
  titleKey: "content.algorithms.dfs.title",
  category: "graph" as const,
  subcategory: "traversal",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.dfs.desc",
  generator: dfsGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: dfsCode,
  language: "TypeScript",
  complexity: { time: "O(V +E)", space: "O(V)" },
  tags: [],
  icon: "🔽",
  codeExamples: {
    typescript: {
      code: `function dfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const result: string[]=[];

  function visit(node: string) {
    if (visited.has(node)) return;
    visited.add(node);
    result.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor))
        visit(neighbor);
    }
  }

  visit(start);
  return result;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void dfs(int** graph, int n, int start, int* visited, int* result, int* returnSize) {
    visited[start]=1;
    result[(*returnSize)++]=start;

    for (int i = 0; i < n; i++) {
        if (graph[start][i] && !visited[i]) {
            dfs(graph, n, i, visited, result, returnSize);
        }
    }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void dfs(const unordered_map<string, vector<string>>& graph, const string& node,
            unordered_set<string>& visited, vector<string>& result) {
    visited.insert(node);
    result.push_back(node);

    for (const string& neighbor : graph.at(node)) {
        if (!visited.count(neighbor)) {
            dfs(graph, neighbor, visited, result);
        }
    }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def dfs(graph, start, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    result = [start]

    for neighbor in graph.get(start, []):
        if neighbor not in visited:
            result.extend(dfs(graph, neighbor, visited))
    return result`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn dfs(graph: &std::collections::HashMap<String, Vec<String>>, start: &str) -> Vec<String> {
    let mut visited = std::collections::HashSet::new();
    let mut result = Vec::new();

    fn visit(graph: &std::collections::HashMap<String, Vec<String>>,
             node: &str, visited: &mut std::collections::HashSet<String>, result: &mut Vec<String>) {
        if visited.contains(node) { return; }
        visited.insert(node.to_string());
        result.push(node.to_string());

        if let Some(neighbors)=graph.get(node) {
            for neighbor in neighbors {
                if !visited.contains(neighbor) {
                    visit(graph, neighbor, visited, result);
                }
            }
        }
    }

    visit(graph, start, &mut visited, &mut result);
    result
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func dfs(graph map[string][]string, start string) []string {
    visited := make(map[string]bool)
    result := []string{}

    var visit func(node string)
    visit = func(node string) {
        if visited[node] { return }
        visited[node]=true
        result = append(result, node)

        for _, neighbor := range graph[node] {
            if !visited[neighbor] {
                visit(neighbor)
            }
        }
    }

    visit(start)
    return result
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static List<String> dfs(Map<String, List<String>> graph, String start) {
    Set<String> visited = new HashSet<>();
    List<String> result = new ArrayList<>();

    Consumer<String> visit = new Consumer<String>() {
        public void accept(String node) {
            if (visited.contains(node)) return;
            visited.add(node);
            result.add(node);

            for (String neighbor : graph.getOrDefault(node, Collections.emptyList())) {
                if (!visited.contains(neighbor)) {
                    accept(neighbor);
                }
            }
        }
    };

    visit.accept(start);
    return result;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "garbage-collector",
      i18nKey: "content.algorithms.dfs.scenarios.garbage-collector",
      domain: "system",
      icon: "♻️",
      reference: "V8 mark-sweep, Java G1 GC, Go tricolor",
      codeSnippet: {
        language: "typescript",
        code: `// V8 mark-sweep: DFS marks all reachable objects from roots
function markSweep(roots: object[], heap: Map<object, Set<object>>) {
  const marked = new Set<object>();
  const stack = [...roots; // DFS stack
  while (stack.length > 0) {
    const obj = stack.pop()!;
    if (marked.has(obj)) continue;
    marked.add(obj);
    for (const ref of heap.get(obj) ?? []) {
      stack.push(ref);
    }
  }
  // Sweep: free unmarked objects
  for (const [obj] of heap) {
    if (!marked.has(obj)) heap.delete(obj);
  }
}`,
      },
    },
    {
      id: "compiler-ast",
      i18nKey: "content.algorithms.dfs.scenarios.compiler-ast",
      domain: "devtools",
      icon: "🔧",
      reference: "Babel, TypeScript compiler, ESLint AST",
    },
    {
      id: "maze-solver",
      i18nKey: "content.algorithms.dfs.scenarios.maze-solver",
      domain: "game-dev",
      icon: "🎮",
      reference: "Unity NavMesh, Godot Pathfinding, Rogue legacy",
    },
  ] satisfies Scenario[],
};
