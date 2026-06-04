import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Bubble Sort — Frame Generator
 * Yields Frame<SortState> with step, state, description, and highlightLine.
 */
export function* bubbleSortGenerator(
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

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Compare
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [j, j +1],
          swapping: [],
          sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
        },
        description: `Comparing arr[${j}]=${arr[j]} and arr[${j +1}]=${arr[j +1]}`,
        highlightLine: 4,
      };

      if (arr[j] > arr[j +1]) {
        // Capture pre-swap values for description
        const preA = arr[j];
        const preB = arr[j +1];

        // Swap
        [arr[j], arr[j +1]]=[arr[j +1], arr[j]];

        yield {
          step: step++,
          state: {
            array: [...arr],
            comparing: [],
            swapping: [j, j +1],
            sorted: Array.from({ length: i }, (_, k) => n - 1 - k),
          },
          description: `Swap arr[${j}](${preA}) ↔ arr[${j +1}](${preB})`,
          highlightLine: 6,
        };
      }
    }
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
    highlightLine: 10,
  };
}

/** Code snippet for display */
export const bubbleSortCode = `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j +1]) {    // ← compare
        [arr[j], arr[j +1]]=
          [arr[j +1], arr[j]];     // ← swap
      }
    }
  }
  return arr;
}`;

export const bubbleSortCodeLines = [
  "function bubbleSort(arr: number[]): number[] {",
  "  const n = arr.length;",
  "  for (let i = 0; i < n - 1; i++) {",
  "    for (let j = 0; j < n - i - 1; j++) {",
  "      if (arr[j] > arr[j +1]) {    // ← compare",
  "        [arr[j], arr[j +1]]=",
  "          [arr[j +1], arr[j]];     // ← swap",
  "      }",
  "    }",
  "  }",
  "  return arr;",
  "}",
];

/** Content definition */
export const bubbleSortContent = {
  id: "bubble-sort",
  slug: "bubble-sort",
  title: "",
  titleKey: "content.algorithms.bubble-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.algorithms.bubble-sort.desc",
  defaultInput: [64, 34, 25, 12, 22, 11, 90],
  generator: bubbleSortGenerator as FrameGenerator<number[], SortState>,
  code: bubbleSortCode,
  language: "TypeScript",
  complexity: {
    time: "O(n²)",
    space: "O(1)",
  },
  tags: [],
  icon: "🫧",
  codeExamples: {
    typescript: {
      code: `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j +1]) {    // ← compare
        [arr[j], arr[j +1]]=
          [arr[j +1], arr[j]];     // ← swap
      }
    }
  }
  return arr;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void bubbleSort(int arr[], int n) {
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j +1]) {    // ← compare
        int temp = arr[j];
        arr[j]=arr[j +1];
        arr[j +1]=temp;          // ← swap
      }
    }
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void bubbleSort(vector<int>& arr) {
  int n = arr.size();
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j +1]) {    // ← compare
        swap(arr[j], arr[j +1]);   // ← swap
      }
    }
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j +1]:    # ← compare
                arr[j], arr[j +1]=arr[j +1], arr[j]  # ← swap
    return arr`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn bubble_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    for i in 0..n - 1 {
        for j in 0..n - i - 1 {
            if arr[j] > arr[j +1] {    // ← compare
                arr.swap(j, j +1);     // ← swap
            }
        }
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++{
        for j := 0; j < n-i-1; j++{
            if arr[j] > arr[j+1] {    // ← compare
                arr[j],
            }
        }
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j +1]) {    // ← compare
                int temp = arr[j];
                arr[j]=arr[j +1];
                arr[j +1]=temp;         // ← swap
            }
        }
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "ntfs-small-segments",
      i18nKey: "content.algorithms.bubble-sort.scenarios.ntfs-small-segments",
      domain: "system",
      icon: "💾",
      reference: "Windows NTFS, Linux ext4, embedded firmware",
    },
    {
      id: "nearly-sorted-reactivity",
      i18nKey: "content.algorithms.bubble-sort.scenarios.nearly-sorted-reactivity",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "React reconciliation, Vue reactivity, Svelte transitions",
      codeSnippet: {
        language: "typescript",
        code: `// Nearly-sorted arrays: optimized bubble sort exits in O(n)
function bubbleSortOptimized(arr: number[]): number[] {
  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;  // ← already sorted
  }
  return arr;
}`,
      },
    },
    {
      id: "algorithm-visualization",
      i18nKey: "content.algorithms.bubble-sort.scenarios.algorithm-visualization",
      domain: "devtools",
      icon: "🔧",
      reference: "Visualgo, Algorithm Visualizer, Sorting.at",
    },
  ] satisfies Scenario[],
};
