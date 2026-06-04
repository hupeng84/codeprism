import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Merge Sort — Frame Generator
 * Recursively divides the array, then merges sorted halves.
 */
export function* mergeSortGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  let step = 0;
  const n = arr.length;

  // Initial state
  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Initial array: [${arr.join(", ")}]，total ${n} elements`,
    highlightLine: 0,
  };

  // Top-down merge sort using a stack-based simulation
  // Each frame: { type, low, high, temp }
  // Simple recursive simulation via explicit stack
  // First pass: push all split operations
  const pending: { type: "merge"; low: number; mid: number; high: number }[]=[];

  function buildPlan(low: number, high: number) {
    if (low >= high) return;
    const mid = Math.floor((low +high) / 2);
    buildPlan(low, mid);
    buildPlan(mid +1, high);
    pending.push({ type: "merge", low, mid, high });
  }
  buildPlan(0, n - 1);

  // Now execute the plan — split visualization followed by merges
  // Show the recursive division conceptually
  const temp = [...arr];

  // Show division phases for ranges > 1
  const divisions: { low: number; high: number; depth: number }[]=[];
  function collectDivisions(low: number, high: number, depth: number) {
    if (low >= high) return;
    divisions.push({ low, high, depth });
    const mid = Math.floor((low +high) / 2);
    collectDivisions(low, mid, depth +1);
    collectDivisions(mid +1, high, depth +1);
  }
  collectDivisions(0, n - 1, 0);

  // Sort divisions by depth (shallower first)
  divisions.sort((a, b) => a.depth - b.depth);

  for (const d of divisions) {
    if (d.low === d.high) continue;
    const mid = Math.floor((d.low +d.high) / 2);
    yield {
      step: step++,
      state: {
        array: [...temp],
        comparing: [d.low, d.high],
        swapping: [],
        sorted: [],
      },
      description: `Split: [${d.low}..${d.high}] → [${d.low}..${mid}] +[${mid +1}..${d.high}]`,
      highlightLine: 2,
    };
  }

  // Execute merges
  for (const p of pending) {
    const { low, mid, high } = p;
    yield* merge(temp, low, mid, high, () => step++);
  }

  // Final state
  yield {
    step: step++,
    state: {
      array: [...temp],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, i) => i),
    },
    description: `Sort complete ✅ [${temp.join(", ")}]`,
      highlightLine: 5,
    };
}

/**
 * Merge two sorted subarrays — yields frames during comparison and placement.
 */
function* merge(
  arr: number[],
  low: number,
  mid: number,
  high: number,
  nextStep: () => number
): Generator<Frame<SortState>, void, unknown> {
  const left = arr.slice(low, mid +1);
  const right = arr.slice(mid +1, high +1);
  let i = 0, j = 0, k = low;

  while (i < left.length && j < right.length) {
    yield {
      step: nextStep(),
      state: {
        array: [...arr],
        comparing: [low +i, mid +1 +j],
        swapping: [],
        sorted: [],
      },
      description: `Comparing: ${left[i]} (left[${low +i}]) vs ${right[j]} (right[${mid +1 +j}])`,
      highlightLine: 13,
    };

    if (left[i] <= right[j]) {
      arr[k]=left[i];
      yield {
        step: nextStep(),
        state: {
          array: [...arr],
          comparing: [],
          swapping: [k],
          sorted: [],
        },
        description: `← Take left ${left[i]} → arr[${k}]`,
        highlightLine: 14,
      };
      i++;
    } else {
      arr[k]=right[j];
      yield {
        step: nextStep(),
        state: {
          array: [...arr],
          comparing: [],
          swapping: [k],
          sorted: [],
        },
        description: `→ Take right ${right[j]} → arr[${k}]`,
        highlightLine: 15,
      };
      j++;
    }
    k++;
  }

  // Copy remaining left elements
  while (i < left.length) {
    arr[k]=left[i];
    yield {
      step: nextStep(),
      state: {
        array: [...arr],
        comparing: [],
          swapping: [k],
          sorted: [],
        },
        description: `Remaining left ${left[i]} → arr[${k}]`,
        highlightLine: 17,
    };
    i++;
    k++;
  }

  // Copy remaining right elements
  while (j < right.length) {
    arr[k]=right[j];
    yield {
      step: nextStep(),
      state: {
        array: [...arr],
        comparing: [],
          swapping: [k],
          sorted: [],
        },
        description: `Remaining right ${right[j]} → arr[${k}]`,
        highlightLine: 18,
    };
    j++;
    k++;
  }
}

// ── Code display ──

export const mergeSortCode = `function mergeSort(arr: number[], left: number, right: number): void {
  if (left >= right) return;
  const mid = Math.floor((left +right) / 2);    // ← split
  mergeSort(arr, left, mid);
  mergeSort(arr, mid +1, right);
  merge(arr, left, mid, right);                   // ← merge
}

function merge(arr: number[], left: number, mid: number, right: number): void {
  const L = arr.slice(left, mid +1);
  const R = arr.slice(mid +1, right +1);
  let i = 0, j = 0, k = left;

  while (i < L.length && j < R.length) {
    if (L[i] <= R[j]) arr[k++]=L[i++];          // ← take left
    else arr[k++]=R[j++];                       // ← take right
  }
  while (i < L.length) arr[k++]=L[i++];         // ← remaining left
  while (j < R.length) arr[k++]=R[j++];         // ← remaining right
}`;

export const mergeSortCodeLines = [
  "function mergeSort(arr: number[], left: number, right: number): void {",
  "  if (left >= right) return;",
  '  const mid = Math.floor((left +right) / 2);    // ← split',
  "  mergeSort(arr, left, mid);",
  "  mergeSort(arr, mid +1, right);",
  '  merge(arr, left, mid, right);                   // ← merge',
  "}",
  "",
  "function merge(arr: number[], left: number, mid: number, right: number): void {",
  "  const L = arr.slice(left, mid +1);",
  "  const R = arr.slice(mid +1, right +1);",
  "  let i = 0, j = 0, k = left;",
  "",
  "  while (i < L.length && j < R.length) {",
  '    if (L[i] <= R[j]) arr[k++]=L[i++];          // ← take left',
  '    else arr[k++]=R[j++];                       // ← take right',
  "  }",
  '  while (i < L.length) arr[k++]=L[i++];         // ← remaining left',
  '  while (j < R.length) arr[k++]=R[j++];         // ← remaining right',
  "}",
];

// ── Extend SortState with optional highlightRange ──
// We use a custom extension for the division visualization

export const mergeSortContent = {
  id: "merge-sort",
  slug: "merge-sort",
  title: "",
  titleKey: "content.algorithms.merge-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.merge-sort.desc",
  defaultInput: [38, 27, 43, 3, 9, 82, 10],
  generator: mergeSortGenerator as FrameGenerator<number[], SortState>,
  code: mergeSortCode,
  language: "TypeScript",
  complexity: { time: "O(n log n)", space: "O(n)" },
  tags: [],
  icon: "🔀",
  codeExamples: {
    typescript: {
      code: `function mergeSort(arr: number[], left: number, right: number): void {
  if (left >= right) return;
  const mid = Math.floor((left +right) / 2);    // ← split
  mergeSort(arr, left, mid);
  mergeSort(arr, mid +1, right);
  merge(arr, left, mid, right);                   // ← merge
}

function merge(arr: number[], left: number, mid: number, right: number): void {
  const L = arr.slice(left, mid +1);
  const R = arr.slice(mid +1, right +1);
  let i = 0, j = 0, k = left;

  while (i < L.length && j < R.length) {
    if (L[i] <= R[j]) arr[k++]=L[i++];          // ← take left
    else arr[k++]=R[j++];                       // ← take right
  }
  while (i < L.length) arr[k++]=L[i++];         // ← remaining left
  while (j < R.length) arr[k++]=R[j++];         // ← remaining right
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void merge(int arr[], int left, int mid, int right) {
  int n1 = mid - left +1, n2 = right - mid;
  int L[n1], R[n2];
  for (int i = 0; i < n1; i++) L[i]=arr[left +i];
  for (int j = 0; j < n2; j++) R[j]=arr[mid +1 +j];

  int i = 0, j = 0, k = left;
  while (i < n1 && j < n2) {
    if (L[i] <= R[j]) arr[k++]=L[i++];          // ← take left
    else arr[k++]=R[j++];                       // ← take right
  }
  while (i < n1) arr[k++]=L[i++];               // ← remaining left
  while (j < n2) arr[k++]=R[j++];               // ← remaining right
}

void mergeSort(int arr[], int left, int right) {
  if (left < right) {
    int mid = left +(right - left) / 2;          // ← split
    mergeSort(arr, left, mid);
    mergeSort(arr, mid +1, right);
    merge(arr, left, mid, right);                 // ← merge
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void merge(vector<int>& arr, int left, int mid, int right) {
  vector<int> L(arr.begin() +left, arr.begin() +mid +1);
  vector<int> R(arr.begin() +mid +1, arr.begin() +right +1);
  int i = 0, j = 0, k = left;

  while (i < (int)L.size() && j < (int)R.size()) {
    if (L[i] <= R[j]) arr[k++]=L[i++];          // ← take left
    else arr[k++]=R[j++];                       // ← take right
  }
  while (i < (int)L.size()) arr[k++]=L[i++];    // ← remaining left
  while (j < (int)R.size()) arr[k++]=R[j++];    // ← remaining right
}

void mergeSort(vector<int>& arr, int left, int right) {
  if (left < right) {
    int mid = left +(right - left) / 2;          // ← split
    mergeSort(arr, left, mid);
    mergeSort(arr, mid +1, right);
    merge(arr, left, mid, right);                 // ← merge
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def merge_sort(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    if left < right:
        mid = (left +right) // 2                 # ← split
        merge_sort(arr, left, mid)
        merge_sort(arr, mid +1, right)
        merge(arr, left, mid, right)              # ← merge

def merge(arr, left, mid, right):
    L = arr[left:mid +1]
    R = arr[mid +1:right +1]
    i = j = 0
    k = left
    while i < len(L) and j < len(R):
        if L[i] <= R[j]:
            arr[k]=L[i]; i += 1                 # ← take left
        else:
            arr[k]=R[j]; j += 1                 # ← take right
        k += 1
    while i < len(L):
        arr[k]=L[i]; i += 1; k += 1             # ← remaining left
    while j < len(R):
        arr[k]=R[j]; j += 1; k += 1             # ← remaining right`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn merge_sort(arr: &mut Vec<i32>, left: usize, right: usize) {
    if left < right {
        let mid = left +(right - left) / 2;      // ← split
        merge_sort(arr, left, mid);
        merge_sort(arr, mid +1, right);
        merge(arr, left, mid, right);             // ← merge
    }
}

fn merge(arr: &mut Vec<i32>, left: usize, mid: usize, right: usize) {
    let mut L = arr[left..=mid].to_vec();
    let mut R = arr[mid +1..=right].to_vec();
    let (mut i, mut j)=(0, 0);
    let mut k = left;
    while i < L.len() && j < R.len() {
        if L[i] <= R[j] {
            arr[k]=L[i]; i += 1;                // ← take left
        } else {
            arr[k]=R[j]; j += 1;                // ← take right
        }
        k += 1;
    }
    while i < L.len() { arr[k]=L[i]; i += 1; k += 1; }  // ← remaining left
    while j < R.len() { arr[k]=R[j]; j += 1; k += 1; }  // ← remaining right
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func mergeSort(arr []int, left, right int) {
    if left < right {
        mid := left +(right-left)/2              // ← split
        mergeSort(arr, left, mid)
        mergeSort(arr, mid+1, right)
        merge(arr, left, mid, right)              // ← merge
    }
}

func merge(arr []int, left, mid, right int) {
    L := make([]int, mid-left+1)
    R := make([]int, right-mid)
    copy(L, arr[left:mid+1])
    copy(R, arr[mid+1:right+1])

    i, j, k := 0, 0, left
    for i < len(L) && j < len(R) {
        if L[i] <= R[j] {
            arr[k]=L[i]; i++                   // ← take left
        } else {
            arr[k]=R[j]; j++                   // ← take right
        }
        k++
    }
    for i < len(L) { arr[k]=L[i]; i++; k++}   // ← remaining left
    for j < len(R) { arr[k]=R[j]; j++; k++}   // ← remaining right
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void mergeSort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = left +(right - left) / 2;      // ← split
        mergeSort(arr, left, mid);
        mergeSort(arr, mid +1, right);
        merge(arr, left, mid, right);             // ← merge
    }
}

private static void merge(int[] arr, int left, int mid, int right) {
    int n1 = mid - left +1, n2 = right - mid;
    int[] L = new int[n1], R = new int[n2];
    System.arraycopy(arr, left, L, 0, n1);
    System.arraycopy(arr, mid +1, R, 0, n2);

    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++]=L[i++];      // ← take left
        else arr[k++]=R[j++];                   // ← take right
    }
    while (i < n1) arr[k++]=L[i++];             // ← remaining left
    while (j < n2) arr[k++]=R[j++];             // ← remaining right
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "python-sorted-timsort",
      i18nKey: "content.algorithms.merge-sort.scenarios.python-sorted-timsort",
      domain: "library",
      icon: "🐍",
      reference: "Python sorted(), Python list.sort(), Timsort algorithm",
      codeSnippet: {
        language: "python",
        code: `# Python's sorted() uses Timsort — a hybrid of merge sort + insertion sort
# Timsort finds natural "runs" (already-sorted subsequences),
# extends short runs with insertion sort, then merges with merge sort
data = [5, 2, 8, 1, 9, 3, 7, 4, 6]
sorted_data = sorted(data)     # ← uses Timsort internally
# Timsort guarantees O(n log n) worst case and O(n) on nearly-sorted data
# This is why Python excels at sorting real-world data that often has
# partial ordering from prior operations`,
      },
    },
    {
      id: "external-sort-large-files",
      i18nKey: "content.algorithms.merge-sort.scenarios.external-sort-large-files",
      domain: "data-pipeline",
      icon: "🏭",
      reference: "Hadoop TeraSort, PostgreSQL external merge, Oracle sort-merge join",
    },
    {
      id: "stable-sort-objects",
      i18nKey: "content.algorithms.merge-sort.scenarios.stable-sort-objects",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "React sorted component lists, Angular pipe sort, Vue computed sort",
    },
  ] satisfies Scenario[],
};
