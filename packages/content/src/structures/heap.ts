import type { Frame, Scenario, TreeState, TreeNode } from "@codeprism/core";

/**
 * Min Heap — Frame Generator
 * Insert elements one by one, sifting up to maintain heap property.
 * Uses binary tree to visualize heap logic.
 */
export function* heapGenerator(): Generator<Frame<TreeState>, void, unknown> {
  const input = [8, 3, 10, 1, 6, 14, 4, 7, 13];
  const heap: number[] = [];
  let step = 0;

  // Empty heap
  yield {
    step: step++,
    state: { root: null, operation: "empty heap" },
    description: "Initial empty heap, ready to insert elements",
    highlightLine: 0,
  };

  for (const value of input) {
    // 1. Append new value to the end (as a leaf)
    heap.push(value);
    const insertedIdx = heap.length - 1;

    // Show new element inserted as leaf
    yield {
      step: step++,
      state: {
        root: buildHeapTree(heap, new Map([[insertedIdx, "inserted"]])),
        operation: `Insert ${value}`,
      },
      description: `Append ${value} to heap end (index ${insertedIdx}), insert as leaf`,
      highlightLine: 4,
    };

    // 2. Sift-up: bubble up while smaller than parent
    let currentIdx = insertedIdx;
    let didSwap = false;

    while (currentIdx > 0) {
      const parentIdx = Math.floor((currentIdx - 1) / 2);

      // Show comparison: current node vs parent
      yield {
        step: step++,
        state: {
          root: buildHeapTree(
            heap,
            new Map([
              [currentIdx, "visiting"],
              [parentIdx, "visiting"],
            ]),
          ),
          operation: `Compare ${heap[currentIdx]} with parent ${heap[parentIdx]}`,
        },
        description:
          `${heap[currentIdx]} ↔ parent ${heap[parentIdx]}：${
            heap[currentIdx] < heap[parentIdx]
              ? `${heap[currentIdx]} < ${heap[parentIdx]}, needs sift up`
              : `${heap[currentIdx]} ≥ ${heap[parentIdx]}, stays in place`
          }`,
        highlightLine: 10,
      };

      if (heap[currentIdx] < heap[parentIdx]) {
        // Swap values in the array
        const childVal = heap[currentIdx];
        const parentVal = heap[parentIdx];
        [heap[currentIdx], heap[parentIdx]] = [parentVal, childVal];
        didSwap = true;

        // Show swapped state
        yield {
          step: step++,
          state: {
            root: buildHeapTree(
              heap,
              new Map([
                [currentIdx, "inserted"],
                [parentIdx, "inserted"],
              ]),
            ),
            operation: `swap ${childVal} ↔ ${parentVal}`,
          },
          description: `${childVal} < ${parentVal}: sift up ${childVal} to index ${parentIdx}, sink ${parentVal} to index ${currentIdx}`,
          highlightLine: 12,
        };

        currentIdx = parentIdx;
      } else {
        break;
      }
    }

    // 3. Show settled state after insertion
    yield {
      step: step++,
      state: {
        root: buildHeapTree(heap),
        operation: `${value} inserted`,
      },
      description: didSwap
        ? `${value} Sifted up, min-heap property maintained ✓`
        : `${value} In correct position, no swap needed ✓`,
      highlightLine: 11,
    };
  }

  // Final heap state
  yield {
    step: step++,
    state: {
      root: buildHeapTree(heap),
      operation: "Build complete",
    },
    description: `Min-heap build complete ✅ ${input.length} nodes, root ${heap[0]} is global minimum`,
    highlightLine: 11,
  };
}

// ── Helpers ──

function createNode(id: string, value: number, status: TreeNode["status"] = "default"): TreeNode {
  return { id, value, x: 0, y: 0, left: null, right: null, status };
}

/**
 * Build a complete binary tree from the array-backed heap representation.
 * Array index i maps to tree position; left child = 2i+1, right child = 2i+2.
 * `marks` is a Map from array index → status to highlight specific nodes.
 */
function buildHeapTree(
  heap: number[],
  marks: Map<number, TreeNode["status"]> = new Map(),
): TreeNode | null {
  if (heap.length === 0) return null;

  function build(index: number): TreeNode | null {
    if (index >= heap.length) return null;
    return {
      ...createNode(`n${index}`, heap[index], marks.get(index) ?? "default"),
      left: build(2 * index + 1),
      right: build(2 * index + 2),
    };
  }

  return build(0);
}

// ── Code display ──

export const heapCode = `class MinHeap {
  private heap: number[] = [];

  insert(value: number): void {
    this.heap.push(value);                 // append to end
    this.siftUp(this.heap.length - 1);     // sift up
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index] >= this.heap[parent]) break;  // no swap needed
      [this.heap[index], this.heap[parent]] =            // swap parent-child
        [this.heap[parent], this.heap[index]];
      index = parent;                                     // continue sifting up
    }
  }
}`;

export const heapCodeLines = [
  "class MinHeap {",
  "  private heap: number[] = [];",
  "",
  "  insert(value: number): void {",
  "    this.heap.push(value);                 // append to end",
  "    this.siftUp(this.heap.length - 1);     // sift up",
  "  }",
  "",
  "  private siftUp(index: number): void {",
  "    while (index > 0) {",
  "      const parent = Math.floor((index - 1) / 2);",
  "      if (this.heap[index] >= this.heap[parent]) break;  // no swap needed",
  "      [this.heap[index], this.heap[parent]] =            // swap parent-child",
  "        [this.heap[parent], this.heap[index]];",
  "      index = parent;                                     // continue sifting up",
  "    }",
  "  }",
  "}",
];

// ── Content definition ──

export const heapContent = {
  id: "heap",
  slug: "heap",
  title: "",
  titleKey: "content.structures.heap.title",
  category: "structure" as const,
  subcategory: "tree",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.structures.heap.desc",
  generator: heapGenerator,
  code: heapCode,
  language: "TypeScript",
  complexity: { time: "O(log n)", space: "O(n)" },
  tags: [],
  icon: "📊",
  codeExamples: {
    typescript: {
      code: `class MinHeap {
  private heap: number[] = [];

  insert(value: number): void {
    this.heap.push(value);               // append to end
    this.siftUp(this.heap.length - 1);   // sift up
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index] >= this.heap[parent]) break; // no swap needed
      [this.heap[index], this.heap[parent]] =           // swap parent-child
        [this.heap[parent], this.heap[index]];
      index = parent;                                   // continue sifting up
    }
  }

  extractMin(): number | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.sinkDown(0);                     // sink down
    return min;
  }

  private sinkDown(index: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1, right = 2 * index + 2;
      if (left < n && this.heap[left] < this.heap[smallest]) smallest = left;
      if (right < n && this.heap[right] < this.heap[smallest]) smallest = right;
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] =
        [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct {
  int data[1000];
  int size;
} MinHeap;

void siftUp(MinHeap* h, int i) {
  while (i > 0) {
    int parent = (i - 1) / 2;
    if (h->data[i] >= h->data[parent]) break;
    int temp = h->data[i];               // swap
    h->data[i] = h->data[parent];
    h->data[parent] = temp;
    i = parent;
  }
}

void insert(MinHeap* h, int value) {
  h->data[h->size] = value;              // append to end
  siftUp(h, h->size++);                  // sift up
}

void sinkDown(MinHeap* h, int i) {
  int n = h->size;
  while (1) {
    int smallest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && h->data[l] < h->data[smallest]) smallest = l;
    if (r < n && h->data[r] < h->data[smallest]) smallest = r;
    if (smallest == i) break;
    int temp = h->data[i];               // swap
    h->data[i] = h->data[smallest];
    h->data[smallest] = temp;
    i = smallest;
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class MinHeap {
  vector<int> heap;
public:
  void insert(int value) {
    heap.push_back(value);               // append to end
    siftUp(heap.size() - 1);             // sift up
  }

  void siftUp(int i) {
    while (i > 0) {
      int parent = (i - 1) / 2;
      if (heap[i] >= heap[parent]) break;
      swap(heap[i], heap[parent]);       // swap parent-child
      i = parent;
    }
  }

  int extractMin() {
    int min = heap[0];
    heap[0] = heap.back();
    heap.pop_back();
    sinkDown(0);                          // sink down
    return min;
  }

  void sinkDown(int i) {
    int n = heap.size();
    while (true) {
      int smallest = i, l = 2*i+1, r = 2*i+2;
      if (l < n && heap[l] < heap[smallest]) smallest = l;
      if (r < n && heap[r] < heap[smallest]) smallest = r;
      if (smallest == i) break;
      swap(heap[i], heap[smallest]);
      i = smallest;
    }
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class MinHeap:
    def __init__(self):
        self.heap = []

    def insert(self, value):
        self.heap.append(value)           # append to end
        self._sift_up(len(self.heap) - 1) # sift up

    def _sift_up(self, i):
        while i > 0:
            parent = (i - 1) // 2
            if self.heap[i] >= self.heap[parent]:
                break
            self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]  # swap
            i = parent

    def extract_min(self):
        if not self.heap: return None
        min_val = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sink_down(0)                # sink down
        return min_val

    def _sink_down(self, i):
        n = len(self.heap)
        while True:
            smallest = i
            l, r = 2*i+1, 2*i+2
            if l < n and self.heap[l] < self.heap[smallest]: smallest = l
            if r < n and self.heap[r] < self.heap[smallest]: smallest = r
            if smallest == i: break
            self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]
            i = smallest`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `struct MinHeap {
    data: Vec<i32>,
}

impl MinHeap {
    fn new() -> Self { MinHeap { data: Vec::new() } }

    fn insert(&mut self, value: i32) {
        self.data.push(value);            // append to end
        self.sift_up(self.data.len() - 1); // sift up
    }

    fn sift_up(&mut self, mut i: usize) {
        while i > 0 {
            let parent = (i - 1) / 2;
            if self.data[i] >= self.data[parent] { break; }
            self.data.swap(i, parent);    // swap parent-child
            i = parent;
        }
    }

    fn extract_min(&mut self) -> Option<i32> {
        let min = self.data.first().copied()?;
        let last = self.data.pop()?;
        if !self.data.is_empty() {
            self.data[0] = last;
            self.sink_down(0);            // sink down
        }
        Some(min)
    }

    fn sink_down(&mut self, mut i: usize) {
        let n = self.data.len();
        loop {
            let mut smallest = i;
            let l = 2*i+1; let r = 2*i+2;
            if l < n && self.data[l] < self.data[smallest] { smallest = l; }
            if r < n && self.data[r] < self.data[smallest] { smallest = r; }
            if smallest == i { break; }
            self.data.swap(i, smallest);
            i = smallest;
        }
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type MinHeap struct { data []int }

func (h *MinHeap) Insert(value int) {
  h.data = append(h.data, value)          // append to end
  h.siftUp(len(h.data) - 1)              // sift up
}

func (h *MinHeap) siftUp(i int) {
  for i > 0 {
    parent := (i - 1) / 2
    if h.data[i] >= h.data[parent] { break }
    h.data[i], h.data[parent] = h.data[parent], h.data[i] // swap
    i = parent
  }
}

func (h *MinHeap) ExtractMin() (int, bool) {
  if len(h.data) == 0 { return 0, false }
  min := h.data[0]
  h.data[0] = h.data[len(h.data)-1]
  h.data = h.data[:len(h.data)-1]
  h.sinkDown(0)                           // sink down
  return min, true
}

func (h *MinHeap) sinkDown(i int) {
  n := len(h.data)
  for {
    smallest, l, r := i, 2*i+1, 2*i+2
    if l < n && h.data[l] < h.data[smallest] { smallest = l }
    if r < n && h.data[r] < h.data[smallest] { smallest = r }
    if smallest == i { break }
    h.data[i], h.data[smallest] = h.data[smallest], h.data[i]
    i = smallest
  }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class MinHeap {
  private int[] heap;
  private int size;

  MinHeap(int capacity) { heap = new int[capacity]; size = 0; }

  void insert(int value) {
    heap[size] = value;                   // append to end
    siftUp(size++);                       // sift up
  }

  void siftUp(int i) {
    while (i > 0) {
      int parent = (i - 1) / 2;
      if (heap[i] >= heap[parent]) break;
      int temp = heap[i];                 // swap
      heap[i] = heap[parent];
      heap[parent] = temp;
      i = parent;
    }
  }

  int extractMin() {
    int min = heap[0];
    heap[0] = heap[--size];
    sinkDown(0);                          // sink down
    return min;
  }

  void sinkDown(int i) {
    while (true) {
      int smallest = i, l = 2*i+1, r = 2*i+2;
      if (l < size && heap[l] < heap[smallest]) smallest = l;
      if (r < size && heap[r] < heap[smallest]) smallest = r;
      if (smallest == i) break;
      int temp = heap[i];
      heap[i] = heap[smallest];
      heap[smallest] = temp;
      i = smallest;
    }
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "priority-queue",
      i18nKey: "content.structures.heap.scenarios.priority-queue",
      domain: "library",
      icon: "📊",
      reference: "Java PriorityQueue, C++ std::priority_queue, Python heapq",
      codeSnippet: {
        language: "typescript",
        code: `// OS uses a min-heap for process scheduling
// Each process has a priority; extractMin gets the highest-priority process
const pq = new MinHeap();
pq.insert({ pid: 1, priority: 5 });  // low priority
pq.insert({ pid: 2, priority: 1 });  // high priority
const next = pq.extractMin(); // returns pid 2 (priority 1)`,
      },
    },
    {
      id: "dijkstra",
      i18nKey: "content.structures.heap.scenarios.dijkstra",
      domain: "system",
      icon: "🗺️",
      reference: "Google Maps, OSRM, GraphHopper",
    },
    {
      id: "top-k",
      i18nKey: "content.structures.heap.scenarios.top-k",
      domain: "data-pipeline",
      icon: "🏆",
      reference: "Apache Spark, Elasticsearch aggregations, Redis ZREVRANGE",
    },
  ] satisfies Scenario[],
};
