import type { Frame, FrameGenerator, Scenario, TableState } from "@codeprism/core";

/**
 * Longest Common Subsequence — Frame Generator (TableState)
 * Fills a 2D DP table dp[i][j] for LCS length.
 * Input encoding: [...s1 char codes, 0, ...s2 char codes]
 * The 0 separator distinguishes the two strings.
 */

export function* lcsGenerator(
  input: number[]
): Generator<Frame<TableState>, void, unknown> {
  // Decode: find separator 0
  const sepIdx = input.indexOf(0);
  const s1Codes = input.slice(0, sepIdx);
  const s2Codes = input.slice(sepIdx +1);
  const s1 = String.fromCharCode(...s1Codes);
  const s2 = String.fromCharCode(...s2Codes);
  const m = s1.length;
  const n = s2.length;

  const rows = m +1;
  const cols = n +1;

  // Build 2D DP table
  const grid: number[][]=Array.from({ length: rows }, () =>
    new Array(cols).fill(0)
  );
  let step = 0;

  // Headers
  const rowHeaders = ["\u03b5", ...Array.from(s1)];
  const colHeaders = ["\u03b5", ...Array.from(s2)];

  // Track filled cells
  const sortedCells: [number, number][]=[];

  // Deep copy grid
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
  yield yieldFrame(null, [], null, `Initialize DP table: s1="${s1}" (${m}), s2="${s2}" (${n}), table ${rows}×${cols}`, 0);

  // Fill table row by row
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        // Characters match — extend diagonal
        grid[i][j]=grid[i - 1][j - 1] +1;

        yield yieldFrame(
          [i, j],
          [[i - 1, j - 1]],
          grid[i][j],
          `s1[${i - 1}]='${s1[i - 1]}'==s2[${j - 1}]='${s2[j - 1]}', dp[${i}][${j}]=dp[${i - 1}][${j - 1}] +1 = ${grid[i][j]}`,
          6
        );
      } else {
        // No match — take max of left or top
        const top = grid[i - 1][j];
        const left = grid[i][j - 1];
        grid[i][j]=Math.max(top, left);

        yield yieldFrame(
          [i, j],
          [[i - 1, j], [i, j - 1]],
          grid[i][j],
          `s1[${i - 1}]='${s1[i - 1]}'!=s2[${j - 1}]='${s2[j - 1]}', dp[${i}][${j}]=max(up=${top}, l=${left})=${grid[i][j]}`,
          9
        );
      }

      sortedCells.push([i, j]);
    }
  }

  // Final state
  const lcsLen = grid[m][n];
  yield yieldFrame(
    [m, n],
    [],
    lcsLen,
    `complete ✅ LCS length = ${lcsLen}`,
    12
  );
}

/** Code snippet for display */
export const lcsCode = `function lcs(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m +1 }, () => 
    new Array(n +1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j]=dp[i - 1][j - 1] +1;   // ← Characters match
      } else {
        dp[i][j]=Math.max(dp[i - 1][j], dp[i][j - 1]); // ← Take larger value
      }
    }
  }
  return dp[m][n];                          // ← LCS length
}`;

export const lcsCodeLines = [
  "function lcs(s1: string, s2: string): number {",
  "  const m = s1.length, n = s2.length;",
  "  const dp = Array.from({ length: m +1 }, () => ",
  "    new Array(n +1).fill(0));",
  "  for (let i = 1; i <= m; i++) {",
  "    for (let j = 1; j <= n; j++) {",
  "      if (s1[i - 1] === s2[j - 1]) {",
  "        dp[i][j]=dp[i - 1][j - 1] +1;   // ← Characters match",
  "      } else {",
  "        dp[i][j]=Math.max(dp[i - 1][j], dp[i][j - 1]); // ← Take larger value",
  "      }",
  "    }",
  "  }",
  "  return dp[m][n];                          // ← LCS length",
  "}",
];

/** Content definition */
export const lcsContent = {
  id: "lcs",
  slug: "lcs",
  title: "",
  titleKey: "content.algorithms.lcs.title",
  category: "algorithm" as const,
  subcategory: "dynamic-programming",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.lcs.desc",
  defaultInput: [65, 66, 67, 66, 0, 66, 68, 65, 66],
  generator: lcsGenerator as FrameGenerator<number[], TableState>,
  code: lcsCode,
  language: "TypeScript",
  complexity: { time: "O(m×n)", space: "O(m×n)" },
  tags: [],
  icon: "🔗",
  codeExamples: {
    typescript: {
      code: `function lcs(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m +1 }, () => 
    new Array(n +1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j]=dp[i - 1][j - 1] +1;   // ← Characters match，Extend diagonal
      } else {
        dp[i][j]=Math.max(dp[i - 1][j], dp[i][j - 1]); // ← Take larger value
      }
    }
  }
  return dp[m][n];
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int lcs(const char *s1, const char *s2) {
  int m = strlen(s1), n = strlen(s2);
  int dp[m +1][n +1];
  memset(dp, 0, sizeof(dp));

  for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
      if (s1[i - 1] == s2[j - 1]) {
        dp[i][j]=dp[i - 1][j - 1] +1;   // ← Characters match
      } else {
        dp[i][j]=dp[i - 1][j] > dp[i][j - 1] ? dp[i - 1][j] : dp[i][j - 1]; // ← Take larger value
      }
    }
  }
  return dp[m][n];
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int lcs(const string& s1, const string& s2) {
  int m = s1.size(), n = s2.size();
  vector<vector<int>> dp(m +1, vector<int>(n +1, 0));

  for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
      if (s1[i - 1] == s2[j - 1]) {
        dp[i][j]=dp[i - 1][j - 1] +1;   // ← Characters match
      } else {
        dp[i][j]=max(dp[i - 1][j], dp[i][j - 1]); // ← Take larger value
      }
    }
  }
  return dp[m][n];
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def lcs(s1: str, s2: str) -> int:
    m, n = len(s1), len(s2)
    dp = [[0] * (n +1) for _ in range(m +1)]

    for i in range(1, m +1):
        for j in range(1, n +1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j]=dp[i - 1][j - 1] +1  # ← Characters match
            else:
                dp[i][j]=max(dp[i - 1][j], dp[i][j - 1])  # ← Take larger value
    return dp[m][n]`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn lcs(s1: &str, s2: &str) -> usize {
    let s1: Vec<char> = s1.chars().collect();
    let s2: Vec<char> = s2.chars().collect();
    let m = s1.len();
    let n = s2.len();
    let mut dp = vec![vec![0usize; n +1]; m +1];

    for i in 1..=m {
        for j in 1..=n {
            if s1[i - 1] == s2[j - 1] {
                dp[i][j]=dp[i - 1][j - 1] +1;  // ← Characters match
            } else {
                dp[i][j]=dp[i - 1][j].max(dp[i][j - 1]);  // ← Take larger value
            }
        }
    }
    dp[m][n]
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func lcs(s1, s2 string) int {
    m, n := len(s1), len(s2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i]=make([]int, n+1)
    }

    for i := 1; i <= m; i++{
        for j := 1; j <= n; j++{
            if s1[i-1] == s2[j-1] {
                dp[i][j]=dp[i-1][j-1] +1     // ← Characters match
            } else if dp[i-1][j] > dp[i][j-1] {
                dp[i][j]=dp[i-1][j]            // ← Take larger value
            } else {
                dp[i][j]=dp[i][j-1]
            }
        }
    }
    return dp[m][n]
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int lcs(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m +1][n +1];

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                dp[i][j]=dp[i - 1][j - 1] +1;     // ← Characters match
            } else {
                dp[i][j]=Math.max(dp[i - 1][j], dp[i][j - 1]); // ← Take larger value
            }
        }
    }
    return dp[m][n];
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "git-diff",
      i18nKey: "content.algorithms.lcs.scenarios.git-diff",
      domain: "devtools",
      icon: "🔀",
      reference: "Git, SVN, Mercurial",
      codeSnippet: {
        language: "typescript",
        code: `// Git diff uses LCS to find the minimal edit script between two file versions
function diffLines(oldLines: string[], newLines: string[]): string[] {
  const lcs = longestCommonSubsequence(oldLines, newLines);
  // Lines in old but not in LCS → deleted (-)
  // Lines in new but not in LCS → added (+)
  return computePatch(oldLines, newLines, lcs);
}`,
      },
    },
    {
      id: "dna-alignment",
      i18nKey: "content.algorithms.lcs.scenarios.dna-alignment",
      domain: "ai-ml",
      icon: "🧬",
      reference: "BLAST, Biopython, NCBI Entrez",
    },
    {
      id: "plagiarism-detection",
      i18nKey: "content.algorithms.lcs.scenarios.plagiarism-detection",
      domain: "business",
      icon: "📝",
      reference: "Turnitin, Copyscape, Grammarly",
    },
  ] satisfies Scenario[],
};
