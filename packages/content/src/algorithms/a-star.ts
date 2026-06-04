import type { Frame, GraphState, GraphNode, GraphEdge, Scenario } from "@codeprism/core";

/**
 * A* Search — Best-First Search with Heuristic Frame Generator
 * Finds the shortest path from a start node to a goal node using
 * f(n)=g(n) +h(n) where h is Euclidean distance to the goal.
 */

// ── Graph Data (Weighted, undirected) ───────────────────────────────────────

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

/** Undirected adjacency */
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

// ── Heuristic ───────────────────────────────────────────────────────────────

const GOAL_ID = "H";

function euclidean(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 +(a.y - b.y) ** 2);
}

function heuristic(nodeId: string): number {
  const node = NODES.find((n) => n.id === nodeId)!;
  const goal = NODES.find((n) => n.id === GOAL_ID)!;
  return euclidean(node, goal) / 50; // Scale to comparable range with edge weights
}



// ═══════════════════════════════════════════════════════════════════════════
// A* SEARCH
// ═══════════════════════════════════════════════════════════════════════════

export function* aStarGenerator(): Generator<Frame<GraphState>, void, unknown> {
  const nodes = resetNodes();
  const edges = resetEdges();
  let step = 0;

  const START = "A";
  const GOAL = GOAL_ID;

  // g scores, f scores, came-from map
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();

  for (const n of NODES) {
    gScore.set(n.id, Infinity);
    fScore.set(n.id, Infinity);
  }
  gScore.set(START, 0);
  fScore.set(START, heuristic(START));

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: `A*: from ${START} to ${GOAL}，Initialize g(A)=0, h(A)=${heuristic(START).toFixed(2)}, f(A)=${fScore.get(START)!.toFixed(2)}`,
    },
    description: `Initialize A* search：from ${START} to ${GOAL}`,
    highlightLine: 0,
  };

  // Mark start
  const startNode = nodes.find((n) => n.id === START)!;
  startNode.status = "current";

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [],
      operation: `A*: Add ${START} Add open set(f=${fScore.get(START)!.toFixed(2)})`,
    },
    description: `Start node ${START} → open`,
    highlightLine: 2,
  };

  // Open set (simple array, extract min each iteration)
  const openSet = new Set<string>([START]);
  const closedSet = new Set<string>();

  while (openSet.size > 0) {
    // Pick node in openSet with lowest fScore
    let currentId = "";
    let bestF = Infinity;
    for (const id of openSet) {
      const f = fScore.get(id)!;
      if (f < bestF) {
        bestF = f;
        currentId = id;
      }
    }

    const curNode = nodes.find((n) => n.id === currentId)!;
    curNode.status = "current";

    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
        visitedOrder: [...closedSet],
        operation: `A*: from open set select min-f node  ${currentId}(g=${gScore.get(currentId)!.toFixed(1)}, h=${heuristic(currentId).toFixed(2)}, f=${bestF.toFixed(2)})`,
      },
      description: `Select node with minimum f value ${currentId}`,
      highlightLine: 4,
    };

    // Goal reached — reconstruct path
    if (currentId === GOAL) {
      const path: string[]=[];
      let trace: string | undefined = GOAL;
      while (trace !== undefined) {
        path.unshift(trace);
        trace = cameFrom.get(trace);
      }

      // Highlight path edges
      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i +1];
        const edge = edges.find(
          (e) =>
            (e.from === from && e.to === to) ||
            (e.from === to && e.to === from),
        );
        if (edge) edge.status = "traversed";
      }

      // Mark path nodes
      for (const id of path) {
        const nd = nodes.find((n) => n.id === id)!;
        nd.status = "visited";
      }

      const totalCost = gScore.get(GOAL)!;
      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: path,
          operation: `A* complete ✅ shortest path: ${path.join(" → ")}  cost: ${totalCost.toFixed(1)}`,
        },
        description: `A* Found shortest path ✅ ${path.join(" → ")}(cost: ${totalCost.toFixed(1)})`,
        highlightLine: 14,
      };
      return;
    }

    // Move current from open to closed
    openSet.delete(currentId);
    closedSet.add(currentId);

    // Expand neighbors
    for (const { neighbor, weight } of UNDIR_ADJ[currentId]) {
      if (closedSet.has(neighbor)) continue;

      const edge = edges.find(
        (e) =>
          (e.from === currentId && e.to === neighbor) ||
          (e.from === neighbor && e.to === currentId),
      )!;
      edge.status = "traversing";

      const tentativeG = gScore.get(currentId)! +weight;

      yield {
        step: step++,
        state: {
          nodes: nodes.map((n) => ({ ...n })),
          edges: edges.map((e) => ({ ...e })),
          visitedOrder: [...closedSet],
          operation: `A*: Check neighbors ${neighbor}，tentative g=${tentativeG.toFixed(1)}(current g=${gScore.get(neighbor) === Infinity ? "∞" : gScore.get(neighbor)!.toFixed(1)})`,
        },
        description: `check ${currentId}  of neighbor ${neighbor}(edgeweight ${weight})`,
        highlightLine: 8,
      };

      if (tentativeG < gScore.get(neighbor)!) {
        // Found better path
        cameFrom.set(neighbor, currentId);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG +heuristic(neighbor));
        openSet.add(neighbor);

        const nb = nodes.find((n) => n.id === neighbor)!;
        nb.status = "visiting";
        edge.status = "traversed";

        yield {
          step: step++,
          state: {
            nodes: nodes.map((n) => ({ ...n })),
            edges: edges.map((e) => ({ ...e })),
            visitedOrder: [...closedSet],
            operation: `A*: update ${neighbor}  of  g=${tentativeG.toFixed(1)}, h=${heuristic(neighbor).toFixed(2)}, f=${fScore.get(neighbor)!.toFixed(2)}`,
          },
          description: `${neighbor}  of pathupdate：g=${tentativeG.toFixed(1)}, f=${fScore.get(neighbor)!.toFixed(2)}`,
          highlightLine: 10,
        };
      } else {
        edge.status = "default";
      }
    }

    // Mark current as visited (closed)
    curNode.status = "visited";
  }

  // No path found
  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({ ...n })),
      edges: edges.map((e) => ({ ...e })),
      visitedOrder: [...closedSet],
      operation: `A* searchcomplete，not foundfrom ${START} to ${GOAL}  of path`,
    },
    description: `A* searchcomplete，not foundpath`,
    highlightLine: 14,
  };
}

export const aStarCode = `function aStar(graph: WeightedGraph, start: string, goal: string): string[] {
  const gScore = new Map<string, number>();    // ← Actual cost from start to node
  const fScore = new Map<string, number>();    // ← g(n) +h(n)
  const cameFrom = new Map<string, string>();
  const openSet = new Set<string>([start]);

  gScore.set(start, 0);
  fScore.set(start, heuristic(start, goal));

  while (openSet.size > 0) {
    const current = pickMinFScore(openSet, fScore); // ← select min-f 
    if (current === goal) return reconstructPath(cameFrom, goal);

    openSet.delete(current);
    for (const { to, weight } of graph.neighbors(current)) {
      const tentativeG = gScore.get(current) +weight;
      if (tentativeG < gScore.get(to) ?? Infinity) {
        cameFrom.set(to, current);                  // ← updatepath
        gScore.set(to, tentativeG);
        fScore.set(to, tentativeG +heuristic(to, goal));
        openSet.add(to);
      }
    }
  }
  return []; // no path
}`;

export const aStarCodeLines = [
  "function aStar(graph: WeightedGraph, start: string, goal: string): string[] {",
  "  const gScore = new Map<string, number>();",
  "  const fScore = new Map<string, number>();",
  "  const cameFrom = new Map<string, string>();",
  "  const openSet = new Set<string>([start]);",
  "  gScore.set(start, 0);",
  "  fScore.set(start, heuristic(start, goal));",
  "  while (openSet.size > 0) {",
  "    const current = pickMinFScore(openSet, fScore);",
  "    if (current === goal) return reconstructPath(cameFrom, goal);",
  "    openSet.delete(current);",
  "    for (const { to, weight } of graph.neighbors(current)) {",
  "      const tentativeG = gScore.get(current) +weight;",
  "      if (tentativeG < gScore.get(to) ?? Infinity) {",
  "        cameFrom.set(to, current);",
  "        gScore.set(to, tentativeG);",
  "        fScore.set(to, tentativeG +heuristic(to, goal));",
  "        openSet.add(to);",
  "      }",
  "    }",
  "  }",
  "  return [];",
  "}",
];

export const aStarContent = {
  id: "a-star",
  slug: "a-star",
  title: "",
  titleKey: "content.algorithms.a-star.title",
  category: "graph" as const,
  subcategory: "pathfinding",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.a-star.desc",
  generator: aStarGenerator as () => Generator<Frame<GraphState>, void, unknown>,
  code: aStarCode,
  language: "TypeScript",
  complexity: { time: "O(E log V)", space: "O(V)" },
  tags: [],
  icon: "⭐",
  codeExamples: {
    typescript: {
      code: `function aStar(
  graph: Map<string, [string, number][]>,
  start: string,
  goal: string,
  heuristic: (node: string) => number
): string[] | null {
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const openSet = new Set<string>([start]);

  for (const node of graph.keys()) {
    gScore.set(node, Infinity);
    fScore.set(node, Infinity);
  }
  gScore.set(start, 0);
  fScore.set(start, heuristic(start));

  while (openSet.size > 0) {
    let current = "";
    let minF = Infinity;
    for (const node of openSet) {
      const f = fScore.get(node)!;
      if (f < minF) { minF = f; current = node; }
    }

    if (current === goal) {
      const path: string[]=[];
      let node: string | undefined = goal;
      while (node) { path.unshift(node); node = cameFrom.get(node); }
      return path;
    }

    openSet.delete(current);
    for (const [neighbor, weight] of graph.get(current) ?? []) {
      const tentativeG = gScore.get(current)! +weight;
      if (tentativeG < gScore.get(neighbor)!) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        fScore.set(neighbor, tentativeG +heuristic(neighbor));
        openSet.add(neighbor);
      }
    }
  }
  return null;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int aStar(int n, int** graph, int start, int goal,
              int (*h)(int), int* dist) {
    for (int i = 0; i < n; i++) dist[i]=INT_MAX;
    dist[start]=0;

    int inOpen[n]; memset(inOpen, 0, sizeof(inOpen));
    inOpen[start]=1;

    typedef struct { int node, f; } PQ;
    PQ pq[MAX_N]; int pqSize = 0;

    while (pqSize > 0 || inOpen[start]) {
        // Find min f in open set
        int minF = INT_MAX, u = -1;
        for (int i = 0; i < n; i++) {
            if (inOpen[i] && dist[i] +h(i) < minF) {
                minF = dist[i] +h(i);
                u = i;
            }
        }
        if (u == goal) return dist[goal];
        inOpen[u]=0;

        for (int v = 0; v < n; v++) {
            if (graph[u][v] && dist[u] +graph[u][v] < dist[v]) {
                dist[v]=dist[u] +graph[u][v];
                inOpen[v]=1;
            }
        }
    }
    return -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int aStar(int n, const vector<vector<int>>& graph, int start, int goal,
            const vector<int>& h) {
    vector<int> dist(n, INT_MAX);
    dist[start]=0;
    vector<char> inOpen(n, 0);
    inOpen[start]=1;

    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    pq.push({h[start], start});

    while (!pq.empty()) {
        auto [_, u]=pq.top(); pq.pop();
        if (u == goal) return dist[goal];

        for (int v = 0; v < n; v++) {
            if (graph[u][v] && dist[u] +graph[u][v] < dist[v]) {
                dist[v]=dist[u] +graph[u][v];
                pq.push({dist[v] +h[v], v});
            }
        }
    }
    return -1;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `import heapq

def a_star(graph, start, goal, heuristic):
    dist = {node: float('inf') for node in graph}
    dist[start]=0

    open_set = [(heuristic(start), start)]
    came_from = {}

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == goal:
            path = []
            node = goal
            while node in came_from:
                path.append(node)
                node = came_from[node]
            path.append(start)
            return path[::-1]

        for neighbor, weight in graph.get(current, []):
            tentative_g = dist[current] +weight
            if tentative_g < dist.get(neighbor, float('inf')):
                came_from[neighbor]=current
                dist[neighbor]=tentative_g
                f = tentative_g +heuristic(neighbor)
                heapq.heappush(open_set, (f, neighbor))
    return None`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::{BinaryHeap, HashMap, HashSet};

#[derive(Clone, Debug)]
struct Entry(u32, usize);

impl PartialEq for Entry {
    fn eq(&self, other: &Self) -> bool { self.0 == other.0 }
}

impl Eq for Entry {}

impl PartialOrd for Entry {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.0.cmp(&other.0).reverse())
    }
}

impl Ord for Entry {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering { other.0.cmp(&self.0) }
}

fn a_star(graph: &[(usize, usize, u32)], n: usize, start: usize, goal: usize,
          heuristic: &[u32]) -> Option<Vec<usize>> {
    let mut dist = vec![u32::MAX; n];
    let mut came_from = HashMap::new();
    let mut open_set = HashSet::new();

    dist[start]=0;
    let mut pq = BinaryHeap::new();
    pq.push(Entry(heuristic[start], start));
    open_set.insert(start);

    while let Some(Entry(f, u))=pq.pop() {
        if u == goal {
            let mut path = vec![goal];
            let mut node = goal;
            while let Some(&prev)=came_from.get(&node) {
                path.push(prev);
                node = prev;
            }
            path.push(start);
            return Some(path.into_iter().rev().collect());
        }

        for &(u_v, v, w) in graph {
            if u_v == u || v == u {
                let neighbor = if u_v == u { v } else { u_v };
                let tentative_g = dist[u] +w;
                if tentative_g < dist[neighbor] {
                    came_from.insert(neighbor, u);
                    dist[neighbor]=tentative_g;
                    pq.push(Entry(dist[neighbor] +heuristic[neighbor], neighbor));
                }
            }
        }
    }
    None
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func aStar(graph map[string][][2]int, start, goal string,
             heuristic func(string) int) ([]string, bool) {
    dist := make(map[string]int)
    cameFrom := make(map[string]string)

    for node := range graph {
        dist[node]=int(^uint(0) >> 1)
    }
    dist[start]=0

    openSet := [][2]int{{heuristic(start), start}}

    for len(openSet) > 0 {
        // Find min f
        minIdx := 0
        for i := 1; i < len(openSet); i++{
            if openSet[i][0] < openSet[minIdx][0] {
                minIdx = i
            }
        }
        _, u := openSet[minIdx][0], openSet[minIdx][1]
        openSet = append(openSet[:minIdx], openSet[minIdx+1:]...)

        if u == goal {
            path := []string{goal}
            for node := goal; node != start; {
                node = cameFrom[node]
                path = append([]string{node}, path...)
            }
            return path, true
        }

        for _, edge := range graph[u] {
            v, w := edge[0], edge[1]
            if dist[u]+w < dist[v] {
                cameFrom[v]=u
                dist[v]=dist[u] +w
                openSet = append(openSet, [2]int{dist[v] +heuristic(v), v})
            }
        }
    }
    return nil, false
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static List<String> aStar(Map<String, List<int[]>> graph, String start, String goal,
                         Function<String, Integer> heuristic) {
    Map<String, Integer> dist = new HashMap<>();
    Map<String, String> cameFrom = new HashMap<>();

    for (String node : graph.keySet()) dist.put(node, Integer.MAX_VALUE);
    dist.put(start, 0);

    PriorityQueue<int[]> openSet = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
    openSet.offer(new int[]{0, start});

    while (!openSet.isEmpty()) {
        int[] current = openSet.poll();
        String u = (String) openSet.stream().filter(x -> x[1] == current[1]).findFirst().orElse(null);

        if (u.equals(goal)) {
            List<String> path = new ArrayList<>();
            String node = goal;
            while (node != null) {
                path.add(0, node);
                node = cameFrom.get(node);
            }
            return path;
        }

        for (int[] edge : graph.getOrDefault(u, Collections.emptyList())) {
            String v = (String) edge[0];
            int w = edge[1];
            if (dist.get(u) +w < dist.getOrDefault(v, Integer.MAX_VALUE)) {
                cameFrom.put(v, u);
                dist.put(v, dist.get(u) +w);
                openSet.offer(new int[]{v, dist.get(v) +heuristic.apply(v)});
            }
        }
    }
    return Collections.emptyList();
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "game-pathfinding",
      i18nKey: "content.algorithms.a-star.scenarios.game-pathfinding",
      domain: "game-dev",
      icon: "🎮",
      reference: "Age of Empires, StarCraft, Civilization, Unity NavMesh",
      codeSnippet: {
        language: "typescript",
        code: `// Game AI pathfinding — A* finds shortest route on tile-based map
// Each tile has g (movement cost) + h (heuristic distance to target)
type Tile = { x: number; y: number; walkable: boolean };

function findPath(
  grid: Tile[][],
  start: Tile,
  goal: Tile
): Tile[] | null {
  const h = (a: Tile, b: Tile) =>
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y); // Manhattan distance
  const visited = new Set<string>();
  const cameFrom = new Map<string, Tile>();
  const g = new Map<string, number>();
  const f = new Map<string, number>();
  const key = (t: Tile) => \`\${t.x},\${t.y}\`;
  const openSet = [start];
  g.set(key(start), 0);
  f.set(key(start), h(start, goal));
  while (openSet.length > 0) {
    openSet.sort((a, b) => f.get(key(a))! - f.get(key(b))!);
    const current = openSet.shift()!;
    if (current === goal) {
      const path: Tile[] = [];
      let c: Tile | undefined = goal;
      while (c) { path.unshift(c); c = cameFrom.get(key(c)); }
      return path;
    }
    visited.add(key(current));
    for (const [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const nx = current.x + dx, ny = current.y + dy;
      if (nx < 0 || ny < 0 || nx >= grid.length || ny >= grid[0].length) continue;
      const neighbor = grid[nx][ny];
      if (!neighbor.walkable || visited.has(key(neighbor))) continue;
      const tentG = g.get(key(current))! + 1;
      if (tentG < (g.get(key(neighbor)) ?? Infinity)) {
        cameFrom.set(key(neighbor), current);
        g.set(key(neighbor), tentG);
        f.set(key(neighbor), tentG + h(neighbor, goal));
        if (!openSet.includes(neighbor)) openSet.push(neighbor);
      }
    }
  }
  return null;
}`,
      },
    },
    {
      id: "robotics-navigation",
      i18nKey: "content.algorithms.a-star.scenarios.robotics-navigation",
      domain: "system",
      icon: "🤖",
      reference: "ROS Navigation Stack, Waymo, Boston Dynamics",
    },
    {
      id: "eta-estimation",
      i18nKey: "content.algorithms.a-star.scenarios.eta-estimation",
      domain: "business",
      icon: "📍",
      reference: "Google Maps ETA, Uber, Lyft",
    },
  ] satisfies Scenario[],
};
