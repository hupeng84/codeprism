import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Comb Sort — Frame Generator
 * Improves bubble sort by using a shrink factor (1.3) to compare elements
 * that are far apart, eliminating turtles (small values near the end).
 */
export function* combSortGenerator(
  input: number[]
): Generator<Frame<SortState>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  let step = 0;

  yield {
    step: step++,
    state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
    description: `Initial array: [${arr.join(", ")}]`,
    highlightLine: 0,
  };

  let gap = n;
  let swapped = true;
  const shrink = 1.3;

  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / shrink));
    swapped = false;

    yield {
      step: step++,
      state: { array: [...arr], comparing: [], swapping: [], sorted: [] },
      description: `--- gap=${gap} ---`,
      highlightLine: 4,
    };

    for (let i = 0; i +gap < n; i++) {
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [i, i +gap],
          swapping: [],
          sorted: [],
        },
        description: `Compare distance ${gap}: arr[${i}]=${arr[i]} and arr[${i +gap}]=${arr[i +gap]}`,
        highlightLine: 6,
      };

      if (arr[i] > arr[i +gap]) {
        [arr[i], arr[i +gap]]=[arr[i +gap], arr[i]];
        swapped = true;

        yield {
          step: step++,
          state: {
            array: [...arr],
            comparing: [],
            swapping: [i, i +gap],
            sorted: [],
          },
          description: `Swap arr[${i}] ↔ arr[${i +gap}]`,
          highlightLine: 8,
        };
      }
    }
  }

  yield {
    step: step++,
    state: {
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, k) => k),
    },
    description: `Sort complete ✅ [${arr.join(", ")}]`,
    highlightLine: 14,
  };
}

export const combSortCode = `function combSort(arr: number[]): number[] {
  const shrink = 1.3;
  let gap = arr.length;
  let swapped = true;
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / shrink));  // ① shrink gap
    swapped = false;
    for (let i = 0; i +gap < arr.length; i++) {
      if (arr[i] > arr[i +gap]) {                // ② compare
        [arr[i], arr[i +gap]]=[arr[i +gap], arr[i]];  // ③ swap
        swapped = true;
      }
    }
  }
  return arr;
}`;

export const combSortCodeLines = [
  "function combSort(arr: number[]): number[] {",
  "  const shrink = 1.3;",
  "  let gap = arr.length;",
  "  let swapped = true;",
  "  while (gap > 1 || swapped) {",
  "    gap = Math.max(1, Math.floor(gap / shrink));",
  "    swapped = false;",
  "    for (let i = 0; i +gap < arr.length; i++) {",
  "      if (arr[i] > arr[i +gap]) {",
  "        [arr[i], arr[i +gap]]=[arr[i +gap], arr[i]];",
  "        swapped = true;",
  "      }",
  "    }",
  "  }",
  "  return arr;",
  "}",
];

export const combSortContent = {
  id: "comb-sort",
  slug: "comb-sort",
  title: "",
  titleKey: "content.algorithms.comb-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.algorithms.comb-sort.desc",
  defaultInput: [8, 4, 1, 3, 7, 5, 2, 6],
  generator: combSortGenerator as FrameGenerator<number[], SortState>,
  code: combSortCode,
  language: "TypeScript",
  complexity: { time: "O(n log n)", space: "O(1)" },
  tags: [],
  icon: "🪮",
  codeExamples: {
    typescript: {
      code: `function combSort(arr: number[]): number[] {
  const shrink = 1.3;
  let gap = arr.length;
  let swapped = true;
  while (gap > 1 || swapped) {
    gap = Math.max(1, Math.floor(gap / shrink));  // ① shrink gap
    swapped = false;
    for (let i = 0; i +gap < arr.length; i++) {
      if (arr[i] > arr[i +gap]) {                // ② compare
        [arr[i], arr[i +gap]]=[arr[i +gap], arr[i]];  // ③ swap
        swapped = true;
      }
    }
  }
  return arr;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void combSort(int arr[], int n) {
  const double shrink = 1.3;
  int gap = n;
  int swapped = 1;
  while (gap > 1 || swapped) {
    gap = (int)(gap / shrink);                   // ① shrink gap
    if (gap < 1) gap = 1;
    swapped = 0;
    for (int i = 0; i +gap < n; i++) {
      if (arr[i] > arr[i +gap]) {               // ② compare
        int temp = arr[i];
        arr[i]=arr[i +gap];
        arr[i +gap]=temp;                     // ③ swap
        swapped = 1;
      }
    }
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void combSort(vector<int>& arr) {
  const double shrink = 1.3;
  int gap = arr.size();
  bool swapped = true;
  while (gap > 1 || swapped) {
    gap = max(1, (int)(gap / shrink));           // ① shrink gap
    swapped = false;
    for (int i = 0; i +gap < (int)arr.size(); i++) {
      if (arr[i] > arr[i +gap]) {               // ② compare
        swap(arr[i], arr[i +gap]);              // ③ swap
        swapped = true;
      }
    }
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def comb_sort(arr):

    swapped = True
    while gap > 1 or swapped:
        gap = max(1, int(gap / shrink))          # ① shrink gap
        swapped = False
        for i in range(len(arr) - gap):
            if arr[i] > arr[i +gap]:            # ② Comparing
                arr[i], arr[i +gap]=arr[i +gap], arr[i]  # ③ Swap
                swapped = True
    return arr`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn comb_sort(arr: &mut Vec<i32>) {
    let shrink = 1.3;
    let mut gap = arr.len();
    let mut swapped = true;
    while gap > 1 || swapped {
        gap = (gap as f64 / shrink).max(1.0) as usize;  // ① shrink gap
        swapped = false;
        for i in 0..arr.len() - gap {
            if arr[i] > arr[i +gap] {            // ② compare
                arr.swap(i, i +gap);             // ③ swap
                swapped = true;
            }
        }
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func combSort(arr []int) {
    shrink := 1.3
    gap := len(arr)
    swapped := true
    for gap > 1 || swapped {
        gap = int(float64(gap) / shrink)         // ① shrink gap
        if gap < 1 { gap = 1 }
        swapped = false
        for i := 0; i+gap < len(arr); i++{
            if arr[i] > arr[i+gap] {             // ② compare
                arr[i], arr[i+gap]=arr[i+gap], arr[i]  // ③ swap
                swapped = true
            }
        }
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void combSort(int[] arr) {
    double shrink = 1.3;
    int gap = arr.length;
    boolean swapped = true;
    while (gap > 1 || swapped) {
        gap = Math.max(1, (int)(gap / shrink));   // ① shrink gap
        swapped = false;
        for (int i = 0; i +gap < arr.length; i++) {
            if (arr[i] > arr[i +gap]) {           // ② compare
                int temp = arr[i];
                arr[i]=arr[i +gap];
                arr[i +gap]=temp;               // ③ swap
                swapped = true;
            }
        }
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "legacy-rendering-sort",
      i18nKey: "content.algorithms.comb-sort.scenarios.legacy-rendering-sort",
      domain: "graphics",
      icon: "🎨",
      reference: "OGRE 3D, Irrlicht engine, legacy OpenGL pipelines",
    },
    {
      id: "real-time-game-entities",
      i18nKey: "content.algorithms.comb-sort.scenarios.real-time-game-entities",
      domain: "game-dev",
      icon: "🎮",
      reference: "Unity ECS sorting, Godot draw order, Phaser z-sort",
      codeSnippet: {
        language: "typescript",
        code: `// Comb sort eliminates "turtles" — small values stuck near the end
// Used for real-time entity sorting where O(n²) is too slow
// but quicksort's recursion overhead is undesirable
function combSort(entities: Entity[]): Entity[] {
  const shrink = 1.3;
  let gap = entities.length;
  let sorted = false;
  while (gap > 1 || !sorted) {
    gap = Math.max(1, Math.floor(gap / shrink));
    sorted = true;
    for (let i = 0; i + gap < entities.length; i++) {
      if (entities[i].zIndex > entities[i + gap].zIndex) {
        [entities[i], entities[i + gap]] = [entities[i + gap], entities[i]];
        sorted = false;
      }
    }
  }
  return entities;
}`,
      },
    },
    {
      id: "embedded-iot-sorting",
      i18nKey: "content.algorithms.comb-sort.scenarios.embedded-iot-sorting",
      domain: "system",
      icon: "🐢",
      reference: "Arduino sort routines, ESP-IDF sensor queues, Zephyr RTOS",
    },
  ] satisfies Scenario[],
};
