import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Quick Sort — Frame Generator
 * Uses the middle element as pivot, partitions in-place, recurses.
 */
export function* quickSortGenerator(
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
    description: `Initial array: [${arr.join(", ")}]`,
    highlightLine: 0,
  };

  // Run recursive quick sort
  yield* quickSortStep(arr, 0, n - 1, sorted, () => step++);

  // Final: mark all as sorted
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, i) => i),
    },
    description: `Sort complete ✅ [${arr.join(", ")}]`,
    highlightLine: 18,
  };
}

/**
 * Recursive Quick Sort step — yields frames for each operation.
 */
function* quickSortStep(
  arr: number[],
  low: number,
  high: number,
  sorted: Set<number>,
  nextStep: () => number
): Generator<Frame<SortState>, void, unknown> {
  // Base case: empty or single element
  if (low > high) return;
  if (low === high) {
    if (!sorted.has(low)) {
      sorted.add(low);
      yield {
        step: nextStep(),
        state: {
          array: [...arr],
          comparing: [],
          swapping: [],
          sorted: [...sorted],
        },
        description: `arr[${low}]=${arr[low]} Single element in place`,
        highlightLine: 2,
      };
    }
    return;
  }

  // Choose pivot (middle element) and move it to the end
  const mid = low +Math.floor((high - low) / 2);
  const pivotVal = arr[mid];

  if (mid !== high) {
    [arr[mid], arr[high]]=[arr[high], arr[mid]];
    yield {
      step: nextStep(),
      state: {
        array: [...arr],
        comparing: [],
        swapping: [mid, high],
        sorted: [...sorted],
      },
      description: `Select pivot=${pivotVal}(arr[${mid}])`,
      highlightLine: 8,
    };
  } else {
    yield {
      step: nextStep(),
      state: {
        array: [...arr],
        comparing: [high],
        swapping: [],
        sorted: [...sorted],
      },
      description: `Select pivot=${pivotVal}(arr[${high}])`,
      highlightLine: 8,
    };
  }

  // Partition: rearrange so elements ≤ pivot go left, > pivot go right
  let i = low - 1;
  for (let j = low; j < high; j++) {
    yield {
      step: nextStep(),
      state: {
        array: [...arr],
        comparing: [j, high],
        swapping: [],
        sorted: [...sorted],
      },
      description: `Comparing arr[${j}]=${arr[j]} and pivot=${pivotVal}`,
      highlightLine: 11,
    };

    if (arr[j] <= pivotVal) {
      i++;
      if (i !== j) {
        [arr[i], arr[j]]=[arr[j], arr[i]];
        yield {
          step: nextStep(),
          state: {
            array: [...arr],
            comparing: [],
            swapping: [i, j],
            sorted: [...sorted],
          },
          description: `arr[${j}] ≤ pivot → Swap arr[${i}](${arr[i]})↔arr[${j}](${arr[j]})`,
          highlightLine: 13,
        };
      }
    }
  }

  // Place pivot in its final position
  const pivotPos = i +1;
  if (pivotPos !== high) {
    [arr[pivotPos], arr[high]]=[arr[high], arr[pivotPos]];
    yield {
      step: nextStep(),
      state: {
        array: [...arr],
        comparing: [],
        swapping: [pivotPos, high],
        sorted: [...sorted],
      },
      description: `pivot ${arr[pivotPos]} placed at index ${pivotPos}`,
      highlightLine: 16,
    };
  }
  sorted.add(pivotPos);

  // Recursively sort left and right sub-arrays
  yield* quickSortStep(arr, low, pivotPos - 1, sorted, nextStep);
  yield* quickSortStep(arr, pivotPos +1, high, sorted, nextStep);
}

// ── Code display ──

export const quickSortCode = `function quickSort(arr: number[], low = 0, high = arr.length - 1): void {
  if (low >= high) return;
  const pivot = partition(arr, low, high);
  quickSort(arr, low, pivot - 1);
  quickSort(arr, pivot +1, high);
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];              // ① Select pivot
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {              // ② compare
      i++;
      [arr[i], arr[j]]=[arr[j], arr[i]];  // ③ swap
    }
  }
  [arr[i +1], arr[high]]=            // ④ place pivot
    [arr[high], arr[i +1]];
  return i +1;
}`;

export const quickSortCodeLines = [
  "function quickSort(arr: number[], low = 0, high = arr.length - 1): void {",
  "  if (low >= high) return;",
  "  const pivot = partition(arr, low, high);",
  "  quickSort(arr, low, pivot - 1);",
  "  quickSort(arr, pivot +1, high);",
  "}",
  "",
  "function partition(arr: number[], low: number, high: number): number {",
  "  const pivot = arr[high];              // ① Select pivot",
  "  let i = low - 1;",
  "  for (let j = low; j < high; j++) {",
  "    if (arr[j] <= pivot) {              // ② Comparing",
  "      i++;",
  "      [arr[i], arr[j]]=[arr[j], arr[i]];  // ③ Swap",
  "    }",
  "  }",
  "  [arr[i +1], arr[high]]=            // ④ place pivot",
  "    [arr[high], arr[i +1]];",
  "  return i +1;",
  "}",
];

// ── Content definition ──

export const quickSortContent = {
  id: "quick-sort",
  slug: "quick-sort",
  title: "",
  titleKey: "content.algorithms.quick-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.quick-sort.desc",
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  generator: quickSortGenerator as FrameGenerator<number[], SortState>,
  code: quickSortCode,
  language: "TypeScript",
  complexity: { time: "O(n log n)", space: "O(log n)" },
  tags: [],
  icon: "🔄",
  codeExamples: {
    typescript: {
      code: `function quickSort(arr: number[], low = 0, high = arr.length - 1): void {
  if (low >= high) return;
  const pivot = partition(arr, low, high);
  quickSort(arr, low, pivot - 1);
  quickSort(arr, pivot +1, high);
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];              // ① Select pivot
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {              // ② compare
      i++;
      [arr[i], arr[j]]=[arr[j], arr[i]];  // ③ swap
    }
  }
  [arr[i +1], arr[high]]=            // ④ place pivot
    [arr[high], arr[i +1]];
  return i +1;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int partition(int arr[], int low, int high) {
  int pivot = arr[high];              // ① Select pivot
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] <= pivot) {            // ② compare
      i++;
      int temp = arr[i];
      arr[i]=arr[j];
      arr[j]=temp;                  // ③ swap
    }
  }
  int temp = arr[i +1];
  arr[i +1]=arr[high];
  arr[high]=temp;                   // ④ place pivot
  return i +1;
}

void quickSort(int arr[], int low, int high) {
  if (low < high) {
    int pivot = partition(arr, low, high);
    quickSort(arr, low, pivot - 1);
    quickSort(arr, pivot +1, high);
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int partition(vector<int>& arr, int low, int high) {
  int pivot = arr[high];              // ① Select pivot
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] <= pivot) {            // ② compare
      i++;
      swap(arr[i], arr[j]);           // ③ swap
    }
  }
  swap(arr[i +1], arr[high]);        // ④ place pivot
  return i +1;
}

void quickSort(vector<int>& arr, int low, int high) {
  if (low < high) {
    int pivot = partition(arr, low, high);
    quickSort(arr, low, pivot - 1);
    quickSort(arr, pivot +1, high);
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pivot = partition(arr, low, high)
        quick_sort(arr, low, pivot - 1)
        quick_sort(arr, pivot +1, high)

def partition(arr, low, high):
    pivot = arr[high]                  # ① Select pivot
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:            # ② Comparing
            i += 1
            arr[i], arr[j]=arr[j], arr[i]  # ③ Swap
    arr[i +1], arr[high]=arr[high], arr[i +1]  # ④ place pivot
    return i +1`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn partition(arr: &mut Vec<i32>, low: usize, high: usize) -> usize {
    let pivot = arr[high];              // ① Select pivot
    let mut i = low as i32 - 1;
    for j in low..high {
        if arr[j] <= pivot {            // ② compare
            i += 1;
            arr.swap(i as usize, j);    // ③ swap
        }
    }
    arr.swap((i +1) as usize, high);   // ④ place pivot
    (i +1) as usize
}

fn quick_sort(arr: &mut Vec<i32>, low: usize, high: usize) {
    if low < high {
        let pivot = partition(arr, low, high);
        if pivot > 0 { quick_sort(arr, low, pivot - 1); }
        quick_sort(arr, pivot +1, high);
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func partition(arr []int, low, high int) int {
    pivot := arr[high]                 // ① Select pivot
    i := low - 1
    for j := low; j < high; j++{
        if arr[j] <= pivot {           // ② compare
            i++
            arr[i], arr[j]=arr[j], arr[i]  // ③ swap
        }
    }
    arr[i+1], arr[high]=arr[high], arr[i+1]  // ④ place pivot
    return i +1
}

func quickSort(arr []int, low, high int) {
    if low < high {
        pivot := partition(arr, low, high)
        quickSort(arr, low, pivot-1)
        quickSort(arr, pivot+1, high)
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pivot = partition(arr, low, high);
        quickSort(arr, low, pivot - 1);
        quickSort(arr, pivot +1, high);
    }
}

private static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];              // ① Select pivot
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] <= pivot) {          // ② compare
            i++;
            int temp = arr[i];
            arr[i]=arr[j];
            arr[j]=temp;              // ③ swap
        }
    }
    int temp = arr[i +1];
    arr[i +1]=arr[high];
    arr[high]=temp;                   // ④ place pivot
    return i +1;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "c-qsort-libc",
      i18nKey: "content.algorithms.quick-sort.scenarios.c-qsort-libc",
      domain: "library",
      icon: "📦",
      reference: "glibc qsort, musl qsort, BSD libc qsort",
      codeSnippet: {
        language: "c",
        code: `// glibc qsort uses a hybrid: quicksort + heapsort fallback
// This avoids worst-case O(n²) on adversarial inputs
void __qsort_r(void *base, size_t nmemb, size_t size,
               int (*compar)(const void *, const void *, void *),
               void *arg) {
    // 1. For small arrays (< 16): insertion sort
    // 2. For medium arrays: quicksort with median-of-3 pivot
    // 3. Detects bad partitions and falls back to heapsort
    // This is introsort-like behavior in the standard library
}`,
      },
    },
    {
      id: "java-dual-pivot-primitives",
      i18nKey: "content.algorithms.quick-sort.scenarios.java-dual-pivot-primitives",
      domain: "library",
      icon: "☕",
      reference: "OpenJDK DualPivotQuicksort, V8 TimSort fallback, Go sort.Sort",
    },
    {
      id: "database-in-memory-sort",
      i18nKey: "content.algorithms.quick-sort.scenarios.database-in-memory-sort",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL quicksort path, MySQL filesort, SQLite temp B-tree",
    },
  ] satisfies Scenario[],
};
