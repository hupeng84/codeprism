import type { Frame, ListState, ListNode, Scenario } from "@codeprism/core";

interface CacheNode {
  id: string;
  key: number;
  value: string;
  status: ListNode["status"];
}

function createCacheNode(id: string, key: number, value: string, status: ListNode["status"] = "default"): CacheNode {
  return { id, key, value, status };
}

export function* lruCacheGenerator(): Generator<Frame<ListState>, void, unknown> {
  const CAPACITY = 3;
  let step = 0;
  let nodeIdCounter = 0;
  const cache: CacheNode[] = [];

  const makeListState = (nodes: CacheNode[], operation: string): ListState => ({
    nodes: nodes.map((n) => ({ id: n.id, value: n.key, status: n.status })),
    operation,
    orientation: "horizontal",
  });

  const makeFrame = (
    nodes: CacheNode[],
    operation: string,
    description: string,
    highlight: number
  ): Frame<ListState> => ({
    step: step++,
    state: makeListState(nodes, operation),
    description,
    highlightLine: highlight,
  });

  yield {
    step: step++,
    state: makeListState([], "empty cache"),
    description: `LRU Cache capacity = ${CAPACITY}. Left=MRU, Right=LRU. Evict from right.`,
    highlightLine: 0,
  };

  const operations = [
    { type: "put" as const, key: 1, value: "a" },
    { type: "put" as const, key: 2, value: "b" },
    { type: "put" as const, key: 3, value: "c" },
    { type: "get" as const, key: 1 },
    { type: "put" as const, key: 4, value: "d" },
    { type: "get" as const, key: 2 },
    { type: "put" as const, key: 5, value: "e" },
  ];

  for (const op of operations) {
    if (op.type === "get") {
      const key = op.key;
      const existingIdx = cache.findIndex((n) => n.key === key);

      if (existingIdx === -1) {
        const displayNodes = cache.map((n) => ({ ...n, status: "default" as const }));
        yield makeFrame(displayNodes, `get(${key})`, `get(${key}): cache miss, key= not in cache${key}`, 10);

        yield makeFrame(
          displayNodes,
          `get(${key}) Complete`,
          `get(${key}) returns null, cache unchanged`,
          11
        );
      } else {
        const visitingIdx = existingIdx;
        const visitNodes = cache.map((n, i) => ({
          ...n,
          status: i === visitingIdx ? ("active" as const) : ("default" as const),
        }));
        yield makeFrame(visitNodes, `get(${key})`, `get(${key}): Found key=${key}, value "${cache[existingIdx]!.value}", now moving to front`, 12);

        const [hitNode] = cache.splice(existingIdx, 1);
        hitNode.status = "found";
        cache.unshift(hitNode);

        const updatedNodes = cache.map((n) => ({ ...n, status: "default" as const }));
        yield makeFrame(updatedNodes, `get(${key}) Complete`, `key=${key} moved to MRU position (front). Cache: [${cache.map((n) => n.key).join(", ")}]`, 13);
      }
    } else {
      const key = op.key!;
      const value = op.value!;
      const existingIdx = cache.findIndex((n) => n.key === key);

      if (existingIdx !== -1) {
        const updateNodes = cache.map((n, i) => ({
          ...n,
          status: i === existingIdx ? ("active" as const) : ("default" as const),
        }));
        yield makeFrame(updateNodes, `put(${key}, "${value}")`, `key=${key} exists, update to "${value}" and move to front`, 16);

        const [updateNode] = cache.splice(existingIdx, 1);
        updateNode.value = value;
        cache.unshift(updateNode);

        const afterNodes = cache.map((n) => ({ ...n, status: "default" as const }));
        yield makeFrame(afterNodes, `put(${key}, "${value}") Complete`, `Update complete. Cache: [${cache.map((n) => n.key).join(", ")}]`, 17);
      } else {
        const newNode = createCacheNode(`n${nodeIdCounter++}`, key, value, "active");
        yield makeFrame([newNode], `put(${key}, "${value}")`, `key=${key} does not exist, create and insert at front`, 19);

        cache.unshift(newNode);

        if (cache.length > CAPACITY) {
          const evictNode = cache.pop()!;
          evictNode.status = "active";
          const evictNodes = cache.map((n, i) => ({
            ...n,
            status: i === cache.length ? ("active" as const) : ("default" as const),
          }));

          yield makeFrame(evictNodes, `put(${key}, "${value}")`, `Capacity full, evict LRU key=${evictNode.key}(least recently used)`, 21);

          evictNode.status = "default";
        }

        const finalNodes = cache.map((n) => ({ ...n, status: "default" as const }));
        yield makeFrame(finalNodes, `put(${key}, "${value}") Complete`, `Insert complete. Cache: [${cache.map((n) => n.key).join(", ")}]`, 22);
      }
    }
  }

  yield {
    step: step++,
    state: makeListState(cache, "LRU Cache final state"),
    description: `LRU Cache complete. Final cache: [${cache.map((n) => `${n.key}:"${n.value}"`).join(", ")}]. MRU left, LRU right.`,
    highlightLine: 25,
  };
}

export const lruCacheCode = `class LRUCache {
  private cache: Map<number, string> = new Map();
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): string | null {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);  // reinsert at end (MRU)
    return value;
  }

  put(key: number, value: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);    // delete old position
    } else if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey); // evict LRU
    }
    this.cache.set(key, value);  // insert at end (MRU)
  }
}`;

export const lruCacheCodeLines = [
  "class LRUCache {",
  "  private cache: Map<number, string> = new Map();  // hash table",
  "  private capacity: number;",
  "",
  "  constructor(capacity: number) {",
  "    this.capacity = capacity;",
  "  }",
  "",
  "  get(key: number): string | null {",
  "    if (!this.cache.has(key)) return null;  // cache miss",
  "    const value = this.cache.get(key)!;",
  "    this.cache.delete(key);",
  "    this.cache.set(key, value);             // reinsert at end (MRU)",
  "    return value;",
  "  }",
  "",
  "  put(key: number, value: string): void {",
  "    if (this.cache.has(key)) {",
  "      this.cache.delete(key);               // delete old position",
  "    } else if (this.cache.size >= this.capacity) {",
  "      const lruKey = this.cache.keys().next().value;  // get first (LRU)",
  "      this.cache.delete(lruKey);            // evict LRU",
  "    }",
  "    this.cache.set(key, value);             // insert at end (MRU)",
  "  }",
  "}",
];

export const lruCacheContent = {
  id: "lru-cache",
  slug: "lru-cache",
  title: "",
  titleKey: "content.structures.lru-cache.title",
  category: "structure" as const,
  subcategory: "cache",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.lru-cache.desc",
  generator: lruCacheGenerator,
  code: lruCacheCode,
  language: "TypeScript",
  complexity: { time: "O(1) get/put", space: "O(capacity)" },
  tags: [],
  icon: "📦",
  codeExamples: {
    typescript: {
      code: `class LRUCache {
  private cache: Map<number, string> = new Map();
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get(key: number): string | null {
    if (!this.cache.has(key)) return null; // cache miss
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);           // reinsert at end (MRU)
    return value;
  }

  put(key: number, value: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);             // delete old position
    } else if (this.cache.size >= this.capacity) {
      const lruKey = this.cache.keys().next().value;
      this.cache.delete(lruKey);          // evict LRU
    }
    this.cache.set(key, value);           // insert at end (MRU)
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `typedef struct CacheNode {
  int key;
  char value[64];
  struct CacheNode *prev, *next;
} CacheNode;

typedef struct {
  CacheNode* cache;     // hash table
  CacheNode* head;      // MRU end
  CacheNode* tail;      // LRU end
  int capacity;
  int count;
} LRUCache;

void moveToFront(LRUCache* lru, CacheNode* node) {
  if (node == lru->head) return;
  // remove from list
  node->prev->next = node->next;
  node->next->prev = node->prev;
  // insert at front
  node->next = lru->head;
  node->prev = NULL;
  lru->head->prev = node;
  lru->head = node;
}

CacheNode* get(LRUCache* lru, int key) {
  // find key (simplified: traverse)
  CacheNode* cur = lru->head;
  while (cur) {
    if (cur->key == key) {
      moveToFront(lru, cur);              // move to MRU end
      return cur;
    }
    cur = cur->next;
  }
  return NULL;                             // cache miss
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class LRUCache {
  list<pair<int, string>> cacheList;       // doubly linked list
  unordered_map<int, list<pair<int,string>>::iterator> cacheMap;
  int capacity;
public:
  LRUCache(int cap) : capacity(cap) {}

  string get(int key) {
    auto it = cacheMap.find(key);
    if (it == cacheMap.end()) return "";   // cache miss
    cacheList.splice(cacheList.begin(), cacheList, it->second); // move to front
    return it->second->second;
  }

  void put(int key, string value) {
    auto it = cacheMap.find(key);
    if (it != cacheMap.end()) {
      cacheList.erase(it->second);        // delete old position
    } else if (cacheMap.size() >= capacity) {
      auto lru = cacheList.back();
      cacheMap.erase(lru.first);          // evict LRU
      cacheList.pop_back();
    }
    cacheList.emplace_front(key, value);
    cacheMap[key] = cacheList.begin();     // insert at front (MRU)
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = OrderedDict()        # ← ordered dict

    def get(self, key):
        if key not in self.cache:
            return None                    # cache miss
        self.cache.move_to_end(key)        # move to end (MRU)
        return self.cache[key]

    def put(self, key, value):
        if key in self.cache:
            self.cache.move_to_end(key)    # delete old position
        elif len(self.cache) >= self.capacity:
            self.cache.popitem(last=False)  # evict LRU (front)
        self.cache[key] = value            # insert at end (MRU)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::HashMap;

struct LRUCache {
    capacity: usize,
    cache: Vec<(i32, String)>,            // end = most recently used
}

impl LRUCache {
    fn new(capacity: usize) -> Self {
        LRUCache { capacity, cache: Vec::new() }
    }

    fn get(&mut self, key: i32) -> Option<String> {
        if let Some(pos) = self.cache.iter().position(|(k, _)| *k == key) {
            let node = self.cache.remove(pos);
            let value = node.1.clone();
            self.cache.push(node);         // move to end (MRU)
            Some(value)
        } else {
            None                           // cache miss
        }
    }

    fn put(&mut self, key: i32, value: String) {
        if let Some(pos) = self.cache.iter().position(|(k, _)| *k == key) {
            self.cache.remove(pos);        // delete old position
        } else if self.cache.len() >= self.capacity {
            self.cache.remove(0);          // evict LRU (front)
        }
        self.cache.push((key, value));     // insert at end (MRU)
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type LRUCache struct {
  capacity int
  keys     []int
  cache    map[int]string
}

func NewLRUCache(capacity int) *LRUCache {
  return &LRUCache{capacity: capacity, cache: make(map[int]string)}
}

func (l *LRUCache) Get(key int) string {
  val, ok := l.cache[key]
  if !ok { return "" }                     // cache miss
  // move to end (MRU)
  for i, k := range l.keys {
    if k == key { l.keys = append(l.keys[:i], l.keys[i+1:]...); break }
  }
  l.keys = append(l.keys, key)
  return val
}

func (l *LRUCache) Put(key int, value string) {
  if _, ok := l.cache[key]; ok {
    // delete old position
    for i, k := range l.keys {
      if k == key { l.keys = append(l.keys[:i], l.keys[i+1:]...); break }
    }
  } else if len(l.keys) >= l.capacity {
    lruKey := l.keys[0]
    l.keys = l.keys[1:]                    // evict LRU
    delete(l.cache, lruKey)
  }
  l.keys = append(l.keys, key)
  l.cache[key] = value                     // insert at end (MRU)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class LRUCache {
  private int capacity;
  private LinkedHashMap<Integer, String> cache;

  LRUCache(int capacity) {
    this.capacity = capacity;
    // accessOrder=true puts recently accessed elements at end
    this.cache = new LinkedHashMap<>(capacity, 0.75f, true);
  }

  String get(int key) {
    if (!cache.containsKey(key)) return null; // cache miss
    return cache.get(key);                // auto move to end (MRU)
  }

  void put(int key, String value) {
    if (cache.containsKey(key)) {
      cache.remove(key);                  // delete old position
    } else if (cache.size() >= capacity) {
      int lruKey = cache.keySet().iterator().next();
      cache.remove(lruKey);               // evict LRU
    }
    cache.put(key, value);
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "memcached-redis",
      i18nKey: "content.structures.lru-cache.scenarios.memcached-redis",
      domain: "database",
      icon: "🔴",
      reference: "Memcached, Redis maxmemory, Couchbase",
      codeSnippet: {
        language: "typescript",
        code: `// Redis uses LRU (approximate) for key eviction when maxmemory hit
// maxmemory-policy allkeys-lru → evict least recently used key
// Memcached slab allocator uses LRU per slab class
// O(1) get/put via hash table + doubly-linked list`,
      },
    },
    {
      id: "os-page-replace",
      i18nKey: "content.structures.lru-cache.scenarios.os-page-replace",
      domain: "system",
      icon: "⚙️",
      reference: "Linux kernel, Windows memory manager, FreeBSD",
    },
    {
      id: "cdn-edge-cache",
      i18nKey: "content.structures.lru-cache.scenarios.cdn-edge-cache",
      domain: "network",
      icon: "🌐",
      reference: "Cloudflare, AWS CloudFront, Varnish",
    },
  ] satisfies Scenario[],
};
