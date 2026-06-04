import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Counting Sort — Frame Generator
 * Non-comparison integer sort. Counts occurrences of each value,
 * then uses prefix sums to place elements in correct positions.
 */
export function* countingSortGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  let step = 0;
  const sortedIndices: number[]=[];
  void sortedIndices;

  // Initial state
  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Initial array: [${arr.join(", ")}]`,
    highlightLine: 0,
  };

  if (n === 0) return;

  // Find range
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min +1;

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Value range [${min}, ${max}]，Count array size = ${range}`,
    highlightLine: 3,
  };

  // Step 1: Count frequencies
  const count = new Array(range).fill(0);
  for (let i = 0; i < n; i++) {
    count[arr[i] - min]++;

    yield {
      step: step++,
      state: { array: [...arr], comparing: [i], swapping: [], sorted: [] },
      description: `Count：arr[${i}]=${arr[i]} → count[${arr[i] - min}]=${count[arr[i] - min]}`,
      highlightLine: 6,
    };
  }

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Count complete: [${count.join(", ")}]`,
    highlightLine: 8,
  };

  // Step 2: Prefix sums (for stable placement)
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Prefix sum complete: [${count.join(", ")}]`,
    highlightLine: 10,
  };

  // Step 3: Build output array
  const output = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    const val = arr[i];
    const pos = count[val - min] - 1;
    output[pos]=val;
    count[val - min]--;

    yield {
      step: step++,
      state: {
        array: [...output, ...arr.slice(n)],
        comparing: [i],
        swapping: [pos],
        sorted: [],
      },
      description: `Place arr[${i}]=${val} → position ${pos}`,
      highlightLine: 13,
    };
  }

  // Copy back
  for (let i = 0; i < n; i++) {
    arr[i]=output[i];
  }

  // Final sorted state
  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, k) => k),
    },
    description: `Sort complete ✅ [${arr.join(", ")}]`,
    highlightLine: 17,
  };
}

/** Code snippet for display */
export const countingSortCode = `function countingSort(arr: number[]): number[] {
  const min = Math.min(...arr), max = Math.max(...arr);
  const range = max - min +1;
  const count = new Array(range).fill(0);

  for (const val of arr) count[val - min]++;     // ① 

  for (let i = 1; i < range; i++)                // ② prefix sum
    count[i] += count[i - 1];

  const output = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {     // ③ ReversePlace(stable)
    output[count[arr[i] - min] - 1]=arr[i];
    count[arr[i] - min]--;
  }
  return output;
}`;

export const countingSortCodeLines = [
  "function countingSort(arr: number[]): number[] {",
  "  const min = Math.min(...arr), max = Math.max(...arr);",
  "  const range = max - min +1;",
  "  const count = new Array(range).fill(0);",
  "  for (const val of arr) count[val - min]++;     // ① ",
  "  for (let i = 1; i < range; i++)                // ② prefix sum",
  "    count[i] += count[i - 1];",
  "  const output = new Array(arr.length);",
  "  for (let i = arr.length - 1; i >= 0; i--) {     // ③ ReversePlace(stable)",
  "    output[count[arr[i] - min] - 1]=arr[i];",
  "    count[arr[i] - min]--;",
  "  }",
  "  return output;",
  "}",
];

/** Content definition */
export const countingSortContent = {
  id: "counting-sort",
  slug: "counting-sort",
  title: "",
  titleKey: "content.algorithms.counting-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.counting-sort.desc",
  defaultInput: [4, 2, 2, 8, 3, 3, 1],
  generator: countingSortGenerator as FrameGenerator<number[], SortState>,
  code: countingSortCode,
  language: "TypeScript",
  complexity: {
    time: "O(n +k)",
    space: "O(k)",
  },
  tags: [],
  icon: "📊",
  codeExamples: {
    typescript: {
      code: `function countingSort(arr: number[]): number[] {
  const min = Math.min(...arr), max = Math.max(...arr);
  const range = max - min +1;
  const count = new Array(range).fill(0);

  for (const val of arr) count[val - min]++;     // ① 

  for (let i = 1; i < range; i++)                // ② prefix sum
    count[i] += count[i - 1];

  const output = new Array(arr.length);
  for (let i = arr.length - 1; i >= 0; i--) {    // ③ ReversePlace(stable)
    output[count[arr[i] - min] - 1]=arr[i];
    count[arr[i] - min]--;
  }
  return output;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void countingSorr[0], max = arr[0];
  for (int i = 1; i < n; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }
  int range = max - min +1;
  int count[range];
  for (int i = 0; i < range; i++) count[i]=0;

  for (int i = 0; i < n; i++) count[arr[i] - min]++;  // ① 

  for (int i = 1; i < range; i++)                      // ② prefix sum
    count[i] += count[i - 1];

  int output[n];
  for (int i = n - 1; i >= 0; i--) {                   // ③ ReversePlace(stable)
    output[count[arr[i] - min] - 1]=arr[i];
    count[arr[i] - min]--;
  }
  for (int i = 0; i < n; i++) arr[i]=output[i];
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void countingSort(vector<int>& arr) {
  int n = arr.size();
  int min = *min_element(arr.begin(), arr.end());
  int max = *max_element(arr.begin(), arr.end());
  int range = max - min +1;
  vector<int> count(range, 0);

  for (int val : arr) count[val - min]++;           // ① 

  for (int i = 1; i < range; i++)                   // ② prefix sum
    count[i] += count[i - 1];

  vector<int> output(n);
  for (int i = n - 1; i >= 0; i--) {                // ③ ReversePlace(stable)
    output[count[arr[i] - min] - 1]=arr[i];
    count[arr[i] - min]--;
  }
  arr = output;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def counting_sort(arr):
    if not arr:
        return arr
    min_val, max_val = min(arr), max(arr)
    range_val = max_val - min_val +1
    count = [0] * range_val

    for val in arr:
        count[val - min_val] += 1                  # ① 

    for i in range(1, range_val):
        count[i] += count[i - 1]                   # ② prefix sum

    output = [0] * len(arr)
    for i in range(len(arr) - 1, -1, -1):          # ③ ReversePlace(stable)
        output[count[arr[i] - min_val] - 1]=arr[i]
        count[arr[i] - min_val] -= 1
    return output`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn counting_sort(arr: &mut Vec<i32>) {
    let min = *arr.iter().min().unwrap();
    let max = *arr.iter().max().unwrap();
    let range = (max - min +1) as usize;
    let mut count = vec![0; range];

    for &val in arr.iter() {
        count[(val - min) as usize] += 1;          // ① 
    }

    for i in 1..range {
        count[i] += count[i - 1];                  // ② prefix sum
    }

    let mut output = vec![0; arr.len()];
    for &val in arr.iter().rev() {                  // ③ ReversePlace(stable)
        let idx = (val - min) as usize;
        count[idx] -= 1;
        output[count[idx]]=val;
    }
    *arr = output;
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func countingSort(arr []int) {
    if len(arr) <= 1 { return }
    min, max := arr[0], arr[0]
    for _, v := range arr {
        if v < min { min = v }
        if v > max { max = v }
    }
    rangeVal := max - min +1
    count := make([]int, rangeVal)

    for _, val := range arr {
        count[val-min]++                         // ① 
    }

    for i := 1; i < rangeVal; i++{               // ② prefix sum
        count[i] += count[i-1]
    }

    output := make([]int, len(arr))
    for i := len(arr) - 1; i >= 0; i-- {          // ③ ReversePlace(stable)
        val := arr[i]
        count[val-min]--
        output[count[val-min]]=val
    }
    copy(arr, output)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void countingSort(int[] arr) {
    int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
    for (int val : arr) {
        if (val < min) min = val;
        if (val > max) max = val;
    }
    int range = max - min +1;
    int[] count = new int[range];

    for (int val : arr) count[val - min]++;         // ① 

    for (int i = 1; i < range; i++)                 // ② prefix sum
        count[i] += count[i - 1];

    int[] output = new int[arr.length];
    for (int i = arr.length - 1; i >= 0; i--) {     // ③ ReversePlace(stable)
        output[count[arr[i] - min] - 1]=arr[i];
        count[arr[i] - min]--;
    }
    System.arraycopy(output, 0, arr, 0, arr.length);
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "radix-sort-subroutine",
      i18nKey: "content.algorithms.counting-sort.scenarios.radix-sort-subroutine",
      domain: "library",
      icon: "🔢",
      reference: "Java Arrays.sort (stable), GNU libc qsort, Go sort.Slice",
      codeSnippet: {
        language: "typescript",
        code: `// Counting sort as a stable subroutine in radix sort
function countingSortByDigit(arr: number[], exp: number): void {
    const output = new Array(arr.length);
    const count = new Array(10).fill(0);

    for (const val of arr)
        count[Math.floor(val / exp) % 10]++;  // ① count digits

    for (let i = 1; i < 10; i++)
        count[i] += count[i - 1];             // ② prefix sum

    for (let i = arr.length - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    for (let i = 0; i < arr.length; i++) arr[i] = output[i];
}`,
      },
    },
    {
      id: "histogram-equalization",
      i18nKey: "content.algorithms.counting-sort.scenarios.histogram-equalization",
      domain: "graphics",
      icon: "🎨",
      reference: "OpenCV equalizeHist, PIL ImageEnhance, GPU shader pipelines",
    },
    {
      id: "database-statistics",
      i18nKey: "content.algorithms.counting-sort.scenarios.database-statistics",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL ANALYZE, MySQL histogram stats, ClickHouse sampling",
    },
  ] satisfies Scenario[],
};
