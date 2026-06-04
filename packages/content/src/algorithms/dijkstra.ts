import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * Dijkstra — Single-Source Shortest Path Frame Generator
 * Finds shortest paths from a source node to all other nodes using a priority queue.
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

const ADJ: Record<string, { node: string; weight: number }[]> = {
  A: [
    { node: "B", weight: 4 },
    { node: "C", weight: 2 },
  ],
  B: [
    { node: "D", weight: 5 },
    { node: "E", weight: 10 },
  ],
  C: [
    { node: "E", weight: 3 },
    { node: "F", weight: 8 },
  ],
  D: [{ node: "G", weight: 1 }],
  E: [
    { node: "G", weight: 7 },
    { node: "H", weight: 2 },
  ],
  F: [],
  G: [{ node: "H", weight: 6 }],
  H: [],
};

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

export function* dijkstraGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  const visited = new Set<string>();
  const finalized: string[]=[];
  let step = 0;

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  for (const n of NODES) {
    dist[n.id]=INF;
    prev[n.id]=null;
  }
  dist["A"]=0;

  yield {
    step: step++,
    state: {
      nodes,
      edges,
      visitedOrder: [],
      operation: `Dijkstra: Initialize dist = ${formatDist(dist)}`,
    },
    description: "Initialize: source A distance = 0，others = ∞",
    highlightLine: 4,
  };

  // Simple priority queue (sorted array for visualization clarity)
  type PQEntry = { id: string; d: number };
  const pq: PQEntry[]=[{ id: "A", d: 0 }];

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: `Dijkstra: Add A to priority queue | PQ = [{A,0}]`,
    },
    description: "Add source A to priority queue",
    highlightLine: 8,
  };

  while (pq.length > 0) {
    // Extract minimum distance node
    pq.sort((a, b) => a.d - b.d);
    const { id: uid, d: ud } = pq.shift()!;

    // Skip stale entries
    if (visited.has(uid)) continue;
    visited.add(uid);
    finalized.push(uid);

    const uNode = nodes.find((n) => n.id === uid)!;
    uNode.status = "visited";

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...finalized],
        operation: `Dijkstra: Extracted min-distance node ${uid} (dist=${ud}) | dist = ${formatDist(dist)}`,
      },
      description: `Extract min-distance node ${uid}`,
      highlightLine: 12,
    };

    // Relax all outgoing edges from u
    for (const { node: vid, weight } of ADJ[uid]) {
      if (visited.has(vid)) continue;

      const edge = edges.find((e) => e.from === uid && e.to === vid)!;
      if (edge) edge.status = "traversing";

      const newDist = ud +weight;

      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: [...finalized],
          operation: `Dijkstra: Relax edge ${uid}→${vid} (weight=${weight})，${ud}+${weight}=${newDist}，current dist[${vid}]=${dist[vid] === INF ? "∞" : dist[vid]}`,
        },
        description: `Try relaxing edge ${uid}→${vid}(weight=${weight})`,
        highlightLine: 15,
      };

      if (newDist < dist[vid]) {
        dist[vid]=newDist;
        prev[vid]=uid;
        pq.push({ id: vid, d: newDist });
        if (edge) edge.status = "traversed";

        yield {
          step: step++,
          state: {
            nodes: nodes.map((n) => ({ ...n })),
            edges: edges.map((e) => ({ ...e })),
            visitedOrder: [...finalized],
            operation: `Dijkstra: Updated dist[${vid}]=${newDist}(via ${uid})| dist = ${formatDist(dist)}`,
          },
          description: `Relaxation succeeded：${vid} distance updated from ${dist[vid] === INF ? "∞" : dist[vid]} to ${newDist}`,
          highlightLine: 17,
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
      visitedOrder: [...finalized],
      operation: `Dijkstra complete ✅ dist = ${formatDist(dist)}`,
    },
    description: `Dijkstra complete ✅ Shortest distance: A=0, B=4, C=2, D=9, E=5, F=10, G=10, H=7`,
    highlightLine: 22,
  };
}

export const dijkstraCode = `function dijkstra(nodes, edges, start) {
  const dist = {};
  const prev = {};
  for (const node of nodes) {
    dist[node]=Infinity;
    prev[node]=null;
  }
  dist[start]=0;
  const pq = [{ id: start, dist: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.dist - b.dist);
    const { id: u } = pq.shift();

    for (const { node: v, weight } of neighbors(u)) {
      if (dist[u] +weight < dist[v]) {
        dist[v]=dist[u] +weight;
        prev[v]=u;
        pq.push({ id: v, dist: dist[v] });
      }
    }
  }
  return { dist, prev };
}`;

export const dijkstraCodeLines = [
  "function dijkstra(nodes, edges, start) {",
  "  const dist = {};",
  "  const prev = {};",
  "  for (const node of nodes) {",
  "    dist[node]=Infinity;",
  "    prev[node]=null;",
  "  }",
  "  dist[start]=0;",
  "  const pq = [{ id: start, dist: 0 }];",
  "",
  "  while (pq.length > 0) {",
  "    pq.sort((a, b) => a.dist - b.dist);",
  "    const { id: u } = pq.shift();",
  "",
  "    for (const { node: v, weight } of neighbors(u)) {",
  "      if (dist[u] +weight < dist[v]) {",
  "        dist[v]=dist[u] +weight;",
  "        prev[v]=u;",
  "        pq.push({ id: v, dist: dist[v] });",
  "      }",
  "    }",
  "  }",
  "  return { dist, prev };",
  "}",
];

export const dijkstraContent = {
  id: "dijkstra",
  slug: "dijkstra",
  title: "",
  titleKey: "content.algorithms.dijkstra.title",
  category: "graph" as const,
  subcategory: "shortest-path",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.dijkstra.desc",
  generator: dijkstraGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: dijkstraCode,
  language: "TypeScript",
  complexity: { time: "O((V +E) log V)", space: "O(V)" },
  tags: [],
  icon: "🎯",
  codeExamples: {
    typescript: {
      code: `function dijkstra(graph: Map<string, [string, number][]>, start: string) {
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();

  for (const node of graph.keys()) {
    dist.set(node, Infinity);
    prev.set(node, null);
  }
  dist.set(start, 0);

  const pq: [string, number][]=[[start, 0]];
  while (pq.length > 0) {
    pq.sort((a, b) => a[1] - b[1]);
    const [u, d]=pq.shift()!;
    if (d > dist.get(u)!) continue;

    for (const [v, weight] of graph.get(u) ?? []) {
      const alt = dist.get(u)! +weight;
      if (alt < dist.get(v)!) {
        dist.set(v, alt);
        prev.set(v, u);
        pq.push([v, alt]);
      }
    }
  }
  return { dist, prev };
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void dijkstra(int n, int** graph, int start, int* dist, int* prev) {
    for (int i = 0; i < n; i++) {
        dist[i]=INT_MAX;
        prev[i]=-1;
    }
    dist[start]=0;

    int pq[MAX_N], pqSize = 0;
    pq[pqSize++]=start;

    while (pqSize > 0) {
        // Find min in pq (simplified)
        int minIdx = 0;
        for (int i = 1; i < pqSize; i++)
            if (dist[pq[i]] < dist[pq[minIdx]]) minIdx = i;
        int u = pq[minIdx];
        pq[minIdx]=pq[--pqSize];

        for (int v = 0; v < n; v++) {
            if (graph[u][v] && dist[u] +graph[u][v] < dist[v]) {
                dist[v]=dist[u] +graph[u][v];
                prev[v]=u;
                pq[pqSize++]=v;
            }
        }
    }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void dijkstra(int n, const vector<vector<int>>& graph, int start,
            vector<int>& dist, vector<int>& prev) {
    dist.assign(n, INT_MAX);
    prev.assign(n, -1);
    dist[start]=0;

    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u]=pq.top(); pq.pop();
        if (d > dist[u]) continue;

        for (int v = 0; v < n; v++) {
            if (graph[u][v] && dist[u] +graph[u][v] < dist[v]) {
                dist[v]=dist[u] +graph[u][v];
                prev[v]=u;
                pq.push({dist[v], v});
            }
        }
    }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `import heapq

def dijkstra(graph, start):
    dist = {node: float('inf') for node in graph}
    prev = {node: None for node in graph}
    dist[start]=0

    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]: continue

        for v, weight in graph.get(u, []):
            alt = dist[u] +weight
            if alt < dist[v]:
                dist[v]=alt
                prev[v]=u
                heapq.heappush(pq, (alt, v))
    return dist, prev`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::BinaryHeap;
use std::cmp::Ordering;

#[derive(Clone, Debug)]
struct Dist(u32, usize);

impl PartialEq for Dist {
    fn eq(&self, other: &Self) -> bool { self.0 == other.0 }
}

impl Eq for Dist {}

impl PartialOrd for Dist {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.0.cmp(&other.0).reverse())
    }
}

impl Ord for Dist {
    fn cmp(&self, other: &Self) -> Ordering { other.0.cmp(&self.0) }
}

fn dijkstra(graph: &[&[(usize, u32)]], start: usize) -> (Vec<u32>, Vec<Option<usize>>) {
    let n = graph.len();
    let mut dist = vec![u32::MAX; n];
    let mut prev = vec![None; n];
    let mut pq = BinaryHeap::new();

    dist[start]=0;
    pq.push(Dist(0, start));

    while let Some(Dist(d, u))=pq.pop() {
        if d > dist[u] { continue; }
        for &(v, w) in graph[u] {
            if dist[u] +w < dist[v] {
                dist[v]=dist[u] +w;
                prev[v]=Some(u);
                pq.push(Dist(dist[v], v));
            }
        }
    }
    (dist, prev)
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func dijkstra(graph map[string][][2]int, start string) (map[string]int, map[string]string) {
    dist := make(map[string]int)
    prev := make(map[string]string)

    for node := range graph {
        dist[node]=int(^uint(0) >> 1)
        prev[node]=""
    }
    dist[start]=0

    pq := [][2]int{{0, start}}
    for len(pq) > 0 {
        // Find min
        minIdx := 0
        for i := 1; i < len(pq); i++{
            if pq[i][0] < pq[minIdx][0] { minIdx = i }
        }
        u := pq[minIdx]
        pq = append(pq[:minIdx], pq[minIdx+1:]...)

        if u[0] > dist[start] { continue }
        for _, edge := range graph[start] {
            v, w := edge[0], edge[1]
            if dist[start]+w < dist[v] {
                dist[v]=dist[start] +w
                prev[v]=start
                pq = append(pq, [2]int{dist[v], v})
            }
        }
    }
    return dist, prev
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static Map<String, Integer> dijkstra(Map<String, List<int[]>> graph, String start) {
    Map<String, Integer> dist = new HashMap<>();
    Map<String, String> prev = new HashMap<>();

    for (String node : graph.keySet()) {
        dist.put(node, Integer.MAX_VALUE);
        prev.put(node, null);
    }
    dist.put(start, 0);

    PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
    pq.offer(new int[]{0, start});

    while (!pq.isEmpty()) {
        int[] u = pq.poll();
        if (u[1] > dist.get(start)) continue;

        for (int[] edge : graph.getOrDefault(start, Collections.emptyList())) {
            int v = edge[0], w = edge[1];
            if (dist.get(start) +w < dist.get(v)) {
                dist.put(v, dist.get(start) +w);
                prev.put(v, start);
                pq.offer(new int[]{v, dist.get(v)});
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
      id: "gps-navigation",
      i18nKey: "content.algorithms.dijkstra.scenarios.gps-navigation",
      domain: "network",
      icon: "🗺️",
      reference: "Google Maps, TomTom, Waze",
      codeSnippet: {
        language: "typescript",
        code: `// Google Maps route planning — Dijkstra finds shortest driving route
type Road = { from: string; to: string; distance: number };

function shortestRoute(roads: Road[], start: string, end: string): string[] {
  const graph = new Map<string, [string, number][]>();
  for (const r of roads) {
    if (!graph.has(r.from)) graph.set(r.from, []);
    graph.get(r.from)!.push([r.to, r.distance]);
  }
  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const pq: [number, string][] = [[0, start]];
  dist.set(start, 0);
  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift()!;
    if (u === end) break;
    if (d > (dist.get(u) ?? Infinity)) continue;
    for (const [v, w] of graph.get(u) ?? []) {
      const alt = d + w;
      if (alt < (dist.get(v) ?? Infinity)) {
        dist.set(v, alt);
        prev.set(v, u);
        pq.push([alt, v]);
      }
    }
  }
  const path: string[] = [];
  let cur: string | undefined = end;
  while (cur) { path.unshift(cur); cur = prev.get(cur); }
  return path;
}`,
      },
    },
    {
      id: "ospf-routing",
      i18nKey: "content.algorithms.dijkstra.scenarios.ospf-routing",
      domain: "system",
      icon: "📡",
      reference: "Cisco OSPF, Juniper IS-IS, Linux Zebra",
    },
    {
      id: "logistics-optimization",
      i18nKey: "content.algorithms.dijkstra.scenarios.logistics-optimization",
      domain: "business",
      icon: "🚚",
      reference: "FedEx routing, UPS ORION, Amazon logistics",
    },
  ] satisfies Scenario[],
};
