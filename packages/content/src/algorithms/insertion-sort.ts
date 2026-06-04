import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Insertion Sort — Frame Generator
 * Builds the sorted array one element at a time by inserting each element
 * into its correct position among the already-sorted elements.
 */
export function* insertionSortGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  let step = 0;

  // Initial state
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
    },
    description: `Initial array: [${arr.join(", ")}]`,
    highlightLine: 0,
  };

  // First element is trivially sorted
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [0],
    },
    description: `arr[0]=${arr[0]} considered sorted`,
    highlightLine: 3,
  };

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    // Mark the key element
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => k),
      },
      description: `Select key = arr[${i}]=${key}`,
      highlightLine: 5,
    };

    while (j >= 0 && arr[j] > key) {
      // Compare
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [j, j +1],
          swapping: [],
          sorted: Array.from({ length: i }, (_, k) => k < j ? k : -1).filter(k => k >= 0),
        },
        description: `arr[${j}]=${arr[j]} > key=${key} → shift right`,
        highlightLine: 7,
      };

      // Shift
      arr[j +1]=arr[j];
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [],
          swapping: [j, j +1],
          sorted: Array.from({ length: i }, (_, k) => k < j ? k : -1).filter(k => k >= 0),
        },
        description: `arr[${j +1}]=arr[${j}]=${arr[j]}`,
        highlightLine: 8,
      };

      j--;
    }

    // Insert key at correct position
    arr[j +1]=key;
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [],
        swapping: [j +1],
        sorted: Array.from({ length: i +1 }, (_, k) => k),
      },
      description: `Insert key=${key} at position ${j +1}`,
      highlightLine: 11,
    };
  }

  // Final sorted state
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, k) => k),
    },
    description: `Sort complete ✅ [${arr.join(", ")}]`,
    highlightLine: 15,
  };
}

/** Code snippet for display */
export const insertionSortCode = `function insertionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];           // ← select element to insert
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {  // ← find insertion position
      arr[j +1]=arr[j];         // ← shift element
      j--;
    }
    arr[j +1]=key;             // ← insert at correct position
  }
  return arr;
}`;

export const insertionSortCodeLines = [
  "function insertionSort(arr: number[]): number[] {",
  "  const n = arr.length;",
  "  for (let i = 1; i < n; i++) {",
  "    const key = arr[i];           // ← select element to insert",
  "    let j = i - 1;",
  "    while (j >= 0 && arr[j] > key) {  // ← find insertion position",
  "      arr[j +1]=arr[j];         // ← shift element",
  "      j--;",
  "    }",
  "    arr[j +1]=key;             // ← insert at correct position",
  "  }",
  "  return arr;",
  "}",
];

/** Content definition */
export const insertionSortContent = {
  id: "insertion-sort",
  slug: "insertion-sort",
  title: "",
  titleKey: "content.algorithms.insertion-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.algorithms.insertion-sort.desc",
  defaultInput: [12, 11, 13, 5, 6],
  generator: insertionSortGenerator as FrameGenerator<number[], SortState>,
  code: insertionSortCode,
  language: "TypeScript",
  complexity: {
    time: "O(n²)",
    space: "O(1)",
  },
  tags: [],
  icon: "🃏",
  codeExamples: {
    typescript: {
      code: `function insertionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];                    // ← select element to insert
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {       // ← find insertion position
      arr[j +1]=arr[j];                // ← shift element
      j--;
    }
    arr[j +1]=key;                      // ← insert at correct position
  }
  return arr;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void insertionSort(int arr[], int n) {
  for (int i = 1; i < n; i++) {
    int key = arr[i];                      // ← select element to insert
    int j = i - 1;
    while (j >= 0 && arr[j] > key) {       // ← find insertion position
      arr[j +1]=arr[j];                // ← shift element
      j--;
    }
    arr[j +1]=key;                      // ← insert at correct position
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void insertionSort(vector<int>& arr) {
  int n = arr.size();
  for (int i = 1; i < n; i++) {
    int key = arr[i];                      // ← select element to insert
    int j = i - 1;
    while (j >= 0 && arr[j] > key) {       // ← find insertion position
      arr[j +1]=arr[j];                // ← shift element
      j--;
    }
    arr[j +1]=key;                      // ← insert at correct position
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def insertion_sort(arr):
    n = len(arr)
    for i in range(1, n):
        key = arr[i]                       # ← select element to insert
        j = i - 1
        while j >= 0 and arr[j] > key:     # ← find insertion position
            arr[j +1]=arr[j]            # ← shift element
            j -= 1
        arr[j +1]=key                   # ← insert at correct position
    return arr`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn insertion_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    for i in 1..n {
        let key = arr[i];                  // ← select element to insert
        let mut j = i - 1;
        while j > 0 && arr[j - 1] > key {  // ← find insertion position
            arr[j]=arr[j - 1];           // ← shift element
            j -= 1;
        }
        arr[j]=key;                      // ← insert at correct position
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func insertionSort(arr []int) {
    n := len(arr)
    for i := 1; i < n; i++{
        key := arr[i]                      // ← select element to insert
        j := i - 1
        for j >= 0 && arr[j] > key {       // ← find insertion position
            arr[j+1]=arr[j]              // ← shift element
            j--
        }
        arr[j+1]=key                     // ← insert at correct position
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void insertionSort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; i++) {
        int key = arr[i];                  // ← select element to insert
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {   // ← find insertion position
            arr[j +1]=arr[j];           // ← shift element
            j--;
        }
        arr[j +1]=key;                  // ← insert at correct position
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "timsort-small-runs",
      i18nKey: "content.algorithms.insertion-sort.scenarios.timsort-small-runs",
      domain: "library",
      icon: "☕",
      reference: "Java Arrays.sort, V8 Array.prototype.sort, Python sorted()",
      codeSnippet: {
        language: "java",
        code: `// Java's DualPivotQuicksort falls back to insertion sort for small arrays
// Found in OpenJDK: Arrays.sort() for primitives
private static void sort(int[] a, int left, int right) {
    // Use insertion sort for small subarrays (threshold ~47)
    if (right - left + 1 < INSERTION_SORT_THRESHOLD) {
        for (int i = left + 1; i <= right; i++) {
            int key = a[i];
            int j = i - 1;
            while (j >= left && a[j] > key) {
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;
        }
        return;
    }
    // ... dual-pivot quicksort for larger arrays
}`,
      },
    },
    {
      id: "online-card-sorting",
      i18nKey: "content.algorithms.insertion-sort.scenarios.online-card-sorting",
      domain: "business",
      icon: "💼",
      reference: "Playing card games, Kanban boards, Trello lists",
    },
    {
      id: "nearly-sorted-collections",
      i18nKey: "content.algorithms.insertion-sort.scenarios.nearly-sorted-collections",
      domain: "data-pipeline",
      icon: "🏭",
      reference: "Kafka log compaction, B-tree page splits, LSM-tree compaction",
    },
  ] satisfies Scenario[],
};
