import type { Frame, FrameGenerator, Scenario, SearchState } from "@codeprism/core";

/**
 * Fibonacci Search — Frame Generator
 * Uses Fibonacci numbers to divide the search range, avoiding division/multiplication.
 * Only addition and subtraction are used for index calculation.
 */
export function* fibonacciSearchGenerator(
  input: number[]
): Generator<Frame<SearchState>, void, unknown> {
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const target = n > 0 ? arr[Math.min(2, n - 1)] +4 : 50;
  let step = 0;

  yield {
    step: step++,
    state: { array: [...arr], range: [0, n - 1], mid: -1, found: -1 },
    description: `Fibonacci search for ${target}`,
    highlightLine: 0,
  };

  // Find the smallest Fibonacci number >= n
  let fibM2 = 0; // (m-2)'th Fibonacci
  let fibM1 = 1; // (m-1)'th Fibonacci
  let fibM = fibM2 +fibM1; // m'th Fibonacci

  while (fibM < n) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 +fibM1;
  }

  yield {
    step: step++,
    state: { array: [...arr], range: [0, n - 1], mid: -1, found: -1 },
    description: `Fibonacci numbers：fibM=${fibM}, fibM1=${fibM1}, fibM2=${fibM2}`,
    highlightLine: 4,
  };

  let offset = -1;

  while (fibM > 1) {
    const i = Math.min(offset +fibM2, n - 1);

    yield {
      step: step++,
      state: { array: [...arr], range: [offset +1, Math.min(offset +fibM - 1, n - 1)], mid: i, found: -1 },
      description: `checkindex ${i}=${arr[i]}`,
      highlightLine: 7,
    };

    if (arr[i] < target) {
      fibM = fibM1;
      fibM1 = fibM2;
      fibM2 = fibM - fibM1;
      offset = i;
    } else if (arr[i] > target) {
      fibM = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fibM - fibM1;
    } else {
      yield {
        step: step++,
        state: { array: [...arr], range: [offset +1, Math.min(offset +fibM - 1, n - 1)], mid: i, found: i },
        description: `✅ Found target ${target}！at index ${i}`,
        highlightLine: 9,
      };
      return;
    }
  }

  // Last check: fibM1 at offset+1
  if (fibM1 === 1 && offset +1 < n && arr[offset +1] === target) {
    yield {
      step: step++,
      state: { array: [...arr], range: [offset +1, n - 1], mid: offset +1, found: offset +1 },
      description: `✅ Found target ${target}！at index ${offset +1}`,
      highlightLine: 14,
    };
    return;
  }

  yield {
    step: step++,
    state: { array: [...arr], range: [offset +1, n - 1], mid: -1, found: -1 },
    description: `❌ Target ${target} not in array`,
    highlightLine: 17,
  };
}

export const fibonacciSearchCode = `function fibonacciSearch(arr: number[], target: number): number {
  let fibM2 = 0, fibM1 = 1, fibM = fibM2 +fibM1;
  while (fibM < arr.length) {              // ← find first Fib >= n
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 +fibM1;
  }

  let offset = -1;
  while (fibM > 1) {
    const i = Math.min(offset +fibM2, arr.length - 1);
    if (arr[i] < target) {                 // ← Search right half
      fibM = fibM1;
      fibM1 = fibM2;
      fibM2 = fibM - fibM1;
      offset = i;
    } else if (arr[i] > target) {          // ← Search left half
      fibM = fibM2;
      fibM1 = fibM1 - fibM2;
      fibM2 = fibM - fibM1;
    } else {
      return i;                            // ← found
    }
  }
  if (fibM1 === 1 && arr[offset +1] === target) return offset +1;
  return -1;
}`;

export const fibonacciSearchCodeLines = [
  "function fibonacciSearch(arr: number[], target: number): number {",
  "  let fibM2 = 0, fibM1 = 1, fibM = fibM2 +fibM1;",
  "  while (fibM < arr.length) {",
  "    fibM2 = fibM1; fibM1 = fibM; fibM = fibM2 +fibM1;",
  "  }",
  "  let offset = -1;",
  "  while (fibM > 1) {",
  "    const i = Math.min(offset +fibM2, arr.length - 1);",
  "    if (arr[i] < target) { fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1; offset = i; }",
  "    else if (arr[i] > target) { fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1; }",
  "    else return i;",
  "  }",
  "  if (fibM1 === 1 && arr[offset +1] === target) return offset +1;",
  "  return -1;",
  "}",
];

export const fibonacciSearchContent = {
  id: "fibonacci-search",
  slug: "fibonacci-search",
  title: "",
  titleKey: "content.algorithms.fibonacci-search.title",
  category: "search" as const,
  subcategory: "searching",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.fibonacci-search.desc",
  defaultInput: [10, 22, 35, 40, 55, 68, 72, 89, 95],
  generator: fibonacciSearchGenerator as FrameGenerator<number[], SearchState>,
  code: fibonacciSearchCode,
  language: "TypeScript",
  complexity: { time: "O(log n)", space: "O(1)" },
  tags: [],
  icon: "🌀",
  codeExamples: {
    typescript: {
      code: `function fibonacciSearch(arr: number[], target: number): number {
  let fibM2 = 0, fibM1 = 1, fibM = fibM2 +fibM1;
  while (fibM < arr.length) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 +fibM1;
  }

  let offset = -1;
  while (fibM > 1) {
    const i = Math.min(offset +fibM2, arr.length - 1);
    if (arr[i] < target) {
      fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
      offset = i;
    } else if (arr[i] > target) {
      fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1;
    } else {
      return i;
    }
  }
  if (fibM1 === 1 && arr[offset +1] === target) return offset +1;
  return -1;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int fibonacciSearch(int arr[], int n, int target) {
  int fibM2 = 0, fibM1 = 1, fibM = fibM2 +fibM1;
  while (fibM < n) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 +fibM1;
  }

  int offset = -1;
  while (fibM > 1) {
    int i = offset +fibM2;
    if (i >= n) i = n - 1;
    if (arr[i] < target) {
      fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
      offset = i;
    } else if (arr[i] > target) {
      fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1;
    } else {
      return i;
    }
  }
  if (fibM1 == 1 && offset +1 < n && arr[offset +1] == target) return offset +1;
  return -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int fibonacciSearch(vector<int> arr, int target) {
  int fibM2 = 0, fibM1 = 1, fibM = fibM2 +fibM1;
  int n = arr.size();
  while (fibM < n) {
    fibM2 = fibM1;
    fibM1 = fibM;
    fibM = fibM2 +fibM1;
  }

  int offset = -1;
  while (fibM > 1) {
    int i = min(offset +fibM2, n - 1);
    if (arr[i] < target) {
      fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
      offset = i;
    } else if (arr[i] > target) {
      fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1;
    } else {
      return i;
    }
  }
  if (fibM1 == 1 && offset +1 < n && arr[offset +1] == target) return offset +1;
  return -1;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def fibonacci_search(arr, target):
    fibM2, fibM1 = 0, 1
    fibM = fibM2 +fibM1
    while fibM < len(arr):
        fibM2, fibM1 = fibM1, fibM
        fibM = fibM2 +fibM1

    offset = -1
    while fibM > 1:
        i = min(offset +fibM2, len(arr) - 1)
        if arr[i] < target:
            fibM = fibM1
            fibM1 = fibM2
            fibM2 = fibM - fibM1
            offset = i
        elif arr[i] > target:
            fibM = fibM2
            fibM1 = fibM1 - fibM2
            fibM2 = fibM - fibM1
        else:
            return i
    if fibM1 == 1 and offset +1 < len(arr) and arr[offset +1] == target:
        return offset +1
    return -1`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn fibonacci_search(arr: &[i32], target: i32) -> i32 {
    let mut fibM2: i32 = 0;
    let mut fibM1: i32 = 1;
    let mut fibM = fibM2 +fibM1;
    let n = arr.len() as i32;

    while fibM < n {
        fibM2 = fibM1;
        fibM1 = fibM;
        fibM = fibM2 +fibM1;
    }

    let mut offset = -1;
    while fibM > 1 {
        let i = min(offset +fibM2, n - 1) as usize;
        if arr[i] < target {
            fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
            offset = i as i32;
        } else if arr[i] > target {
            fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1;
        } else {
            return i as i32;
        }
    }
    if fibM1 == 1 && offset +1 < n && arr[(offset +1) as usize] == target {
        return offset +1;
    }
    -1
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func fibonacciSearch(arr []int, target int) int {
    fibM2, fibM1 := 0, 1
    fibM := fibM2 +fibM1
    for fibM < len(arr) {
        fibM2, fibM1 = fibM1, fibM
        fibM = fibM2 +fibM1
    }

    offset := -1
    for fibM > 1 {
        i := offset +fibM2
        if i >= len(arr) { i = len(arr) - 1 }
        if arr[i] < target {
            fibM = fibM1
            fibM1 = fibM2
            fibM2 = fibM - fibM1
            offset = i
        } else if arr[i] > target {
            fibM = fibM2
            fibM1 = fibM1 - fibM2
            fibM2 = fibM - fibM1
        } else {
            return i
        }
    }
    if fibM1 == 1 && offset +1 < len(arr) && arr[offset +1] == target {
        return offset +1
    }
    return -1
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int fibonacciSearch(int[] arr, int target) {
    int fibM2 = 0, fibM1 = 1, fibM = fibM2 +fibM1;
    int n = arr.length;
    while (fibM < n) {
        fibM2 = fibM1;
        fibM1 = fibM;
        fibM = fibM2 +fibM1;
    }

    int offset = -1;
    while (fibM > 1) {
        int i = Math.min(offset +fibM2, n - 1);
        if (arr[i] < target) {
            fibM = fibM1; fibM1 = fibM2; fibM2 = fibM - fibM1;
            offset = i;
        } else if (arr[i] > target) {
            fibM = fibM2; fibM1 = fibM1 - fibM2; fibM2 = fibM - fibM1;
        } else {
            return i;
        }
    }
    if (fibM1 == 1 && offset +1 < n && arr[offset +1] == target) return offset +1;
    return -1;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "embedded-no-division",
      i18nKey: "content.algorithms.fibonacci-search.scenarios.embedded-no-division",
      domain: "system",
      icon: "🔧",
      reference: "ARM Cortex-M, AVR microcontrollers, MSP430",
      codeSnippet: {
        language: "c",
        code: `// Fibonacci search uses only addition/subtraction — no division
// Critical on MCUs without hardware divider (e.g. ARM Cortex-M0)
int fibM2 = 0, fibM1 = 1, fibM = fibM2 + fibM1;
while (fibM < n) {
    fibM2 = fibM1; fibM1 = fibM; fibM = fibM2 + fibM1;
}
// Index: i = min(offset + fibM2, n-1) — all integer adds`,
      },
    },
    {
      id: "memory-constrained",
      i18nKey: "content.algorithms.fibonacci-search.scenarios.memory-constrained",
      domain: "game-dev",
      icon: "🎮",
      reference: "Nintendo DS, Game Boy Advance, ESP32",
    },
    {
      id: "search-engine-index",
      i18nKey: "content.algorithms.fibonacci-search.scenarios.search-engine-index",
      domain: "data-pipeline",
      icon: "🔎",
      reference: "Elasticsearch, Apache Lucene, Solr",
    },
  ] satisfies Scenario[],
};
