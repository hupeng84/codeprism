import type { Frame, FrameGenerator, Scenario, SearchState } from "@codeprism/core";

/**
 * Binary Search — Frame Generator
 * Searches for a target value in a sorted array by repeatedly dividing the search range in half.
 */
export function* binarySearchGenerator(
  input: number[]
): Generator<Frame<SearchState>, void, unknown> {
  const arr = [...input].sort((a, b) => a - b);
  // Pick a target that may or may not exist to exercise both paths
  const target = arr.length > 0 ? arr[Math.floor(arr.length / 2)] +1 : 50;
  let step = 0;

  // Initial state
  yield {
    step: step++,
    state: {
      array: [...arr],
      range: [0, arr.length - 1],
      mid: -1,
      found: -1,
    },
    description: `Binary searching for target ${target}。Initial range: [0, ${arr.length - 1}]`,
    highlightLine: 0,
  };

  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low +high) / 2);

    yield {
      step: step++,
      state: {
        array: [...arr],
        range: [low, high],
        mid,
        found: -1,
      },
      description: `Compute midpoint: low=${low}, high=${high}, mid=${mid}=${arr[mid]}`,
      highlightLine: 6,
    };

    if (arr[mid] === target) {
      yield {
        step: step++,
        state: {
          array: [...arr],
          range: [low, high],
          mid,
          found: mid,
        },
        description: `✅ Found target ${target}！at index ${mid}`,
        highlightLine: 7,
      };
      return;
    }

    yield {
      step: step++,
      state: {
        array: [...arr],
        range: [low, high],
        mid,
        found: -1,
      },
      description: `${target} ${target > arr[mid] ? ">" : "<"} arr[${mid}]=${arr[mid]} → ${target > arr[mid] ? "narrow to right half" : "narrow to left half"}`,
      highlightLine: 8,
    };

    if (target > arr[mid]) {
      low = mid +1;
    } else {
      high = mid - 1;
    }
  }

  // Not found
  yield {
    step: step++,
    state: {
      array: [...arr],
      range: [low, high],
      mid: -1,
      found: -1,
    },
    description: `❌ Target ${target} not in array`,
    highlightLine: 11,
  };
}

// ── Code display ──

export const binarySearchCode = `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low +high) / 2);    // ← compute midpoint

    if (arr[mid] === target) return mid;          // ← found target
    if (target > arr[mid])
      low = mid +1;                              // ← search right half
    else
      high = mid - 1;                             // ← search left half
  }

  return -1;  // Not found
}`;

export const binarySearchCodeLines = [
  "function binarySearch(arr: number[], target: number): number {",
  "  let low = 0;",
  "  let high = arr.length - 1;",
  "",
  "  while (low <= high) {",
  '    const mid = Math.floor((low +high) / 2);    // ← compute midpoint',
  "",
  '    if (arr[mid] === target) return mid;          // ← found target',
  "    if (target > arr[mid])",
  '      low = mid +1;                              // ← search right half',
  "    else",
  '      high = mid - 1;                             // ← search left half',
  "  }",
  "",
  "  return -1;  // Not found",
  "}",
];

// ── Content definition ──

export const binarySearchContent = {
  id: "binary-search",
  slug: "binary-search",
  title: "",
  titleKey: "content.algorithms.binary-search.title",
  category: "search" as const,
  subcategory: "searching",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.algorithms.binary-search.desc",
  defaultInput: [3, 9, 12, 17, 25, 33, 42, 56, 64, 78, 85],
  generator: binarySearchGenerator as FrameGenerator<number[], SearchState>,
  code: binarySearchCode,
  language: "TypeScript",
  complexity: { time: "O(log n)", space: "O(1)" },
  tags: [],
  icon: "🔍",
  codeExamples: {
    typescript: {
      code: `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low +high) / 2);
    if (arr[mid] === target) return mid;
    if (target > arr[mid])
      low = mid +1;
    else
      high = mid - 1;
  }

  return -1;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int binarySearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high) {
        int mid = low +(high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid +1;
        else high = mid - 1;
    }
    return -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int binarySearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low +(high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid +1;
        else high = mid - 1;
    }
    return -1;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low +high) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < t      else:
            high = mid - 1
    return -1`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn binary_search(arr: &[i32], target: i32) -> i32 {
    let mut low = 0;
    let mut high = arr.len() as i32 - 1;
    while low <= high {
        let mid = low +(high - low) / 2;
        if arr[mid as usize] == target { return mid; }
        if arr[mid as usize] < target { low = mid +1; }
        else { high = mid - 1; }
    }
    -1
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func binarySearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high {
        mid := low +(high-low)/2
        if arr[mid] == target { return mid }
        if arr[mid] < target { low = mid +1 } else { high = mid - 1 }
    }
    return -1
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int binarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid = low +(high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid +1;
        else high = mid - 1;
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
      id: "v8-array-indexof",
      i18nKey: "content.algorithms.binary-search.scenarios.v8-array-indexof",
      domain: "system",
      icon: "⚡",
      reference: "V8 engine, SpiderMonkey, JavaScriptCore",
      codeSnippet: {
        language: "javascript",
        code: `// V8 optimizes indexOf on sorted arrays with binary search
// internally uses %ArrayIndexOf for O(log n) on sorted data
const sorted = [1, 3, 5, 7, 9, 11, 13];
// Binary search under the hood when array is detected as sorted
sorted.indexOf(7); // → 3`,
      },
    },
    {
      id: "git-bisect",
      i18nKey: "content.algorithms.binary-search.scenarios.git-bisect",
      domain: "devtools",
      icon: "🔧",
      reference: "Git, LLVM Bugpoint, Chrome Bisect",
    },
    {
      id: "btree-index",
      i18nKey: "content.algorithms.binary-search.scenarios.btree-index",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL B-tree, InnoDB, LMDB",
      codeSnippet: {
        language: "sql",
        code: `-- B-tree index uses binary search on each page node
-- PostgreSQL binary search on ~400 keys per internal page
CREATE INDEX idx_users_email ON users(email);
-- Lookup: traverse B-tree levels, binary search each page
SELECT * FROM users WHERE email = 'alice@example.com';`,
      },
    },
  ] satisfies Scenario[],
};
