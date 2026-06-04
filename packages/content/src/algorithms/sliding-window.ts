import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Sliding Window — Maximum Sum Subarray of Size K
 * Yields Frame<SortState> with step, state, description, and highlightLine.
 *
 * Input encoding: [k, ...arr] where k = window size, arr = data array.
 * State mapping:
 *   array     → the data array
 *   comparing → indices inside the current window
 *   swapping  → element being added/removed during a slide
 *   sorted    → indices of the best window found so far (final result)
 */
export function* slidingWindowGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const k = input[0];
  const arr = input.slice(1);
  const n = arr.length;
  let step = 0;

  // ── Initial state ──
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
    },
    description: `Initial array: [${arr.join(", ")}], k=${k}`,
    highlightLine: 0,
  };

  if (k <= 0 || k > n) {
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [],
      },
      description: `Window k=${k} invalid(len=${n}), cannot run`,
      highlightLine: 0,
    };
    return;
  }

  // ── Build the first window ──
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [],
        swapping: [i],
        sorted: [],
      },
      description: `Init window: add arr[${i}]=${arr[i]}, sum=${windowSum}`,
      highlightLine: 3,
    };
  }

  let maxSum = windowSum;
  let maxStart = 0;

  // Show the first complete window
  const firstWindow = Array.from({ length: k }, (_, i) => i);
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [...firstWindow],
      swapping: [],
      sorted: [],
    },
    description: `Window [0..${k - 1}]  of and = ${windowSum}, currentmaximumand = ${maxSum}`,
    highlightLine: 5,
  };

  // ── Slide the window ──
  for (let i = k; i < n; i++) {
    const removed = arr[i - k];
    const added = arr[i];
    windowSum = windowSum - removed +added;

    // Show the slide operation
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [i - k, i],
        swapping: [],
        sorted: [],
      },
      description: `Slide: remove arr[${i - k}]=${removed}, Add arr[${i}]=${added}, sum=${windowSum}`,
      highlightLine: 7,
    };

    // Show the new window
    const newWindow = Array.from({ length: k }, (_, j) => i - k +1 +j);
    const updated = windowSum > maxSum;
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [...newWindow],
        swapping: [],
        sorted: [],
      },
      description: `Current window [${i - k +1}..${i}]  of and = ${windowSum}${updated ? ` > ${maxSum}, Update maximum sum!` : ` ≤ ${maxSum}, not update`}`,
      highlightLine: 8,
    };

    if (updated) {
      maxSum = windowSum;
      maxStart = i - k +1;
    }
  }

  // ── Final result ──
  const resultIndices = Array.from({ length: k }, (_, j) => maxStart +j);
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...resultIndices],
    },
    description: `complete ✅ max subarray sum = ${maxSum}, position [${maxStart}..${maxStart +k - 1}]`,
    highlightLine: 10,
  };
}

/** Code snippet for display */
export const slidingWindowCode = `function maxSubarraySum(arr: number[], k: number): number {
  let windowSum = 0;
  for (let i = 0; i < k; i++) {        // ← Initialize first window
    windowSum += arr[i];
  }
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];  // ← Slide window
    maxSum = Math.max(maxSum, windowSum); // ← Update maximum sum
  }
  return maxSum;
}`;

export const slidingWindowCodeLines = [
  "function maxSubarraySum(arr: number[], k: number): number {",
  "  let windowSum = 0;",
  "  for (let i = 0; i < k; i++) {        // ← Initialize first window",
  "    windowSum += arr[i];",
  "  }",
  "  let maxSum = windowSum;",
  "  for (let i = k; i < arr.length; i++) {",
  "    windowSum += arr[i] - arr[i - k];  // ← Slide window",
  "    maxSum = Math.max(maxSum, windowSum); // ← Update maximum sum",
  "  }",
  "  return maxSum;",
  "}",
];

/** Content definition */
export const slidingWindowContent = {
  id: "sliding-window",
  slug: "sliding-window",
  title: "",
  titleKey: "content.algorithms.sliding-window.title",
  category: "algorithm" as const,
  subcategory: "technique",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.sliding-window.desc",
  defaultInput: [3, 2, 3, 4, 6, 5, 1, 8, 7],
  generator: slidingWindowGenerator as FrameGenerator<number[], SortState>,
  code: slidingWindowCode,
  language: "TypeScript",
  complexity: { time: "O(n)", space: "O(1)" },
  tags: [],
  icon: "🪟",
  codeExamples: {
    typescript: {
      code: `function maxSubarraySum(arr: number[], k: number): number {
  let windowSum = 0;
  for (let i = 0; i < k; i++) {        // ← Initialize first window
    windowSum += arr[i];
  }
  let maxSum = windowSum;
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];  // ← Slide window
    maxSum = Math.max(maxSum, windowSum); // ← Update maximum sum
  }
  return maxSum;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int maxSubarraySum(int arr[], int n, int k) {
  int windowSum = 0;
  for (int i = 0; i < k; i++) {        // ← Initialize first window
    windowSum += arr[i];
  }
  int maxSum = windowSum;
  for (int i = k; i < n; i++) {
    windowSum += arr[i] - arr[i - k];  // ← Slide window
    if (windowSum > maxSum)            // ← Update maximum sum
      maxSum = windowSum;
  }
  return maxSum;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int maxSubarraySum(vector<int>& arr, int k) {
  int windowSum = 0;
  for (int i = 0; i < k; i++) {        // ← Initialize first window
    windowSum += arr[i];
  }
  int maxSum = windowSum;
  for (int i = k; i < arr.size(); i++) {
    windowSum += arr[i] - arr[i - k];  // ← Slide window
    maxSum = max(maxSum, windowSum);   // ← Update maximum sum
  }
  return maxSum;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def max_subarray_sum(arr, k):
    window_sum = sum(arr[:k])           # ← Initialize first window
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]  # ← Slide window
        max_sum = max(max_sum, window_sum)  # ← Update maximum sum
    return max_sum`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn max_subarray_sum(arr: &[i32], k: usize) -> i32 {
    let mut window_sum: i32 = arr[..k].iter().sum(); // ← Initialize first window
    let mut max_sum = window_sum;
    for i in k..arr.len() {
        window_sum += arr[i] - arr[i - k];   // ← Slide window
        max_sum = max_sum.max(window_sum);   // ← Update maximum sum
    }
    max_sum
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func maxSubarraySum(arr []int, k int) int {
    windowSum := 0
    for i := 0; i < k; i++{            // ← Initialize first window
        windowSum += arr[i]
    }
    maxSum := windowSum
    for i := k; i < len(arr); i++{
        windowSum += arr[i] - arr[i-k]  // ← Slide window
        if windowSum > maxSum {          // ← Update maximum sum
            maxSum = windowSum
        }
    }
    return maxSum
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int maxSubarraySum(int[] arr, int k) {
    int windowSum = 0;
    for (int i = 0; i < k; i++) {        // ← Initialize first window
        windowSum += arr[i];
    }
    int maxSum = windowSum;
    for (int i = k; i < arr.length; i++) {
        windowSum += arr[i] - arr[i - k];  // ← Slide window
        maxSum = Math.max(maxSum, windowSum); // ← Update maximum sum
    }
    return maxSum;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "rate-limiting",
      i18nKey: "content.algorithms.sliding-window.scenarios.rate-limiting",
      domain: "network",
      icon: "🛡️",
      reference: "Nginx, Cloudflare, AWS WAF",
    },
    {
      id: "stock-moving-avg",
      i18nKey: "content.algorithms.sliding-window.scenarios.stock-moving-avg",
      domain: "business",
      icon: "💰",
      reference: "Yahoo Finance, Bloomberg, TradingView",
    },
    {
      id: "log-analysis",
      i18nKey: "content.algorithms.sliding-window.scenarios.log-analysis",
      domain: "data-pipeline",
      icon: "📊",
      codeSnippet: {
        language: "typescript",
        code: `// ELK-style windowed aggregation: error rate over 5-minute buckets
function errorRateWindow(logs: { timestamp: number; isError: boolean }[], windowMs: number): number[] {
  const result: number[] = [];
  let errorCount = 0;
  let left = 0;
  for (let right = 0; right < logs.length; right++) {
    if (logs[right].isError) errorCount++;
    while (logs[right].timestamp - logs[left].timestamp > windowMs) {
      if (logs[left].isError) errorCount--;
      left++;
    }
    result.push(errorCount / (right - left + 1));
  }
  return result;
}`,
      },
    },
  ] satisfies Scenario[],
};
