import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Heap Sort — Frame Generator
 * Builds a max heap, then repeatedly extracts the maximum element.
 */
export function* heapSortGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  let step = 0;
  const sorted = new Set<number>();

  // Initial state
  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Initial array: [${arr.join(", ")}]，total ${n} elements`,
    highlightLine: 0,
  };

  // ── Phase 1: Build max heap ──

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    yield {
      step: step++,
      state: { array: [...arr], comparing: [], swapping: [], sorted: [...sorted] },
      description: `Build max heap — Sift down node arr[${i}]=${arr[i]}`,
      highlightLine: 3,
    };
    yield* siftDown(arr, n, i, sorted, () => step++);
  }

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [...sorted] },
    description: `Max heap built ✅ [${arr.join(", ")}]`,
    highlightLine: 5,
  };

  // ── Phase 2: Extract elements ──

  for (let i = n - 1; i > 0; i--) {
    // Swap root (max) with the last unsorted element
    [arr[0], arr[i]]=[arr[i], arr[0]];
    sorted.add(i);
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [],
        swapping: [0, i],
        sorted: [...sorted],
      },
      description: `extractMaximum value ${arr[i]} → Swap arr[0] ↔ arr[${i}]`,
      highlightLine: 8,
    };

    // Heapify the reduced heap
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [...sorted],
      },
      description: `Sift down new root arr[0]=${arr[0]} Restore heap property`,
      highlightLine: 9,
    };
    yield* siftDown(arr, i, 0, sorted, () => step++);
  }

  // Final element is automatically sorted
  sorted.add(0);

  // Final state
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, i) => i),
    },
    description: `Sort complete ✅ [${arr.join(", ")}]`,
    highlightLine: 11,
  };
}

/**
 * Sift-down (heapify) — yields frames during comparison and swapping.
 * Iterative version to allow frame generation.
 */
function* siftDown(
  arr: number[],
  n: number,
  start: number,
  sorted: Set<number>,
  nextStep: () => number
): Generator<Frame<SortState>, void, unknown> {
  let i = start;

  while (true) {
    let largest = i;
    const left = 2 * i +1;
    const right = 2 * i +2;

    // Compare with left child
    if (left < n) {
      yield {
        step: nextStep(),
        state: {
          array: [...arr],
          comparing: [left, largest],
          swapping: [],
          sorted: [...sorted],
        },
        description: `Comparing arr[${left}]=${arr[left]} and arr[${largest}]=${arr[largest]}`,
        highlightLine: 17,
      };
      if (arr[left] > arr[largest]) largest = left;
    }

    // Compare with right child
    if (right < n) {
      yield {
        step: nextStep(),
        state: {
          array: [...arr],
          comparing: [right, largest],
          swapping: [],
          sorted: [...sorted],
        },
        description: `Comparing arr[${right}]=${arr[right]} and arr[${largest}]=${arr[largest]}`,
        highlightLine: 18,
      };
      if (arr[right] > arr[largest]) largest = right;
    }

    if (largest === i) break;

    // Swap parent with largest child
    [arr[i], arr[largest]]=[arr[largest], arr[i]];
    yield {
      step: nextStep(),
      state: {
        array: [...arr],
        comparing: [],
        swapping: [i, largest],
        sorted: [...sorted],
      },
      description: `arr[${largest}] > arr[${i}] → Swap arr[${i}](${arr[i]})↔arr[${largest}](${arr[largest]})`,
      highlightLine: 20,
    };

    i = largest;
  }
}

// ── Code display ──

export const heapSortCode = `function heapSort(arr: number[]): void {
  const n = arr.length;
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]]=[arr[i], arr[0]];   // ← extractMaximum value
    heapify(arr, i, 0);
  }
}

function heapify(arr: number[], n: number, i: number): void {
  let largest = i;
  const left = 2 * i +1;
  const right = 2 * i +2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]]=[arr[largest], arr[i]];  // ← sift-down swap
    heapify(arr, n, largest);
  }
}`;

export const heapSortCodeLines = [
  "function heapSort(arr: number[]): void {",
  "  const n = arr.length;",
  "  // Build max heap",
  "  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {",
  "    heapify(arr, n, i);",
  "  }",
  "  // Extract elements",
  "  for (let i = n - 1; i > 0; i--) {",
  '    [arr[0], arr[i]]=[arr[i], arr[0]];   // ← extractMaximum value',
  "    heapify(arr, i, 0);",
  "  }",
  "}",
  "",
  "function heapify(arr: number[], n: number, i: number): void {",
  "  let largest = i;",
  "  const left = 2 * i +1;",
  "  const right = 2 * i +2;",
  "  if (left < n && arr[left] > arr[largest]) largest = left;",
  "  if (right < n && arr[right] > arr[largest]) largest = right;",
  "  if (largest !== i) {",
  '    [arr[i], arr[largest]]=[arr[largest], arr[i]];  // ← sift-down swap',
  "    heapify(arr, n, largest);",
  "  }",
  "}",
];

// ── Content definition ──

export const heapSortContent = {
  id: "heap-sort",
  slug: "heap-sort",
  title: "",
  titleKey: "content.algorithms.heap-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.heap-sort.desc",
  defaultInput: [12, 11, 13, 5, 6, 7, 20],
  generator: heapSortGenerator as FrameGenerator<number[], SortState>,
  code: heapSortCode,
  language: "TypeScript",
  complexity: { time: "O(n log n)", space: "O(1)" },
  tags: [],
  icon: "📊",
  codeExamples: {
    typescript: {
      code: `function heapSort(arr: number[]): void {
  const n = arr.length;
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]]=[arr[i], arr[0]];   // ← extractMaximum value
    heapify(arr, i, 0);
  }
}

function heapify(arr: number[], n: number, i: number): void {
  let largest = i;
  const left = 2 * i +1;
  const right = 2 * i +2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]]=[arr[largest], arr[i]];  // ← sift-down swap
    heapify(arr, n, largest);
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void heapify(int arr[], int n, int i) {
  int largest = i;
  int left = 2 * i +1;
  int right = 2 * i +2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest != i) {
    int temp = arr[i];
    arr[i]=arr[largest];
    arr[largest]=temp;               // ← sift-down swap
    heapify(arr, n, largest);
  }
}

void heapSort(int arr[], int n) {
  // Build max heap
  for (int i = n / 2 - 1; i >= 0; i--)
    heapify(arr, n, i);
  // Extract elements
  for (int i = n - 1; i > 0; i--) {
    int temp = arr[0];
    arr[0]=arr[i];
    arr[i]=temp;                     // ← extractMaximum value
    heapify(arr, i, 0);
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void heapify(vector<int>& arr, int n, int i) {
  int largest = i;
  int left = 2 * i +1;
  int right = 2 * i +2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest != i) {
    swap(arr[i], arr[largest]);         // ← sift-down swap
    heapify(arr, n, largest);
  }
}

void heapSort(vector<int>& arr) {
  int n = arr.size();
  // Build max heap
  for (int i = n / 2 - 1; i >= 0; i--)
    heapify(arr, n, i);
  // Extract elements
  for (int i = n - 1; i > 0; i--) {
    swap(arr[0], arr[i]);              // ← extractMaximum value
    heapify(arr, i, 0);
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def heap_sort(arr):
    n = len(arr)

    def heapify(n, i):
        largest = i
        left = 2 * i +1
        right = 2 * i +2
        if left < n and arr[left] > arr[largest]:
            largest = left
        if right < n and arr[right] > arr[largest]:
            largest = right
        if largest != i:
            arr[i], arr[largest]=arr[largest], arr[i]  # ← sift-down swap
            heapify(n, largest)

    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(n, i)
    # Extract elements
    for i in range(n - 1, 0, -1):
        arr[0], arr[i]=arr[i], arr[0]   # ← extractMaximum value
        heapify(i, 0)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn heapify(arr: &mut Vec<i32>, n: usize, i: usize) {
    let mut largest = i;
    let left = 2 * i +1;
    let right = 2 * i +2;
    if left < n && arr[left] > arr[largest] { largest = left; }
    if right < n && arr[right] > arr[largest] { largest = right; }
    if largest != i {
        arr.swap(i, largest);              // ← sift-down swap
        heapify(arr, n, largest);
    }
}

fn heap_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    // Build max heap
    for i in (0..n / 2).rev() {
        heapify(arr, n, i);
    }
    // Extract elements
    for i in (1..n).rev() {
        arr.swap(0, i);                    // ← extractMaximum value
        heapify(arr, i, 0);
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func heapify(arr []int, n, i int) {
    largest := i
    left := 2*i +1
    right := 2*i +2
    if left < n && arr[left] > arr[largest] { largest = left }
    if right < n && arr[right] > arr[largest] { largest = right }
    if largest != i {
        arr[i], arr[largest]=arr[largest], arr[i]  // ← sift-down swap
        heapify(arr, n, largest)
    }
}

func heapSort(arr []int) {
    n := len(arr)
    // Build max heap
    for i := n/2 - 1; i >= 0; i-- {
        heapify(arr, n, i)
    }
    // Extract elements
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i]=arr[i], arr[0]    // ← extractMaximum value
        heapify(arr, i, 0)
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void heapSort(int[] arr) {
    int n = arr.length;
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    // Extract elements
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0]=arr[i];
        arr[i]=temp;                     // ← extractMaximum value
        heapify(arr, i, 0);
    }
}

private static void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i +1;
    int right = 2 * i +2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int temp = arr[i];
        arr[i]=arr[largest];
        arr[largest]=temp;               // ← sift-down swap
        heapify(arr, n, largest);
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "os-process-scheduler",
      i18nKey: "content.algorithms.heap-sort.scenarios.os-process-scheduler",
      domain: "system",
      icon: "🐧",
      reference: "Linux CFS scheduler, Windows thread pool, FreeBSD scheduler",
      codeSnippet: {
        language: "c",
        code: `// Linux kernel uses heap-like structures for process scheduling
// The CFS scheduler uses a red-black tree, but priority queues
// for real-time tasks use binary heaps (heap sort's data structure)
struct sched_rt_entity {
    struct rb_node run_list;     // for CFS
    unsigned long timeout;       // timeout for RT tasks
    // Priority queue operations use sift-down (heap sort's core)
};
// Heap property ensures O(log n) insert and extract-max
// Which is the essence of heap sort's operation`,
      },
    },
    {
      id: "top-k-queries",
      i18nKey: "content.algorithms.heap-sort.scenarios.top-k-queries",
      domain: "ai-ml",
      icon: "🧠",
      reference: "NumPy argpartition, Spark topK(), Elasticsearch top_hits",
    },
    {
      id: "k-way-merge",
      i18nKey: "content.algorithms.heap-sort.scenarios.k-way-merge",
      domain: "data-pipeline",
      icon: "🏭",
      reference: "Hadoop merge phase, Kafka log compaction, Bigtable compaction",
    },
  ] satisfies Scenario[],
};
