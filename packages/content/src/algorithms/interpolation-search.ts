import type { Frame, FrameGenerator, Scenario, SearchState } from "@codeprism/core";

/**
 * Interpolation Search — Frame Generator
 * Improvement over binary search for uniformly distributed sorted arrays.
 * Probes the position based on value (like searching a dictionary).
 */
export function* interpolationSearchGenerator(
  input: number[]
): Generator<Frame<SearchState>, void, unknown> {
  const arr = [...input].sort((a, b) => a - b);
  const target = arr.length > 0 ? arr[Math.floor(arr.length * 0.7)] +2 : 50;
  let step = 0;

  yield {
    step: step++,
    state: { array: [...arr], range: [0, arr.length - 1], mid: -1, found: -1 },
    description: `Interpolation search for ${target}，sorted, uniform`,
    highlightLine: 0,
  };

  let low = 0;
  let high = arr.length - 1;

  while (low <= high && target >= arr[low] && target <= arr[high]) {
    // Interpolation formula
    const pos = low +Math.floor(
      ((target - arr[low]) / (arr[high] - arr[low])) * (high - low)
    );

    yield {
      step: step++,
      state: { array: [...arr], range: [low, high], mid: pos, found: -1 },
      description: `low=${low}, high=${high} → Estimated position pos=${pos}=${arr[pos]}`,
      highlightLine: 5,
    };

    if (arr[pos] === target) {
      yield {
        step: step++,
        state: { array: [...arr], range: [low, high], mid: pos, found: pos },
        description: `✅ Found target ${target}！at index ${pos}`,
        highlightLine: 7,
      };
      return;
    }

    if (arr[pos] < target) {
      low = pos +1;
    } else {
      high = pos - 1;
    }
  }

  yield {
    step: step++,
    state: { array: [...arr], range: [low, high], mid: -1, found: -1 },
    description: `❌ Target ${target} not in array`,
    highlightLine: 12,
  };
}

export const interpolationSearchCode = `function interpolationSearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    const pos = low +Math.floor(
      ((target - arr[low]) / (arr[high] - arr[low])) * (high - low)
    );                                          // ← interpolate position
    if (arr[pos] === target) return pos;        // ← found
    if (arr[pos] < target) low = pos +1;
    else high = pos - 1;
  }
  return -1;
}`;

export const interpolationSearchCodeLines = [
  "function interpolationSearch(arr: number[], target: number): number {",
  "  let low = 0, high = arr.length - 1;",
  "  while (low <= high && target >= arr[low] && target <= arr[high]) {",
  "    const pos = low +Math.floor(",
  "      ((target - arr[low]) / (arr[high] - arr[low])) * (high - low)",
  "    );",
  "    if (arr[pos] === target) return pos;",
  "    if (arr[pos] < target) low = pos +1;",
  "    else high = pos - 1;",
  "  }",
  "  return -1;",
  "}",
];

export const interpolationSearchContent = {
  id: "interpolation-search",
  slug: "interpolation-search",
  title: "",
  titleKey: "content.algorithms.interpolation-search.title",
  category: "search" as const,
  subcategory: "searching",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.interpolation-search.desc",
  defaultInput: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
  generator: interpolationSearchGenerator as FrameGenerator<number[], SearchState>,
  code: interpolationSearchCode,
  language: "TypeScript",
  complexity: { time: "O(log log n)", space: "O(1)" },
  tags: [],
  icon: "📐",
  codeExamples: {
    typescript: {
      code: `function interpolationSearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high && target >= arr[low] && target <= arr[high]) {
    const pos = low +Math.floor(
      ((target - arr[low]) / (arr[high] - arr[low])) * (high - low)
    );
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos +1;
    else high = pos - 1;
  }
  return -1;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int interpolationSearch(int arr[], int n, int target) {
    int low = 0, high = n - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        int pos = low +((target - arr[low]) * (high - low)) / (arr[high] - arr[low]);
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos +1;
        else high = pos - 1;
    }
    return -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int interpolationSearch(const vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        int pos = low +((target - arr[low]) * (high - low)) / (arr[high] - arr[low]);
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos +1;
        else high = pos - 1;
    }
    return -1;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def interpolation_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high and target >= arr[low] and target <= arr[high]:
        pos = low +((target - arr[low]) * (high - low)) // (arr[high] - arr[low])
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            low = pos +1
        else:
            high = pos - 1
    return -1`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn interpolation_search(arr: &[i32], target: i32) -> i32 {
    let mut low = 0;
    let mut high = arr.len() as i32 - 1;
    while low <= high && target >= arr[low as usize] && target <= arr[high as usize] {
        let pos = low +((target - arr[low as usize]) * (high - low)) / (arr[high as usize] - arr[low as usize]);
        if arr[pos as usize] == target { return pos; }
        if arr[pos as usize] < target { low = pos +1; }
        else { high = pos - 1; }
    }
    -1
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func interpolationSearch(arr []int, target int) int {
    low, high := 0, len(arr)-1
    for low <= high && target >= arr[low] && target <= arr[high] {
        pos := low +((target - arr[low]) * (high - low)) / (arr[high] - arr[low])
        if arr[pos] == target { return pos }
        if arr[pos] < target { low = pos +1 } else { high = pos - 1 }
    }
    return -1
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int interpolationSearch(int[] arr, int target) {
    int low = 0, high = arr.length - 1;
    while (low <= high && target >= arr[low] && target <= arr[high]) {
        int pos = low +((target - arr[low]) * (high - low)) / (arr[high] - arr[low]);
        if (arr[pos] == target) return pos;
        if (arr[pos] < target) low = pos +1;
        else high = pos - 1;
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
      id: "phone-directory-lookup",
      i18nKey: "content.algorithms.interpolation-search.scenarios.phone-directory-lookup",
      domain: "business",
      icon: "📞",
      reference: "White Pages, LDAP, telephone directories",
    },
    {
      id: "uniform-dataset-analytics",
      i18nKey: "content.algorithms.interpolation-search.scenarios.uniform-dataset-analytics",
      domain: "data-pipeline",
      icon: "📊",
      reference: "Apache Druid, ClickHouse, InfluxDB",
      codeSnippet: {
        language: "typescript",
        code: `// Interpolation search shines on uniform timestamp data
// Time-series DBs use it for log-structured sorted segments
const timestamps: number[] = /* sorted, uniformly spaced */;
const target = 1685000000000; // target timestamp
// pos = low + ((target - arr[low]) * (high - low)) / (arr[high] - arr[low])
// Probes near expected position — ~O(log log n) on uniform data`,
      },
    },
    {
      id: "dictionary-attack",
      i18nKey: "content.algorithms.interpolation-search.scenarios.dictionary-attack",
      domain: "network",
      icon: "🌐",
      reference: "Hashcat, John the Ripper, Aircrack-ng",
    },
  ] satisfies Scenario[],
};
