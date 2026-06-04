import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * Graph (BFS Traversal) — Frame Generator
 * Builds an undirected graph and performs BFS traversal, highlighting
 * current node, visited set, and frontier expansion.
 */
export function* graphGenerator(): Generator<Frame<GraphState>, void, unknown> {
  // Build the graph with nodes at fixed positions (for deterministic layout)
  const nodePositions: Record<string, [number, number]> = {
    "0": [2, 0],
    "1": [0, 2],
    "2": [4, 2],
    "3": [1, 4],
    "4": [3, 4],
    "5": [5, 4],
  };

  // Edge list: (0-1), (0-2), (1-3), (2-3), (2-5), (3-4), (4-5)
  const edgeList: [string, string][] = [
    ["0", "1"],
    ["0", "2"],
    ["1", "3"],
    ["2", "3"],
    ["2", "5"],
    ["3", "4"],
    ["4", "5"],
  ];

  const nodeLabels: Record<string, string> = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
  };

  function makeNodes(): GraphNode[] {
    return Object.entries(nodePositions).map(([id, [x, y]]) => ({
      id,
      label: nodeLabels[id],
      value: parseInt(id),
      x,
      y,
      status: "default" as const,
    }));
  }

  function makeEdges(visitedEdges: Set<string> = new Set()): GraphEdge[] {
    return edgeList.map(([from, to]) => {
      const edgeKey = [from, to].sort().join("-");
      return {
        from,
        to,
        status: visitedEdges.has(edgeKey) ? "traversed" as const : "default" as const,
      };
    });
  }

  function buildState(
    visited: Set<string>,
    current: string | null,
    frontier: string[],
    visitedOrder: string[],
    traversingEdge: [string, string] | null = null,
  ): GraphState {
    const nodes = makeNodes().map((n) => {
      if (n.id === current) return { ...n, status: "visiting" as const };
      if (visited.has(n.id)) return { ...n, status: "visited" as const };
      if (frontier.includes(n.id)) return { ...n, status: "current" as const };
      return { ...n, status: "default" as const };
    });

    const visitedEdgeKeys = new Set<string>();
    for (let i = 0; i < visitedOrder.length - 1; i++) {
      const key = [visitedOrder[i], visitedOrder[i + 1]].sort().join("-");
      visitedEdgeKeys.add(key);
    }
    if (traversingEdge) {
      visitedEdgeKeys.add(traversingEdge.sort().join("-"));
    }

    const edges = makeEdges(visitedEdgeKeys).map((e) => {
      const key = [e.from, e.to].sort().join("-");
      return {
        ...e,
        status: (key === traversingEdge?.sort().join("-"))
          ? ("traversing" as const)
          : e.status,
      };
    });

    return { nodes, edges, visitedOrder, operation: "BFS traversal" };
  }

  // Build adjacency list
  const adj: Record<string, string[]> = {};
  for (const [a, b] of edgeList) {
    if (!adj[a]) adj[a] = [];
    if (!adj[b]) adj[b] = [];
    adj[a].push(b);
    adj[b].push(a);
  }

  let step = 0;

  // Initial state: empty visited set
  yield {
    step: step++,
    state: buildState(new Set(), null, [], [], null),
    description: "Initial state: all unvisited, BFS from node 0",
    highlightLine: 0,
  };

  const startNode = "0";
  const visited = new Set<string>();
  const queue: string[] = [startNode];
  const visitedOrder: string[] = [];

  yield {
    step: step++,
    state: buildState(visited, null, [startNode], [], null),
    description: `Enqueue start node ${startNode} as BFS origin`,
    highlightLine: 8,
  };

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) continue;

    // Visit current node
    visited.add(current);
    visitedOrder.push(current);

    yield {
      step: step++,
      state: buildState(visited, current, queue, [...visitedOrder], null),
      description: `Dequeue and visit node ${current}, mark as visited`,
      highlightLine: 12,
    };

    // Explore neighbors
    for (const neighbor of adj[current] ?? []) {
      if (!visited.has(neighbor) && !queue.includes(neighbor)) {
        queue.push(neighbor);

        yield {
          step: step++,
          state: buildState(
            visited,
            current,
            queue,
            [...visitedOrder],
            [current, neighbor],
          ),
          description: `Neighbor ${neighbor} unvisited, enqueue`,
          highlightLine: 15,
        };
      }
    }

    // Mark node as fully processed
    yield {
      step: step++,
      state: buildState(visited, null, queue, [...visitedOrder], null),
      description: `Node ${current} explored, queue: [${queue.join(", ")}]`,
      highlightLine: 11,
    };
  }

  // Final state: traversal complete
  yield {
    step: step++,
    state: buildState(visited, null, [], [...visitedOrder], null),
    description: `BFS traversal complete ✅ Visit order: ${visitedOrder.join(" → ")}`,
    highlightLine: 18,
  };
}

// ── Code display ──

export const graphCode = `function bfs(graph: AdjList, start: string): string[] {
  const visited = new Set<string>();
  const queue = [start];
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;

    visited.add(node);
    order.push(node);

    for (const neighbor of graph[node] ?? []) {
      if (!visited.has(neighbor) && !queue.includes(neighbor)) {
        queue.push(neighbor);
      }
    }
  }
  return order;
}`;

export const graphCodeLines = [
  "function bfs(graph: AdjList, start: string): string[] {",
  "  const visited = new Set<string>();",
  "  const queue = [start];           // ← BFS uses queue",
  "  const order: string[] = [];",
  "",
  "  while (queue.length > 0) {",
  "    const node = queue.shift()!;    // ← dequeue current node",
  "    if (visited.has(node)) continue;",
  "",
  "    visited.add(node);             // ← mark as visited",
  "    order.push(node);",
  "",
  "    for (const neighbor of graph[node] ?? []) {",
  "      if (!visited.has(neighbor) && !queue.includes(neighbor)) {",
  "        queue.push(neighbor);       // ← enqueue unvisited neighbor",
  "      }",
  "    }",
  "  }",
  "  return order;",
  "}",
];

// ── Content definition ──

export const graphContent = {
  id: "graph-bfs",
  slug: "graph-bfs",
  title: "",
  titleKey: "content.structures.graph-bfs.title",
  category: "structure" as const,
  subcategory: "graph",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.graph-bfs.desc",
  defaultInput: undefined,
  generator: graphGenerator,
  code: graphCode,
  language: "TypeScript",
  complexity: { time: "O(V + E)", space: "O(V)" },
  tags: [],
  icon: "🔵",
  codeExamples: {
    typescript: {
      code: `function bfs(graph: Record<string, string[]>, start: string): string[] {
  const visited = new Set<string>();
  const queue = [start];                  // ← BFS uses queue
  const order: string[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;          // ← dequeue current node
    if (visited.has(node)) continue;

    visited.add(node);                    // ← mark as visited
    order.push(node);

    for (const neighbor of graph[node] ?? []) {
      if (!visited.has(neighbor) && !queue.includes(neighbor)) {
        queue.push(neighbor);             // ← enqueue unvisited neighbor
      }
    }
  }
  return order;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#define MAX_V 100

typedef struct {
  int adj[MAX_V][MAX_V];
  int n;
} Graph;

void bfs(Graph* g, int start) {
  int visited[MAX_V] = {0};
  int queue[MAX_V], front = 0, rear = 0;
  queue[rear++] = start;                  // ← enqueue start

  while (front < rear) {
    int node = queue[front++];            // ← dequeue
    if (visited[node]) continue;

    visited[node] = 1;                    // ← mark visited
    printf("%d ", node);

    for (int i = 0; i < g->n; i++) {
      if (g->adj[node][i] && !visited[i] && !inQueue(queue, front, rear, i)) {
        queue[rear++] = i;               // ← enqueue neighbor
      }
    }
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `vector<int> bfs(unordered_map<int, vector<int>>& graph, int start) {
  unordered_set<int> visited;
  queue<int> q;
  vector<int> order;
  q.push(start);                          // ← enqueue start

  while (!q.empty()) {
    int node = q.front(); q.pop();        // ← dequeue
    if (visited.count(node)) continue;

    visited.insert(node);                 // ← mark visited
    order.push_back(node);

    for (int neighbor : graph[node]) {
      if (!visited.count(neighbor)) {
        q.push(neighbor);                 // ← enqueue neighbor
      }
    }
  }
  return order;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])                # ← BFS uses queue
    order = []

    while queue:
        node = queue.popleft()            # ← dequeue
        if node in visited:
            continue

        visited.add(node)                 # ← mark visited
        order.append(node)

        for neighbor in graph.get(node, []):
            if neighbor not in visited and neighbor not in queue:
                queue.append(neighbor)    # ← enqueue neighbor
    return order`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::{HashMap, VecDeque, HashSet};

fn bfs(graph: &HashMap<i32, Vec<i32>>, start: i32) -> Vec<i32> {
    let mut visited = HashSet::new();
    let mut queue = VecDeque::new();
    let mut order = Vec::new();
    queue.push_back(start);               // ← enqueue start

    while let Some(node) = queue.pop_front() { // ← dequeue
        if visited.contains(&node) { continue; }
        visited.insert(node);             // ← mark visited
        order.push(node);

        if let Some(neighbors) = graph.get(&node) {
            for &neighbor in neighbors {
                if !visited.contains(&neighbor) && !queue.contains(&neighbor) {
                    queue.push_back(neighbor); // ← enqueue neighbor
                }
            }
        }
    }
    order
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func bfs(graph map[string][]string, start string) []string {
  visited := make(map[string]bool)
  queue := []string{start}                // ← enqueue start
  var order []string

  for len(queue) > 0 {
    node := queue[0]
    queue = queue[1:]                      // ← dequeue
    if visited[node] { continue }

    visited[node] = true                  // ← mark visited
    order = append(order, node)

    for _, neighbor := range graph[node] {
      if !visited[neighbor] && !contains(queue, neighbor) {
        queue = append(queue, neighbor)   // ← enqueue neighbor
      }
    }
  }
  return order
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `List<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
  Set<Integer> visited = new HashSet<>();
  Queue<Integer> queue = new LinkedList<>();
  List<Integer> order = new ArrayList<>();
  queue.add(start);                        // ← enqueue start

  while (!queue.isEmpty()) {
    int node = queue.poll();               // ← dequeue
    if (visited.contains(node)) continue;

    visited.add(node);                     // ← mark visited
    order.add(node);

    for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {
      if (!visited.contains(neighbor) && !queue.contains(neighbor)) {
        queue.add(neighbor);               // ← enqueue neighbor
      }
    }
  }
  return order;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "social-network",
      i18nKey: "content.structures.graph-bfs.scenarios.social-network",
      domain: "business",
      icon: "👥",
      reference: "LinkedIn, Facebook, Twitter",
      codeSnippet: {
        language: "typescript",
        code: `// BFS finds shortest path in unweighted social graphs
// "People you may know" = BFS 2-3 hops from your profile
// LinkedIn uses BFS for degree-of-connection display
const connections = bfs(socialGraph, userId);`,
      },
    },
    {
      id: "road-network",
      i18nKey: "content.structures.graph-bfs.scenarios.road-network",
      domain: "network",
      icon: "🗺️",
      reference: "Google Maps, OpenStreetMap, Waze",
    },
    {
      id: "dependency-resolution",
      i18nKey: "content.structures.graph-bfs.scenarios.dependency-resolution",
      domain: "devtools",
      icon: "📦",
      reference: "npm, Maven, pip",
    },
  ] satisfies Scenario[],
};
