import type { Frame, FrameGenerator, Scenario, SearchState } from "@codeprism/core";

/**
 * Ternary Search — Frame Generator
 * Divides the sorted array into three equal parts using two mid points.
 * Reduces search range to 2/3 each iteration (vs 1/2 for binary search).
 */
export function* ternarySearchGenerator(
  input: number[]
): Generator<Frame<SearchState>, void, unknown> {
  const arr = [...input].sort((a, b) => a - b);
  const n = arr.length;
  const target = n > 0 ? arr[Math.min(2, n - 1)] +4 : 50;
  let step = 0;

  yield {
    step: step++,
    state: { array: [...arr], range: [0, n - 1], mid: -1, found: -1 },
    description: `Ternary search for ${target}`,
    highlightLine: 0,
  };

  let low = 0;
  let high = n - 1;

  while (low <= high) {
    const mid1 = low +Math.floor((high - low) / 3);
    const mid2 = high - Math.floor((high - low) / 3);

    yield {
      step: step++,
      state: { array: [...arr], range: [low, high], mid: mid1, found: -1 },
      description: `[${low}, ${high}] → mid1=${mid1}=${arr[mid1]}, mid2=${mid2}=${arr[mid2]}`,
      highlightLine: 3,
    };

    if (arr[mid1] === target) {
      yield {
        step: step++,
        state: { array: [...arr], range: [low, high], mid: mid1, found: mid1 },
        description: `✅ Found target ${target}！at index ${mid1}`,
        highlightLine: 5,
      };
      return;
    }

    if (arr[mid2] === target) {
      yield {
        step: step++,
        state: { array: [...arr], range: [low, high], mid: mid2, found: mid2 },
        description: `✅ Found target ${target}！at index ${mid2}`,
        highlightLine: 6,
      };
      return;
    }

    if (target < arr[mid1]) {
      high = mid1 - 1;
    } else if (target > arr[mid2]) {
      low = mid2 +1;
    } else {
      low = mid1 +1;
      high = mid2 - 1;
    }
  }

  yield {
    step: step++,
    state: { array: [...arr], range: [low, high], mid: -1, found: -1 },
    description: `❌ Target ${target} not in array`,
    highlightLine: 15,
  };
}

export const ternarySearchCode = `function ternarySearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid1 = low +Math.floor((high - low) / 3);   // ← first third point
    const mid2 = high - Math.floor((high - low) / 3);  // ← second third point

    if (arr[mid1] === target) return mid1;
    if (arr[mid2] === target) return mid2;

    if (target < arr[mid1])      high = mid1 - 1;      // [low, mid1-1]
    else if (target > arr[mid2]) low = mid2 +1;       // [mid2+1, high]
    else { low = mid1 +1; high = mid2 - 1; }          // [mid1+1, mid2-1]
  }
  return -1;
}`;

export const ternarySearchCodeLines = [
  "function ternarySearch(arr: number[], target: number): number {",
  "  let low = 0, high = arr.length - 1;",
  "  while (low <= high) {",
  "    const mid1 = low +Math.floor((high - low) / 3);",
  "    const mid2 = high - Math.floor((high - low) / 3);",
  "    if (arr[mid1] === target) return mid1;",
  "    if (arr[mid2] === target) return mid2;",
  "    if (target < arr[mid1])      high = mid1 - 1;",
  "    else if (target > arr[mid2]) low = mid2 +1;",
  "    else { low = mid1 +1; high = mid2 - 1; }",
  "  }",
  "  return -1;",
  "}",
];

export const ternarySearchContent = {
  id: "ternary-search",
  slug: "ternary-search",
  title: "",
  titleKey: "content.algorithms.ternary-search.title",
  category: "search" as const,
  subcategory: "searching",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.ternary-search.desc",
  defaultInput: [4, 12, 25, 33, 47, 51, 68, 72, 86, 93],
  generator: ternarySearchGenerator as FrameGenerator<number[], SearchState>,
  code: ternarySearchCode,
  language: "TypeScript",
  complexity: { time: "O(log₃ n)", space: "O(1)" },
  tags: [],
  icon: "📌",
  codeExamples: {
    typescript: {
      code: `function ternarySearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid1 = low +Math.floor((high - low) / 3);
    const mid2 = high - Math.floor((high - low) / 3);

    if (arr[mid1] === target) return mid1;
    if (arr[mid2] === target) return mid2;

    if (target < arr[mid1])
      high = mid1 - 1;
    else if (target > arr[mid2])
      low = mid2 +1;
    else
      { low = mid1 +1; high = mid2 - 1; }
  }
  return -1;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int ternarySearch(int arr[], int n, int target) {
  int low = 0, high = n - 1;
  while (low <= high) {
    int mid1 = low +(high - low) / 3;
    int mid2 = high - (high - low) / 3;

    if (arr[mid1] == target) return mid1;
    if (arr[mid2] == target) return mid2;

    if (target < arr[mid1])
      high = mid1 - 1;
    else if (target > arr[mid2])
      low = mid2 +1;
    else
      { low = mid1 +1; high = mid2 - 1; }
  }
  return -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int ternarySearch(vector<int> arr, int target) {
  int low = 0, high = arr.size() - 1;
  while (low <= high) {
    int mid1 = low +(high - low) / 3;
    int mid2 = high - (high - low) / 3;

    if (arr[mid1] == target) return mid1;
    if (arr[mid2] == target) return mid2;

    if (target < arr[mid1])
      high = mid1 - 1;
    else if (target > arr[mid2])
      low = mid2 +1;
    else
      { low = mid1 +1; high = mid2 - 1; }
  }
  return -1;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def ternary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid1 = low +(high - low) // 3
        mid2 = high - (high - low) // 3

        if arr[mid1] == target:
            return mid1
        if arr[mid2] == target:
            return mid2

        if target < arr[mid1]:
            high = mid1 - 1
        elif target > arr[mid2]:
            low = mid2 +1
        else:
            low = mid1 +1
            high = mid2 - 1
    return -1`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn ternary_search(arr: &[i32], target: i32) -> i32 {
    let mut low = 0;
    let mut high = arr.len() as i32 - 1;
    while low <= high {
        let mid1 = low +(high - low) / 3;
        let mid2 = high - (high - low) / 3;

        if arr[mid1 as usize] == target { return mid1; }
        if arr[mid2 as usize] == target { return mid2; }

        if target < arr[mid1 as usize] {
            high = mid1 - 1;
        } else if target > arr[mid2 as usize] {
            low = mid2 +1;
        } else {
            low = mid1 +1;
            high = mid2 - 1;
        }
    }
    -1
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func ternarySearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high {
        mid1 := low +(high-low)/3
        mid2 := high - (high-low)/3

        if arr[mid1] == target { return mid1 }
        if arr[mid2] == target { return mid2 }

        if target < arr[mid1] {
            high = mid1 - 1
        } else if target > arr[mid2] {
            low = mid2 +1
        } else {
            low = mid1 +1
            high = mid2 - 1
        }
    }
    return -1
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int ternarySearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high) {
        int mid1 = low +(high - low) / 3;
        int mid2 = high - (high - low) / 3;

        if (arr[mid1] == target) return mid1;
        if (arr[mid2] == target) return mid2;

 1])
            high = mid1 - 1;
        else if (target > arr[mid2])
            low = mid2 +1;
        else
            { low = mid1 +1; high = mid2 - 1; }
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
      id: "unimodal-optimization",
      i18nKey: "content.algorithms.ternary-search.scenarios.unimodal-optimization",
      domain: "ai-ml",
      icon: "🧠",
      reference: "TensorFlow, scikit-learn, Optuna",
      codeSnippet: {
        language: "python",
        code: `# Ternary search on a unimodal loss landscape (learning rate tuning)
def ternary_search(f, left, right, eps=1e-9):
    while right - left > eps:
        m1 = left + (right - left) / 3
        m2 = right - (right - left) / 3
        if f(m1) < f(m2):
            right = m2
        else:
            left = m1
    return (left + right) / 2`,
      },
    },
    {
      id: "game-physics-tuning",
      i18nKey: "content.algorithms.ternary-search.scenarios.game-physics-tuning",
      domain: "game-dev",
      icon: "🎮",
      reference: "Unity, Unreal Engine, Godot",
    },
    {
      id: "signal-peak-detection",
      i18nKey: "content.algorithms.ternary-search.scenarios.signal-peak-detection",
      domain: "graphics",
      icon: "📡",
      reference: "MATLAB, NumPy, SciPy",
    },
  ] satisfies Scenario[],
};
