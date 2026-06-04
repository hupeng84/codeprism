import type { Frame, FrameGenerator, Scenario, TableState } from "@codeprism/core";

/**
 * Edit Distance (Levenshtein) — Frame Generator (TableState)
 * Fills a 2D DP table dp[i][j] for minimum edit operations.
 * Input encoding: [...s1 char codes, 0, ...s2 char codes]
 * The 0 separator distinguishes the two strings.
 */

export function* editDistanceGenerator(
  input: number[]
): Generator<Frame<TableState>, void, unknown> {
  // Decode strings
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

  // Initialize first column: dp[i][0]=i (delete all chars)
  for (let i = 0; i <= m; i++) {
    grid[i][0]=i;
    sortedCells.push([i, 0]);
  }
  yield yieldFrame(null, [], null, `Init col 0: dp[i][0]=i (delete first i chars of s1)`, 2);

  // Initialize first row: dp[0][j]=j (insert all chars)
  for (let j = 0; j <= n; j++) {
    grid[0][j]=j;
    if (j > 0) sortedCells.push([0, j]);
  }
  yield yieldFrame(null, [], null, `Init row 0: dp[0][j]=j (insert first j chars of s2)`, 3);

  // Fill table row by row
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const top = grid[i - 1][j];     // delete
      const left = grid[i][j - 1];    // insert
      const diag = grid[i - 1][j - 1]; // replace

      if (s1[i - 1] === s2[j - 1]) {
        // Characters match — no operation needed
        grid[i][j]=diag;

        yield yieldFrame(
          [i, j],
          [[i - 1, j - 1]],
          grid[i][j],
          `s1[${i - 1}]='${s1[i - 1]}'==s2[${j - 1}]='${s2[j - 1]}', dp[${i}][${j}]=dp[${i - 1}][${j - 1}]=${diag} (No operation needed)`,
          7
        );
      } else {
        // Take minimum of insert, delete, replace
        const deleteOp = top +1;
        const insertOp = left +1;
        const replaceOp = diag +1;
        grid[i][j]=Math.min(deleteOp, insertOp, replaceOp);

        const ops: string[]=[];
        if (grid[i][j] === deleteOp) ops.push("delete");
        if (grid[i][j] === insertOp) ops.push("insert");
        if (grid[i][j] === replaceOp) ops.push("replace");

        yield yieldFrame(
          [i, j],
          [[i - 1, j], [i, j - 1], [i - 1, j - 1]],
          grid[i][j],
          `s1[${i - 1}]='${s1[i - 1]}'!=s2[${j - 1}]='${s2[j - 1]}', dp[${i}][${j}]=min(d=${deleteOp}, i=${insertOp}, r=${replaceOp})=${grid[i][j]} [${ops.join("/")}]`,
          10
        );
      }

      sortedCells.push([i, j]);
    }
  }

  // Final state
  yield yieldFrame(
    [m, n],
    [],
    grid[m][n],
    `complete ✅ Minimum edit distance = ${grid[m][n]} ("${s1}" transform to "${s2}" operations needed ${grid[m][n]} ops)`,
    14
  );
}

/** Code snippet for display */
export const editDistanceCode = `function editDistance(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m +1 }, () => 
    new Array(n +1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0]=i;  // ← delete
  for (let j = 0; j <= n; j++) dp[0][j]=j;  // ← insert

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j]=dp[i - 1][j - 1];           // ← match, no operation
      } else {
        dp[i][j]=1 +Math.min(
          dp[i - 1][j],     // ← delete
          dp[i][j - 1],     // ← insert
          dp[i - 1][j - 1]  // ← replace
        );
      }
    }
  }
  return dp[m][n];                            // ← edit distance
}`;

export const editDistanceCodeLines = [
  "function editDistance(s1: string, s2: string): number {",
  "  const m = s1.length, n = s2.length;",
  "  const dp = Array.from({ length: m +1 }, () => ",
  "    new Array(n +1).fill(0));",
  "  for (let i = 0; i <= m; i++) dp[i][0]=i;  // ← delete",
  "  for (let j = 0; j <= n; j++) dp[0][j]=j;  // ← insert",
  "  for (let i = 1; i <= m; i++) {",
  "    for (let j = 1; j <= n; j++) {",
  "      if (s1[i - 1] === s2[j - 1]) {",
  "        dp[i][j]=dp[i - 1][j - 1];           // ← match, no operation",
  "      } else {",
  "        dp[i][j]=1 +Math.min(",
  "          dp[i - 1][j],     // ← delete",
  "          dp[i][j - 1],     // ← insert",
  "          dp[i - 1][j - 1]  // ← replace",
  "        );",
  "      }",
  "    }",
  "  }",
  "  return dp[m][n];                            // ← edit distance",
  "}",
];

/** Content definition */
export const editDistanceContent = {
  id: "edit-distance",
  slug: "edit-distance",
  title: "",
  titleKey: "content.algorithms.edit-distance.title",
  category: "algorithm" as const,
  subcategory: "dynamic-programming",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.edit-distance.desc",
  defaultInput: [75, 105, 116, 116, 101, 110, 0, 115, 105, 116, 116, 105, 110, 103],
  generator: editDistanceGenerator as FrameGenerator<number[], TableState>,
  code: editDistanceCode,
  language: "TypeScript",
  complexity: { time: "O(m×n)", space: "O(m×n)" },
  tags: [],
  icon: "✏️",
  codeExamples: {
    typescript: {
      code: `function editDistance(s1: string, s2: string): number {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m +1 }, () => 
    new Array(n +1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0]=i;  // ← delete
  for (let j = 0; j <= n; j++) dp[0][j]=j;  // ← insert

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j]=dp[i - 1][j - 1];           // ← match
      } else {
        dp[i][j]=1 +Math.min(
          dp[i - 1][j],     // ← delete
          dp[i][j - 1],     // ← insert
          dp[i - 1][j - 1]  // ← replace
        );
      }
    }
  }
  return dp[m][n];
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `int editDistance(const char *s1, const char *s2) {
  int m = strlen(s1), n = strlen(s2);
  int dp[m +1][n +1];

  for (int i = 0; i <= m; i++) dp[i][0]=i;  // ← delete
  for (int j = 0; j <= n; j++) dp[0][j]=j;  // ← insert

  for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
      if (s1[i - 1] == s2[j - 1]) {
        dp[i][j]=dp[i - 1][j - 1];           // ← match
      } else {
        int del = dp[i - 1][j] +1;             // ← delete
        int ins = dp[i][j - 1] +1;             // ← insert
        int rep = dp[i - 1][j - 1] +1;         // ← replace
        dp[i][j]=del < ins ? (del < rep ? del : rep) : (ins < rep ? ins : rep);
      }
    }
  }
  return dp[m][n];
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `int editDistance(const string& s1, const string& s2) {
  int m = s1.size(), n = s2.size();
  vector<vector<int>> dp(m +1, vector<int>(n +1));

  for (int i = 0; i <= m; i++) dp[i][0]=i;  // ← delete
  for (int j = 0; j <= n; j++) dp[0][j]=j;  // ← insert

  for (int i = 1; i <= m; i++) {
    for (int j = 1; j <= n; j++) {
      if (s1[i - 1] == s2[j - 1]) {
        dp[i][j]=dp[i - 1][j - 1];           // ← match
      } else {
        dp[i][j]=1 +min({
          dp[i - 1][j],     // ← delete
          dp[i][j - 1],     // ← insert
          dp[i - 1][j - 1]  // ← replace
        });
      }
    }
  }
  return dp[m][n];
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def edit_distance(s1: str, s2: str) -> int:
    m, n = len(s1), len(s2)
    dp = [[0] * (n +1) for _ in range(m +1)]

    for i in range(m +1): dp[i][0]=i      # ← delete
    for j in range(n +1): dp[0][j]=j      # ← insert

    for i in range(1, m +1):
        for j in range(1, n +1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j]=dp[i - 1][j - 1]  # ← match
            else:
                dp[i][j]=1 +min(
                    dp[i - 1][j],             # ← delete
                    dp[i][j - 1],             # ← insert
                    dp[i - 1][j - 1]          # ← replace
                )
    return dp[m][n]`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn edit_distance(s1: &str, s2: &str) -> usize {
    let s1: Vec<char> = s1.chars().collect();
    let s2: Vec<char> = s2.chars().collect();
    let m = s1.len();
    let n = s2.len();
    let mut dp = vec![vec![0usize; n +1]; m +1];

    for i in 0..=m { dp[i][0]=i; }          // ← delete
    for j in 0..=n { dp[0][j]=j; }          // ← insert

    for i in 1..=m {
        for j in 1..=n {
            if s1[i - 1] == s2[j - 1] {
                dp[i][j]=dp[i - 1][j - 1];  // ← match
            } else {
                dp[i][j]=1 +dp[i - 1][j].min(dp[i][j - 1]).min(dp[i - 1][j - 1]);
            }
        }
    }
    dp[m][n]
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func editDistance(s1, s2 string) int {
    m, n := len(s1), len(s2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i]=make([]int, n+1)
    }

    for i := 0; i <= m; i++{ dp[i][0]=i }  // ← delete
    for j := 0; j <= n; j++{ dp[0][j]=j }  // ← insert

    for i := 1; i <= m; i++{
        for j := 1; j <= n; j++{
            if s1[i-1] == s2[j-1] {
                dp[i][j]=dp[i-1][j-1]        // ← match
            } else {
                dp[i][j]=1 +min3(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
            }
        }
    }
    return dp[m][n]
}

func min3(a, b, c int) int {
    if a < b && a < c { return a }
    if b < c { return b }
    return c
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int editDistance(String s1, String s2) {
    int m = s1.length(), n = s2.length();
    int[][] dp = new int[m +1][n +1];

    for (int i = 0; i <= m; i++) dp[i][0]=i;  // ← delete
    for (int j = 0; j <= n; j++) dp[0][j]=j;  // ← insert

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                dp[i][j]=dp[i - 1][j - 1];     // ← match
            } else {
                dp[i][j]=1 +Math.min(dp[i - 1][j],
                    Math.min(dp[i][j - 1], dp[i - 1][j - 1]));
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
      id: "spell-checker",
      i18nKey: "content.algorithms.edit-distance.scenarios.spell-checker",
      domain: "library",
      icon: "🔤",
      reference: "Aspell, Hunspell, VS Code IntelliSense",
      codeSnippet: {
        language: "typescript",
        code: `// Spell checker: find dictionary words within edit distance 2
function suggest(misspelled: string, dictionary: string[]): string[] {
  return dictionary
    .map(word => ({ word, dist: levenshtein(misspelled, word) }))
    .filter(({ dist }) => dist <= 2)
    .sort((a, b) => a.dist - b.dist)
    .map(({ word }) => word);
}
// suggest("recieve", ["receive","recipe","recite"]) → ["receive"]`,
      },
    },
    {
      id: "fuzzy-search",
      i18nKey: "content.algorithms.edit-distance.scenarios.fuzzy-search",
      domain: "database",
      icon: "🔍",
      reference: "Elasticsearch fuzzy query, PostgreSQL pg_trgm, Redis RediSearch",
    },
    {
      id: "dna-sequence-alignment",
      i18nKey: "content.algorithms.edit-distance.scenarios.dna-sequence-alignment",
      domain: "ai-ml",
      icon: "🧪",
      reference: "BLAST, Bioconductor, NCBI BLAST+",
    },
  ] satisfies Scenario[],
};
