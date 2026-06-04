import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * BFS — Breadth-First Search Frame Generator
 * Traverses a graph level by level using a queue.
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

export function* bfsGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  const visited = new Set<string>();
  const visitOrder: string[]=[];
  let step = 0;

  yield {
    step: step++,
    state: {
      nodes, edges, visitedOrder: [],
      operation: "BFS: from node A start traversal",
    },
    description: "Initial graph, starting from node A BFS traversal",
    highlightLine: 0,
  };

  const queue: string[]=["A"];
  visited.add("A");
  const nodeA = nodes.find((n) => n.id === "A")!;
  nodeA.status = "current";

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...visitOrder],
      operation: "BFS: enqueue A to queue",
    },
    description: "Add start node A to queue",
    highlightLine: 3,
  };

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    visitOrder.push(currentId);
    const currNode = nodes.find((n) => n.id === currentId)!;
    currNode.status = "visited";

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...visitOrder],
        operation: `BFS: Dequeue ${currentId}(queue: [${queue.join(", ")}])`,
      },
      description: `popnode ${currentId}(visited)`,
      highlightLine: 6,
    };

    for (const neighbor of ADJ[currentId]) {
      const edge = edges.find((e) => e.from === currentId && e.to === neighbor)!;
      if (edge) edge.status = "traversing";

      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: [...visitOrder],
          operation: `BFS: check ${neighbor}`,
        },
        description: `check ${currentId}  of neighbor ${neighbor}`,
        highlightLine: 8,
      };

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        const nb = nodes.find((n) => n.id === neighbor)!;
        nb.status = "current";
        if (edge) edge.status = "traversed";

        yield {
          step: step++,
          state: {
            nodes: nodes.map((n) => ({ ...n })),
            edges: edges.map((e) => ({ ...e })),
            visitedOrder: [...visitOrder],
            operation: `BFS: Add ${neighbor} Enqueued(queue: [${queue.join(", ")}])`,
          },
          description: `${neighbor} unvisited → Enqueued`,
          highlightLine: 10,
        };
      } else {
        if (edge) edge.status = "default";
      }
    }
  }

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...visitOrder],
      operation: `BFS traversal complete ✅ Visit order: ${visitOrder.join(" → ")}`,
    },
    description: `BFS complete ✅ order: ${visitOrder.join(" → ")}`,
    highlightLine: 14,
  };
}

export const bfsCode = `function bfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>([start]);
  const queue: string[]=[start];             // ← init queue
  const result: string[]=[];

  while (queue.length > 0) {
    const node = queue.shift()!;               // ← Dequeue
    result.push(node);                         // ← visit

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {            // ← unvisitedneighborto queue
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return result;
}`;

export const bfsCodeLines = [
  "function bfs(graph: Map<string, string[]>, start: string): string[] {",
  "  const visited = new Set<string>([start]);",
  "  const queue: string[]=[start];",
  "  const result: string[]=[];",
  "  while (queue.length > 0) {",
  "    const node = queue.shift()!;",
  "    result.push(node);",
  "    for (const neighbor of graph.get(node) ?? []) {",
  "      if (!visited.has(neighbor)) {",
  "        visited.add(neighbor);",
  "        queue.push(neighbor);",
  "      }",
  "    }",
  "  }",
  "  return result;",
  "}",
];

export const bfsContent = {
  id: "bfs",
  slug: "bfs",
  title: "",
  titleKey: "content.algorithms.bfs.title",
  category: "graph" as const,
  subcategory: "traversal",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.bfs.desc",
  generator: bfsGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: bfsCode,
  language: "TypeScript",
  complexity: { time: "O(V +E)", space: "O(V)" },
  tags: [],
  icon: "🔵",
  codeExamples: {
    typescript: {
      code: `function bfs(graph: Map<string, string[]>, start: string): string[] {
  const visited = new Set<string>([start]);
  const queue: string[]=[start];
  const result: string[]=[];

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return result;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void bfs(int** graph, int n, int start, int* visited, int* result, int* returnSize) {
    int queue[MAX_N];
    int front = 0, rear = 0;
    visited[start]=1;
    queue[rear++]=start;

    while (front < rear) {
        int node = queue[front++];
        result[(*returnSize)++]=node;

        for (int i = 0; i < n; i++) {
            if (graph[node][i] && !visited[i]) {
                visited[i]=1;
                queue[rear++]=i;
            }
        }
    }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void bfs(const unordered_map<string, vector<string>>& graph, const string& start,
            unordered_set<string>& visited, vector<string>& result) {
    queue<string> q;
    q.push(start);
    visited.insert(start);

    while (!q.empty()) {
        string node = q.front(); q.pop();
        result.push_back(node);

        for (const string& neighbor : graph.at(node)) {
            if (!visited.count(neighbor)) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    result = []

    while queue:
        node = queue.popleft()
        result.append(node)

        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return result`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::{HashSet, VecDeque};

fn bfs(graph: &std::collections::HashMap<String, Vec<String>>, start: &str) -> Vec<String> {
    let mut visited = HashSet::new();
    let mut queue = VecDeque::new();
    let mut result = Vec::new();

    visited.insert(start.to_string());
    queue.push_back(start.to_string());

    while let Some(node)=queue.pop_front() {
        result.push(node.clone());

        if let Some(neighbors)=graph.get(&node) {
            for neighbor in neighbors {
                if !visited.contains(neighbor) {
                    visited.insert(neighbor.clone());
                    queue.push_back(neighbor.clone());
                }
            }
        }
    }
    result
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func bfs(graph map[string][]string, start string) []string {
    visited := make(map[string]bool)
    queue := []string{start}
    result := []string{}

    visited[start]=true
    for len(queue) > 0 {
        node := queue[0]
        queue = queue[1:]
        result = append(result, node)

        for _, neighbor := range graph[node] {
            if !visited[neighbor] {
                visited[neighbor]=true
                queue = append(queue, neighbor)
            }
        }
    }
    return result
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static List<String> bfs(Map<String, List<String>> graph, String start) {
    Set<String> visited = new HashSet<>();
    Queue<String> queue = new LinkedList<>();
    List<String> result = new ArrayList<>();

    visited.add(start);
    queue.offer(start);

    while (!queue.isEmpty()) {
        String node = queue.poll();
        result.add(node);

        for (String neighbor : graph.getOrDefault(node, Collections.emptyList())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.offer(neighbor);
            }
        }
    }
    return result;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "social-network",
      i18nKey: "content.algorithms.bfs.scenarios.social-network",
      domain: "ui-framework",
      icon: "👥",
      reference: "LinkedIn, Facebook, Twitter",
      codeSnippet: {
        language: "typescript",
        code: `// LinkedIn "degrees of separation" — BFS finds shortest connection chain
function degreesOfSeparation(
  graph: Map<string, string[]>,
  source: string,
  target: string
): number {
  const visited = new Set<string>();
  const queue: [string, number][] = [[source, 0]];
  visited.add(source);
  while (queue.length > 0) {
    const [person, degree] = queue.shift()!;
    if (person === target) return degree;
    for (const friend of graph.get(person) ?? []) {
      if (!visited.has(friend)) {
        visited.add(friend);
        queue.push([friend, degree + 1]);
      }
    }
  }
  return -1; // not connected
}`,
      },
    },
    {
      id: "web-crawler",
      i18nKey: "content.algorithms.bfs.scenarios.web-crawler",
      domain: "data-pipeline",
      icon: "🕷️",
      reference: "Googlebot, Scrapy, Apache Nutch",
    },
    {
      id: "peer-to-peer",
      i18nKey: "content.algorithms.bfs.scenarios.peer-to-peer",
      domain: "network",
      icon: "🌐",
      reference: "BitTorrent DHT, IPFS, Kademlia",
    },
  ] satisfies Scenario[],
};
