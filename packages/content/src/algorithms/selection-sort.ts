import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Selection Sort — Frame Generator
 * Repeatedly finds the minimum element from the unsorted portion
 * and swaps it into its correct position.
 */
export function* selectionSortGenerator(
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
    let minIdx = i;

    // Mark current minimum candidate
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [minIdx],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => k),
      },
      description: `Round  ${i +1} : assume arr[${i}]=${arr[i]} as minimum`,
      highlightLine: 3,
    };

    // Find minimum in unsorted portion
    for (let j = i +1; j < n; j++) {
      // Compare
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [j, minIdx],
          swapping: [],
          sorted: Array.from({ length: i }, (_, k) => k),
        },
        description: `Comparing arr[${j}]=${arr[j]} andcurrent minimum arr[${minIdx}]=${arr[minIdx]}`,
        highlightLine: 5,
      };

      if (arr[j]<arr[minIdx]) {
        minIdx = j;

        yield {
          step: step++,
          state: {
            array: [...arr],
            comparing: [minIdx],
            swapping: [],
            sorted: Array.from({ length: i }, (_, k) => k),
          },
          description: `Found smaller value arr[${minIdx}]=${arr[minIdx]}`,
          highlightLine: 7,
        };
      }
    }

    // Swap if needed
    if (minIdx !== i) {
      [arr[i], arr[minIdx]]=[arr[minIdx], arr[i]];

      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [],
          swapping: [i, minIdx],
          sorted: Array.from({ length: i }, (_, k) => k),
        },
        description: `Swap arr[${i}] ↔ arr[${minIdx}] (values ${arr[i]} ↔ ${arr[minIdx] === undefined ? arr[minIdx] : ""})`,
        highlightLine: 11,
      };
    }

    // Mark i as sorted
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: i +1 }, (_, k) => k),
      },
      description: `arr[${i}]=${arr[i]} placed in position`,
      highlightLine: 14,
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
    highlightLine: 18,
  };
}

/** Code snippet for display */
export const selectionSortCode = `function selectionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;                     // ← assume current is min
    for (let j = i +1; j < n; j++) {
      if (arr[j]<arr[minIdx]) {       // ← find smaller value
        minIdx = j;                     // ← update min index
      }
    }
    if (minIdx !== i) {                 // ← need swap
      [arr[i], arr[minIdx]]=
        [arr[minIdx], arr[i]];          // ← swap
    }
  }
  return arr;
}`;

export const selectionSortCodeLines = [
  "function selectionSort(arr: number[]): number[] {",
  "  const n = arr.length;",
  "  for (let i = 0; i < n - 1; i++) {",
  "    let minIdx = i;                     // ← assume current is min",
  "    for (let j = i +1; j < n; j++) {",
  "      if (arr[j]<arr[minIdx]) {       // ← find smaller value",
  "        minIdx = j;                     // ← update min index",
  "      }",
  "    }",
  "    if (minIdx !== i) {                 // ← need swap",
  "      [arr[i], arr[minIdx]]=",
  "        [arr[minIdx], arr[i]];          // ← swap",
  "    }",
  "  }",
  "  return arr;",
  "}",
];

/** Content definition */
export const selectionSortContent = {
  id: "selection-sort",
  slug: "selection-sort",
  title: "",
  titleKey: "content.algorithms.selection-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.algorithms.selection-sort.desc",
  defaultInput: [29, 10, 14, 37, 13],
  generator: selectionSortGenerator as FrameGenerator<number[], SortState>,
  code: selectionSortCode,
  language: "TypeScript",
  complexity: {
    time: "O(n²)",
    space: "O(1)",
  },
  tags: [],
  icon: "🎯",
  codeExamples: {
    typescript: {
      code: `function selectionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;                        // ← assume current is min
    for (let j = i +1; j < n; j++) {
      if (arr[j]<arr[minIdx]) {          // ← find smaller value
        minIdx = j;                        // ← update min index
      }
    }
    if (minIdx !== i) {                    // ← need swap
      [arr[i], arr[minIdx]]=
        [arr[minIdx], arr[i]];             // ← swap
    }
  }
  return arr;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void selectionSort(int arr[], int n) {
  for (int i = 0; i < n - 1; i++) {
    int minIdx = i;                        // ← assume current is min
    for (int j = i +1; j < n; j++) {
      if (arr[j]<arr[minIdx]) {          // ← find smaller value
        minIdx = j;                        // ← update min index
      }
    }
    if (minIdx != i) {                     // ← need swap
      int temp = arr[i];
      arr[i]=arr[minIdx];
      arr[minIdx]=temp;                  // ← swap
    }
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void selectionSort(vector<int>& arr) {
  int n = arr.size();
  for (int i = 0; i < n - 1; i++) {
    int minIdx = i;                        // ← assume current is min
    for (int j = i +1; j < n; j++) {
      if (arr[j]<arr[minIdx]) {          // ← find smaller value
        minIdx = j;                        // ← update min index
      }
    }
    if (minIdx != i) {                     // ← need swap
      swap(arr[i], arr[minIdx]);           // ← swap
    }
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i                        # ← assume current is min
        for j in range(i +1, n):
            if arr[j]<arr[min_idx]:      # ← find smaller value
                min_idx = j                # ← update min index
        if min_idx != i:                   # ← need swap
            arr[i], arr[min_idx]=arr[min_idx], arr[i]  # ← swap
    return arr`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn selection_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    for i in 0..n - 1 {
        let mut min_idx = i;               // ← assume current is min
        for j in i +1..n {
            if arr[j]<arr[min_idx] {     // ← find smaller value
                min_idx = j;               // ← update min index
            }
        }
        if min_idx != i {                  // ← need swap
            arr.swap(i, min_idx);          // ← swap
        }
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func selectionSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++{
        minIdx := i  Assumecurrentpositionminimum
        for j := i +1; j < n; j++{
            if arr[j]<arr[minIdx] {      // ← find smaller value
                minIdx = j                 // ← update min index
            }
        }
        if minIdx != i {                   // ← need swap
            arr[i], arr[minIdx]=arr[minIdx], arr[i]  // ← swap
        }
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;                    // ← assume current is min
        for (int j = i +1; j < n; j++) {
            if (arr[j]<arr[minIdx]) {    // ← find smaller value
                minIdx = j;                // ← update min index
            }
        }
        if (minIdx != i) {                 // ← need swap
            int temp = arr[i];
            arr[i]=arr[minIdx];
            arr[minIdx]=temp;            // ← swap
        }
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "flash-memory-minimal-writes",
      i18nKey: "content.algorithms.selection-sort.scenarios.flash-memory-minimal-writes",
      domain: "system",
      icon: "💾",
      reference: "EEPROM drivers, SD card firmware, NOR flash controllers",
    },
    {
      id: "embedded-constrained-sort",
      i18nKey: "content.algorithms.selection-sort.scenarios.embedded-constrained-sort",
      domain: "game-dev",
      icon: "🎮",
      reference: "Arduino sort.h, microcontroller sort routines, IoT sensor nodes",
    },
    {
      id: "educational-algorithm",
      i18nKey: "content.algorithms.selection-sort.scenarios.educational-algorithm",
      domain: "devtools",
      icon: "🔧",
      reference: "CS50, MIT 6.006, Princeton Algorithms course",
    },
  ] satisfies Scenario[],
};
