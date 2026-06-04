import type { Frame, ListState, ListNode, Scenario } from "@codeprism/core";

interface SkipListNode {
  id: string;
  value: number;
  height: number;
  status: ListNode["status"];
}

function createNode(id: string, value: number, height: number, status: ListNode["status"] = "default"): SkipListNode {
  return { id, value, height, status };
}

function randomHeight(): number {
  let h = 1;
  while (Math.random() < 0.5 && h < 4) h++;
  return h;
}

export function* skipListGenerator(): Generator<Frame<ListState>, void, unknown> {
  let step = 0;
  const nodeIdCounter = 0;
  const nodes: SkipListNode[] = [];
  const insertions = [3, 6, 7, 9, 12, 17, 19, 21];

  yield {
    step: step++,
    state: { nodes: [], operation: "empty skip list", orientation: "horizontal" },
    description: "Skip List: multi-level linked list. Each level is an express lane. Top nodes skip elements → O(log n) search.",
    highlightLine: 0,
  };

  for (const value of insertions) {
    const height = randomHeight();
    const newNode = createNode(`n${nodeIdCounter}`, value, height, "active");

    yield {
      step: step++,
      state: {
        nodes: [{ ...newNode, status: "active" as const }],
        operation: `Insert ${value} (height ${height})`,
        orientation: "horizontal",
      },
      description: `Insert element ${value}，node height is ${height}，will appear in ${height} levels`,
      highlightLine: 3,
    };

    const insertIdx = nodes.findIndex((n) => n.value > value);
    if (insertIdx === -1) {
      nodes.push(newNode);
    } else {
      nodes.splice(insertIdx, 0, newNode);
    }

    const levelInfo = `Level 0-${height - 1}`;
    yield {
      step: step++,
      state: {
        nodes: nodes.map((n) => ({
          id: n.id,
          value: n.value,
          status: n.id === newNode.id ? ("found" as const) : ("default" as const),
        })),
        operation: `${value} inserted (${levelInfo})`,
        orientation: "horizontal",
      },
      description: `${value} inserted into Level 0 list. Node ${value} in ${levelInfo}, express lane.`,
      highlightLine: 4,
    };

    newNode.status = "default";
  }

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({
        id: n.id,
        value: n.value,
        status: "default" as const,
      })),
      operation: "Complete skip list",
      orientation: "horizontal",
    },
    description: "Skip list complete. Level 0 is full sorted list. Levels 1+ are express lanes.",
    highlightLine: 5,
  };

  const searchValue = 7;
  const searchPath: number[] = [];
  let curIdx = 0;
  let maxLevel = Math.max(...nodes.map((n) => n.height));

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n, i) => ({
        id: n.id,
        value: n.value,
        status: i === 0 ? ("active" as const) : ("default" as const),
      })),
      operation: `Search ${searchValue}`,
      orientation: "horizontal",
    },
    description: `Start search ${searchValue}. From Level ${maxLevel - 1} head, highest express lane.`,
    highlightLine: 8,
  };

  for (let level = maxLevel - 1; level >= 0; level--) {
    while (curIdx < nodes.length - 1) {
      const nextIdx = curIdx + 1;
      const nextNode = nodes[nextIdx]!;

      const currentNodes = nodes.map((n, i) => ({
        id: n.id,
        value: n.value,
        status:
          i === curIdx
            ? ("active" as const)
            : i === nextIdx && n.height > level
            ? ("active" as const)
            : ("default" as const),
      }));

      yield {
        step: step++,
        state: {
          nodes: currentNodes,
          operation: `Level ${level} Search`,
          orientation: "horizontal",
        },
        description:
          nextNode.value <= searchValue
            ? `Level ${level}: ${nodes[curIdx]!.value} → ${nextNode.value} ≤ ${searchValue}，, continue forward`
            : `Level ${level}: ${nodes[curIdx]!.value} → ${nextNode.value} > ${searchValue}，, drop to Level ${level - 1}`,
        highlightLine: 12,
      };

      if (nextNode.value <= searchValue && nextNode.height > level) {
        curIdx = nextIdx;
        searchPath.push(curIdx);
      } else {
        break;
      }
    }

    if (curIdx > 0 && nodes[curIdx]!.value === searchValue) {
      break;
    }
  }

  const found = nodes[curIdx]?.value === searchValue;

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n, i) => ({
        id: n.id,
        value: n.value,
        status: i === curIdx ? ("found" as const) : ("default" as const),
      })),
      operation: found ? `Found ${searchValue}` : `not found ${searchValue}`,
      orientation: "horizontal",
    },
    description: found
      ? `Search path: ${searchPath.map((i) => nodes[i]!.value).join(" → ")}. Found ${searchValue}! Much shorter than Level 0 list.`
      : `${searchValue} does not exist in skip list`,
    highlightLine: found ? 20 : 21,
  };

  yield {
    step: step++,
    state: {
      nodes: nodes.map((n) => ({
        id: n.id,
        value: n.value,
        status: "default" as const,
      })),
      operation: "Skip list search complete",
      orientation: "horizontal",
    },
    description: `Skip list search complete. Average O(log n), much faster than O(n).`,
    highlightLine: 25,
  };
}

export const skipListCode = `class SkipListNode {
  constructor(
    public value: number,
    public height: number,
    public forwards: (SkipListNode | null)[] = []
  ) {
    for (let i = 0; i < height; i++) forwards.push(null);
  }
}

class SkipList {
  private head: SkipListNode = new SkipListNode(-1, 4);
  private maxLevel = 4;

  insert(value: number): void {
    const height = this.randomHeight();
    const newNode = new SkipListNode(value, height);
    let cur = this.head;
    for (let i = this.maxLevel - 1; i >= 0; i--) {
      while (cur.forwards[i] && cur.forwards[i]!.value < value)
        cur = cur.forwards[i]!;
      if (i < height)
        cur.forwards[i] = newNode;
    }
  }

  search(value: number): boolean {
    let cur = this.head;
    for (let i = this.maxLevel - 1; i >= 0; i--) {
      while (cur.forwards[i] && cur.forwards[i]!.value < value)
        cur = cur.forwards[i]!;
      if (cur.forwards[i]?.value === value) return true;
    }
    return false;
  }

  private randomHeight(): number {
    let h = 1;
    while (Math.random() < 0.5 && h < this.maxLevel) h++;
    return h;
  }
}`;

export const skipListCodeLines = [
  "class SkipListNode {",
  "  constructor(",
  "    public value: number,",
  "    public height: number,",
  "    public forwards: (SkipListNode | null)[] = []  // forward pointers per level",
  "  ) {",
  "    for (let i = 0; i < height; i++) forwards.push(null);",
  "  }",
  "}",
  "",
  "class SkipList {",
  "  private head: SkipListNode = new SkipListNode(-1, 4);",
  "  private maxLevel = 4;",
  "",
  "  insert(value: number): void {",
  "    const height = this.randomHeight();         // random height",
  "    const newNode = new SkipListNode(value, height);",
  "    let cur = this.head;",
  "    for (let i = this.maxLevel - 1; i >= 0; i--) {",
  "      while (cur.forwards[i] && cur.forwards[i]!.value < value)",
  "        cur = cur.forwards[i]!;                  // advance until > value",
  "      if (i < height)                            // insert into levels < height",
  "        cur.forwards[i] = newNode;",
  "    }",
  "  }",
  "",
  "  search(value: number): boolean {",
  "    let cur = this.head;",
  "    for (let i = this.maxLevel - 1; i >= 0; i--) {  // start from top express lane",
  "      while (cur.forwards[i] && cur.forwards[i]!.value < value)",
  "        cur = cur.forwards[i]!;",
  "      if (cur.forwards[i]?.value === value) return true;",
  "    }",
  "    return false;",
  "  }",
  "",
  "  private randomHeight(): number {",
  "    let h = 1;",
  "    while (Math.random() < 0.5 && h < this.maxLevel) h++;  // probability 0.5^h",
  "    return h;",
  "  }",
  "}",
];

export const skipListContent = {
  id: "skip-list",
  slug: "skip-list",
  title: "",
  titleKey: "content.structures.skip-list.title",
  category: "structure" as const,
  subcategory: "linear",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.skip-list.desc",
  generator: skipListGenerator,
  code: skipListCode,
  language: "TypeScript",
  complexity: { time: "O(log n) search/insert/delete", space: "O(n)" },
  tags: [],
  icon: "🚀",
  codeExamples: {
    typescript: {
      code: `class SkipListNode {
  constructor(
    public value: number,
    public height: number,
    public forwards: (SkipListNode | null)[] = []
  ) {
    for (let i = 0; i < height; i++) forwards.push(null);
  }
}

class SkipList {
  private head: SkipListNode = new SkipListNode(-1, 4);
  private maxLevel = 4;

  insert(value: number): void {
    const height = this.randomHeight();
    const newNode = new SkipListNode(value, height);
    let cur = this.head;
    for (let i = this.maxLevel - 1; i >= 0; i--) {
      while (cur.forwards[i] && cur.forwards[i]!.value < value)
        cur = cur.forwards[i]!;
      if (i < height)
        cur.forwards[i] = newNode;        // ← insert into levels
    }
  }

  search(value: number): boolean {
    let cur = this.head;
    for (let i = this.maxLevel - 1; i >= 0; i--) { // ← search from top level
      while (cur.forwards[i] && cur.forwards[i]!.value < value)
        cur = cur.forwards[i]!;
      if (cur.forwards[i]?.value === value) return true;
    }
    return false;
  }

  private randomHeight(): number {
    let h = 1;
    while (Math.random() < 0.5 && h < this.maxLevel) h++;
    return h;
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#define MAX_LEVEL 4

typedef struct SkipListNode {
  int value;
  int height;
  struct SkipListNode* forwards[MAX_LEVEL];
} SkipListNode;

typedef struct {
  SkipListNode* head;
  int maxLevel;
} SkipList;

void initSkipList(SkipList* sl) {
  sl->maxLevel = MAX_LEVEL;
  sl->head = malloc(sizeof(SkipListNode));
  sl->head->value = -1;
  sl->head->height = MAX_LEVEL;
  for (int i = 0; i < MAX_LEVEL; i++) sl->head->forwards[i] = NULL;
}

void insert(SkipList* sl, int value) {
  int height = randomHeight();
  SkipListNode* newNode = malloc(sizeof(SkipListNode));
  newNode->value = value;
  newNode->height = height;
  SkipListNode* cur = sl->head;
  for (int i = sl->maxLevel - 1; i >= 0; i--) {
    while (cur->forwards[i] && cur->forwards[i]->value < value)
      cur = cur->forwards[i];
    if (i < height)
      cur->forwards[i] = newNode;         // ← insert into levels
  }
}

int search(SkipList* sl, int value) {
  SkipListNode* cur = sl->head;
  for (int i = sl->maxLevel - 1; i >= 0; i--) { // ← search from top level
    while (cur->forwards[i] && cur->forwards[i]->value < value)
      cur = cur->forwards[i];
    if (cur->forwards[i] && cur->forwards[i]->value == value) return 1;
  }
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `class SkipListNode {
public:
  int value;
  int height;
  vector<SkipListNode*> forwards;
  SkipListNode(int v, int h) : value(v), height(h), forwards(h, nullptr) {}
};

class SkipList {
  SkipListNode* head;
  int maxLevel = 4;
public:
  SkipList() : head(new SkipListNode(-1, 4)) {}

  void insert(int value) {
    int height = randomHeight();
    SkipListNode* newNode = new SkipListNode(value, height);
    SkipListNode* cur = head;
    for (int i = maxLevel - 1; i >= 0; i--) {
      while (cur->forwards[i] && cur->forwards[i]->value < value)
        cur = cur->forwards[i];
      if (i < height)
        cur->forwards[i] = newNode;       // ← insert into levels
    }
  }

  bool search(int value) {
    SkipListNode* cur = head;
    for (int i = maxLevel - 1; i >= 0; i--) { // ← search from top level
      while (cur->forwards[i] && cur->forwards[i]->value < value)
        cur = cur->forwards[i];
      if (cur->forwards[i] && cur->forwards[i]->value == value) return true;
    }
    return false;
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `import random

class SkipListNode:
    def __init__(self, value, height):
        self.value = value
        self.forwards = [None] * height   // ← forward pointers per level

class SkipList:
    def __init__(self, max_level=4):
        self.max_level = max_level
        self.head = SkipListNode(-1, max_level)

    def insert(self, value):
        height = self._random_height()
        new_node = SkipListNode(value, height)
        cur = self.head
        for i in range(self.max_level - 1, -1, -1):
            while cur.forwards[i] and cur.forwards[i].value < value:
                cur = cur.forwards[i]
            if i < height:
                cur.forwards[i] = new_node  // ← insert into levels

    def search(self, value):
        cur = self.head
        for i in range(self.max_level - 1, -1, -1):  // ← search from top level
            while cur.forwards[i] and cur.forwards[i].value < value:
                cur = cur.forwards[i]
            if cur.forwards[i] and cur.forwards[i].value == value:
                return True
        return False

    def _random_height(self):
        h = 1
        while random.random() < 0.5 and h < self.max_level:
            h += 1
        return h`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use rand::Rng;

struct SkipListNode {
    value: i32,
    forwards: Vec<Option<Box<SkipListNode>>>,
}

struct SkipList {
    head: Box<SkipListNode>,
    max_level: usize,
}

impl SkipList {
    fn new(max_level: usize) -> Self {
        SkipList {
            head: Box::new(SkipListNode { value: -1, forwards: vec![None; max_level] }),
            max_level,
        }
    }

    fn insert(&mut self, value: i32) {
        let height = self.random_height();
        let mut new_node = Box::new(SkipListNode {
            value,
            forwards: vec![None; height],
        });
        let mut cur = &mut self.head;
        for i in (0..self.max_level).rev() {
            while let Some(ref mut next) = cur.forwards[i] {
                if next.value >= value { break; }
                cur = next;
            }
            if i < height {
                new_node.forwards[i] = cur.forwards[i].take(); // ← insert into levels
                cur.forwards[i] = Some(new_node);
                break;
            }
        }
    }

    fn search(&self, value: i32) -> bool {
        let mut cur = &self.head;
        for i in (0..self.max_level).rev() {          // ← search from top level
            while let Some(ref next) = cur.forwards[i] {
                if next.value >= value { break; }
                cur = next;
            }
            if let Some(ref next) = cur.forwards[i] {
                if next.value == value { return true; }
            }
        }
        false
    }

    fn random_height(&self) -> usize {
        let mut h = 1;
        let mut rng = rand::thread_rng();
        while rng.gen::<f64>() < 0.5 && h < self.max_level { h += 1; }
        h
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `import "math/rand"

type SkipListNode struct {
  Value    int
  Forwards []*SkipListNode
}

type SkipList struct {
  Head     *SkipListNode
  MaxLevel int
}

func NewSkipList(maxLevel int) *SkipList {
  return &SkipList{
    Head:     &SkipListNode{Value: -1, Forwards: make([]*SkipListNode, maxLevel)},
    MaxLevel: maxLevel,
  }
}

func (sl *SkipList) Insert(value int) {
  height := sl.randomHeight()
  newNode := &SkipListNode{Value: value, Forwards: make([]*SkipListNode, height)}
  cur := sl.Head
  for i := sl.MaxLevel - 1; i >= 0; i-- {
    for cur.Forwards[i] != nil && cur.Forwards[i].Value < value {
      cur = cur.Forwards[i]
    }
    if i < height {
      newNode.Forwards[i] = cur.Forwards[i] // ← insert into levels
      cur.Forwards[i] = newNode
    }
  }
}

func (sl *SkipList) Search(value int) bool {
  cur := sl.Head
  for i := sl.MaxLevel - 1; i >= 0; i-- { // ← search from top level
    for cur.Forwards[i] != nil && cur.Forwards[i].Value < value {
      cur = cur.Forwards[i]
    }
    if cur.Forwards[i] != nil && cur.Forwards[i].Value == value {
      return true
    }
  }
  return false
}

func (sl *SkipList) randomHeight() int {
  h := 1
  for rand.Float64() < 0.5 && h < sl.MaxLevel { h++ }
  return h
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class SkipListNode {
  int value;
  SkipListNode[] forwards;
  SkipListNode(int v, int h) {
    value = v;
    forwards = new SkipListNode[h];
  }
}

class SkipList {
  private SkipListNode head;
  private int maxLevel;

  SkipList(int maxLevel) {
    this.maxLevel = maxLevel;
    head = new SkipListNode(-1, maxLevel);
  }

  void insert(int value) {
    int height = randomHeight();
    SkipListNode newNode = new SkipListNode(value, height);
    SkipListNode cur = head;
    for (int i = maxLevel - 1; i >= 0; i--) {
      while (cur.forwards[i] != null && cur.forwards[i].value < value)
        cur = cur.forwards[i];
      if (i < height)
        cur.forwards[i] = newNode;        // ← insert into levels
    }
  }

  boolean search(int value) {
    SkipListNode cur = head;
    for (int i = maxLevel - 1; i >= 0; i--) { // ← search from top level
      while (cur.forwards[i] != null && cur.forwards[i].value < value)
        cur = cur.forwards[i];
      if (cur.forwards[i] != null && cur.forwards[i].value == value)
        return true;
    }
    return false;
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "redis-sorted-sets",
      i18nKey: "content.structures.skip-list.scenarios.redis-sorted-sets",
      domain: "database",
      icon: "🔴",
      reference: "Redis, LevelDB, RocksDB",
      codeSnippet: {
        language: "typescript",
        code: `// Redis ZADD uses a skip list + hash table for sorted sets
// ZADD leaderboard 1500 "player1"  → O(log n) insert
// ZRANGEBYSCORE leaderboard 1000 2000 → O(log n + k) range query
// Skip list chosen over RBT: simpler concurrent locking`,
      },
    },
    {
      id: "leveldb-memtable",
      i18nKey: "content.structures.skip-list.scenarios.leveldb-memtable",
      domain: "system",
      icon: "💾",
      reference: "LevelDB, RocksDB, PebbleDB",
    },
    {
      id: "hbase-region",
      i18nKey: "content.structures.skip-list.scenarios.hbase-region",
      domain: "data-pipeline",
      icon: "🏗️",
      reference: "Apache HBase, Apache Cassandra",
    },
  ] satisfies Scenario[],
};
