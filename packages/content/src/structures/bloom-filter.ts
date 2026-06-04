import type { Frame, ListState, ListNode, Scenario } from "@codeprism/core";

/**
 * Bloom Filter — Frame Generator
 * Demonstrates a probabilistic set membership data structure.
 * Uses k=3 hash functions and a bit array of size 16.
 * Shows insertion of elements and membership queries including false positives.
 */
export function* bloomFilterGenerator(): Generator<Frame<ListState>, void, unknown> {
  const m = 16; // bit array size
  const k = 3;  // number of hash functions
  let bits = new Array<0 | 1>(m).fill(0);
  let step = 0;

  function makeState(
    highlightIndices: number[],
    description: string,
    line: number,
  ): Frame<ListState> {
    const nodes: ListNode[] = bits.map((bit, idx) => ({
      id: `b${idx}`,
      value: bit,
      status: highlightIndices.includes(idx)
        ? ("highlighted" as const)
        : ("default" as const),
    }));
    return {
      step: step++,
      state: { nodes, operation: "Bloom Filter", orientation: "horizontal" },
      description,
      highlightLine: line,
    };
  }

  // Pseudo-hash functions: h1(x) = (x * 3 + 7) % 16, etc.
  function h1(x: number): number {
    return (x * 3 + 7) % m;
  }
  function h2(x: number): number {
    return (x * 5 + 11) % m;
  }
  function h3(x: number): number {
    return (x * 7 + 13) % m;
  }

  function getBitIndices(x: number): [number, number, number] {
    return [h1(x), h2(x), h3(x)];
  }

  function setBits(indices: number[]): void {
    for (const idx of indices) {
      bits[idx] = 1;
    }
  }

  function allBitsSet(indices: number[]): boolean {
    return indices.every((idx) => bits[idx] === 1);
  }

  // Initial empty filter
  yield makeState([], `Initial empty Bloom Filter, bit array size m=${m}，k=${k} hash functions`, 0);

  // Insert elements
  const toInsert = [3, 7, 15, 23];

  for (const x of toInsert) {
    const [i1, i2, i3] = getBitIndices(x);
    const newBits = [i1, i2, i3];

    yield makeState(
      newBits,
      `Insert ${x}: compute hashes → h1(${x})=${i1}, h2(${x})=${i2}, h3(${x})=${i3}`,
      4,
    );

    setBits(newBits);

    yield makeState(
      newBits,
      `Insert ${x}: set bits [${i1}, ${i2}, ${i3}] to 1`,
      5,
    );
  }

  // Query: check membership
  const queries: { value: number; expected: string }[] = [
    { value: 3, expected: "probably yes (definitely yes, since we inserted it)" },
    { value: 7, expected: "probably yes (definitely yes, since we inserted it)" },
    { value: 12, expected: "probably no (definitely no - bits not set)" },
    { value: 22, expected: "probably yes (but could be FALSE POSITIVE!)" },
  ];

  yield {
    step: step++,
    state: {
      nodes: bits.map((bit, idx) => ({
        id: `b${idx}`,
        value: bit,
        status: "default" as const,
      })),
      operation: "Bloom Filter",
      orientation: "horizontal" as const,
    },
    description: "=== Start query tests ===",
    highlightLine: 9,
  };

  for (const { value, expected } of queries) {
    const [i1, i2, i3] = getBitIndices(value);
    const indices = [i1, i2, i3];
    const allSet = allBitsSet(indices);

    yield makeState(
      indices,
      `Query ${value}: check bits [${i1}, ${i2}, ${i3}] ] all set`,
      11,
    );

    const result = allSet ? "probably exists ✓" : "definitely not exists ✗";
    const explanation = allSet ? expected : "bits not all set → definitely not in set";

    yield makeState(
      indices,
      `Query ${value}  result: ${result} | ${explanation}`,
      13,
    );
  }

  // Final state
  yield makeState([], `Bloom Filter complete ✅ 3,7,22 may exist (3,7 yes, 22 false positive), 12 definitely not`, 14);
}

// ── Code display ──

export const bloomCode = `class BloomFilter<T> {
  private bits: boolean[];
  private m: number;

  constructor(size: number) {
    this.m = size;
    this.bits = new Array(size).fill(false);
  }

  add(item: T): void {
    for (const idx of this.hash(item)) {
      this.bits[idx] = true;                // ← set bit to 1
    }
  }

  contains(item: T): boolean {
    return this.hash(item).every((i) => this.bits[i]); // ← check all bits
    // note: returning true doesn't guarantee existence (false positive)
  }

  private hash(item: T): number[] {
    return [
      this.h1(item), // h1(x) = (3x+7) mod m
      this.h2(item), // h2(x) = (5x+11) mod m
      this.h3(item), // h3(x) = (7x+13) mod m
    ];
  }
}`;

export const bloomCodeLines = [
  "class BloomFilter<T> {",
  "  private bits: boolean[];",
  "  private m: number;",
  "",
  "  constructor(size: number) {",
  "    this.m = size;",
  "    this.bits = new Array(size).fill(false);",
  "  }",
  "",
  "  add(item: T): void {",
  "    for (const idx of this.hash(item)) {",
  "      this.bits[idx] = true;                // ← set bit to 1",
  "    }",
  "  }",
  "",
  "  contains(item: T): boolean {",
  "    return this.hash(item).every((i) => this.bits[i]); // ← check all bits",
  "    // note: returning true doesn't guarantee existence (false positive)",
  "  }",
  "",
  "  private hash(item: T): number[] {",
  "    return [",
  "      this.h1(item), // h1(x) = (3x+7) mod m",
  "      this.h2(item), // h2(x) = (5x+11) mod m",
  "      this.h3(item), // h3(x) = (7x+13) mod m",
  "    ];",
  "  }",
  "}",
];

// ── Content definition ──

export const bloomContent = {
  id: "bloom-filter",
  slug: "bloom-filter",
  title: "",
  titleKey: "content.structures.bloom-filter.title",
  category: "structure" as const,
  subcategory: "probabilistic",
  difficulty: "advanced" as const,
  description: "",
  descKey: "content.structures.bloom-filter.desc",
  defaultInput: undefined,
  generator: bloomFilterGenerator,
  code: bloomCode,
  language: "TypeScript",
  complexity: { time: "O(k)", space: "O(m)" },
  tags: [],
  icon: "🌸",
  codeExamples: {
    typescript: {
      code: `class BloomFilter<T> {
  private bits: boolean[];
  private m: number;

  constructor(size: number) {
    this.m = size;
    this.bits = new Array(size).fill(false);
  }

  add(item: T): void {
    for (const idx of this.hash(item)) {
      this.bits[idx] = true;              // ← set bit to 1
    }
  }

  contains(item: T): boolean {
    return this.hash(item).every((i) => this.bits[i]); // ← check all bits
    // note: returning true doesn't guarantee existence (false positive)
  }

  private hash(item: T): number[] {
    const str = String(item);
    let h1 = 0, h2 = 0, h3 = 0;
    for (let i = 0; i < str.length; i++) {
      h1 = (h1 * 31 + str.charCodeAt(i)) % this.m;
      h2 = (h2 * 37 + str.charCodeAt(i)) % this.m;
      h3 = (h3 * 41 + str.charCodeAt(i)) % this.m;
    }
    return [h1, h2, h3];                  // ← k hash functions
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct {
  int* bits;
  int m;
} BloomFilter;

BloomFilter* createFilter(int m) {
  BloomFilter* bf = malloc(sizeof(BloomFilter));
  bf->m = m;
  bf->bits = calloc(m, sizeof(int));
  return bf;
}

int h1(const char* s, int m) {
  int h = 0;
  for (int i = 0; s[i]; i++) h = (h * 31 + s[i]) % m;
  return h;
}

int h2(const char* s, int m) {
  int h = 0;
  for (int i = 0; s[i]; i++) h = (h * 37 + s[i]) % m;
  return h;
}

void add(BloomFilter* bf, const char* item) {
  bf->bits[h1(item, bf->m)] = 1;          // ← set bit to 1
  bf->bits[h2(item, bf->m)] = 1;
}

int contains(BloomFilter* bf, const char* item) {
  return bf->bits[h1(item, bf->m)] &&     // ← check all bits
         bf->bits[h2(item, bf->m)];
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class BloomFilter {
  vector<bool> bits;
  int m;
public:
  BloomFilter(int size) : m(size), bits(size, false) {}

  void add(const string& item) {
    for (int idx : hash(item))
      bits[idx] = true;                    // ← set bit to 1
  }

  bool contains(const string& item) {
    for (int idx : hash(item))
      if (!bits[idx]) return false;        // ← check all bits
    return true;
  }

private:
  vector<int> hash(const string& s) {
    int h1 = 0, h2 = 0;
    for (char c : s) { h1 = (h1 * 31 + c) % m; h2 = (h2 * 37 + c) % m; }
    return {h1, h2, (h1 + h2) % m};       // ← k hash functions
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class BloomFilter:
    def __init__(self, size=16):
        self.m = size
        self.bits = [0] * size

    def _hash(self, item):
        s = str(item)
        h1 = sum(ord(c) * (31 ** i) for i, c in enumerate(s)) % self.m
        h2 = sum(ord(c) * (37 ** i) for i, c in enumerate(s)) % self.m
        return [h1, h2, (h1 + h2) % self.m]  # ← k hash functions

    def add(self, item):
        for idx in self._hash(item):
            self.bits[idx] = 1             # ← set bit to 1

    def contains(self, item):
        return all(self.bits[i] for i in self._hash(item))  # ← check all bits
        # note: returning true doesn't guarantee existence (false positive)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `struct BloomFilter {
    bits: Vec<bool>,
    m: usize,
}

impl BloomFilter {
    fn new(m: usize) -> Self {
        BloomFilter { bits: vec![false; m], m }
    }

    fn hash(&self, item: &str) -> Vec<usize> {
        let mut h1: usize = 0;
        let mut h2: usize = 0;
        for b in item.bytes() {
            h1 = (h1.wrapping_mul(31).wrapping_add(b as usize)) % self.m;
            h2 = (h2.wrapping_mul(37).wrapping_add(b as usize)) % self.m;
        }
        vec![h1, h2, (h1 + h2) % self.m]    // ← k hash functions
    }

    fn add(&mut self, item: &str) {
        for idx in self.hash(item) {
            self.bits[idx] = true;           // ← set bit to 1
        }
    }

    fn contains(&self, item: &str) -> bool {
        self.hash(item).iter().all(|&i| self.bits[i]) // ← check all bits
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type BloomFilter struct {
  bits []bool
  m    int
}

func NewBloomFilter(m int) *BloomFilter {
  return &BloomFilter{bits: make([]bool, m), m: m}
}

func hashFunc(s string, m int, seed int) int {
  h := 0
  for _, c := range s {
    h = (h*seed + int(c)) % m
  }
  return h
}

func (bf *BloomFilter) Add(item string) {
  bf.bits[hashFunc(item, bf.m, 31)] = true // ← set bit to 1
  bf.bits[hashFunc(item, bf.m, 37)] = true
  bf.bits[(hashFunc(item, bf.m, 31)+hashFunc(item, bf.m, 37))%bf.m] = true
}

func (bf *BloomFilter) Contains(item string) bool {
  return bf.bits[hashFunc(item, bf.m, 31)] &&  // ← check all bits
         bf.bits[hashFunc(item, bf.m, 37)] &&
         bf.bits[(hashFunc(item, bf.m, 31)+hashFunc(item, bf.m, 37))%bf.m]
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class BloomFilter {
  private boolean[] bits;
  private int m;

  BloomFilter(int size) {
    m = size;
    bits = new boolean[size];
  }

  private int[] hash(String item) {
    int h1 = 0, h2 = 0;
    for (char c : item.toCharArray()) {
      h1 = (h1 * 31 + c) % m;
      h2 = (h2 * 37 + c) % m;
    }
    return new int[]{h1, h2, (h1 + h2) % m}; // ← k hash functions
  }

  void add(String item) {
    for (int idx : hash(item))
      bits[idx] = true;
  }

  boolean contains(String item) {
    for (int idx : hash(item))
      if (!bits[idx]) return false;
    return true;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "medium-read",
      i18nKey: "content.structures.bloom-filter.scenarios.medium-read",
      domain: "ui-framework",
      icon: "📰",
      reference: "Medium, Netflix, Akamai",
      codeSnippet: {
        language: "typescript",
        code: `// Medium uses a Bloom filter to check "Have you read this?"
// ~1 byte per article vs ~64 bytes for exact storage
// False positives show already-read, but never miss unread
const filter = new BloomFilter(1_000_000);
filter.add(articleId);
if (filter.contains(articleId)) showAsRead(); // may false-positive`,
      },
    },
    {
      id: "db-query-optimization",
      i18nKey: "content.structures.bloom-filter.scenarios.db-query-optimization",
      domain: "database",
      icon: "🗄️",
      reference: "Cassandra, RocksDB, ClickHouse",
    },
    {
      id: "url-dedup",
      i18nKey: "content.structures.bloom-filter.scenarios.url-dedup",
      domain: "data-pipeline",
      icon: "🕷️",
      reference: "Apache Nutch, Scrapy, Google Crawler",
    },
  ] satisfies Scenario[],
};
