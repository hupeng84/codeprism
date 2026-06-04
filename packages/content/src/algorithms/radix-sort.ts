import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Radix Sort (LSD) — Frame Generator
 * Sorts numbers digit by digit from least significant to most significant,
 * using counting sort as the stable subroutine.
 */
export function* radixSortGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  let step = 0;

  // Initial state
  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Initial array: [${arr.join(", ")}]`,
    highlightLine: 0,
  };

  if (n <= 1) {
    yield {
      step: step++,
      state: { array: [...arr], comparing: [], swapping: [], sorted: Array.from({ length: n }, (_, k) => k) },
      description: `Sort complete ✅ [${arr.join(", ")}]`,
      highlightLine: 2,
    };
    return;
  }

  // Find max value to determine number of digits
  const maxVal = Math.max(...arr);
  const maxDigits = maxVal.toString().length;

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Maximum value=${maxVal}，total ${maxDigits} digits`,
    highlightLine: 5,
  };

  // LSD Radix Sort
  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    yield {
      step: step++,
      state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
      description: `--- By digit/${exp === 1 ? "ones" : exp === 10 ? "tens" : exp === 100 ? "hundreds" : String(exp) +" digit"} sort (exp=${exp}) ---`,
      highlightLine: 7,
    };

    const output = new Array(n);
    const count = new Array(10).fill(0);

    // Count occurrences of current digit
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      count[digit]++;

      yield {
        step: step++,
        state: { array: [...arr], comparing: [i], swapping: [], sorted: [] },
        description: `arr[${i}]=${arr[i]} → digit ${digit}, count=${count[digit]}`,
        highlightLine: 10,
      };
    }

    // Prefix sum for stable placement
    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
    }

    // Build output (stable: iterate backwards)
    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(arr[i] / exp) % 10;
      const pos = count[digit] - 1;
      output[pos]=arr[i];
      count[digit]--;
    }

    // Copy back
    for (let i = 0; i < n; i++) {
      arr[i]=output[i];
    }

    yield {
      step: step++,
      state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
      description: `After digit sort: [${arr.join(", ")}]`,
      highlightLine: 15,
    };
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
export const radixSortCode = `function radixSort(arr: number[]): number[] {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array(arr.length);
    const count = new Array(10).fill(0);

    for (const val of arr)                    // ① count current digit
      count[Math.floor(val / exp) % 10]++;

    for (let i = 1; i < 10; i++)              // ② sum
      count[i] += count[i - 1];

    for (let i = arr.length - 1; i >= 0; i--) { // ③ stable place
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1]=arr[i];
      count[digit]--;
    }
    for (let i = 0; i < arr.length; i++)
      arr[i]=output[i];
  }
  return arr;
}`;

export const radixSortCodeLines = [
  "function radixSort(arr: number[]): number[] {",
  "  const max = Math.max(...arr);",
  "  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {",
  "    const output = new Array(arr.length);",
  "    const count = new Array(10).fill(0);",
  "    for (const val of arr)",
  "      count[Math.floor(val / exp) % 10]++;",
  "    for (let i = 1; i < 10; i++)",
  "      count[i] += count[i - 1];",
  "    for (let i = arr.length - 1; i >= 0; i--) {",
  "      const digit = Math.floor(arr[i] / exp) % 10;",
  "      output[count[digit] - 1]=arr[i];",
  "      count[digit]--;",
  "    }",
  "    for (let i = 0; i < arr.length; i++)",
  "      arr[i]=output[i];",
  "  }",
  "  return arr;",
  "}",
];

/** Content definition */
export const radixSortContent = {
  id: "radix-sort",
  slug: "radix-sort",
  title: "",
  titleKey: "content.algorithms.radix-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.radix-sort.desc",
  defaultInput: [170, 45, 75, 90, 2, 802, 24, 66],
  generator: radixSortGenerator as FrameGenerator<number[], SortState>,
  code: radixSortCode,
  language: "TypeScript",
  complexity: {
    time: "O(d × (n +k))",
    space: "O(n +k)",
  },
  tags: [],
  icon: "🔢",
  codeExamples: {
    typescript: {
      code: `function radixSort(arr: number[]): number[] {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const output = new Array(arr.length);
    const count = new Array(10).fill(0);

    for (const val of arr)                    // ① count current digit
      count[Math.floor(val / exp) % 10]++;

    for (let i = 1; i < 10; i++)              // ② sum
      count[i] += count[i - 1];

    for (let i = arr.length - 1; i >= 0; i--) { // ③ stable place
      const digit = Math.floor(arr[i] / exp) % 10;
      output[count[digit] - 1]=arr[i];
      count[digit]--;
    }
    for (let i = 0; i < arr.length; i++)
      arr[i]=output[i];
  }
  return arr;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void countingSortByDigit(int arr[], int n, int exp) {
  int output[n], count[10]={0};

  for (int i = 0; i < n; i++)
    count[(arr[i] / exp) % 10]++;             // ① count current digit

  for (int i = 1; i < 10; i++)                // ② sum
    count[i] += count[i - 1];

  for (int i = n - 1; i >= 0; i--) {          // ③ stable place
    int digit = (arr[i] / exp) % 10;
    output[count[digit] - 1]=arr[i];
    count[digit]--;
  }
  for (int i = 0; i < n; i++) arr[i]=output[i];
}

void radixSort(int arr[], int n) {
  int max = arr[0];
  for (int i = 1; i < n; i++)
    if (arr[i] > max) max = arr[i];
  for (int exp = 1; max / exp > 0; exp *= 10)
    countingSortByDigit(arr, n, exp);
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void countingSortByDigit(vector<int>& arr, int exp) {
  int n = arr.size();
  vector<int> output(n), count(10, 0);

  for (int val : arr)
    count[(val / exp) % 10]++;                // ① count current digit

  for (int i = 1; i < 10; i++)                // ② sum
    count[i] += count[i - 1];

  for (int i = n - 1; i >= 0; i--) {          // ③ stable place
    int digit = (arr[i] / exp) % 10;
    output[count[digit] - 1]=arr[i];
    count[digit]--;
  }
  arr = output;
}

void radixSort(vector<int>& arr) {
  int max = *max_element(arr.begin(), arr.end());
  for (int exp = 1; max / exp > 0; exp *= 10)
    countingSortByDigit(arr, exp);
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_by_di*= 10
    return arr

def counting_sort_by_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10

    for val in arr:
        count[(val // exp) % 10] += 1          # ① count current digit

    for i in range(1, 10):
        count[i] += count[i - 1]               # ② sum

    for i in range(n - 1, -1, -1):             # ③ stable place
        digit = (arr[i] // exp) % 10
        output[count[digit] - 1]=arr[i]
        count[digit] -= 1

    for i in range(n):
        arr[i]=output[i]`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn counting_sort_by_digit(arr: &mut Vec<i32>, exp: i32) {
    let n = arr.len();
    let mut output = vec![0; n];
    let mut count = vec![0; 10];

    for &val in arr.iter() {
        count[((val / exp) % 10) as usize] += 1;  // ① count current digit
    }

    for i in 1..10 {
        count[i] += count[i - 1];                  // ② sum
    }

    for &val in arr.iter().rev() {                  // ③ stable place
        let digit = ((val / exp) % 10) as usize;
        count[digit] -= 1;
        output[count[digit]]=val;
    }
    *arr = output;
}

fn radix_sort(arr: &mut Vec<i32>) {
    let max = *arr.iter().max().unwrap();
    let mut exp = 1;
    while max / exp > 0 {
        counting_sort_by_digit(arr, exp);
        exp *= 10;
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func countingSortByDigit(arr []int, exp int) {
    n := len(arr)
    output := make([]int, n)
    count := make([]int, 10)

    for _, val := range arr {
        count[(val/exp)%10]++                 // ① count current digit
    }

    for i := 1; i < 10; i++{                  // ② sum
        count[i] += count[i-1]
    }

    for i := n - 1; i >= 0; i-- {              // ③ stable place
        digit := (arr[i] / exp) % 10
        count[digit]--
        output[count[digit]]=arr[i]
    }
    copy(arr, output)
}

func radixSort(arr []int) {
    max := arr[0]
    for _, v := range arr {
        if v > max { max = v }
    }
    for exp := 1; max/exp > 0; exp *= 10 {
        countingSortByDigit(arr, exp)
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void radixSort(int[] arr) {
    int max = Arrays.stream(arr).max().getAsInt();
    for (int exp = 1; max / exp > 0; exp *= 10)
        countingSortByDigit(arr, exp);
}

private static void countingSortByDigit(int[] arr, int exp) {
    int n = arr.length;
    int[] output = new int[n];
    int[] count = new int[10];

    for (int val : arr)
        count[(val / exp) % 10]++;              // ① count current digit

    for (int i = 1; i < 10; i++)                // ② sum
        count[i] += count[i - 1];

    for (int i = n - 1; i >= 0; i--) {          // ③ stable place
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1]=arr[i];
        count[digit]--;
    }
    System.arraycopy(output, 0, arr, 0, n);
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "unix-external-sort",
      i18nKey: "content.algorithms.radix-sort.scenarios.unix-external-sort",
      domain: "system",
      icon: "🐧",
      reference: "GNU sort, BSD sort, macOS sort command",
      codeSnippet: {
        language: "c",
        code: `// Classic Unix sort used radix-based approaches for string data
// The 'sort' command historically used multi-key radix sorting
// for large file sorting with limited memory
void radix_pass(unsigned char *data, unsigned char *tmp,
                int *buckets, int n, int radix_shift) {
    int count[256] = {0};
    for (int i = 0; i < n; i++)
        count[(data[i * sizeof_key] >> radix_shift) & 0xFF]++;
    for (int i = 1; i < 256; i++)
        count[i] += count[i-1];
    for (int i = n - 1; i >= 0; i--) {
        int digit = (data[i * sizeof_key] >> radix_shift) & 0xFF;
        int pos = --count[digit];
        memcpy(tmp + pos * sizeof_key, data + i * sizeof_key, sizeof_key);
    }
}`,
      },
    },
    {
      id: "suffix-array-construction",
      i18nKey: "content.algorithms.radix-sort.scenarios.suffix-array-construction",
      domain: "ai-ml",
      icon: "🧠",
      reference: "Elasticsearch BM25, Lucene index, Sphinx search engine",
    },
    {
      id: "database-integer-index",
      i18nKey: "content.algorithms.radix-sort.scenarios.database-integer-index",
      domain: "database",
      icon: "🗄️",
      reference: "SQLite autoincrement, PostgreSQL OIDs, MySQL InnoDB primary keys",
    },
  ] satisfies Scenario[],
};
