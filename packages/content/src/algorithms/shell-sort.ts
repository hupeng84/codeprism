import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Shell Sort — Frame Generator
 * An in-place comparison sort. It is a generalization of insertion sort
 * that allows the exchange of items that are far apart.
 * The algorithm uses diminishing gaps (Knuth sequence: 3h+1).
 */
export function* shellSortGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  let step = 0;

  // Initial state
  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Initial array: [${arr.join(", ")}]`,
    highlightLine: 0,
  };

  // Compute Knuth gap sequence: 1, 4, 13, 40, 121, ...
  const gaps: number[]=[];
  let g = 1;
  while (g < n) {
    gaps.push(g);
    g = 3 * g +1;
  }
  gaps.reverse(); // descending: largest gap first

  for (const gap of gaps) {
    yield {
      step: step++,
      state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
      description: `--- gap gap=${gap} ---`,
      highlightLine: 2,
    };

    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;

      // Show the element being inserted
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [j],
          swapping: [],
          sorted: [],
        },
        description: `gap ${gap}：Select arr[${i}]=${temp}`,
        highlightLine: 6,
      };

      while (j >= gap && arr[j - gap] > temp) {
        // Compare
        yield {
          step: step++,
          state: {
            array: [...arr],
            comparing: [j, j - gap],
            swapping: [],
            sorted: [],
          },
          description: `gap ${gap}：arr[${j - gap}]=${arr[j - gap]} > ${temp} → shift right`,
          highlightLine: 8,
        };

        arr[j]=arr[j - gap];
        yield {
          step: step++,
          state: {
            array: [...arr],
            comparing: [],
            swapping: [j, j - gap],
            sorted: [],
          },
          description: `arr[${j}]=arr[${j - gap}]=${arr[j]}`,
          highlightLine: 9,
        };

        j -= gap;
      }

      arr[j]=temp;
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [],
          swapping: [j],
          sorted: [],
        },
        description: `gap ${gap}：Insert ${temp} at position ${j}`,
        highlightLine: 13,
      };
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
    highlightLine: 17,
  };
}

/** Code snippet for display */
export const shellSortCode = `function shellSort(arr: number[]): number[] {
  const n = arr.length;
  // Knuth gap sequence
  let gap = 1;
  while (gap < n) gap = 3 * gap +1;
  for (gap = Math.floor(gap / 3); gap > 0; gap = Math.floor(gap / 3)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {  // ← cross-gap compare
        arr[j]=arr[j - gap];                     // ← shift
        j -= gap;
      }
      arr[j]=temp;                               // ← insert
    }
  }
  return arr;
}`;

export const shellSortCodeLines = [
  "function shellSort(arr: number[]): number[] {",
  "  const n = arr.length;",
  "  let gap = 1;",
  "  while (gap < n) gap = 3 * gap +1;",
  "  for (gap = Math.floor(gap / 3); gap > 0; gap = Math.floor(gap / 3)) {",
  "    for (let i = gap; i < n; i++) {",
  "      const temp = arr[i];",
  "      let j = i;",
  "      while (j >= gap && arr[j - gap] > temp) {  // ← cross-gap compare",
  "        arr[j]=arr[j - gap];                     // ← shift",
  "        j -= gap;",
  "      }",
  "      arr[j]=temp;                               // ← insert",
  "    }",
  "  }",
  "  return arr;",
  "}",
];

/** Content definition */
export const shellSortContent = {
  id: "shell-sort",
  slug: "shell-sort",
  title: "",
  titleKey: "content.algorithms.shell-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.shell-sort.desc",
  defaultInput: [62, 83, 18, 53, 7, 17, 95, 86, 47, 69, 25, 28],
  generator: shellSortGenerator as FrameGenerator<number[], SortState>,
  code: shellSortCode,
  language: "TypeScript",
  complexity: {
    time: "O(n log n) ~ O(n^(3/2))",
    space: "O(1)",
  },
  tags: [],
  icon: "🐢",
  codeExamples: {
    typescript: {
      code: `function shellSort(arr: number[]): number[] {
  const n = arr.length;
  // Knuth gap sequence
  let gap = 1;
  while (gap < n) gap = 3 * gap +1;
  for (gap = Math.floor(gap / 3); gap > 0; gap = Math.floor(gap / 3)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {  // ← cross-gap compare
        arr[j]=arr[j - gap];                     // ← shift
        j -= gap;
      }
      arr[j]=temp;                               // ← insert
    }
  }
  return arr;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void shellSort(int arr[], int n) {
  // Knuth gap sequence
  int gap = 1;
  while (gap < n) gap = 3 * gap +1;
  for (gap /= 3; gap > 0; gap /= 3) {
    for (int i = gap; i < n; i++) {
      int temp = arr[i];
      int j = i;
      while (j >= gap && arr[j - gap] > temp) {  // ← cross-gap compare
        arr[j]=arr[j - gap];                    // ← shift
        j -= gap;
      }
      arr[j]=temp;                              // ← insert
    }
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void shellSort(vector<int>& arr) {
  int n = arr.size();
  // Knuth gap sequence
  int gap = 1;
  while (gap < n) gap = 3 * gap +1;
  for (gap /= 3; gap > 0; gap /= 3) {
    for (int i = gap; i < n; i++) {
      int temp = arr[i];
      int j = i;
      while (j >= gap && arr[j - gap] > temp) {  // ← cross-gap compare
        arr[j]=arr[j - gap];                    // ← shift
        j -= gap;
      }
      arr[j]=temp;                              // ← insert
    }
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def shell_sort(arr):
    n = len(arr)
    # Knuth gap sequence
    gap = 1
    while gap < n:
        gap = 3 * gap +1
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:  # ← cross-gap compare
                arr[j]=arr[j - gap]                # ← shift
                j -= gap
            arr[j]=temp                            # ← insert
        gap //= 3
    return arr`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn shell_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    // Knuth gap sequence
    let mut gap = 1;
    while gap < n { gap = 3 * gap +1; }
    while gap > 0 {
        for i in gap..n {
            let temp = arr[i];
            let mut j = i;
            while j >= gap && arr[j - gap] > temp {  // ← cross-gap compare
                arr[j]=arr[j - gap];               // ← shift
                j -= gap;
            }
                          // ← insert
        }
        gap /= 3;
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func shellSort(arr []int) {
    n := len(arr)
    // Knuth gap sequence
    gap := 1
    for gap < n { gap = 3*gap +1 }
    for gap > 0 {
        for i := gap; i < n; i++{
            temp := arr[i]
            j := i
            for j >= gap && arr[j-gap] > temp {   // ← cross-gap compare
                arr[j]=arr[j-gap]               // ← shift
                j -= gap
            }
            arr[j]=temp                         // ← insert
        }
        gap /= 3
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void shellSort(int[] arr) {
    int n = arr.length;
    // Knuth gap sequence
    int gap = 1;
    while (gap < n) gap = 3 * gap +1;
    for (gap /= 3; gap > 0; gap /= 3) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {  // ← cross-gap compare
                arr[j]=arr[j - gap];                  // ← shift
                j -= gap;
            }
            arr[j]=temp;                              // ← insert
        }
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "uclibc-embedded-libc",
      i18nKey: "content.algorithms.shell-sort.scenarios.uclibc-embedded-libc",
      domain: "system",
      icon: "🐢",
      reference: "uClibc, musl libc, BusyBox qsort fallback",
      codeSnippet: {
        language: "c",
        code: `// uClibc uses shell sort as qsort fallback for small arrays
// With Knuth gap sequence: 1, 4, 13, 40, 121, ...
void shellsort(int *base, size_t nmemb, size_t size) {
    int gap, i, j;
    for (gap = nmemb / 2; gap > 0; gap /= 2) {
        for (i = gap; i < nmemb; i++) {
            void *tmp = malloc(size);
            memcpy(tmp, base + i * size, size);
            for (j = i; j >= gap &&
                compare(base + (j-gap)*size, tmp) > 0;
                j -= gap) {
                memcpy(base + j*size, base + (j-gap)*size, size);
            }
            memcpy(base + j*size, tmp, size);
            free(tmp);
        }
    }
}`,
      },
    },
    {
      id: "embedded-database-index",
      i18nKey: "content.algorithms.shell-sort.scenarios.embedded-database-index",
      domain: "database",
      icon: "🗄️",
      reference: "SQLite in-memory sorts, LevelDB memtable, BoltDB pages",
    },
    {
      id: "network-packet-buffer",
      i18nKey: "content.algorithms.shell-sort.scenarios.network-packet-buffer",
      domain: "network",
      icon: "🌐",
      reference: "Linux kernel inet_frag_queue, BSD mbuf sorting, DPDK packet rings",
    },
  ] satisfies Scenario[],
};
