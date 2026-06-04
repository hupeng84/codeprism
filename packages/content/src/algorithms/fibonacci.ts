import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Fibonacci Sequence — Bottom-up DP Frame Generator
 * Fills a DP table from left to right to compute fib(n).
 * Input: number[] where input[0]=n
 */

export function* fibonacciGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const n = Math.max(1, Math.min(input[0] ?? 10, 20));
  const dp: number[]=new Array(n +1).fill(-1);
  let step = 0;

  // Initial state — empty DP table
  yield {
    step: step++,
    state: {
      array: dp.map((v) => (v === -1 ? 0 : v)),
      comparing: [],
      swapping: [],
      sorted: [],
    },
    description: `Initialize DP table: dp[0..${n}]=[${dp.map(() => 0).join(", ")}]`,
    highlightLine: 0,
  };

  // Base case: dp[0]=0
  dp[0]=0;
  yield {
    step: step++,
    state: {
      array: [...dp],
      comparing: [],
      swapping: [0],
      sorted: [],
    },
    description: `Set base case: dp[0]=0`,
    highlightLine: 2,
  };

  if (n >= 1) {
    // Base case: dp[1]=1
    dp[1]=1;
    yield {
      step: step++,
      state: {
        array: [...dp],
        comparing: [],
        swapping: [1],
        sorted: [0],
      },
      description: `Set base case: dp[1]=1`,
      highlightLine: 3,
    };
  }

  // Fill dp[2] to dp[n]
  for (let i = 2; i <= n; i++) {
    // Show the two values we're reading
    yield {
      step: step++,
      state: {
        array: [...dp],
        comparing: [i - 2, i - 1],
        swapping: [],
        sorted: Array.from({ length: i }, (_, k) => k),
      },
      description: `Read dp[${i - 2}]=${dp[i - 2]} and dp[${i - 1}]=${dp[i-1]}`,
      highlightLine: 6,
    };

    dp[i]=dp[i - 1] +dp[i - 2];

    // Show the computed value
    yield {
      step: step++,
      state: {
        array: [...dp],
        comparing: [],
        swapping: [i],
        sorted: Array.from({ length: i }, (_, k) => k),
      },
      description: `compute dp[${i}]=dp[${i - 1}] +dp[${i - 2}]=${dp[i-1]} +${dp[i - 2]} = ${dp[i]}`,
      highlightLine: 7,
    };
  }

  // Final state
  yield {
    step: step++,
    state: {
      array: [...dp],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n +1 }, (_, k) => k),
    },
    description: `complete ✅ fib(${n})=${dp[n]}，DP table: [${dp.join(", ")}]`,
    highlightLine: 9,
  };
}

/** Code snippet for display */
export const fibonacciCode = `function fibonacci(n: number): number[] {
  const dp = new Array(n +1).fill(0);
  dp[0]=0;                              // ← base case
  if (n >= 1) dp[1]=1;                  // ← base case
  for (let i = 2; i <= n; i++) {
    const val1 = dp[i - 2];               // ← Read subproblem
    const val2 = dp[i - 1];               // ← Read subproblem
    dp[i]=val1 +val2;                  // ← State transition
  }
  return dp;                              // ← Return result
}`;

export const fibonacciCodeLines = [
  "function fibonacci(n: number): number[] {",
  "  const dp = new Array(n +1).fill(0);",
  "  dp[0]=0;                              // ← base case",
  "  if (n >= 1) dp[1]=1;                  // ← base case",
  "  for (let i = 2; i <= n; i++) {",
  "    const val1 = dp[i - 2];               // ← Read subproblem",
  "    const val2 = dp[i - 1];               // ← Read subproblem",
  "    dp[i]=val1 +val2;                  // ← State transition",
  "  }",
  "  return dp;                              // ← Return result",
  "}",
];

/** Content definition */
export const fibonacciContent = {
  id: "fibonacci",
  slug: "fibonacci",
  title: "",
  titleKey: "content.algorithms.fibonacci.title",
  category: "algorithm" as const,
  subcategory: "dynamic-programming",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.algorithms.fibonacci.desc",
  defaultInput: [10],
  generator: fibonacciGenerator as FrameGenerator<number[], SortState>,
  code: fibonacciCode,
  language: "TypeScript",
  complexity: { time: "O(n)", space: "O(n)" },
  tags: [],
  icon: "🐚",
  codeExamples: {
    typescript: {
      code: `function fibonacci(n: number): number[] {
  const dp = new Array(n +1).fill(0);
  dp[0]=0;                              // ← base case
  if (n >= 1) dp[1]=1;                  // ← base case
  for (let i = 2; i <= n; i++) {
    dp[i]=dp[i - 1] +dp[i - 2];       // ← State transition
  }
  return dp;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void fibonacci(int n, int dp[]) {
  dp[0]=0;                              // ← base case
  if (n >= 1) dp[1]=1;                  // ← base case
  for (int i = 2; i <= n; i++) {
    dp[i]=dp[i - 1] +dp[i - 2];       // ← State transition: f(i)=f(i-1) +f(i-2)
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `vector<int> fibonacci(int n) {
  vector<int> dp(n +1, 0);
  dp[0]=0;                              // ← base case
  if (n >= 1) dp[1]=1;                  // ← base case
  for (int i = 2; i <= n; i++) {
    dp[i]=dp[i - 1] +dp[i - 2];       // ← State transition: f(i)=f(i-1) +f(i-2)
  }
  return dp;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def fibonacci(n: int) -> list[int]:
    dp = [0] * (n +1)
    dp[0]=0                              # ← base case
    if n >= 1:
        dp[1]=1                          # ← base case
    for i in range(2, n +1):
        dp[i]=dp[i - 1] +dp[i - 2]    # ← State transition: f(i)=f(i-1) +f(i-2)
    return dp`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn fibonacci(n: usize) -> Vec<usize> {
    let mut dp = vec![0usize; n +1];
    dp[0]=0;                              // ← base case
    if n >= 1 { dp[1]=1; }               // ← base case
    for i in 2..=n {
        dp[i]=dp[i - 1] +dp[i - 2];    // ← State transition: f(i)=f(i-1) +f(i-2)
    }
    dp
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func fibonacci(n int) []int {
    dp := make([]int, n+1)
    dp[0]=0                              // ← base case
    if n >= 1 { dp[1]=1 }               // ← base case
    for i := 2; i <= n; i++{
        dp[i]=dp[i-1] +dp[i-2]         // ← State transition: f(i)=f(i-1) +f(i-2)
    }
    return dp
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int[] fibonacci(int n) {
    int[] dp = new int[n +1];
    dp[0]=0;                              // ← base case
    if (n >= 1) dp[1]=1;                  // ← base case
    for (int i = 2; i <= n; i++) {
        dp[i]=dp[i - 1] +dp[i - 2];     // ← State transition: f(i)=f(i-1) +f(i-2)
    }
    return dp;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "trading-retracement",
      i18nKey: "content.algorithms.fibonacci.scenarios.trading-retracement",
      domain: "business",
      icon: "📈",
      reference: "TradingView, MetaTrader, Bloomberg Terminal",
    },
    {
      id: "l-system-fractals",
      i18nKey: "content.algorithms.fibonacci.scenarios.l-system-fractals",
      domain: "graphics",
      icon: "🌿",
      reference: "Processing, Three.js, Blender Geometry Nodes",
    },
    {
      id: "memoization-foundation",
      i18nKey: "content.algorithms.fibonacci.scenarios.memoization-foundation",
      domain: "library",
      icon: "🧮",
      reference: "Python functools.lru_cache, React useMemo, JavaScript lodash.memoize",
      codeSnippet: {
        language: "typescript",
        code: `// Fibonacci — classic demonstration of why memoization matters
function fib(n: number): number {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2); // exponential without memo
}

const memo = new Map<number, number>();
function fibMemo(n: number): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;
  memo.set(n, fibMemo(n - 1) + fibMemo(n - 2));
  return memo.get(n)!;
}`,
      },
    },
  ] satisfies Scenario[],
};
