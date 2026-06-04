import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Bucket Sort — Frame Generator
 * Distributes elements into buckets, sorts each bucket (using insertion sort),
 * then concatenates. Works well for uniformly distributed data.
 */
export function* bucketSortGenerator(
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

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const bucketCount = Math.ceil(Math.sqrt(n));
  const range = (max - min) / bucketCount || 1;

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Create ${bucketCount}  buckets, range [${min}, ${max}]，span≈${range.toFixed(1)}`,
    highlightLine: 5,
  };

  // Distribute into buckets
  const buckets: number[][]=Array.from({ length: bucketCount }, () => []);

  for (let i = 0; i < n; i++) {
    const val = arr[i];
    let bucketIdx = Math.floor((val - min) / range);
    if (bucketIdx >= bucketCount) bucketIdx = bucketCount - 1; // max value goes to last bucket

    buckets[bucketIdx].push(val);

    yield {
      step: step++,
      state: { array: [...arr], comparing: [i], swapping: [], sorted: [] },
      description: `arr[${i}]=${val} → bucket[${bucketIdx}] (${buckets[bucketIdx].join(",")})`,
      highlightLine: 8,
    };
  }

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Buckets: ${buckets.map((b, i) => `bucket${i}[${b.join(",")}]`).join(" | ")}`,
    highlightLine: 10,
  };

  // Sort each bucket using insertion sort and concatenate
  const result: number[]=[];
  for (let b = 0; b < bucketCount; b++) {
    if (buckets[b].length === 0) continue;

    // Simple insertion sort on bucket
    for (let i = 1; i < buckets[b].length; i++) {
      const key = buckets[b][i];
      let j = i - 1;
      while (j >= 0 && buckets[b][j] > key) {
        buckets[b][j +1]=buckets[b][j];
        j--;
      }
      buckets[b][j +1]=key;
    }

    yield {
      step: step++,
      state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
      description: `bucket[${b}] After sorting: [${buckets[b].join(", ")}]`,
      highlightLine: 12,
    };

    result.push(...buckets[b]);
  }

  // Copy result back to arr
  for (let i = 0; i < n; i++) {
    arr[i]=result[i];
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
    highlightLine: 16,
  };
}

/** Code snippet for display */
export const bucketSortCode = `function bucketSort(arr: number[]): number[] {
  const n = arr.length;
  if (n <= 1) return arr;

  const min = Math.min(...arr), max = Math.max(...arr);
  const bucketCount = Math.ceil(Math.sqrt(n));
  const range = (max - min) / bucketCount || 1;

  const buckets: number[][]=Array.from({ length: bucketCount }, () => []);

  for (const val of arr) {                        // ① → bucket
    const idx = Math.min(Math.floor((val - min) / range), bucketCount - 1);
    buckets[idx].push(val);
  }

  const result: number[]=[];
  for (const bucket of buckets) {                  // ② bucket sort
    if (bucket.length === 0) continue;
    bucket.sort((a, b) => a - b);                  // ③ merge
    result.push(...bucket);
  }
  return result;
}`;

export const bucketSortCodeLines = [
  "function bucketSort(arr: number[]): number[] {",
  "  const n = arr.length;",
  "  if (n <= 1) return arr;",
  "  const min = Math.min(...arr), max = Math.max(...arr);",
  "  const bucketCount = Math.ceil(Math.sqrt(n));",
  "  const range = (max - min) / bucketCount || 1;",
  "  const buckets: number[][]=Array.from({ length: bucketCount }, () => []);",
  "  for (const val of arr) {",
  "    const idx = Math.min(Math.floor((val - min) / range), bucketCount - 1);",
  "    buckets[idx].push(val);",
  "  }",
  "  const result: number[]=[];",
  "  for (const bucket of buckets) {",
  "    bucket.sort((a, b) => a - b);",
  "    result.push(...bucket);",
  "  }",
  "  return result;",
  "}",
];

/** Content definition */
export const bucketSortContent = {
  id: "bucket-sort",
  slug: "bucket-sort",
  title: "",
  titleKey: "content.algorithms.bucket-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.bucket-sort.desc",
  defaultInput: [0.42, 0.32, 0.73, 0.11, 0.65, 0.28, 0.94, 0.57],
  generator: bucketSortGenerator as FrameGenerator<number[], SortState>,
  code: bucketSortCode,
  language: "TypeScript",
  complexity: {
    time: "O(n +k)",
    space: "O(k)",
  },
  tags: [],
  icon: "🪣",
  codeExamples: {
    typescript: {
      code: `function bucketSort(arr: number[]): number[] {
  const n = arr.length;
  if (n <= 1) return arr;

  const min = Math.min(...arr), max = Math.max(...arr);
  const bucketCount = Math.ceil(Math.sqrt(n));
  const range = (max - min) / bucketCount || 1;

  const buckets: number[][]=Array.from({ length: bucketCount }, () => []);

  for (const val of arr) {                        // ① → bucket
    const idx = Math.min(Math.floor((val - min) / range), bucketCount - 1);
    buckets[idx].push(val);
  }

  const result: number[]=[];
  for (const bucket of buckets) {                  // ② bucket sort
    if (bucket.length === 0) continue;
    bucket.sort((a, b) => a - b);                  // ③ merge
    result.push(...bucket);
  }
  return result;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void bucketSort(int arr[], int n) {
  if (n <= 1) return;

  int min = arr[0], max = arr[0];
  for (int i = 1; i < n; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }

  int bucketCount = (int)sqrt(n) +1;
  double range = (double)(max - min +1) / bucketCount;

  int** buckets = malloc(bucketCount * sizeof(int*));
  int* sizes = calloc(bucketCount, sizeof(int));

  // ① → bucket
  for (int i = 0; i < n; i++) {
    int idx = (int)((arr[i] - min) / range);
    if (idx >= bucketCount) idx = bucketCount - 1;
    sizes[idx]++;
    buckets[idx]=realloc(buckets[idx], sizes[idx] * sizeof(int));
    buckets[idx][sizes[idx] - 1]=arr[i];
  }

  // ② bucket sort +③ 
  int k = 0;
  for (int b = 0; b < bucketCount; b++) {
    // simple insert sort
    for (int i = 1; i < sizes[b]; i++) {
      int key = buckets[b][i], j = i - 1;
      while (j >= 0 && buckets[b][j] > key) {
        buckets[b][j +1]=buckets[b][j]; j--;
      }
      buckets[b][j +1]=key;
    }
    for (int i = 0; i < sizes[b]; i++)
      arr[k++]=buckets[b][i];
    free(buckets[b]);
  }
  free(buckets); free(sizes);
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void bucketSort(vector<int>& arr) {
  int n = arr.size();
  if (n <= 1) return;

  int min = *min_element(arr.begin(), arr.end());
  int max = *max_element(arr.begin(), arr.end());
  int bucketCount = (int)ceil(sqrt(n));
  double range = (double)(max - min +1) / bucketCount;

  vector<vector<int>> buckets(bucketCount);

  for (int val : arr) {                           // ① → bucket
    int idx = min((int)((val - min) / range), bucketCount - 1);
    buckets[idx].push_back(val);
  }

  for (auto& bucket : buckets)                    // ② bucket sort
    sort(bucket.begin(), bucket.end());

  int k = 0;
  for (auto& bucket : buckets)                    // ③ merge
    for (int val : bucket)
      arr[k++]=val;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def bucket_sort(arr):
    if len(arr) <= 1:
        return arr

    min_val, max_val = min(arr), max(arr)
    bucket_count = max(1, int(len(arr) ** 0.5))
    range_val = (max_val - min_val) / bucket_count or 1

    buckets = [[] for _ in range(bucket_count)]

    for val in arr:                               # ① → bucket
        idx = min(int((val - min_val) / range_val), bucket_count - 1)
        buckets[idx].append(val)

    result = []
    for bucket in buckets:                        # ② bucket sort +③ 
        bucket.sort()
        result.extend(bucket)
    return result`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn bucket_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    if n <= 1 { return; }

    let min = *arr.iter().min().unwrap();
    let max = *arr.iter().max().unwrap();
    let bucket_count = (n as f64).sqrt().ceil() as usize;
    let range = (max - min +1) as f64 / bucket_count as f64;

    let mut buckets: Vec<Vec<i32>> = vec![vec![]; bucket_count];

    for &val in arr.iter() {                      // ① → bucket
        let idx = ((val - min) as f64 / range).min((bucket_count - 1) as f64) as usize;
        buckets[idx].push(val);
    }

    let mut k = 0;
    for bucket in buckets.iter_mut() {            // ② bucket sort +③ 
        bucket.sort();
        for &val in bucket.iter() {
            arr[k]=val;
            k += 1;
        }
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func bucketSort(arr []int) {
    n := len(arr)
    if n <= 1 { return }

    min, max := arr[0], arr[0]
    for _, v := range arr {
        if v < min { min = v }
        if v > max { max = v }
    }
    bucketCount := int(math.Sqrt(float64(n))) +1
    rangeVal := float64(max-min+1) / float64(bucketCount)

    buckets := make([][]int, bucketCount)
    for _, val := range arr {                     // ① → bucket
        idx := int(float64(val-min) / rangeVal)
        if idx >= bucketCount { idx = bucketCount - 1 }
        buckets[idx]=append(buckets[idx], val)
    }

    k := 0
    for _, bucket := range buckets {              // ② bucket sort +③ 
        sort.Ints(bucket)
        for _, val := range bucket {
            arr[k]=val
            k++
        }
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void bucketSort(int[] arr) {
    int n = arr.length;
    if (n <= 1) return;

    int min = Integer.MAX_VALUE, max = Integer.MIN_VALUE;
    for (int val : arr) {
        if (val < min) min = val;
        if (val > max) max = val;
    }

    int bucketCount = (int) Math.ceil(Math.sqrt(n));
    double range = (double) (max - min +1) / bucketCount;
    List<List<Integer>> buckets = new ArrayList<>();
    for (int i = 0; i < bucketCount; i++) buckets.add(new ArrayList<>());

    for (int val : arr) {                         // ① → bucket
        int idx = Math.min((int) ((val - min) / range), bucketCount - 1);
        buckets.get(idx).add(val);
    }

    int k = 0;
    for (List<Integer> bucket : buckets) {         // ② bucket sort +③ 
        Collections.sort(bucket);
        for (int val : bucket) arr[k++]=val;
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "mapreduce-shuffle",
      i18nKey: "content.algorithms.bucket-sort.scenarios.mapreduce-shuffle",
      domain: "data-pipeline",
      icon: "🏭",
      reference: "Hadoop MapReduce, Apache Spark shuffle, Flink partitioning",
      codeSnippet: {
        language: "java",
        code: `// MapReduce shuffle phase uses bucket-based distribution
// Each reducer gets a partition of keys, then sorts within
MapReduceJob job = new MapReduceJob();
// Partitioner assigns keys to reducers (buckets)
job.setPartitioner((key, numReduce) -> {
    return (key.hashCode() & Integer.MAX_VALUE) % numReduce;
});
// Within each reducer, data is sorted (often via merge sort)
// Bucket assignment is O(1), actual sort happens per-bucket`,
      },
    },
    {
      id: "uniform-float-sorting",
      i18nKey: "content.algorithms.bucket-sort.scenarios.uniform-float-sorting",
      domain: "ai-ml",
      icon: "🧠",
      reference: "NumPy percentile, Scikit-learn quantile, TensorFlow ranking",
    },
    {
      id: "dns-record-distribution",
      i18nKey: "content.algorithms.bucket-sort.scenarios.dns-record-distribution",
      domain: "network",
      icon: "🌐",
      reference: "BIND9 zone sorting, dnsmasq query cache, CoreDNS plugins",
    },
  ] satisfies Scenario[],
};
