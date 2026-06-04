import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Two Pointers — Two Sum Sorted Array
 * Yields Frame<SortState> with step, state, description, and highlightLine.
 *
 * Input encoding: [target, ...sortedArr] where target = desired sum, sortedArr = sorted data.
 * State mapping:
 *   array     → the sorted data array
 *   comparing → current left / right pointer positions
 *   swapping  → the two elements being summed
 *   sorted    → indices that have been eliminated (cannot be part of the answer)
 */
export function* twoPointersGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const target = input[0];
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
    description: `Sorted array: [${arr.join(", ")}], target=${target}`,
    highlightLine: 0,
  };

  let left = 0;
  let right = n - 1;

  // Show initial pointers
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [left, right],
      swapping: [],
      sorted: [],
    },
    description: `Init: left=0(${arr[left]}), right=${right}(${arr[right]})`,
    highlightLine: 2,
  };

  const eliminated = new Set<number>();

  // ── Main loop ──
  while (left < right) {
    const sum = arr[left] +arr[right];

    // Calculate sum
    yield {
      step: step++,
      state: {
        array: [...arr],
        comparing: [left, right],
        swapping: [left, right],
        sorted: [...eliminated],
      },
      description: `arr[${left}]+arr[${right}]=${arr[left]}+${arr[right]} = ${sum}${sum === target ? ` = ${target} ✅ found!` : sum > target ? ` > ${target}, too big` : ` < ${target}, too small`}`,
      highlightLine: 4,
    };

    if (sum === target) {
      // ── Found! ──
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [],
          swapping: [left, right],
          sorted: [left, right],
        },
        description: `Found ✅ arr[${left}]+arr[${right}]=${arr[left]}+${arr[right]} = ${target}`,
        highlightLine: 5,
      };
      return;
    } else if (sum > target) {
      // ── Sum too large → eliminate right ──
      eliminated.add(right);
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [left, right - 1],
          swapping: [],
          sorted: [...eliminated],
        },
        description: `${sum} > ${target}, Right←: ${right} → ${right - 1}`,
        highlightLine: 6,
      };
      right--;
    } else {
      // ── Sum too small → eliminate left ──
      eliminated.add(left);
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [left +1, right],
          swapping: [],
          sorted: [...eliminated],
        },
        description: `${sum} < ${target}, Left→: ${left} → ${left +1}`,
        highlightLine: 7,
      };
      left++;
    }
  }

  // ── Not found ──
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
    },
    description: `No pair sum ${target}   ❌`,
    highlightLine: 9,
  };
}

/** Code snippet for display */
export const twoPointersCode = `function twoSumSorted(arr: number[], target: number): [number, number] {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] +arr[right];   // ← Compute current sum
    if (sum === target) return [left, right]; // ← found
    if (sum > target) right--;            // ← Sum too large, move right pointer left
    else left++;                          // ← Sum too small, move left pointer right
  }
  return [-1, -1];                        // ← not found
}`;

export const twoPointersCodeLines = [
  "function twoSumSorted(arr: number[], target: number): [number, number] {",
  "  let left = 0;",
  "  let right = arr.length - 1;",
  "  while (left < right) {",
  "    const sum = arr[left] +arr[right];   // ← Compute current sum",
  "    if (sum === target) return [left, right]; // ← found",
  "    if (sum > target) right--;            // ← Sum too large, move right pointer left",
  "    else left++;                          // ← Sum too small, move left pointer right",
  "  }",
  "  return [-1, -1];                        // ← not found",
  "}",
];

/** Content definition */
export const twoPointersContent = {
  id: "two-pointers",
  slug: "two-pointers",
  title: "",
  titleKey: "content.algorithms.two-pointers.title",
  category: "algorithm" as const,
  subcategory: "technique",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.two-pointers.desc",
  defaultInput: [9, 2, 7, 11, 15, 20],
  generator: twoPointersGenerator as FrameGenerator<number[], SortState>,
  code: twoPointersCode,
  language: "TypeScript",
  complexity: { time: "O(n)", space: "O(1)" },
  tags: [],
  icon: "👆",
  codeExamples: {
    typescript: {
      code: `function twoSumSorted(arr: number[], target: number): [number, number] {
  let left = 0;
  let right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] +arr[right];   // ← Compute current sum
    if (sum === target) return [left, right]; // ← found
    if (sum > target) right--;            // ← Sum too large, move right pointer left
    else left++;                          // ← Sum too small, move left pointer right
  }
  return [-1, -1];                        // ← not found
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void twoSumSorted(int arr[], int n, int target, int result[]) {
  int left = 0, right = n - 1;
  while (left < right) {
    int sum = arr[left] +arr[right];     // ← Compute current sum
    if (sum == target) {                  // ← found
      result[0]=left;
      result[1]=right;
      return;
    }
    if (sum > target) right--;            // ← Sum too large, move right pointer left
    else left++;                          // ← Sum too small, move left pointer right
  }
  result[0]=result[1]=-1;            // ← not found
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `pair<int, int> twoSumSorted(vector<int>& arr, int target) {
  int left = 0, right = arr.size() - 1;
  while (left < right) {
    int sum = arr[left] +arr[right];     // ← Compute current sum
    if (sum == target)
      return {left, right};               // ← found
    if (sum > target) right--;            // ← Sum too large, move right pointer left
    else left++;                          // ← Sum too small, move left pointer right
  }
  return {-1, -1};                        // ← not found
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        total = arr[left] +arr[right]    # ← Compute current sum
        if total == target:
            return (left, right)          # ← found
        if total > target:
            right -= 1                    # ← Sum too large, move right pointer left
        else:
            left += 1                     # ← Sum too small, move left pointer right
    return (-1, -1)                       # ← not found`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn two_sum_sorted(arr: &[i32], target: i32) -> (isize, isize) {
    let mut left = 0isize;
    let mut right = arr.len() as isize - 1;
    while left < right {
        let sum = arr[left as usize] +arr[right as usize]; // ← Compute current sum
        if sum == target {
            return (left, right);         // ← found
        }
        if sum > target {
            right -= 1;                   // ← Sum too large, move right pointer left
        } else {
            left += 1;                    // ← Sum too small, move left pointer right
        }
    }
    (-1, -1)                              // ← not found
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func twoSumSorted(arr []int, target int) (int, int) {
    left, right := 0, len(arr)-1
    for left < right {
        sum := arr[left] +arr[right]     // ← Compute current sum
        if sum == target {
            return left, right            // ← found
        }
        if sum > target {
            right--                       // ← Sum too large, move right pointer left
        } else {
            left++                       // ← Sum too small, move left pointer right
        }
    }
    return -1, -1                         // ← not found
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static int[] twoSumSorted(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int sum = arr[left] +arr[right];   // ← Compute current sum
        if (sum == target)
            return new int[]{left, right};  // ← found
        if (sum > target) right--;          // ← Sum too large, move right pointer left
        else left++;                        // ← Sum too small, move left pointer right
    }
    return new int[]{-1, -1};              // ← not found
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "container-with-water",
      i18nKey: "content.algorithms.two-pointers.scenarios.container-with-water",
      domain: "system",
      icon: "💧",
      reference: "LeetCode #11, HackerRank, CodeSignal",
    },
    {
      id: "merge-sorted-arrays",
      i18nKey: "content.algorithms.two-pointers.scenarios.merge-sorted-arrays",
      domain: "database",
      icon: "🗄️",
      reference: "MySQL merge join, PostgreSQL, SQLite",
    },
    {
      id: "cycle-detection",
      i18nKey: "content.algorithms.two-pointers.scenarios.cycle-detection",
      domain: "concurrency",
      icon: "🔄",
      codeSnippet: {
        language: "typescript",
        code: `// Floyd's tortoise-and-hare: detect infinite loops in linked structures
function hasCycle(head: { next: any } | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;       // tortoise: 1 step
    fast = fast.next.next;   // hare: 2 steps
    if (slow === fast) return true; // they meet → cycle
  }
  return false; // fast reached end → no cycle
}`,
      },
    },
  ] satisfies Scenario[],
};
