import type { Frame, FrameGenerator, Scenario, SearchState } from "@codeprism/core";

/**
 * Exponential Search — Frame Generator
 * Finds a range [2^(k-1), 2^k] that contains the target, then does binary search within.
 * Especially efficient for unbounded/infinite arrays.
 */
function* binarySearchFrames(
  arr: number[], low: number, high: number, target: number, startStep: number
): Generator<Frame<SearchState>, [number, number], unknown> {
  let step = startStep;
  while (low <= high) {
    const mid = low +Math.floor((high - low) / 2);
    yield {
      step: step++,
      state: { array: [...arr], range: [low, high], mid, found: -1 },
      description: `Binary search range [${low}, ${high}]，mid=${mid}=${arr[mid]}`,
      highlightLine: 9,
    };
    if (arr[mid] === target) {
      yield {
        step: step++,
        state: { array: [...arr], range: [low, high], mid, found: mid },
        description: `✅ Found target ${target}！at index ${mid}`,
        highlightLine: 10,
      };
      return [step, mid];
    }
    if (arr[mid] < target) low = mid +1;
    else high = mid - 1;
  }
  yield {
    step: step++,
    state: { array: [...arr], range: [low, high], mid: -1, found: -1 },
    description: `❌ Target ${target} not in array`,
    highlightLine: 14,
  };
  return [step, -1];
}

export function* exponentialSearchGenerator(
  input: number[]
): Generator<Frame<SearchState>, void, unknown> {
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const target = n > 0 ? arr[Math.min(3, n - 1)] +5 : 50;
  let step = 0;

  yield {
    step: step++,
    state: { array: [...arr], range: [0, n - 1], mid: -1, found: -1 },
    description: `Exponential search for ${target}，length ${n}`,
    highlightLine: 0,
  };

  if (arr[0] === target) {
    yield {
      step: step++,
      state: { array: [...arr], range: [0, 0], mid: 0, found: 0 },
      description: `✅ arr[0] is target ${target}`,
      highlightLine: 2,
    };
    return;
  }

  let bound = 1;
  while (bound < n && arr[bound] < target) {
    yield {
      step: step++,
      state: { array: [...arr], range: [bound / 2, bound], mid: -1, found: -1 },
      description: `Exponential expansion：bound=${bound}，arr[${bound}]=${arr[bound]} < ${target}`,
      highlightLine: 5,
    };
    bound *= 2;
  }

  yield {
    step: step++,
    state: { array: [...arr], range: [Math.floor(bound / 2), Math.min(bound, n - 1)], mid: -1, found: -1 },
    description: `Determine search range [${Math.floor(bound / 2)}, ${Math.min(bound, n - 1)}]`,
    highlightLine: 7,
  };

  yield* binarySearchFrames(arr, Math.floor(bound / 2), Math.min(bound, n - 1), target, step);
}

export const exponentialSearchCode = `function exponentialSearch(arr: number[], target: number): number {
  if (arr[0] === target) return 0;            // ← check first element

  let bound = 1;
  while (bound < arr.length && arr[bound] < target)  // ① Exponential expansion
    bound *= 2;

  // ② binary search in range
  return binarySearch(arr, target, bound / 2, Math.min(bound, arr.length - 1));
}

function binarySearch(arr: number[], target: number, low: number, high: number): number {
  while (low <= high) {
    const mid = Math.floor((low +high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid +1;
    else high = mid - 1;
  }
  return -1;
}`;

export const exponentialSearchCodeLines = [
  "function exponentialSearch(arr: number[], target: number): number {",
  "  if (arr[0] === target) return 0;",
  "  let bound = 1;",
  "  while (bound < arr.length && arr[bound] < target)",
  "    bound *= 2;",
  "  return binarySearch(arr, target, Math.floor(bound / 2), Math.min(bound, arr.length - 1));",
  "}",
  "",
  "function binarySearch(arr: number[], target: number, low: number, high: number): number {",
  "  while (low <= high) {",
  "    const mid = Math.floor((low +high) / 2);",
  "    if (arr[mid] === target) return mid;",
  "    if (arr[mid] < target) low = mid +1;",
  "    else high = mid - 1;",
  "  }",
  "  return -1;",
  "}",
];

export const exponentialSearchContent = {
  id: "exponential-search",
  slug: "exponential-search",
  title: "",
  titleKey: "content.algorithms.exponential-search.title",
  category: "search" as const,
  subcategory: "searching",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.exponential-search.desc",
  defaultInput: [2, 4, 8, 16, 32, 64, 128, 256],
  generator: exponentialSearchGenerator as FrameGenerator<number[], SearchState>,
  code: exponentialSearchCode,
  language: "TypeScript",
  complexity: { time: "O(log n)", space: "O(1)" },
  tags: [],
  icon: "📈",
  codeExamples: {
    typescript: {
      code: `function exponentialSearch(arr: number[], target: number): number {
  if (arr[0] === target) return 0;

  let bound = 1;
  while (bound < arr.length && arr[bound] < target)
    bound *= 2;

  return binarySearch(arr, target, Math.floor(bound / 2), Math.min(bound, arr.length - 1));
}

function binarySearch(arr: number[], target: number, low: number, high: number): number {
  while (low <= high) {
    const mid = Math.floor((low +high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid +1;
    else high = mid - 1;
  }
  return -1;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int binarySearch(int arr[], int low, int high, int target) {
    while (low <= high) {
        int mid = low +(high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid +1;
        else high = mid - 1;
    }
    return -1;
}

int exponentialSearch(int arr[], int n, int target) {
    if (arr[0] == target) return 0;
    int bound = 1;
    while (bound < n && arr[bound] < target) bound *= 2;
    return binarySearch(arr, bound / 2, (bound < n ? bound : n - 1), target);
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int binarySearch(const vector<int>& arr, int low, int high, int target) {
    while (low <= high) {
        int mid = low +(high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid +1;
        else high = mid - 1;
    }
    return -1;
}

int exponentialSearch(const vector<int>& arr, int target) {
    if (arr[0] == target) return 0;
    int bound = 1, n = arr.size();
    while (bound < n && arr[bound] < target) bound *= 2;
    return binarySearch(arr, bound / 2, min(bound, n - 1), target);
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def binary_search(arr, low, high, target):
    while low <= high:
        mid = (low +high) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            low = mid +1
        else:
            high = mid - 1
    return -1

def exponential_search(arr, target):
    if arr[0] == target:
        return 0
    bound = 1
    n = len(arr)
    while bound < n and arr[bound] < target:
        bound *= 2
    return binary_search(arr, bound // 2, min(bound, n - 1), target)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn binary_search(arr: &[i32], low: i32, high: i32, target: i32) -> i32 {
    let mut l = low;
    let mut h = high;
    while l <= h {
        let mid = l +(h - l) / 2;
        if arr[mid as usize] == target { return mid; }
        if arr[mid as usize] < target { l = mid +1; }
        else { h = mid - 1; }
    }
    -1
}

fn exponential_search(arr: &[i32], target: i32) -> i32 {
    if arr[0] == target { return 0; }
    let n = arr.len() as i32;
    let mut bound = 1;
    while bound < n && arr[bound as usize] < target { bound *= 2; }
    binary_search(arr, bound / 2, bound.min(n - 1), target)
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func binarySearch(arr []int, low, high, target int) int {
    for low <= high {
        mid := low +(high-low)/2
        if arr[mid] == target { return mid }
        if arr[mid] < target { low = mid +1 } else { high = mid - 1 }
    }
    return -1
}

func exponentialSearch(arr []int, target int) int {
    if arr[0] == target { return 0 }
    bound, n := 1, len(arr)
    for bound < n && arr[bound] < target { bound *= 2 }
    return binarySearch(arr, bound/2, min(bound, n-1), target)
}

func min(a, b int) int { if a < b { return a }; return b }`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int binarySearch(int[] arr, int low, int high, int target) {
    while (low <= high) {
        int mid = low +(high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid +1;
        else high = mid - 1;
    }
    return -1;
}

public static int exponentialSearch(int[] arr, int target) {
    if (arr[0] == target) return 0;
    int bound = 1, n = arr.length;
    while (bound < n && arr[bound] < target) bound *= 2;
    return binarySearch(arr, bound / 2, Math.min(bound, n - 1), target);
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "unbounded-stream",
      i18nKey: "content.algorithms.exponential-search.scenarios.unbounded-stream",
      domain: "concurrency",
      icon: "🌊",
      reference: "Java Streams, C# IEnumerable, Rust Iterator",
      codeSnippet: {
        language: "java",
        code: `// Galloping search on an unbounded sorted stream
// Double the bound until we overshoot, then binary search
int bound = 1;
while (bound < stream.size() && stream.get(bound) < target)
    bound *= 2;
// Now binary search in [bound/2, min(bound, size)]
return binarySearch(stream, target, bound / 2, Math.min(bound, stream.size() - 1));`,
      },
    },
    {
      id: "rotating-sorted-array",
      i18nKey: "content.algorithms.exponential-search.scenarios.rotating-sorted-array",
      domain: "library",
      icon: "🔄",
      reference: "C++ std::rotate, Java Collections, Swift Array",
    },
    {
      id: "galloping-in-sort",
      i18nKey: "content.algorithms.exponential-search.scenarios.galloping-in-sort",
      domain: "ai-ml",
      icon: "🤖",
      reference: "Merge-insertion sort, Tim Peters, Python Timsort",
    },
  ] satisfies Scenario[],
};
