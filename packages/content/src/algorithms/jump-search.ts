import type { Frame, FrameGenerator, Scenario, SearchState } from "@codeprism/core";

/**
 * Jump Search — Frame Generator
 * Searches a sorted array by jumping ahead by fixed block size (√n),
 * then doing linear search within the block.
 */
export function* jumpSearchGenerator(
  input: number[]
): Generator<Frame<SearchState>, void, unknown> {
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const target = n > 0 ? arr[Math.min(2, n - 1)] +3 : 50;
  let step = 0;

  yield {
    step: step++,
    state: { array: [...arr], range: [0, n - 1], mid: -1, found: -1 },
    description: `Jump search for ${target}，array length ${n}，step size=${Math.floor(Math.sqrt(n))}`,
    highlightLine: 0,
  };

  const blockSize = Math.floor(Math.sqrt(n));
  let prev = 0;

  // Jump phase
  while (prev < n && arr[Math.min(prev, n - 1)] < target) {
    yield {
      step: step++,
      state: { array: [...arr], range: [prev, Math.min(prev +blockSize, n - 1)], mid: -1, found: -1 },
      description: `Jump to block ${prev}，Check arr[${prev}]=${arr[prev]} < ${target}`,
      highlightLine: 4,
    };

    if (arr[Math.min(prev, n - 1)] >= target) break;
    prev += blockSize;
    if (prev >= n) break;
  }

  // Linear search within block
  const blockEnd = Math.min(prev +blockSize - 1, n - 1);
  for (let i = prev; i <= blockEnd; i++) {
    yield {
      step: step++,
      state: { array: [...arr], range: [prev, blockEnd], mid: i, found: -1 },
      description: `Linear search within block：Check arr[${i}]=${arr[i]}`,
      highlightLine: 7,
    };

    if (arr[i] === target) {
      yield {
        step: step++,
        state: { array: [...arr], range: [prev, blockEnd], mid: i, found: i },
        description: `✅ Found target ${target}！at index ${i}`,
        highlightLine: 8,
      };
      return;
    }
  }

  yield {
    step: step++,
    state: { array: [...arr], range: [prev, blockEnd], mid: -1, found: -1 },
    description: `❌ Target ${target} not in array`,
    highlightLine: 11,
  };
}

export const jumpSearchCode = `function jumpSearch(arr: number[], target: number): number {
  const n = arr.length;
  const blockSize = Math.floor(Math.sqrt(n));       // ← block size
  let prev = 0;

  while (prev < n && arr[Math.min(prev, n - 1)] < target) // ① jump
    prev += blockSize;

  for (let i = prev; i < Math.min(prev +blockSize, n); i++) { // ② linear search
    if (arr[i] === target) return i;
  }
  return -1;
}`;

export const jumpSearchCodeLines = [
  "function jumpSearch(arr: number[], target: number): number {",
  "  const n = arr.length;",
  "  const blockSize = Math.floor(Math.sqrt(n));",
  "  let prev = 0;",
  "  while (prev < n && arr[Math.min(prev, n - 1)] < target)",
  "    prev += blockSize;",
  "  for (let i = prev; i < Math.min(prev +blockSize, n); i++) {",
  "    if (arr[i] === target) return i;",
  "  }",
  "  return -1;",
  "}",
];

export const jumpSearchContent = {
  id: "jump-search",
  slug: "jump-search",
  title: "",
  titleKey: "content.algorithms.jump-search.title",
  category: "search" as const,
  subcategory: "searching",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.jump-search.desc",
  defaultInput: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 24],
  generator: jumpSearchGenerator as FrameGenerator<number[], SearchState>,
  code: jumpSearchCode,
  language: "TypeScript",
  complexity: { time: "O(√n)", space: "O(1)" },
  tags: [],
  icon: "🦘",
  codeExamples: {
    typescript: {
      code: `function jumpSearch(arr: number[], target: number): number {
  const n = arr.length;
  const blockSize = Math.floor(Math.sqrt(n));
  let prev = 0;

  while (prev < n && arr[Math.min(prev, n - 1)] < target)
    prev += blockSize;

  for (let i = prev; i < Math.min(prev +blockSize, n); i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <math.h>

int jumpSearch(int arr[], int n, int target) {
    int block = (int)sqrt(n);
    int prev = 0;
    while (prev < n && arr[(prev < n) ? prev : n - 1] < target)
        prev += block;
    for (int i = prev; i < (prev +block < n ? prev +block : n); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int jumpSearch(const vector<int>& arr, int target) {
    int n = arr.size();
    int block = (int)sqrt(n);
    int prev = 0;
    while (prev < n && arr[min(prev, n - 1)] < target)
        prev += block;
    for (int i = prev; i < min(prev +block, n); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `import math

def jump_search(arr, target):
    n = len(arr)
    block = int(math.sqrt(n))
    prev = 0
    while prev < n and arr[min(prev, n - 1)] < target:
        prev += block
    for i in range(prev, min(prev +block, n)):
        if arr[i] == target:
            return i
    return -1`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn jump_search(arr: &[i32], target: i32) -> i32 {
    let n = arr.len();
    let block = (n as f64).sqrt() as usize;
    let mut prev = 0;
    while prev < n && arr[prev.min(n - 1)] < target {
        prev += block;
    }
    for i in prev..(prev +block).min(n) {
        if arr[i] == target { return i as i32; }
    }
    -1
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func jumpSearch(arr []int, target int) int {
    n := len(arr)
    block := int(math.Sqrt(float64(n)))
    prev := 0
    for prev < n && arr[min(prev, n-1)] < target {
        prev += block
    }
    for i := prev; i < min(prev+block, n); i++{
        if arr[i] == target { return i }
    }
    return -1
}

func min(a, b int) int { if a < b { return a }; return b }`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int jumpSearch(int[] arr, int target) {
    int n = arr.length;
    int block = (int)Math.sqrt(n);
    int prev = 0;
    while (prev < n && arr[Math.min(prev, n - 1)] < target)
        prev += block;
    for (int i = prev; i < Math.min(prev +block, n); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "flash-memory-block",
      i18nKey: "content.algorithms.jump-search.scenarios.flash-memory-block",
      domain: "system",
      icon: "💾",
      reference: "NAND flash, SSD firmware, eMMC controllers",
      codeSnippet: {
        language: "c",
        code: `// Flash memory reads in blocks — jump to block, linear scan within
// Avoids random access penalty on NAND flash pages
int block_size = (int)sqrt(array_len);
int prev = 0;
while (prev < n && data[prev] < target)
    prev += block_size;
// Linear scan within the found block (sequential reads are fast)
for (int i = prev; i < prev + block_size && i < n; i++)`,
      },
    },
    {
      id: "sorted-cache-index",
      i18nKey: "content.algorithms.jump-search.scenarios.sorted-cache-index",
      domain: "database",
      icon: "🗄️",
      reference: "Redis sorted sets, LevelDB, RocksDB",
    },
    {
      id: "embedded-sensor-search",
      i18nKey: "content.algorithms.jump-search.scenarios.embedded-sensor-search",
      domain: "graphics",
      icon: "📡",
      reference: "Arduino firmware, STM32 HAL, ESP-IDF",
    },
  ] satisfies Scenario[],
};
