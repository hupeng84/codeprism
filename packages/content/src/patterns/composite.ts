import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Composite Pattern — Frame Generator
 * filesystem scenario - File and Directory components
 */
export function* compositeGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const rootPos = { x: 400, y: 50 };
  const dir1Pos = { x: 200, y: 150 };
  const dir2Pos = { x: 600, y: 150 };
  const file1Pos = { x: 100, y: 250 };
  const file2Pos = { x: 300, y: 250 };
  const file3Pos = { x: 500, y: 250 };
  const file4Pos = { x: 700, y: 250 };

  // Objects
  const root: PatternObject = {
    id: "root",
    name: "Root/",
    type: "Directory",
    state: { items: 3 },
    position: rootPos,
    status: "idle",
  };

  const dir1: PatternObject = {
    id: "dir1",
    name: "Documents/",
    type: "Directory",
    state: { items: 2 },
    position: dir1Pos,
    status: "idle",
  };

  const dir2: PatternObject = {
    id: "dir2",
    name: "Images/",
    type: "Directory",
    state: { items: 1 },
    position: dir2Pos,
    status: "idle",
  };

  const file1: PatternObject = {
    id: "file1",
    name: "report.txt",
    type: "File",
    state: { size: "2KB" },
    position: file1Pos,
    status: "idle",
  };

  const file2: PatternObject = {
    id: "file2",
    name: "notes.md",
    type: "File",
    state: { size: "5KB" },
    position: file2Pos,
    status: "idle",
  };

  const file3: PatternObject = {
    id: "file3",
    name: "photo.jpg",
    type: "File",
    state: { size: "2MB" },
    position: file3Pos,
    status: "idle",
  };

  const file4: PatternObject = {
    id: "file4",
    name: "readme.txt",
    type: "File",
    state: { size: "1KB" },
    position: file4Pos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [{ ...root }],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Add Documents directory
  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "active" },
        { ...dir1, status: "active" },
      ],
      messages: [
        { from: "root", to: "dir1", method: "add(Documents)", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.0" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "idle", state: { items: 3 } },
        { ...dir1, status: "idle" },
        { ...dir2 },
        { ...file1 },
        { ...file2 },
        { ...file3 },
        { ...file4 },
      ],
      messages: [
        { from: "root", to: "dir1", method: "add(Documents)", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.1" },
    highlightLine: 8,
  };

  // Step 3: Add Images directory
  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "active" },
        { ...dir2, status: "active" },
      ],
      messages: [
        { from: "root", to: "dir2", method: "add(Images)", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.2" },
    highlightLine: 9,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "idle" },
        { ...dir1 },
        { ...dir2, status: "idle" },
        { ...file1 },
        { ...file2 },
        { ...file3 },
        { ...file4 },
      ],
      messages: [
        { from: "root", to: "dir2", method: "add(Images)", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.3" },
    highlightLine: 9,
  };

  // Step 5: Add file to Documents
  yield {
    step: step++,
    state: {
      objects: [
        { ...dir1, status: "active" },
        { ...file1, status: "active" },
      ],
      messages: [
        { from: "dir1", to: "file1", method: "add(report.txt)", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.4" },
    highlightLine: 12,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...dir1, status: "idle", state: { items: 2 } },
        { ...file1, status: "idle" },
      ],
      messages: [
        { from: "dir1", to: "file1", method: "add(report.txt)", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.5" },
    highlightLine: 12,
  };

  // Step 7: Add another file to Documents
  yield {
    step: step++,
    state: {
      objects: [
        { ...dir1, status: "active" },
        { ...file2, status: "active" },
      ],
      messages: [
        { from: "dir1", to: "file2", method: "add(notes.md)", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.6" },
    highlightLine: 13,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...dir1, status: "idle", state: { items: 2 } },
        { ...file2, status: "idle" },
      ],
      messages: [
        { from: "dir1", to: "file2", method: "add(notes.md)", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.7" },
    highlightLine: 13,
  };

  // Step 9: Add file to Images
  yield {
    step: step++,
    state: {
      objects: [
        { ...dir2, status: "active" },
        { ...file3, status: "active" },
      ],
      messages: [
        { from: "dir2", to: "file3", method: "add(photo.jpg)", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.8" },
    highlightLine: 14,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...dir2, status: "idle", state: { items: 1 } },
        { ...file3, status: "idle" },
      ],
      messages: [
        { from: "dir2", to: "file3", method: "add(photo.jpg)", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.9" },
    highlightLine: 14,
  };

  // Step 11: Add readme to root (file directly in directory)
  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "active" },
        { ...file4, status: "active" },
      ],
      messages: [
        { from: "root", to: "file4", method: "add(readme.txt)", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.10" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "idle", state: { items: 4 } },
        { ...file4, status: "idle" },
      ],
      messages: [
        { from: "root", to: "file4", method: "add(readme.txt)", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.11" },
    highlightLine: 10,
  };

  // Step 13: Calculate total size (recursive operation)
  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "active" },
        { ...dir1, status: "idle", state: { items: 2 } },
        { ...dir2, status: "idle", state: { items: 1 } },
        { ...file1, status: "idle" },
        { ...file2, status: "idle" },
        { ...file3, status: "idle" },
        { ...file4, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.12" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "highlighted", state: { items: 4 } },
        { ...dir1, status: "active" },
        { ...dir2, status: "active" },
        { ...file1, status: "active" },
        { ...file2, status: "active" },
        { ...file3, status: "active" },
        { ...file4, status: "active" },
      ],
      messages: [
        { from: "root", to: "dir1", method: "getSize()", args: [], status: "pending" },
        { from: "root", to: "dir2", method: "getSize()", args: [], status: "pending" },
        { from: "root", to: "file4", method: "getSize()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.13" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...root, status: "highlighted", state: { totalSize: "~2MB" } },
        { ...dir1, status: "idle" },
        { ...dir2, status: "idle" },
        { ...file1, status: "idle" },
        { ...file2, status: "idle" },
        { ...file3, status: "idle" },
        { ...file4, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.composite.frames.14" },
    highlightLine: 20,
  };
}

/** Code snippet */
export const compositeCode = `// Component interface
interface FileSystemItem {
  getSize(): number;     // ← get size
  getName(): string;     // ← get name
}

// Leaf - file (leaf node)
class File implements FileSystemItem {
  constructor(
    public name: string,
    private size: number
  ) {}

  getSize(): number {
    return this.size;
  }

  getName(): string {
    return this.name;
  }
}

// Composite - directory (composite node)
class Directory implements FileSystemItem {
  private children: FileSystemItem[] = [];

  constructor(public name: string) {}

  add(item: FileSystemItem): void {
    this.children.push(item);  // ← add child
  }

  getSize(): number {
    return this.children.reduce(
      (sum, child) => sum + child.getSize(),  // ← recursive sum
      0
    );
  }
}

// Usage
const root = new Directory("root");
const docs = new Directory("Documents");
docs.add(new File("report.txt", 2));
root.add(docs);
root.add(new File("readme.txt", 1));
console.log(root.getSize());  // 3`;

export const compositeCodeLines = [
  "// Component interface",
  "interface FileSystemItem {",
  "  getSize(): number;     // ← get size",
  "  getName(): string;     // ← get name",
  "}",
  "",
  "// Leaf - file (leaf node)",
  "class File implements FileSystemItem {",
  "  constructor(",
  "    public name: string,",
  "    private size: number",
  "  ) {}",
  "",
  "  getSize(): number {",
  "    return this.size;",
  "  }",
  "",
  "  getName(): string {",
  "    return this.name;",
  "  }",
  "}",
  "",
  "// Composite - directory (composite node)",
  "class Directory implements FileSystemItem {",
  "  private children: FileSystemItem[] = [];",
  "",
  "  constructor(public name: string) {}",
  "",
  "  add(item: FileSystemItem): void {",
  "    this.children.push(item);  // ← add child",
  "  }",
  "",
  "  getSize(): number {",
  "    return this.children.reduce(",
  "      (sum, child) => sum + child.getSize(),  // ← recursive sum",
  "      0",
  "    );",
  "  }",
  "}",
  "",
  "// Usage",
  "const root = new Directory('root');",
  "const docs = new Directory('Documents');",
  "docs.add(new File('report.txt', 2));",
  "root.add(docs);",
  "root.add(new File('readme.txt', 1));",
  "console.log(root.getSize());  // 3",
];

const compositeDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "component",
      name: "Component",
      stereotype: "interface",
      attributes: [],
      methods: [
        { visibility: "+", name: "operation()", params: "", returnType: "void" },
        { visibility: "+", name: "add()", params: "c: Component", returnType: "void" },
        { visibility: "+", name: "remove()", params: "c: Component", returnType: "void" },
        { visibility: "+", name: "getChild()", params: "i: number", returnType: "Component" },
      ],
      position: { x: 300, y: 50 },
    },
    {
      id: "leaf",
      name: "Leaf",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 100, y: 200 },
    },
    {
      id: "composite",
      name: "Composite",
      stereotype: "class",
      attributes: [{ visibility: "#", name: "children", type: "Component[]" }],
      methods: [
        { visibility: "+", name: "operation()", params: "", returnType: "void" },
        { visibility: "+", name: "add()", params: "c: Component", returnType: "void" },
        { visibility: "+", name: "remove()", params: "c: Component", returnType: "void" },
        { visibility: "+", name: "getChild()", params: "i: number", returnType: "Component" },
      ],
      position: { x: 500, y: 200 },
    },
  ],
  relationships: [
    { from: "leaf", to: "component", type: "implements" },
    { from: "composite", to: "component", type: "implements" },
    { from: "composite", to: "component", type: "aggregation", label: "contains" },
  ],
};

export const compositeContent = {
  id: "composite",
  slug: "composite",
  title: "",
  titleKey: "content.patterns.composite.title",
  category: "pattern" as const,
  subcategory: "structural",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.composite.desc",
  defaultInput: undefined,
  generator: compositeGenerator,
  code: compositeCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  icon: "📁",
  diagram: compositeDiagram,
  codeExamples: {
    typescript: {
      code: `interface FileSystemItem {
  getSize(): number;
}

class File implements FileSystemItem {
  constructor(public name: string, private size: number) {}
  getSize(): number { return this.size; }
}

class Directory implements FileSystemItem {
  private children: FileSystemItem[] = [];
  constructor(public name: string) {}
  add(item: FileSystemItem): void {
    this.children.push(item);
  }
  getSize(): number {
    return this.children.reduce((sum, c) => sum + c.getSize(), 0);
  }
}

const root = new Directory("root");
const docs = new Directory("Documents");
docs.add(new File("report.txt", 2));
root.add(docs);
root.add(new File("readme.txt", 1));
console.log(root.getSize());  // 3`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct FileSystemItem FileSystemItem;

struct FileSystemItem {
  int (*getSize)(FileSystemItem*);
};

typedef struct {
  FileSystemItem base;
  int size;
} File;

typedef struct {
  FileSystemItem base;
  FileSystemItem** children;
  int count;
} Directory;

int file_get_size(FileSystemItem* base) {
  return ((File*)base)->size;
}

int directory_get_size(FileSystemItem* base) {
  Directory* dir = (Directory*)base;
  int sum = 0;
  for (int i = 0; i < dir->count; i++) {
    sum += dir->children[i]->getSize(dir->children[i]);
  }
  return sum;
}

int main(void) {
  File file = {{file_get_size}, 2};
  printf("%d\\n", file_get_size((FileSystemItem*)&file));
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>
#include <vector>

struct FileSystemItem {
  virtual int getSize() = 0;
  virtual ~FileSystemItem() = default;
};

struct File : FileSystemItem {
  std::string name;
  int size;
  File(std::string n, int s) : name(n), size(s) {}
  int getSize() override { return size; }
};

struct Directory : FileSystemItem {
  std::string name;
  std::vector<std::unique_ptr<FileSystemItem>> children;
  Directory(std::string n) : name(n) {}
  void add(std::unique_ptr<FileSystemItem> item) {
    children.push_back(std::move(item));
  }
  int getSize() override {
    int sum = 0;
    for (auto& c : children) sum += c->getSize();
    return sum;
  }
};

int main() {
  auto root = std::make_unique<Directory>("root");
  root->add(std::make_unique<File>("readme.txt", 1));
  std::cout << root->getSize() << std::endl;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class FileSystemItem(ABC):
    @abstractmethod
    def get_size(self) -> int:
        pass

class File(FileSystemItem):
    def __init__(self, name, size):
        self.name = name
        self.size = size
    def get_size(self) -> int:
        return self.size

class Directory(FileSystemItem):
    def __init__(self, name):
        self.name = name
        self.children = []
    def add(self, item):
        self.children.append(item)
    def get_size(self) -> int:
        return sum(c.get_size() for c in self.children)

root = Directory("root")
docs = Directory("Documents")
docs.add(File("report.txt", 2))
root.add(docs)
root.add(File("readme.txt", 1))
print(root.get_size())  # 3`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait FileSystemItem {
    fn get_size(&self) -> i32;
}

struct File { name: String, size: i32 }
struct Directory { name: String, children: Vec<Box<dyn FileSystemItem>> }

impl FileSystemItem for File {
    fn get_size(&self) -> i32 { self.size }
}

impl FileSystemItem for Directory {
    fn get_size(&self) -> i32 {
        self.children.iter().map(|c| c.get_size()).sum()
    }
}

fn main() {
    let mut docs = Directory {
        name: "Documents".to_string(),
        children: vec![],
    };
    docs.children.push(Box::new(File { name: "report.txt".to_string(), size: 2 }));
    let mut root = Directory { name: "root".to_string(), children: vec![] };
    root.children.push(Box::new(docs));
    println!("{}", root.get_size());
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type FileSystemItem interface {
    GetSize() int
}

type File struct {
    name string
    size int
}

func (f File) GetSize() int { return f.size }

type Directory struct {
    name     string
    children []FileSystemItem
}

func (d Directory) GetSize() int {
    sum := 0
    for _, c := range d.children {
        sum += c.GetSize()
    }
    return sum
}

func main() {
    root := Directory{name: "root", children: []FileSystemItem{}}
    docs := Directory{name: "Documents", children: []FileSystemItem{File{"report.txt", 2}}}
    root.children = append(root.children, docs, File{"readme.txt", 1})
    fmt.Println(root.GetSize())
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface FileSystemItem {`,
      language: "java",
      languageLabel: "Java",
    },
  },
  scenarios: [
    {
      id: "dom-tree",
      i18nKey: "content.patterns.composite.scenarios.dom-tree",
      domain: "ui-framework",
      icon: "🌐",
      reference: "W3C DOM API, jQuery, React DOM",
    },
    {
      id: "ast-nodes",
      i18nKey: "content.patterns.composite.scenarios.ast-nodes",
      domain: "devtools",
      icon: "📦",
      reference: "Babel AST, TypeScript Compiler API, ANTLR, Esprima",
      codeSnippet: {
        language: "typescript",
        code: `// AST node: expressions contain sub-expressions, all eval() uniformly
interface ASTNode { eval(): number; }
class NumberNode implements ASTNode {
  constructor(private value: number) {}
  eval(): number { return this.value; }
}
class AddNode implements ASTNode {
  constructor(private left: ASTNode, private right: ASTNode) {}
  eval(): number { return this.left.eval() + this.right.eval(); }
}
// 1 + (2 + 3)
const tree = new AddNode(new NumberNode(1), new AddNode(new NumberNode(2), new NumberNode(3)));
console.log(tree.eval()); // 6`,
      },
    },
    {
      id: "organization-chart",
      i18nKey: "content.patterns.composite.scenarios.organization-chart",
      domain: "business",
      icon: "💼",
      reference: "Active Directory, Workday, Jira project hierarchy",
    },
  ] satisfies Scenario[],
};
