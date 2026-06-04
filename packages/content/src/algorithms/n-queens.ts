import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * N-Queens — Backtracking Algorithm
 * Yields Frame<SortState> with step, state, description, and highlightLine.
 *
 * Input encoding: [n] where n = board size (n×n).
 * State mapping:
 *   array     → board positions (index = row, value = col). 0 = no queen.
 *   comparing → current row being processed
 *   swapping  → rows that conflict with the position being tried
 *   sorted    → rows where queens are successfully placed (not backtracked)
 */
export function* nQueensGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const n = input[0] ?? 4;
  const board: number[]=new Array(n).fill(0);
  const placed = new Set<number>();
  let step = 0;
  let solutionCount = 0;

  // ── Initial state ──
  yield {
    step: step++,
    state: {
      array: [...board],
      comparing: [],
      swapping: [],
      sorted: [],
    },
    description: `Initialize ${n}×${n} board，place ${n} queens`,
    highlightLine: 0,
  };

  /** Check if placing a queen at (row, col) is safe */
  function isSafe(row: number, col: number): [boolean, number[]] {
    const conflicts: number[]=[];
    for (let r = 0; r < row; r++) {
      if (
        board[r] === col ||
        Math.abs(board[r] - col) === Math.abs(r - row)
      ) {
        conflicts.push(r);
      }
    }
    return [conflicts.length === 0, conflicts];
  }

  /** Recursively solve row-by-row */
  function* solve(
    row: number
  ): Generator<Frame<SortState>, void, unknown> {
    // ── Base case: all queens placed ──
    if (row === n) {
      solutionCount++;
      yield {
        step: step++,
        state: {
          array: [...board],
          comparing: [],
          swapping: [],
          sorted: [...placed].sort((a, b) => a - b),
        },
        description: `Found solution # ${solutionCount} solution ✅: [${board.join(", ")}]`,
        highlightLine: 13,
      };
      return;
    }

    // ── Try each column in this row ──
    for (let col = 0; col < n; col++) {
      const [safe, conflicts]=isSafe(row, col);

      yield {
        step: step++,
        state: {
          array: [...board],
          comparing: [row],
          swapping: conflicts,
          sorted: [...placed].sort((a, b) => a - b),
        },
        description: `Try row=${row}, col=${col}${safe ? " ✓ safe" : ` ✗ conflict(${conflicts.join(",")})`}`,
        highlightLine: 17,
      };

      if (safe) {
        // ── Place queen ──
        board[row]=col;
        placed.add(row);

        yield {
          step: step++,
          state: {
            array: [...board],
            comparing: [],
            swapping: [row],
            sorted: [...placed].sort((a, b) => a - b),
          },
          description: `Placequeens: (${row}, ${col})`,
          highlightLine: 19,
        };

        // ── Recurse to next row ──
        yield* solve(row +1);

        // ── Backtrack ──
        board[row]=0;
        placed.delete(row);

        yield {
          step: step++,
          state: {
            array: [...board],
            comparing: [row],
            swapping: [],
            sorted: [...placed].sort((a, b) => a - b),
          },
          description: `Backtrack: remove queen (${row}, ${col})  of queens`,
          highlightLine: 21,
        };
      }
    }
  }

  // ── Start solving from row 0 ──
  yield* solve(0);

  // ── Final state ──
  yield {
    step: step++,
    state: {
      array: new Array(n).fill(0),
      comparing: [],
      swapping: [],
      sorted: [],
    },
    description: `N-Queens complete ✅ totalfound ${solutionCount} solution`,
    highlightLine: 26,
  };
}

/** Code snippet for display */
export const nQueensCode = `function solveNQueens(n: number): number[][] {
  const board: number[]=new Array(n).fill(0);
  const solutions: number[][]=[];
  function isSafe(row: number, col: number): [boolean, number[]] {
    const conflicts: number[]=[];
    for (let r = 0; r < row; r++) {
      if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row))
        conflicts.push(r);                // ← conflict
    }
    return [conflicts.length === 0, conflicts];
  }
  function solve(row: number) {
    if (row === n) {                       // ← found solution
      solutions.push([...board]);
      return;
    }
    for (let col = 0; col < n; col++) {
      const [safe, conflicts]=isSafe(row, col); // ← Check safety
      if (safe) {                          // ← safe，Placequeens
        board[row]=col;                  // ← Place
        solve(row +1);                    // ← Recurse to next row
        board[row]=0;                    // ← backtrack
      }
    }
  }
  solve(0);
  return solutions;
}`;

export const nQueensCodeLines = [
  "function solveNQueens(n: number): number[][] {",
  "  const board: number[]=new Array(n).fill(0);",
  "  const solutions: number[][]=[];",
  "  function isSafe(row: number, col: number): [boolean, number[]] {",
  "    const conflicts: number[]=[];",
  "    for (let r = 0; r < row; r++) {",
  "      if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row))",
  "        conflicts.push(r);                // ← conflict",
  "    }",
  "    return [conflicts.length === 0, conflicts];",
  "  }",
  "  function solve(row: number) {",
  "    if (row === n) {                       // ← found solution",
  "      solutions.push([...board]);",
  "      return;",
  "    }",
  "    for (let col = 0; col < n; col++) {",
  "      const [safe, conflicts]=isSafe(row, col); // ← Check safety",
  "      if (safe) {                          // ← safe，Placequeens",
  "        board[row]=col;                  // ← Place",
  "        solve(row +1);                    // ← Recurse to next row",
  "        board[row]=0;                    // ← backtrack",
  "      }",
  "    }",
  "  }",
  "  solve(0);",
  "  return solutions;",
  "}",
];

/** Content definition */
export const nQueensContent = {
  id: "n-queens",
  slug: "n-queens",
  title: "",
  titleKey: "content.algorithms.n-queens.title",
  category: "algorithm" as const,
  subcategory: "technique",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.algorithms.n-queens.desc",
  defaultInput: [4],
  generator: nQueensGenerator as FrameGenerator<number[], SortState>,
  code: nQueensCode,
  language: "TypeScript",
  complexity: { time: "O(n!)", space: "O(n²)" },
  tags: [],
  icon: "♛",
  codeExamples: {
    typescript: {
      code: `function solveNQueens(n: number): number[][] {
  const board: number[]=new Array(n).fill(0);
  const solutions: number[][]=[];

  function isSafe(row: number, col: number): boolean {
    for (let r = 0; r < row; r++) {
      if (board[r] === col || Math.abs(board[r] - col) === Math.abs(r - row))
        return false;
    }
    return true;
  }

  function solve(row: number) {
    if (row === n) {
      solutions.push([...board]);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row]=col;     // ← Placequeens
        solve(row +1);       // ← Recurse to next row
        board[row]=0;       // ← backtrack
      }
    }
  }

  solve(0);
  return solutions;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#define MAX_N 20

int board[MAX_N];
int solutions_count;

int is_safe(int row, int col) {
  for (int r = 0; r < row; r++) {
    if (board[r] == col ||
        abs(board[r] - col) == abs(r - row))
      return 0;
  }
  return 1;
}

void solve(int row, int n) {
  if (row == n) {
    solutions_count++;
    return;
  }
  for (int col = 0; col < n; col++) {
    if (is_safe(row, col)) {
      board[row]=col;     // ← Placequeens
      solve(row +1, n);    // ← Recurse to next row
      board[row]=0;       // ← backtrack
    }
  }
}

void nQueens(int n) {
  solutions_count = 0;
  solve(0, n);
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `vector<vector<int>> solveNQueens(int n) {
  vector<int> board(n, 0);
  vector<vector<int>> solutions;

  auto isSafe = [&](int row, int col) -> bool {
    for (int r = 0; r < row; r++) {
      if (board[r] == col ||
          abs(board[r] - col) == abs(r - row))
        return false;
    }
    return true;
  };

  function<void(int)> solve = [&](int row) {
    if (row == n) {
      solutions.push_back(board);
      return;
    }
    for (int col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        board[row]=col;     // ← Placequeens
        solve(row +1);       // ← Recurse to next row
        board[row]=0;       // ← backtrack
      }
    }
  };

  solve(0);
  return solutions;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def solve_n_queens(n):
    board = [0] * n
    solutions = []

    def is_safe(row, col):
        for r in range(row):
            if board[r] == col or abs(board[r] - col) == abs(r - row):
                return False
        return True

    def solve(row):
        if row == n:
            solutions.append(board[:])
            return
        for col in range(n):
            if is_safe(row, col):
                board[row]=col     # ← Placequeens
                solve(row +1)       # ← Recurse to next row
                board[row]=0       # ← backtrack

    solve(0)
    return solutions`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn solve_n_queens(n: usize) -> Vec<Vec<usize>> {
    let mut board = vec![0usize; n];
    let mut solutions = Vec::new();

    fn is_safe(board: &[usize], row: usize, col: usize) -> bool {
        for r in 0..row {
            if board[r] == col
                || (board[r] as isize - col as isize).abs()
                    == (r as isize - row as isize).abs()
            {
                return false;
            }
        }
        true
    }

    fn solve(
        board: &mut Vec<usize>,
        row: usize,
        n: usize,
        solutions: &mut Vec<Vec<usize>>,
    ) {
        if row == n {
            solutions.push(board.clone());
            return;
        }
        for col in 0..n {
            if is_safe(board, row, col) {
                board[row]=col;     // ← Placequeens
                solve(board, row +1, n, solutions);
                board[row]=0;       // ← backtrack
            }
        }
    }

    solve(&mut board, 0, n, &mut solutions);
    solutions
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func solveNQueens(n int) [][]int {
    board := make([]int, n)
    var solutions [][]int

    isSafe := func(row, col int) bool {
        for r := 0; r < row; r++{
            if board[r] == col ||
                abs(board[r]-col) == abs(r-row) {
                return false
            }
        }
        return true
    }

    var solve func(int)
    solve = func(row int) {
        if row == n {
            sol := make([]int, n)
            copy(sol, board)
            solutions = append(solutions, sol)
            return
        }
        for col := 0; col < n; col++{
            if isSafe(row, col) {
                board[row]=col     // ← Placequeens
                solve(row +1)       // ← Recurse to next row
                board[row]=0       // ← backtrack
            }
        }
    }

    solve(0)
    return solutions
}

func abs(x int) int {
    if x < 0 { return -x }
    return x
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static List<List<Integer>> solveNQueens(int n) {
    int[] board = new int[n];
    List<List<Integer>> solutions = new ArrayList<>();

    class Solver {
        boolean isSafe(int row, int col) {
            for (int r = 0; r < row; r++) {
                if (board[r] == col ||
                    Math.abs(board[r] - col) == Math.abs(r - row))
                    return false;
            }
            return true;
        }

        void solve(int row) {
            if (row == n) {
                List<Integer> sol = new ArrayList<>();
                for (int v : board) sol.add(v);
                solutions.add(sol);
                return;
            }
            for (int col = 0; col < n; col++) {
                if (isSafe(row, col)) {
                    board[row]=col;     // ← Placequeens
                    solve(row +1);       // ← Recurse to next row
                    board[row]=0;       // ← backtrack
                }
            }
        }
    }

    new Solver().solve(0);
    return solutions;
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "chess-puzzle-generator",
      i18nKey: "content.algorithms.n-queens.scenarios.chess-puzzle-generator",
      domain: "game-dev",
      icon: "♟️",
      reference: "Chess.com, Lichess, Stockfish",
    },
    {
      id: "register-allocation",
      i18nKey: "content.algorithms.n-queens.scenarios.register-allocation",
      domain: "devtools",
      icon: "⚙️",
      reference: "V8 TurboFan, LLVM, GCC register allocator",
    },
    {
      id: "constraint-satisfaction",
      i18nKey: "content.algorithms.n-queens.scenarios.constraint-satisfaction",
      domain: "ai-ml",
      icon: "🧠",
      codeSnippet: {
        language: "typescript",
        code: `// N-Queens is a special case of constraint satisfaction (CSP)
// Used by SAT solvers and AI planners
function solveCSP(variables: number[], constraints: (assign: number[]) => boolean): number[][] {
  const board: number[] = new Array(variables.length).fill(0);
  const solutions: number[][] = [];

  function backtrack(row: number) {
    if (row === variables.length) { solutions.push([...board]); return; }
    for (let col = 0; col < variables.length; col++) {
      board[row] = col;
      if (constraints(board.slice(0, row + 1))) backtrack(row + 1);
      board[row] = 0;
    }
  }
  backtrack(0);
  return solutions;
}`,
      },
    },
  ] satisfies Scenario[],
};
