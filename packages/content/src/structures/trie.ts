import type { Frame, Scenario, TreeState, TreeNode } from "@codeprism/core";

function makeNode(id: string, value: number, x: number, y: number, left: TreeNode | null, right: TreeNode | null, status: TreeNode["status"] = "default"): TreeNode {
  return { id, value, x, y, left, right, status };
}



function buildRoot(words: string[], marks: Map<string, TreeNode["status"]>): TreeNode | null {
  const root = makeNode("root", 0, 350, 50, null, null, "default");
  for (const word of words) {
    let curr = root;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const charCode = ch.charCodeAt(0);
      if (!curr.left) {
        curr.left = makeNode(`${word.slice(0, i + 1)}`, charCode, 0, 0, null, null, marks.get(`${word.slice(0, i + 1)}`) ?? "default");
      }
      curr = curr.left;
      while (curr.value !== charCode && curr.right) curr = curr.right;
      if (curr.value !== charCode && curr.right === null) {
        curr.right = makeNode(`${word.slice(0, i + 1)}`, charCode, 0, 0, null, null, marks.get(`${word.slice(0, i + 1)}`) ?? "default");
        curr = curr.right;
      } else if (curr.value !== charCode) {
        curr = curr.right!;
      }
    }
  }
  function assignX(node: TreeNode | null, x: number, y: number, spread: number): void {
    if (!node) return;
    node.x = x;
    node.y = y;
    assignX(node.left, x - spread, y + 60, spread / 2);
    assignX(node.right, x + spread / 4, y + 60, spread / 4);
  }
  assignX(root.left, 350, 110, 120);
  return root.left;
}

export function* trieGenerator(): Generator<Frame<TreeState>, void, unknown> {
  let step = 0;
  let root: TreeNode | null = null;

  root = null;
  yield { step: step++, state: { root, operation: "empty Trie" }, description: "Initial empty Trie", highlightLine: 0 };

  root = buildRoot([], new Map());
  yield { step: step++, state: { root, operation: "Insert cat" }, description: "Insert cat — one node per character", highlightLine: 5 };
  root = buildRoot(["cat"], new Map());
  yield { step: step++, state: { root, operation: "Insert cat Complete" }, description: "'cat' insert complete ✅ Mark end position", highlightLine: 5 };

  root = buildRoot(["cat"], new Map());
  yield { step: step++, state: { root, operation: "Insert car" }, description: "Insert car — after c-a branch, r and t are siblings", highlightLine: 5 };
  root = buildRoot(["cat", "car"], new Map([["car", "inserted"]]));
  yield { step: step++, state: { root, operation: "Insert car Complete" }, description: "'car' insert complete, shares prefix 'ca' with 'cat'", highlightLine: 5 };

  root = buildRoot(["cat", "car"], new Map([["card", "inserted"]]));
  yield { step: step++, state: { root, operation: "Insert card" }, description: "Insert card — add 'd' child under 'car'", highlightLine: 5 };

  root = buildRoot(["cat", "car", "card"], new Map([["care", "inserted"]]));
  yield { step: step++, state: { root, operation: "Insert care" }, description: "Insert care — add 'e' child under 'car'", highlightLine: 5 };

  root = buildRoot(["cat", "car", "card", "care"], new Map([["careful", "inserted"]]));
  yield { step: step++, state: { root, operation: "Insert careful" }, description: "Insert careful — complete word path, mark end", highlightLine: 5 };

  const m1 = new Map<string, TreeNode["status"]>([["cat", "found"], ["ca", "visiting"], ["c", "visiting"]]);
  root = buildRoot(["cat", "car", "card", "care", "careful"], m1);
  yield { step: step++, state: { root, operation: `Search "cat" ✅` }, description: "Search 'cat': path c→a→t all found, 'cat' is complete word ✅", highlightLine: 12 };

  const m2 = new Map<string, TreeNode["status"]>([["care", "found"], ["car", "visiting"]]);
  root = buildRoot(["cat", "car", "card", "care", "careful"], m2);
  yield { step: step++, state: { root, operation: `Search "care" ✅` }, description: "Search 'care': path c→a→r→e all found, 'care' is complete word ✅", highlightLine: 12 };

  const m3 = new Map<string, TreeNode["status"]>([["bat", "visiting"]]);
  root = buildRoot(["cat", "car", "card", "care", "careful"], m3);
  yield { step: step++, state: { root, operation: `Search "bat" ❌` }, description: "Search 'bat': compare at root, 'b' ≠ 'c', not in Trie ❌", highlightLine: 15 };

  root = buildRoot(["cat", "car", "card", "care", "careful"], new Map());
  yield { step: step++, state: { root, operation: "Complete" }, description: "Trie demo complete ✅ Insert/search O(m), m=word length", highlightLine: 20 };
}

export const trieCode = `class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}
class Trie {
  root = new TrieNode();
  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;
  }
  search(word: string): boolean {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return node.isEndOfWord;
  }
}`;

export const trieCodeLines = [
  "class TrieNode {",
  "  children: Map<string, TrieNode> = new Map();",
  "  isEndOfWord: boolean = false;",
  "}",
  "class Trie {",
  "  root = new TrieNode();",
  "  // ← insert: O(m)",
  "  insert(word: string): void {",
  "    let node = this.root;",
  "    for (const ch of word) {",
  "      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());",
  "      node = node.children.get(ch)!;",
  "    }",
  "    node.isEndOfWord = true;",
  "  }",
  "  // ← search: O(m)",
  "  search(word: string): boolean {",
  "    let node = this.root;",
  "    for (const ch of word) {",
  "      if (!node.children.has(ch)) return false;",
  "      node = node.children.get(ch)!;",
  "    }",
  "    return node.isEndOfWord;",
  "  }",
  "}",
];

export const trieContent = {
  id: "trie",
  slug: "trie",
  title: "",
  titleKey: "content.structures.trie.title",
  category: "structure" as const,
  subcategory: "tree",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.structures.trie.desc",
  generator: trieGenerator,
  code: trieCode,
  language: "TypeScript",
  complexity: { time: "O(m)", space: "O(Σm)" },
  tags: [],
  icon: "🌲",
  codeExamples: {
    typescript: {
      code: `class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

class Trie {
  root = new TrieNode();

  insert(word: string): void {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch))
        node.children.set(ch, new TrieNode()); // ← create child node
      node = node.children.get(ch)!;
    }
    node.isEndOfWord = true;              // ← mark end of word
  }

  search(word: string): boolean {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) return false;
      node = node.children.get(ch)!;
    }
    return node.isEndOfWord;              // ← check if complete word
  }
}`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#define ALPHABET 26

typedef struct TrieNode {
  struct TrieNode* children[ALPHABET];
  int isEndOfWord;
} TrieNode;

TrieNode* createNode() {
  TrieNode* node = malloc(sizeof(TrieNode));
  node->isEndOfWord = 0;
  for (int i = 0; i < ALPHABET; i++)
    node->children[i] = NULL;
  return node;
}

void insert(TrieNode* root, const char* word) {
  TrieNode* cur = root;
  for (int i = 0; word[i]; i++) {
    int idx = word[i] - 'a';
    if (!cur->children[idx])
      cur->children[idx] = createNode();  // ← create child node
    cur = cur->children[idx];
  }
  cur->isEndOfWord = 1;                   // ← mark end of word
}

int search(TrieNode* root, const char* word) {
  TrieNode* cur = root;
  for (int i = 0; word[i]; i++) {
    int idx = word[i] - 'a';
    if (!cur->children[idx]) return 0;
    cur = cur->children[idx];
  }
  return cur->isEndOfWord;                // ← check if complete word
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `struct TrieNode {
  TrieNode* children[26] = {};
  bool isEndOfWord = false;
};

class Trie {
  TrieNode* root = new TrieNode();
public:
  void insert(const string& word) {
    TrieNode* node = root;
    for (char ch : word) {
      int idx = ch - 'a';
      if (!node->children[idx])
        node->children[idx] = new TrieNode(); // ← create child node
      node = node->children[idx];
    }
    node->isEndOfWord = true;             // ← mark end of word
  }

  bool search(const string& word) {
    TrieNode* node = root;
    for (char ch : word) {
      int idx = ch - 'a';
      if (!node->children[idx]) return false;
      node = node->children[idx];
    }
    return node->isEndOfWord;             // ← check if complete word
  }
};`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()  # ← create child node
            node = node.children[ch]
        node.is_end_of_word = True         # ← mark end of word

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end_of_word         # ← check if complete word`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::HashMap;

#[derive(Default)]
struct TrieNode {
    children: HashMap<char, TrieNode>,
    is_end_of_word: bool,
}

struct Trie {
    root: TrieNode,
}

impl Trie {
    fn new() -> Self { Trie { root: TrieNode::default() } }

    fn insert(&mut self, word: &str) {
        let mut node = &mut self.root;
        for ch in word.chars() {
            node = node.children.entry(ch).or_insert_with(TrieNode::default); // ← create child node
        }
        node.is_end_of_word = true;        // ← mark end of word
    }

    fn search(&self, word: &str) -> bool {
        let mut node = &self.root;
        for ch in word.chars() {
            match node.children.get(&ch) {
                Some(child) => node = child,
                None => return false,
            }
        }
        node.is_end_of_word                // ← check if complete word
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `type TrieNode struct {
  Children    map[byte]*TrieNode
  IsEndOfWord bool
}

func NewTrieNode() *TrieNode {
  return &TrieNode{Children: make(map[byte]*TrieNode)}
}

type Trie struct {
  Root *TrieNode
}

func NewTrie() *Trie { return &Trie{Root: NewTrieNode()} }

func (t *Trie) Insert(word string) {
  node := t.Root
  for i := 0; i < len(word); i++ {
    ch := word[i]
    if _, ok := node.Children[ch]; !ok {
      node.Children[ch] = NewTrieNode()   // ← create child node
    }
    node = node.Children[ch]
  }
  node.IsEndOfWord = true                 // ← mark end of word
}

func (t *Trie) Search(word string) bool {
  node := t.Root
  for i := 0; i < len(word); i++ {
    next, ok := node.Children[word[i]]
    if !ok { return false }
    node = next
  }
  return node.IsEndOfWord                 // ← check if complete word
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `class TrieNode {
  TrieNode[] children = new TrieNode[26];
  boolean isEndOfWord = false;
}

class Trie {
  private TrieNode root = new TrieNode();

  void insert(String word) {
    TrieNode node = root;
    for (char ch : word.toCharArray()) {
      int idx = ch - 'a';
      if (node.children[idx] == null)
        node.children[idx] = new TrieNode(); // ← create child node
      node = node.children[idx];
    }
    node.isEndOfWord = true;              // ← mark end of word
  }

  boolean search(String word) {
    TrieNode node = root;
    for (char ch : word.toCharArray()) {
      int idx = ch - 'a';
      if (node.children[idx] == null) return false;
      node = node.children[idx];
    }
    return node.isEndOfWord;              // ← check if complete word
  }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "autocomplete",
      i18nKey: "content.structures.trie.scenarios.autocomplete",
      domain: "devtools",
      icon: "🔍",
      reference: "Google Search, VS Code IntelliSense, Sublime Text",
      codeSnippet: {
        language: "typescript",
        code: `// Trie enables O(m) prefix lookup for autocomplete
// Google Search uses tries for "search as you type"
function autocomplete(trie: Trie, prefix: string): string[] {
  let node = trie.root;
  for (const ch of prefix) {
    if (!node.children.has(ch)) return [];
    node = node.children.get(ch)!;
  }
  return collectAllWords(node, prefix); // DFS from prefix node
}`,
      },
    },
    {
      id: "ip-routing",
      i18nKey: "content.structures.trie.scenarios.ip-routing",
      domain: "network",
      icon: "🌍",
      reference: "Linux routing table, Cisco IOS, BGP",
    },
    {
      id: "spell-checker",
      i18nKey: "content.structures.trie.scenarios.spell-checker",
      domain: "library",
      icon: "📖",
      reference: "Hunspell, Aspell, browser spell check",
    },
  ] satisfies Scenario[],
};
