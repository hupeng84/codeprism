import type { Frame, FrameGenerator, Scenario, SortState } from "@codeprism/core";

/**
 * Cocktail Shaker Sort — Frame Generator
 * A bidirectional bubble sort that passes through the array in both directions
 * each iteration, reducing the effective range from both ends.
 */
export function* cocktailSortGenerator(
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

  let start = 0;
  let end = n - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;

    // Forward pass (left to right)
    for (let i = start; i < end; i++) {
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [i, i +1],
          swapping: [],
          sorted: Array.from({ length: n - 1 - end }, (_, k) => n - 1 - k),
        },
        description: `Forward：Comparing arr[${i}]=${arr[i]} and arr[${i +1}]=${arr[i +1]}`,
        highlightLine: 3,
      };

      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        swapped = true;

        yield {
          step: step++,
          state: {
            array: [...arr],
            comparing: [],
            swapping: [i, i +1],
            sorted: Array.from({ length: n - 1 - end }, (_, k) => n - 1 - k),
          },
          description: `Swap arr[${i}] ↔ arr[${i +1}]`,
          highlightLine: 5,
        };
      }
    }
    end--;

    if (!swapped) break;
    swapped = false;

    // Backward pass (right to left)
    for (let i = end - 1; i >= start; i--) {
      yield {
        step: step++,
        state: {
          array: [...arr],
          comparing: [i, i +1],
          swapping: [],
          sorted: Array.from({ length: n - 1 - end }, (_, k) => n - 1 - k),
        },
        description: `Reverse：Comparing arr[${i}]=${arr[i]} and arr[${i +1}]=${arr[i +1]}`,
        highlightLine: 10,
      };

      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        swapped = true;

        yield {
          step: step++,
          state: {
            array: [...arr],
            comparing: [],
            swapping: [i, i +1],
            sorted: Array.from({ length: n - 1 - end }, (_, k) => n - 1 - k),
          },
          description: `Swap arr[${i}] ↔ arr[${i +1}]`,
          highlightLine: 12,
        };
      }
    }
    start++;
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
    highlightLine: 18,
  };
}

export const cocktailSortCode = `function cocktailSort(arr: number[]): number[] {
  let start = 0, end = arr.length - 1;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {     // ① Forwardbubble
      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        swapped = true;
      }
    }
    end--;
    if (!swapped) break;
    for (let i = end - 1; i >= start; i--) { // ② Reversebubble
      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        swapped = true;
      }
    }
    start++;
  }
  return arr;
}`;

export const cocktailSortCodeLines = [
  "function cocktailSort(arr: number[]): number[] {",
  "  let start = 0, end = arr.length - 1;",
  "  let swapped = true;",
  "  while (swapped) {",
  "    swapped = false;",
  "    for (let i = start; i < end; i++) {",
  "      if (arr[i] > arr[i +1]) {",
  "        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];",
  "        swapped = true;",
  "      }",
  "    }",
  "    end--;",
  "    if (!swapped) break;",
  "    for (let i = end - 1; i >= start; i--) {",
  "      if (arr[i] > arr[i +1]) {",
  "        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];",
  "        swapped = true;",
  "      }",
  "    }",
  "    start++;",
  "  }",
  "  return arr;",
  "}",
];

export const cocktailSortContent = {
  id: "cocktail-sort",
  slug: "cocktail-sort",
  title: "",
  titleKey: "content.algorithms.cocktail-sort.title",
  category: "algorithm" as const,
  subcategory: "sorting",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.algorithms.cocktail-sort.desc",
  defaultInput: [5, 1, 4, 2, 8, 0, 9, 3],
  generator: cocktailSortGenerator as FrameGenerator<number[], SortState>,
  code: cocktailSortCode,
  language: "TypeScript",
  complexity: { time: "O(n²)", space: "O(1)" },
  tags: [],
  icon: "🥤",
  codeExamples: {
    typescript: {
      code: `function cocktailSort(arr: number[]): number[] {
  let start = 0, end = arr.length - 1;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {     // ① Forwardbubble
      if (arr[i] > arr[i +1]) {
        [arr[i], arr[i +1]]=[arr[i +1], arr[i]];
        swapped = true;
      }
    }
    end--;
    if (!swapped) break;
    for (let i = end - 1; i >= start; i--) { // ② Reversebubble
      if (arr[i] > arr[i +1]) {
        [arr[i], arr[    swapped = true;
      }
    }
    start++;
  }
  return arr;
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `void cocktailSort(int arr[], int n) {
  int start = 0, end = n - 1;
  int swapped = 1;
  while (swapped) {
    swapped = 0;
    for (int i = start; i < end; i++) {     // ① Forwardbubble
      if (arr[i] > arr[i +1]) {
        int temp = arr[i];
        arr[i]=arr[i +1];
        arr[i +1]=temp;
        swapped = 1;
      }
    }
    end--;
    if (!swapped) break;
    swapped = 0;
    for (int i = end - 1; i >= start; i--) { // ② Reversebubble
      if (arr[i] > arr[i +1]) {
        int temp = arr[i];
        arr[i]=arr[i +1];
        arr[i +1]=temp;
        swapped = 1;
      }
    }
    start++;
  }
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `void cocktailSort(vector<int>& arr) {
  int start = 0, end = arr.size() - 1;
  bool swapped = true;
  while (swapped) {
    swapped = false;
    for (int i = start; i < end; i++) {       // ① Forwardbubble
      if (arr[i] > arr[i +1]) {
        swap(arr[i], arr[i +1]);
        swapped = true;
      }
    }
    end--;
    if (!swapped) break;
    swapped = false;
    for (int i = end - 1; i >= start; i--) {  // ② Reversebubble
      if (arr[i] > arr[i +1]) {
        swap(arr[i], arr[i +1]);
        swapped = true;
      }
    }
    start++;
  }
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `def cocktail_sort(arr):
    start, end = 0, len(arr) - 1
    swapped = True
    while swapped:
        swapped = False
        for i in range(start, end):          # ① Forwardbubble
            if arr[i] > arr[i +1]:
                arr[i], arr[i +1]=arr[i +1], arr[i]
                swapped = True
        end -= 1
        if not swapped:
            break
        swapped = False
        for i in range(end - 1, start - 1, -1):  # ② Reversebubble
            if arr[i] > arr[i +1]:
                arr[i], arr[i +1]=arr[i +1], arr[i]
                swapped = True
        start += 1
    return arr`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `fn cocktail_sort(arr: &mut Vec<i32>) {
    let mut start = 0;
    let mut end = arr.len() as i32 - 1;
    let mut swapped = true;
    while swapped {
        swapped = false;
        for i in start..end {                 // ① Forwardbubble
            if arr[i as usize] > arr[i as usize +1] {
                arr.swap(i as usize, i as usize +1);
                swapped = true;
            }
        }
        end -= 1;
        if !swapped { break; }
        swapped = false;
        for i in (start..end).rev() {          // ② Reversebubble
            if arr[i as usize] > arr[i as usize +1] {
                arr.swap(i as usize, i as usize +1);
                swapped = true;
            }
        }
        start += 1;
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `func cocktailSort(arr []int) {
    start, end := 0, len(arr)-1
    swapped := true
    for swapped {
        swapped = false
        for i := start; i < end; i++{         // ① Forwardbubble
            if arr[i] > arr[i+1] {
                arr[i], arr[i+1]=arr[i+1], arr[i]
                swapped = true
            }
        }
        end--
        if !swapped { break }
        swapped = false
        for i := end - 1; i >= start; i-- {    // ② Reversebubble
            if arr[i] > arr[i+1] {
                arr[i], arr[i+1]=arr[i+1], arr[i]
                swapped = true
            }
        }
        start++
    }
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public static void cocktailSort(int[] arr) {
    int start = 0, end = arr.length - 1;
    boolean swapped = true;
    while (swapped) {
        swapped = false;
        for (int i = start; i < end; i++) {     // ① Forwardbubble
            if (arr[i] > arr[i +1]) {
                int temp = arr[i];
                arr[i]=arr[i +1];
                arr[i +1]=temp;
                swapped = true;
            }
        }
        end--;
        if (!swapped) break;
        swapped = false;
        for (int i = end - 1; i >= start; i--) { // ② Reversebubble
            if (arr[i] > arr[i +1]) {
                int temp = arr[i];
                arr[i]=arr[i +1];
                arr[i +1]=temp;
                swapped = true;
            }
        }
        start++;
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "desktop-widget-sorting",
      i18nKey: "content.algorithms.cocktail-sort.scenarios.desktop-widget-sorting",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "WPF ListBox sorting, GTK ComboBox, Qt QListView",
    },
    {
      id: "teaching-bidirectional",
      i18nKey: "content.algorithms.cocktail-sort.scenarios.teaching-bidirectional",
      domain: "devtools",
      icon: "🔧",
      reference: "Algorithm textbooks, CS curriculum, coding interview prep",
      codeSnippet: {
        language: "typescript",
        code: `// Cocktail sort: bidirectional bubble sort
// Passes left→right then right→left, shrinking range from both ends
function cocktailSort(arr: number[]): number[] {
  let start = 0, end = arr.length - 1;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {       // forward
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    end--;
    for (let i = end; i > start; i--) {       // backward
      if (arr[i] > arr[i - 1]) {
        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
        swapped = true;
      }
    }
    start++;
  }
  return arr;
}`,
      },
    },
    {
      id: "small-callback-sort",
      i18nKey: "content.algorithms.cocktail-sort.scenarios.small-callback-sort",
      domain: "library",
      icon: "📦",
      reference: "Underscore.js sortBy, Lodash orderBy, custom comparators",
    },
  ] satisfies Scenario[],
};
