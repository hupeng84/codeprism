import type { Frame, HashState, HashSlot, Scenario } from "@codeprism/core";

// ── Helpers ──

function emptySlots(): HashSlot[] {
  return Array.from({ length: 7 }, (_, i) => ({
    index: i,
    entries: [],
    status: "empty" as const,
  }));
}

function cloneSlots(slots: HashSlot[]): HashSlot[] {
  return slots.map((s) => ({ ...s, entries: s.entries.map((e) => ({ ...e })) }));
}

/**
 * Hash Table — Frame Generator
 * Simulates put/get operations on a hash table (size=7) with chaining.
 * Collisions: apple↔date at slot 3, banana↔elderberry at slot 0.
 */
export function* hashTableGenerator(): Generator<Frame<HashState>, void, unknown> {
  let step = 0;
  const slots = emptySlots();

  // ── Frame 0: Empty table ──
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "empty hash table", size: 7 },
    description: "Initialize hash table size=7, using chaining for collisions",
    highlightLine: 3,
  };

  // ==================== put("apple", 5) → slot 3 ====================
  slots[3].status = "active";
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "put(\"apple\", 5) → hash=3", size: 7 },
    description: "Compute hash of apple: hash(apple) = 3, locate slots[3]",
    highlightLine: 6,
  };

  slots[3] = {
    index: 3,
    entries: [{ key: "apple", value: 5, status: "active" }],
    status: "occupied",
  };
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "apple=5 → slots[3] inserted", size: 7 },
    description: "slots[3] is empty, directly insert apple=5 ✅",
    highlightLine: 11,
  };
  slots[3].entries[0].status = "default";

  // ==================== put("banana", 8) → slot 0 ====================
  slots[0].status = "active";
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "put(\"banana\", 8) → hash=0", size: 7 },
    description: "Compute hash of banana: hash(banana) = 0, locate slots[0]",
    highlightLine: 6,
  };

  slots[0] = {
    index: 0,
    entries: [{ key: "banana", value: 8, status: "active" }],
    status: "occupied",
  };
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "banana=8 → slots[0] inserted", size: 7 },
    description: "slots[0] is empty, directly insert banana=8 ✅",
    highlightLine: 11,
  };
  slots[0].entries[0].status = "default";

  // ==================== put("cherry", 3) → slot 2 ====================
  slots[2].status = "active";
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "put(\"cherry\", 3) → hash=2", size: 7 },
    description: "Compute hash of cherry: hash(cherry) = 2, locate slots[2]",
    highlightLine: 6,
  };

  slots[2] = {
    index: 2,
    entries: [{ key: "cherry", value: 3, status: "active" }],
    status: "occupied",
  };
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "cherry=3 → slots[2] inserted", size: 7 },
    description: "slots[2] is empty, directly insert cherry=3 ✅",
    highlightLine: 11,
  };
  slots[2].entries[0].status = "default";

  // ==================== get("banana") → found at slot 0 ====================
  slots[0].status = "active";
  slots[0].entries[0].status = "found";
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "get(\"banana\") ✓ → 8", size: 7 },
    description: "Compute hash → slots[0], search chain, found banana=8 ✅",
    highlightLine: 15,
  };
  slots[0].entries[0].status = "default";
  slots[0].status = "occupied";

  // ==================== put("date", 9) → slot 3 (collision!) ====================
  slots[3].status = "active";
  slots[3].entries[0].status = "collision";
  slots[3].entries.push({ key: "date", value: 9, status: "active" });
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "Collision! date=9 → slots[3] chain", size: 7 },
    description: "hash(date) = 3! slots[3] occupied by apple, collision ⚡ Chaining: append date to list",
    highlightLine: 11,
  };
  slots[3].entries[0].status = "default";
  slots[3].entries[1].status = "default";
  slots[3].status = "occupied";

  // ==================== get("apple") → found at slot 3 chain ====================
  slots[3].status = "active";
  slots[3].entries[0].status = "found";
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "get(\"apple\") ✓ → 5", size: 7 },
    description: "Compute hash → slots[3], traverse chain, found apple=5 ✅",
    highlightLine: 15,
  };
  slots[3].entries[0].status = "default";
  slots[3].status = "occupied";

  // ==================== put("elderberry", 2) → slot 0 (collision!) ====================
  slots[0].status = "active";
  slots[0].entries[0].status = "collision";
  slots[0].entries.push({ key: "elderberry", value: 2, status: "active" });
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "Collision! elderberry=2 → slots[0] chain", size: 7 },
    description: "hash(elderberry) = 0! slots[0] occupied by banana, chaining: append elderberry ⚡",
    highlightLine: 11,
  };
  slots[0].entries[0].status = "default";
  slots[0].entries[1].status = "default";
  slots[0].status = "occupied";

  // ==================== Final state ====================
  yield {
    step: step++,
    state: { slots: cloneSlots(slots), operation: "hash tableBuild complete ✅", size: 7 },
    description:
      "Final state: slots[0] chain=2 (banana→elderberry), slots[2] chain=1 (cherry), slots[3] chain=2 (apple→date), rest empty",
    highlightLine: 0,
  };
}

// ── Code display ──

export const hashTableCodeLines = [
  "class HashTable {",
  "  private buckets: [string, number][][];",
  "  constructor(size: number) {",
  "    this.buckets = Array.from({length: size}, () => []);",
  "  }",
  "  private hash(key: string): number {",
  "    let sum = 0;",
  "    for (const c of key) sum += c.charCodeAt(0);",
  "    return sum % this.size;  // ← hash function",
  "  }",
  "  put(key: string, value: number): void {",
  "    this.buckets[this.hash(key)].push([key, value]);  // ← insert into bucket",
  "  }",
  "  get(key: string): number | undefined {",
  "    for (const [k, v] of this.buckets[this.hash(key)])",
  "      if (k === key) return v;  // ← return if found",
  "    return undefined;  // ← not found",
  "  }",
  "}",
];

const hashTableCode = hashTableCodeLines.join("\n");

// ── Content definition ──

export const hashTableContent = {
  id: "hash-table",
  slug: "hash-table",
  title: "",
  titleKey: "content.structures.hash-table.title",
  category: "structure" as const,
  subcategory: "hash",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.structures.hash-table.desc",
  generator: hashTableGenerator,
  code: hashTableCode,
  language: "TypeScript",
  complexity: { time: "O(1) average", space: "O(n)" },
  tags: [],
  icon: "#",
  codeExamples: {
    typescript: {
      code: `class HashTable {
  private buckets: [string, number][][];

  constructor(size: number) {
    this.buckets = Array.from({length: size}, () => []);
  }

  private hash(key: string): number {
    let sum = 0;
    for (const c of key) sum += c.charCodeAt(0);
    return sum % this.buckets.length;     // ← hash function
  }

  put(key: string, value: number): void {
    const idx = this.hash(key);
    const bucket = this.buckets[idx];
    for (const [k] of bucket) {
      if (k === key) { bucket.splice(bucket.indexOf([k, value]), 1); break; }
    }
    bucket.push([key, value]);           // ← insert into bucket
  }

  get(key: string): number | undefined {
    for (const [k, v] of this.buckets[this.hash(key)])
      if (k === key) return v;           // ← return if found
    return undefined;                     // ← not found
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct Entry {
  char* key;
  int value;
  struct Entry* next;
} Entry;

typedef struct {
  Entry** buckets;
  int size;
} HashTable;

HashTable* createTable(int size) {
  HashTable* ht = malloc(sizeof(HashTable));
  ht->size = size;
  ht->buckets = calloc(size, sizeof(Entry*));
  return ht;
}

int hash(const char* key, int size) {
  int sum = 0;
  for (int i = 0; key[i]; i++) sum += key[i];
  return sum % size;                     // ← hash function
}

void put(HashTable* ht, const char* key, int value) {
  int idx = hash(key, ht->size);
  Entry* e = ht->buckets[idx];
  while (e) { if (strcmp(e->key, key) == 0) { e->value = value; return; } e = e->next; }
  Entry* newEntry = malloc(sizeof(Entry)); // ← chaining
  newEntry->key = strdup(key); newEntry->value = value;
  newEntry->next = ht->buckets[idx];
  ht->buckets[idx] = newEntry;
}

int get(HashTable* ht, const char* key) {
  Entry* e = ht->buckets[hash(key, ht->size)];
  while (e) { if (strcmp(e->key, key) == 0) return e->value; e = e->next; }
  return -1;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class HashTable {
  vector<list<pair<string, int>>> buckets;
  int size;

  int hash(const string& key) {
    int sum = 0;
    for (char c : key) sum += c;
    return sum % size;                   // ← hash function
  }
public:
  HashTable(int s) : size(s), buckets(s) {}

  void put(const string& key, int value) {
    int idx = hash(key);
    for (auto& [k, v] : buckets[idx])
      if (k == key) { v = value; return; }
    buckets[idx].emplace_back(key, value); // ← chaining
  }

  int get(const string& key) {
    for (auto& [k, v] : buckets[hash(key)])
      if (k == key) return v;
    return -1;
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class HashTable:
    def __init__(self, size):
        self.buckets = [[] for _ in range(size)]

    def _hash(self, key):
        return sum(ord(c) for c in key) % len(self.buckets)  # ← hash function

    def put(self, key, value):
        bucket = self.buckets[self._hash(key)]
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)  # update
                return
        bucket.append((key, value))       # ← chaining

    def get(self, key):
        for k, v in self.buckets[self._hash(key)]:
            if k == key:
                return v                  # ← return if found
        return None`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::LinkedList;

struct HashTable {
    buckets: Vec<LinkedList<(String, i32)>>,
    size: usize,
}

impl HashTable {
    fn new(size: usize) -> Self {
        let mut buckets = Vec::with_capacity(size);
        for _ in 0..size { buckets.push(LinkedList::new()); }
        HashTable { buckets, size }
    }

    fn hash(&self, key: &str) -> usize {
        key.bytes().map(|b| b as usize).sum::<usize>() % self.size // ← hash function
    }

    fn put(&mut self, key: String, value: i32) {
        let idx = self.hash(&key);
        for (k, v) in self.buckets[idx].iter_mut() {
            if k == &key { *v = value; return; }
        }
        self.buckets[idx].push_back((key, value)); // ← chaining
    }

    fn get(&self, key: &str) -> Option<i32> {
        self.buckets[self.hash(key)].iter()
            .find(|(k, _)| k == key)
            .map(|(_, v)| *v)
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type Entry struct {
  Key   string
  Value int
}

type HashTable struct {
  buckets [][]Entry
  size    int
}

func NewHashTable(size int) *HashTable {
  return &HashTable{buckets: make([][]Entry, size), size: size}
}

func (ht *HashTable) hash(key string) int {
  sum := 0
  for _, c := range key { sum += int(c) }
  return sum % ht.size                    // ← hash function
}

func (ht *HashTable) Put(key string, value int) {
  idx := ht.hash(key)
  for i, e := range ht.buckets[idx] {
    if e.Key == key { ht.buckets[idx][i].Value = value; return }
  }
  ht.buckets[idx] = append(ht.buckets[idx], Entry{key, value}) // ← chaining
}

func (ht *HashTable) Get(key string) (int, bool) {
  for _, e := range ht.buckets[ht.hash(key)] {
    if e.Key == key { return e.Value, true }
  }
  return 0, false
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class HashTable {
  private static class Entry {
    String key; int value; Entry next;
    Entry(String k, int v) { key = k; value = v; }
  }
  private Entry[] buckets;
  private int size;

  HashTable(int size) {
    this.size = size;
    buckets = new Entry[size];
  }

  private int hash(String key) {
    int sum = 0;
    for (char c : key.toCharArray()) sum += c;
    return sum % size;                    // ← hash function
  }

  void put(String key, int value) {
    int idx = hash(key);
    Entry e = buckets[idx];
    while (e != null) {
      if (e.key.equals(key)) { e.value = value; return; }
      e = e.next;
    }
    Entry newEntry = new Entry(key, value); // ← chaining
    newEntry.next = buckets[idx];
    buckets[idx] = newEntry;
  }

  int get(String key) {
    Entry e = buckets[hash(key)];
    while (e != null) {
      if (e.key.equals(key)) return e.value;
      e = e.next;
    }
    return -1;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "python-dict",
      i18nKey: "content.structures.hash-table.scenarios.python-dict",
      domain: "library",
      icon: "🐍",
      reference: "Python dict, Java HashMap, V8 Map",
      codeSnippet: {
        language: "python",
        code: `# Python dict is an open-addressing hash table
data = {"name": "Alice", "age": 30}  # O(1) average lookup
data["email"] = "a@b.com"            # O(1) average insert
# CPython uses SipHash for collision resistance against HashDoS`,
      },
    },
    {
      id: "redis-store",
      i18nKey: "content.structures.hash-table.scenarios.redis-store",
      domain: "database",
      icon: "🔴",
      reference: "Redis, Memcached, DynamoDB",
    },
    {
      id: "compiler-symbol-table",
      i18nKey: "content.structures.hash-table.scenarios.compiler-symbol-table",
      domain: "devtools",
      icon: "🔧",
      reference: "GCC, Clang, TypeScript compiler",
    },
  ] satisfies Scenario[],
};
