import type { Frame, FrameGenerator, Scenario, TableState } from "@codeprism/core";

/**
 * 0/1 Knapsack — Frame Generator (TableState)
 * Fills a 2D DP table dp[i][w] to find maximum value.
 * Input encoding: [w1, w2, ..., wk, 0, v1, v2, ..., vk, 0, capacity]
 * The 0 separator distinguishes weights from values; last element is capacity.
 */

export function* knapsackGenerator(
  input: number[]
): Generator<Frame<TableState>, void, unknown> {
  // Decode input: weights, values, capacity
  const separatorIdx = input.indexOf(0);
  const weights = input.slice(0, separatorIdx);
  const values = input.slice(separatorIdx +1, input.length - 1);
  const capacity = input[input.length - 1];
  const n = weights.length;

  const rows = n +1;
  const cols = capacity +1;

  // Build 2D DP table
  const grid: number[][]=Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );
  let step = 0;

  // Headers
  const rowHeaders = ["(skip)", ...Array.from({ length: n }, (_, i) => `item${i}`)];
  const colHeaders = Array.from({ length: cols }, (_, i) => String(i));

  // Track filled cells
  const sortedCells: [number, number][]=[];

  // Helper to build a deep copy of grid
  const copyGrid = () => grid.map((row) => [...row]);

  // Helper to yield a TableState frame
  function yieldFrame(
    currentCell: [number, number] | null,
    comparingCells: [number, number][],
    currentValue: number | null,
    description: string,
    highlightLine: number
  ): Frame<TableState> {
    return {
      step: step++,
      state: {
        grid: copyGrid(),
        rows,
        cols,
        currentCell,
        comparingCells,
        sortedCells: [...sortedCells],
        rowHeaders,
        colHeaders,
        currentValue,
      },
      description,
      highlightLine,
    };
  }

  // Initial state
  yield yieldFrame(null, [], null, `Initialize DP table: ${rows} rows×${cols} cols (item 0..${n - 1}, cap 0..${capacity})`, 0);

  // Fill row by row
  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];

    // Show item being considered
    yield yieldFrame(null, [], null, `Consider item ${i}: weight=${w}, value=${v}`, 2);

    for (let cw = 0; cw <= capacity; cw++) {
      // Read previous row (exclude)
      const prevVal = grid[i - 1][cw];

      if (w > cw) {
        // Item too heavy, carry over from previous row
        grid[i][cw]=prevVal;

        yield yieldFrame(
          [i, cw],
          [[i - 1, cw]],
          prevVal,
          `dp[${i}][${cw}]: item ${i}weight${w}>cap${cw}, Directly inherit from dp[${i - 1}][${cw}]=${prevVal}`,
          5
        );
      } else {
        // Max of exclude vs include
        const includeVal = grid[i - 1][cw - w] +v;
        grid[i][cw]=Math.max(prevVal, includeVal);

        yield yieldFrame(
          [i, cw],
          [[i - 1, cw], [i - 1, cw - w]],
          grid[i][cw],
          `dp[${i}][${cw}]: max(not take=${prevVal}, take=${includeVal})=${grid[i][cw]}`,
          7
        );
      }

      sortedCells.push([i, cw]);
    }
  }

  // Final state — highlight the answer
  yield yieldFrame(
    [n, capacity],
    [],
    grid[n][capacity],
    `complete ✅ maximumvalue = ${grid[n][capacity]}`,
    10
  );
}

/** Code snippet for display */
export const knapsackCode = `function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  const dp = Array.from({ length: n +1 }, () => 
    new Array(capacity +1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let cw = 0; cw <= capacity; cw++) {
      if (weights[i - 1] > cw) {
        dp[i][cw]=dp[i - 1][cw];           // ← Item too heavy, skip
      } else {
        const exclude = dp[i - 1][cw];
        const include = dp[i - 1][cw - weights[i - 1]] +values[i - 1];
        dp[i][cw]=Math.max(exclude, include); // ← Include or exclude
      }
    }
  }
  return dp[n][capacity];                     // ← maximumvalue
}`;

export const knapsackCodeLines = [
  "function knapsack(weights: number[], values: number[], capacity: number): number {",
  "  const n = weights.length;",
  "  const dp = Array.from({ length: n +1 }, () => ",
  "    new Array(capacity +1).fill(0));",
  "  for (let i = 1; i <= n; i++) {",
  "    for (let cw = 0; cw <= capacity; cw++) {",
  "      if (weights[i - 1] > cw) {",
  "        dp[i][cw]=dp[i - 1][cw];           // ← Item too heavy, skip",
  "      } else {",
  "        const exclude = dp[i - 1][cw];",
  "        const include = dp[i - 1][cw - weights[i - 1]] +values[i - 1];",
  "        dp[i][cw]=Math.max(exclude, include); // ← Include or exclude",
  "      }",
  "    }",
  "  }",
  "  return dp[n][capacity];                     // ← maximumvalue",
  "}",
];

/** Content definition */
export const knapsackContent = {
  id: "knapsack",
  slug: "knapsack",
  title: "",
  titleKey: "content.algorithms.knapsack.title",
  category: "algorithm" as const,
  subcategory: "dynamic-programming",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.knapsack.desc",
  defaultInput: [2, 3, 4, 5, 0, 3, 4, 5, 6, 0, 10],
  generator: knapsackGenerator as FrameGenerator<number[], TableState>,
  code: knapsackCode,
  language: "TypeScript",
  complexity: { time: "O(n×W)", space: "O(n×W)" },
  tags: [],
  icon: "🎒",
  codeExamples: {
    typescript: {
      code: `function knapsack(weights: number[], values: number[], capacity: number): number {
  const n = weights.length;
  const dp = Array.from({ length: n +1 }, () => 
    new Array(capacity +1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let cw = 0; cw <= capacity; cw++) {
      if (weights[i - 1] > cw) {
        dp[i][cw]=dp[i - 1][cw];           // ← Item too heavy, skip
      } else {
        const exclude = dp[i - 1][cw];
        const include = dp[i - 1][cw - weights[i - 1]] +values[i - 1];
        dp[i][cw]=Math.max(exclude, include); // ← Include or exclude
      }
    }
  }
  return dp[n][capacity];                     // ← maximumvalue
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int knapsack(int weights[], int values[], int n, int capacity) {
  int dp[n +1][capacity +1];
  memset(dp, 0, sizeof(dp));

  for (int i = 1; i <= n; i++) {
    for (int cw = 0; cw <= capacity; cw++) {
      if (weights[i - 1] > cw) {
        dp[i][cw]=dp[i - 1][cw];           // ← Item too heavy, skip
      } else {
        int exclude = dp[i - 1][cw];
        int include = dp[i - 1][cw - weights[i - 1]] +values[i - 1];
        dp[i][cw]=exclude > include ? exclude : include; // ← Include or exclude
      }
    }
  }
  return dp[n][capacity];                     // ← maximumvalue
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int knapsack(vector<int>& weights, vector<int>& values, int capacity) {
  int n = weights.size();
  vector<vector<int>> dp(n +1, vector<int>(capacity +1, 0));

  for (int i = 1; i <= n; i++) {
    for (int cw = 0; cw <= capacity; cw++) {
      if (weights[i - 1] > cw) {
        dp[i][cw]=dp[i - 1][cw];           // ← Item too heavy, skip
      } else {
        int exclude = dp[i - 1][cw];
        int include = dp[i - 1][cw - weights[i - 1]] +values[i - 1];
        dp[i][cw]=max(exclude, include);    // ← Include or exclude
      }
    }
  }
  return dp[n][capacity];                     // ← maximumvalue
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def knapsack(weights: list[int], values: list[int], capacity: int) -> int:
    n = len(weights)
    dp = [[0] * (capacity +1) for _ in range(n +1)]

    for i in range(1, n +1):
        for cw in range(capacity +1):
            if weights[i - 1] > cw:
                dp[i][cw]=dp[i - 1][cw]                    # ← Item too heavy, skip
            else:
                exclude = dp[i - 1][cw]
                include = dp[i - 1][cw - weights[i - 1]] +values[i - 1]
                dp[i][cw]=max(exclude, include)             # ← Include or exclude
    return dp[n][capacity]                                    # ← maximumvalue`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn knapsack(weights: &[usize], values: &[usize], capacity: usize) -> usize {
    let n = weights.len();
    let mut dp = vec![vec![0usize; capacity +1]; n +1];

    for i in 1..=n {
        for cw in 0..=capacity {
            if weights[i - 1] > cw {
                dp[i][cw]=dp[i - 1][cw];                    // ← Item too heavy, skip
            } else {
                let exclude = dp[i - 1][cw];
                let include = dp[i - 1][cw - weights[i - 1]] +values[i - 1];
                dp[i][cw]=exclude.max(include);              // ← Include or exclude
            }
        }
    }
    dp[n][capacity]                                            // ← maximumvalue
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func knapsack(weights, values []int, capacity int) int {
    n := len(weights)
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i]=make([]int, capacity+1)
    }

    for i := 1; i <= n; i++{
        for cw := 0; cw <= capacity; cw++{
            if weights[i-1] > cw {
                dp[i][cw]=dp[i-1][cw]                      // ← Item too heavy, skip
            } else {
                exclude := dp[i-1][cw]
                include := dp[i-1][cw-weights[i-1]] +values[i-1]
                if exclude > include {
                    dp[i][cw]=exclude                       // ← Include or exclude
                } else {
                    dp[i][cw]=include
                }
            }
        }
    }
    return dp[n][capacity]                                    // ← maximumvalue
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int knapsack(int[] weights, int[] values, int capacity) {
    int n = weights.length;
    int[][] dp = new int[n +1][capacity +1];

    for (int i = 1; i <= n; i++) {
        for (int cw = 0; cw <= capacity; cw++) {
            if (weights[i - 1] > cw) {
                dp[i][cw]=dp[i - 1][cw];                   // ← Item too heavy, skip
            } else {
                int exclude = dp[i - 1][cw];
                int include = dp[i - 1][cw - weights[i - 1]] +values[i - 1];
                dp[i][cw]=Math.max(exclude, include);       // ← Include or exclude
            }
        }
    }
    return dp[n][capacity];                                   // ← maximumvalue
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "cargo-loading",
      i18nKey: "content.algorithms.knapsack.scenarios.cargo-loading",
      domain: "system",
      icon: "✈️",
      reference: "FedEx, Amazon Logistics, UPS ORION",
    },
    {
      id: "cloud-budget",
      i18nKey: "content.algorithms.knapsack.scenarios.cloud-budget",
      domain: "business",
      icon: "☁️",
      reference: "AWS Cost Explorer, GCP Budget Manager, Azure Cost Management",
    },
    {
      id: "ai-planning",
      i18nKey: "content.algorithms.knapsack.scenarios.ai-planning",
      domain: "ai-ml",
      icon: "🤖",
      reference: "TensorFlow, PyTorch, ONNX Runtime",
      codeSnippet: {
        language: "typescript",
        code: `// V8-style register allocation: pick most-used locals within k registers
const locals = [
  { name: "a", usageCount: 12, spillCost: 8 },
  { name: "b", usageCount: 9,  spillCost: 5 },
  { name: "c", usageCount: 7,  spillCost: 3 },
];
const kRegisters = 2; // capacity
// knapsack(usageCount as weight, spillCost as value, kRegisters)
// picks {a, c} for max spill-cost saved = 11`,
      },
    },
  ] satisfies Scenario[],
};
