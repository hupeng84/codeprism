import type { Frame, FrameGenerator, Scenario, SearchState } from "@codeprism/core";

/**
 * Linear Search — Frame Generator
 * Sequentially checks each element until the target is found or the end is reached.
 */
export function* linearSearchGenerator(
  input: number[]
): Generator<Frame<SearchState>, void, unknown> {
  const arr = [...input];
  // Pick a target that exists (middle element)
  const target = arr.length > 0 ? arr[Math.floor(arr.length / 2)] : 42;
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
    description: `Linear search for ${target}，length ${arr.length}`,
    highlightLine: 0,
  };

  for (let i = 0; i < arr.length; i++) {
    yield {
      step: step++,
      state: {
        array: [...arr],
        range: [i, arr.length - 1],
        mid: i,
        found: -1,
      },
      description: `Check arr[${i}]=${arr[i]}${arr[i] === target ? " ← target！" : ""}`,
      highlightLine: 3,
    };

    if (arr[i] === target) {
      yield {
        step: step++,
        state: {
          array: [...arr],
          range: [i, arr.length - 1],
          mid: i,
          found: i,
        },
        description: `✅ Found target ${target}！at index ${i}`,
        highlightLine: 4,
      };
      return;
    }
  }

  // Not found
  yield {
    step: step++,
    state: {
      array: [...arr],
      range: [0, arr.length - 1],
      mid: -1,
      found: -1,
    },
    description: `❌ Target ${target} not in array`,
    highlightLine: 7,
  };
}

/** Code snippet for display */
export const linearSearchCode = `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target)       // ← compare each
      return i;                  // ← return index
  }
  return -1;                     // ← not found
}`;

export const linearSearchCodeLines = [
  "function linearSearch(arr: number[], target: number): number {",
  "  for (let i = 0; i < arr.length; i++) {",
  "    if (arr[i] === target)       // ← compare each",
  "      return i;                  // ← return index",
  "  }",
  "  return -1;                     // ← not found",
  "}",
];

/** Content definition */
export const linearSearchContent = {
  id: "linear-search",
  slug: "linear-search",
  title: "",
  titleKey: "content.algorithms.linear-search.title",
  category: "search" as const,
  subcategory: "searching",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.algorithms.linear-search.desc",
  defaultInput: [42, 15, 7, 30, 22, 18, 9],
  generator: linearSearchGenerator as FrameGenerator<number[], SearchState>,
  code: linearSearchCode,
  language: "TypeScript",
  complexity: { time: "O(n)", space: "O(1)" },
  tags: [],
  icon: "🔎",
  codeExamples: {
    typescript: {
      code: `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target)
      return i;
  }
  return -1;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target)
            return i;
    }
    return -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target)
            return i;
    }
    return -1;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn linear_search(arr: &[i32], target: i32) -> i32 {
    for (i, &val) in arr.iter().enumerate() {
        if val == target { return i as i32; }
    }
    -1
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func linearSearch(arr []int, target int) int {
    for i, v := range arr {
        if v == target { return i }
    }
    return -1
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
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
      id: "small-array-optimization",
      i18nKey: "content.algorithms.linear-search.scenarios.small-array-optimization",
      domain: "system",
      icon: "⚡",
      reference: "V8 engine, libstdc++, LLVM libc",
      codeSnippet: {
        language: "cpp",
        code: `// libstdc++ std::find uses linear scan for small ranges (<32)
// Binary search overhead > linear scan for tiny arrays
template<typename Iter, typename T>
Iter find(Iter first, Iter last, const T& val) {
  for (; first != last; ++first)
    if (*first == val) return first;
  return last;
}`,
      },
    },
    {
      id: "linked-list-traversal",
      i18nKey: "content.algorithms.linear-search.scenarios.linked-list-traversal",
      domain: "library",
      icon: "🔗",
      reference: "Java LinkedList, C++ std::list, Rust VecDeque",
    },
    {
      id: "debug-hex-search",
      i18nKey: "content.algorithms.linear-search.scenarios.debug-hex-search",
      domain: "devtools",
      icon: "🔍",
      reference: "GDB, hexdump, Wireshark",
    },
  ] satisfies Scenario[],
};
