import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Odd-Even Sort (Brick Sort) — Frame Generator
 * A parallel-friendly sorting algorithm that alternates between
 * comparing odd-indexed pairs and even-indexed pairs.
 */
export function* oddEvenSortGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  let step = 0;

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Initial array: [${arr.join(", ")}]`,
    highlightLine: 0,
  };

  let sorted = false;

  while (!sorted) {
    sorted = true;

    // Odd phase: compare (1,2), (3,4), ...
    for (let i = 1; i < n - 1; i += 2) {
      yield {
        step: step++,
        state: { array: [...arr], comparing: [i, i +1], swapping: [], sorted: [] },
        description: `Odd phase：Comparing arr[${i}]=${arr[i]} and arr[${i +1}]=${arr[i +1]}`,
        highlightLine: 3,
      };

      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        sorted = false;

        yield {
          step: step++,
          state: { array: [...arr], comparing: [], swapping: [i, i +1], sorted: [] },
          description: `Swap arr[${i}] ↔ arr[${i +1}]`,
          highlightLine: 5,
        };
      }
    }

    // Even phase: compare (0,1), (2,3), ...
    for (let i = 0; i < n - 1; i += 2) {
      yield {
        step: step++,
        state: { array: [...arr], comparing: [i, i +1], swapping: [], sorted: [] },
        description: `Even phase：Comparing arr[${i}]=${arr[i]} and arr[${i +1}]=${arr[i +1]}`,
        highlightLine: 9,
      };

      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        sorted = false;

        yield {
          step: step++,
          state: { array: [...arr], comparing: [], swapping: [i, i +1], sorted: [] },
          description: `Swap arr[${i}] ↔ arr[${i +1}]`,
          highlightLine: 11,
        };
      }
    }
  }

  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, k) => k),
    },
    description: `Sort complete ✅ [${arr.join(", ")}]`,
    highlightLine: 16,
  };
}

export const oddEvenSortCode = `function oddEvenSort(arr: number[]): number[] {
  let sorted = false;
  while (!sorted) {
    sorted = true;
    for (let i = 1; i < arr.length - 1; i += 2) {   // ① Odd phase
      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        sorted = false;
      }
    }
    for (let i = 0; i < arr.length - 1; i += 2) {   // ② Even phase
      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`;

export const oddEvenSortCodeLines = [
  "function oddEvenSort(arr: number[]): number[] {",
  "  let sorted = false;",
  "  while (!sorted) {",
  "    sorted = true;",
  "    for (let i = 1; i < arr.length - 1; i += 2) {",
  "      if (arr[i] > arr[i +1]) {",
  "        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];",
  "        sorted = false;",
  "      }",
  "    }",
  "    for (let i = 0; i < arr.length - 1; i += 2) {",
  "      if (arr[i] > arr[i +1]) {",
  "        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];",
  "        sorted = false;",
  "      }",
  "    }",
  "  }",
  "  return arr;",
  "}",
];

export const oddEvenSortContent = {
  id: "odd-even-sort",
  slug: "odd-even-sort",
  title: "",
  titleKey: "content.algorithms.odd-even-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.algorithms.odd-even-sort.desc",
  defaultInput: [3, 8, 5, 4, 1, 9, 6, 7],
  generator: oddEvenSortGenerator as FrameGenerator<number[], SortState>,
  code: oddEvenSortCode,
  language: "TypeScript",
  complexity: { time: "O(n²)", space: "O(1)" },
  tags: [],
  icon: "🧱",
  codeExamples: {
    typescript: {
      code: `function oddEvenSort(arr: number[]): number[] {
  let sorted = false;
  while (!sorted) {
    sorted = true;
    for (let i = 1; i < arr.length - 1; i += 2) {   // ① Odd phase
      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        sorted = false;
      }
    }
    for (let i = 0; i < arr.length - 1; i += 2) {   // ② Even phase
      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void oddEvenSort(int arr[], int n) {
  int sorted = 0;
  while (!sorted) {
    sorted = 1;
    for (int i = 1; i < n - 1; i += 2) {           // ① Odd phase
      if (arr[i] > arr[i +1]) {
        int temp = arr[i];
        arr[i]=arr[i +1];
        arr[i +1]=temp;
        sorted = 0;
      }
    }
    for (int i = 0; i < n - 1; i += 2) {           // ② Even phase
      if (arr[i] > arr[i +1]) {
        int temp = arr[i];
        arr[i]=arr[i +1];
        arr[i +1]=temp;
        sorted = 0;
      }
    }
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void oddEvenSort(vector<int>& arr) {
  bool sorted = false;
  while (!sorted) {
    sorted = true;
    for (int i = 1; i < (int)arr.size() - 1; i += 2) {  // ① Odd phase
      if (arr[i] > arr[i +1]) {
        swap(arr[i], arr[i +1]);
        sorted = false;
      }
    }
    for (int i = 0; i < (int)arr.size() - 1; i += 2) {  // ② Even phase
      if (arr[i] > arr[i +1]) {
        swap(arr[i], arr[i +1]);
        sorted = false;
      }
    }
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def odd_even_sort(arr):
    sorted_flag = False
    while not sorted_flag:
        sorted_flag = True
        for i in range(1, len(arr) - 1, 2):        # ① Odd phase
            if arr[i] > arr[i +1]:
                arr[i], arr[i +1]=arr[i +1], arr[i]
                sorted_flag = False
        for i in range(0, len(arr) - 1, 2):        # ② Even phase
            if arr[i] > arr[i +1]:
                arr[i], arr[i +1]=arr[i +1], arr[i]
                sorted_flag = False
    return arr`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn odd_even_sort(arr: &mut Vec<i32>) {
    let mut sorted = false;
    while !sorted {
        sorted = true;
        let mut i = 1;
        while i +1 < arr.len() {                    // ① Odd phase
            if arr[i] > arr[i +1] {
                arr.swap(i, i +1);
                sorted = false;
            }
            i += 2;
        }
        let mut i = 0;
        while i +1 < arr.len() {                    // ② Even phase
            if arr[i] > arr[i +1] {
                arr.swap(i, i +1);
                sorted = false;
            }
            i += 2;
        }
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func oddEvenSort(arr []int) {
    sorted := false
    for !sorted {
        sorted = true
        for i := 1; i < len(arr)-1; i += 2 {        // ① Odd phase
            if arr[i] > arr[i+1] {
                arr[i], arr[i+1]=arr[i+1], arr[i]
                sorted = false
            }
        }
        for i := 0; i < len(arr)-1; i += 2 {        // ② Even phase
            if arr[i] > arr[i+1] {
                arr[i], arr[i+1]=arr[i+1], arr[i]
                sorted = false
            }
        }
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void oddEvenSort(int[] arr) {
    boolean sorted = false;
    while (!sorted) {
        sorted = true;
        for (int i = 1; i < arr.length - 1; i += 2) {   // ① Odd phase
            if (arr[i] > arr[i +1]) {
                int temp = arr[i];
                arr[i]=arr[i +1];
                arr[i +1]=temp;
                sorted = false;
            }
        }
        for (int i = 0; i < arr.length - 1; i += 2) {   // ② Even phase
            if (arr[i] > arr[i +1]) {
                int temp = arr[i];
                arr[i]=arr[i +1];
                arr[i +1]=temp;
                sorted = false;
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
      id: "gpu-parallel-sorting",
      i18nKey: "content.algorithms.odd-even-sort.scenarios.gpu-parallel-sorting",
      domain: "concurrency",
      icon: "🧵",
      reference: "CUDA bitonic networks, OpenCL sort, Vulkan compute shaders",
    },
    {
      id: "sorting-network-hardware",
      i18nKey: "content.algorithms.odd-even-sort.scenarios.sorting-network-hardware",
      domain: "graphics",
      icon: "🎨",
      reference: "FPGA sorting networks, ASIC compare-exchange units, Bitonic hardware",
      codeSnippet: {
        language: "typescript",
        code: `// Odd-even sort: each phase is embarrassingly parallel
// All odd pairs (1,2), (3,4), ... compare independently
// Then all even pairs (0,1), (2,3), ... compare independently
// This maps directly to GPU thread blocks or FPGA stages
function oddEvenSort(arr: number[]): number[] {
  let sorted = false;
  while (!sorted) {
    sorted = true;
    for (let i = 1; i < arr.length - 1; i += 2) {  // odd phase
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        sorted = false;
      }
    }
    for (let i = 0; i < arr.length - 1; i += 2) {  // even phase
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`,
      },
    },
    {
      id: "distributed-key-sort",
      i18nKey: "content.algorithms.odd-even-sort.scenarios.distributed-key-sort",
      domain: "data-pipeline",
      icon: "🏭",
      reference: "Hadoop TeraSort, MPI odd-even merge, distributed sorting",
    },
  ] satisfies Scenario[],
};
