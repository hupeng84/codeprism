import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Longest Increasing Subsequence — Frame Generator
 * Fills a 1D DP table dp[i]=length of LIS ending at index i.
 * Input: number[] (the array to find LIS for)
 */

export function* lisGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  // dp[i]=length of LIS ending at index i
  const dp: number[]=new Array(n).fill(1);
  let step = 0;

  // Initial state — all LIS lengths are 1 (each element alone)
  yield {
    step: step++,
    state: {
      array: [...dp],
      comparing: [],
      swapping: [],
      sorted: [],
    },
    description: `Input array: [${arr.join(", ")}]，Initialize dp[i]=1 (each element has LIS=1)`,
    highlightLine: 0,
  };

  // Fill dp array
  for (let i = 1; i < n; i++) {
    // Scan all previous elements
    yield {
      step: step++,
      state: {
        array: [...dp],
        comparing: [],
        swapping: [i],
        sorted: [],
      },
      description: `Check arr[${i}]=${arr[i]}，compare all previous`,
      highlightLine: 3,
    };

    for (let j = 0; j < i; j++) {
      if (arr[j]<arr[i]) {
        // Show comparison
        yield {
          step: step++,
          state: {
            array: [...dp],
            comparing: [j],
            swapping: [i],
            sorted: [],
          },
          description: `arr[${j}]=${arr[j]} < arr[${i}]=${arr[i]}, dp[${j}]=${dp[j]}`,
          highlightLine: 5,
        };

        if (dp[j] +1 > dp[i]) {
          dp[i]=dp[j] +1;
          yield {
            step: step++,
            state: {
              array: [...dp],
              comparing: [],
              swapping: [i],
              sorted: [],
            },
            description: `update dp[${i}]=dp[${j}] +1 = ${dp[i]}`,
            highlightLine: 6,
          };
        }
      }
    }
  }

  // Find the overall LIS length
  const lisLength = Math.max(...dp);
  const lisEndIdx = dp.indexOf(lisLength);

  // Reconstruct the LIS for description
  const lisArr: number[]=[];
  let curr = lisEndIdx;
  for (let k = 0; k < lisLength; k++) {
    lisArr.unshift(arr[curr]);
    for (let j = curr - 1; j >= 0; j--) {
      if (arr[j]<arr[curr] && dp[j] === dp[curr] - 1) {
        curr = j;
        break;
      }
    }
  }

  // Final state — highlight the LIS positions
  yield {
    step: step++,
    state: {
      array: [...dp],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, k) => k),
    },
    description: `complete ✅ LIS length = ${lisLength}，seq=[${lisArr.join(", ")}]`,
    highlightLine: 9,
  };
}

/** Code snippet for display */
export const lisCode = `function lis(arr: number[]): number {
  const n = arr.length;
  const dp = new Array(n).fill(1);          // ← Each element has length 1

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j]<arr[i] && dp[j] +1 > dp[i]) {
        dp[i]=dp[j] +1;                  // ← Found longer increasing subsequence
      }
    }
  }
  return Math.max(...dp);                   // ← LIS length
}`;

export const lisCodeLines = [
  "function lis(arr: number[]): number {",
  "  const n = arr.length;",
  "  const dp = new Array(n).fill(1);          // ← Each element has length 1",
  "  for (let i = 1; i < n; i++) {",
  "    for (let j = 0; j < i; j++) {",
  "      if (arr[j]<arr[i] && dp[j] +1 > dp[i]) {",
  "        dp[i]=dp[j] +1;                  // ← Found longer increasing subsequence",
  "      }",
  "    }",
  "  }",
  "  return Math.max(...dp);                   // ← LIS length",
  "}",
];

/** Content definition */
export const lisContent = {
  id: "lis",
  slug: "lis",
  title: "",
  titleKey: "content.algorithms.lis.title",
  category: "algorithm" as const,
  subcategory: "dynamic-programming",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.lis.desc",
  defaultInput: [10, 9, 2, 5, 3, 7, 101, 18],
  generator: lisGenerator as FrameGenerator<number[], SortState>,
  code: lisCode,
  language: "TypeScript",
  complexity: { time: "O(n²)", space: "O(n)" },
  tags: [],
  icon: "📈",
  codeExamples: {
    typescript: {
      code: `function lis(arr: number[]): number {
  const n = arr.length;
  const dp = new Array(n).fill(1);          // ← Each element has length 1

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[j]<arr[i] && dp[j] +1 > dp[i]) {
        dp[i]=dp[j] +1;                  // ← Found longer increasing subsequence
      }
    }
  }
  return Math.max(...dp);                   // ← LIS length
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int lis(int arr[], int n) {
  int dp[n];
  for (int i = 0; i < n; i++) dp[i]=1;   // ← Each element has length 1

  for (int i = 1; i < n; i++) {
    for (int j = 0; j < i; j++) {
      if (arr[j]<arr[i] && dp[j] +1 > dp[i]) {
        dp[i]=dp[j] +1;                  // ← Found longer increasing subsequence
      }
    }
  }

  int maxLen = 1;
  for (int i = 0; i < n; i++)
    if (dp[i] > maxLen) maxLen = dp[i];     // ← LIS length
  return maxLen;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int lis(vector<int>& arr) {
  int n = arr.size();
  vector<int> dp(n, 1);                     // ← Each element has length 1

  for (int i = 1; i < n; i++) {
    for (int j = 0; j < i; j++) {
      if (arr[j]<arr[i] && dp[j] +1 > dp[i]) {
        dp[i]=dp[j] +1;                  // ← Found longer increasing subsequence
      }
    }
  }
  return *max_element(dp.begin(), dp.end()); // ← LIS length
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def lis(arr: list[int]) -> int:
    n = len(arr)
    dp = [1] * n                             # ← Each element has length 1

    for i in range(1, n):
        for j in range(i):
            if arr[j]<arr[i] and dp[j] +1 > dp[i]:
                dp[i]=dp[j] +1            # ← Found longer increasing subsequence
    return max(dp)                           # ← LIS length`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn lis(arr: &[usize]) -> usize {
    let n = arr.len();
    let mut dp = vec![1usize; n];            // ← Each element has length 1

    for i in 1..n {
        for j in 0..i {
            if arr[j]<arr[i] && dp[j] +1 > dp[i] {
                dp[i]=dp[j] +1;           // ← Found longer increasing subsequence
            }
        }
    }
    *dp.iter().max().unwrap()                // ← LIS length
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func lis(arr []int) int {
    n := len(arr)
    dp := make([]int, n)
    for i := range dp { dp[i]=1 }         // ← Each element has length 1

    for i := 1; i < n; i++{
        for j := 0; j < i; j++{
            if arr[j]<arr[i] && dp[j]+1 > dp[i] {
                dp[i]=dp[j] +1            // ← Found longer increasing subsequence
            }
        }
    }

    maxLen := 1
    for _, v := range dp {
        if v > maxLen { maxLen = v }         // ← LIS length
    }
    return maxLen
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int lis(int[] arr) {
    int n = arr.length;
    int[] dp = new int[n];
    Arrays.fill(dp, 1);                      // ← Each element has length 1

    for (int i = 1; i < n; i++) {
        for (int j = 0; j < i; j++) {
            if (arr[j]<arr[i] && dp[j] +1 > dp[i]) {
                dp[i]=dp[j] +1;           // ← Found longer increasing subsequence
            }
        }
    }

    int maxLen = 1;
    for (int v : dp) maxLen = Math.max(maxLen, v); // ← LIS length
    return maxLen;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "patience-sorting",
      i18nKey: "content.algorithms.lis.scenarios.patience-sorting",
      domain: "game-dev",
      icon: "🃏",
      reference: "Solitaire, Patience card game, Poker",
    },
    {
      id: "job-scheduling",
      i18nKey: "content.algorithms.lis.scenarios.job-scheduling",
      domain: "business",
      icon: "📅",
      reference: "Kubernetes CronJob, Apache Airflow, GitHub Actions",
    },
    {
      id: "building-bridges",
      i18nKey: "content.algorithms.lis.scenarios.building-bridges",
      domain: "system",
      icon: "🌉",
      codeSnippet: {
        language: "typescript",
        code: `// Maximum number of non-crossing bridges across a river
// Each bridge connects (northBank, southBank)
function maxBridges(bridges: [number, number][]): number {
  // Sort by north bank; LIS on south bank ensures no crossings
  bridges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const southBanks = bridges.map(b => b[1]);
  return lis(southBanks); // LIS gives max non-crossing subset
}`,
      },
    },
  ] satisfies Scenario[],
};
