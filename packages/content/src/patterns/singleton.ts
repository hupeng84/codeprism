import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Singleton Pattern — Frame Generator
 * database connection scenario - singleton with private constructor
 */
export function* singletonGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const client1Pos = { x: 100, y: 150 };
  const singletonPos = { x: 350, y: 150 };
  const client2Pos = { x: 600, y: 150 };
  const instancePos = { x: 350, y: 280 };

  // Objects
  const client1: PatternObject = {
    id: "client1",
    name: "UserService",
    type: "Client",
    state: {},
    position: client1Pos,
    status: "idle",
  };

  const dbClass: PatternObject = {
    id: "singleton",
    name: "Database",
    type: "Singleton",
    state: { instance: null },
    position: singletonPos,
    status: "idle",
  };

  const client2: PatternObject = {
    id: "client2",
    name: "OrderService",
    type: "Client",
    state: {},
    position: client2Pos,
    status: "idle",
  };

  const instance: PatternObject = {
    id: "instance",
    name: "dbInstance",
    type: "Instance",
    state: { connections: 5 },
    position: instancePos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...client1 },
        { ...dbClass },
        { ...client2 },
        { ...instance },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: UserService requests connection
  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "active" },
        { ...dbClass, status: "idle" },
        { ...client2, status: "idle" },
        { ...instance, status: "idle" },
      ],
      messages: [
        { from: "client1", to: "singleton", method: "getInstance()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.0" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "active" },
        { ...dbClass, status: "highlighted" },
        { ...client2, status: "idle" },
        { ...instance, status: "idle" },
      ],
      messages: [
        { from: "client1", to: "singleton", method: "getInstance()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.1" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "active" },
        { ...dbClass, status: "active" },
        { ...client2, status: "idle" },
        { ...instance, status: "idle" },
      ],
      messages: [
        { from: "singleton", to: "singleton", method: "new Database()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.2" },
    highlightLine: 9,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "active" },
        { ...dbClass, status: "highlighted" },
        { ...client2, status: "idle" },
        { ...instance, status: "active" },
      ],
      messages: [
        { from: "singleton", to: "instance", method: "→ dbInstance", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.3" },
    highlightLine: 10,
  };

  // Step 5: Return instance to UserService
  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "idle" },
        { ...dbClass, status: "idle" },
        { ...client2, status: "idle" },
        { ...instance, status: "highlighted" },
      ],
      messages: [
        { from: "singleton", to: "client1", method: "return dbInstance", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.4" },
    highlightLine: 11,
  };

  // Step 6: OrderService requests connection
  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "idle" },
        { ...dbClass, status: "active" },
        { ...client2, status: "active" },
        { ...instance, status: "idle" },
      ],
      messages: [
        { from: "client2", to: "singleton", method: "getInstance()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.5" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "idle" },
        { ...dbClass, status: "highlighted" },
        { ...client2, status: "active" },
        { ...instance, status: "idle" },
      ],
      messages: [
        { from: "client2", to: "singleton", method: "getInstance()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.6" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "idle" },
        { ...dbClass, status: "highlighted" },
        { ...client2, status: "idle" },
        { ...instance, status: "highlighted" },
      ],
      messages: [
        { from: "singleton", to: "client2", method: "return existing dbInstance", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.7" },
    highlightLine: 12,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "idle" },
        { ...dbClass, status: "idle" },
        { ...client2, status: "idle" },
        { ...instance, status: "highlighted" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.8" },
    highlightLine: 12,
  };

  // Step 10: Verify same instance
  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "idle" },
        { ...dbClass, status: "idle" },
        { ...client2, status: "idle" },
        { ...instance, status: "highlighted" },
      ],
      messages: [
        { from: "client1", to: "instance", method: "check same?", args: [], status: "pending" },
        { from: "client2", to: "instance", method: "check same?", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.9" },
    highlightLine: 15,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client1, status: "idle" },
        { ...dbClass, status: "idle" },
        { ...client2, status: "idle" },
        { ...instance, status: "highlighted" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.singleton.frames.10" },
    highlightLine: 15,
  };
}

/** Code snippet */
export const singletonCode = `// Singleton class
class Database {
  // ← private static instance
  private static instance: Database | null = null;

  // ← private constructor, prevents direct new
  private constructor() {
    console.log("Creating Database connection...");
  }

  // ← static method to get the single instance
  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();  // ← lazy creation
    }
    return Database.instance;  // ← always returns the same instance
  }

  query(sql: string): void {
    console.log(\`Executing: \${sql}\`);
  }
}

// Usage
const db1 = Database.getInstance();  // ← first call, creates instance
const db2 = Database.getInstance();   // ← returns existing instance

console.log(db1 === db2);  // true - same object`;

export const singletonCodeLines = [
  "// Singleton class",
  "class Database {",
  "  // ← private static instance",
  "  private static instance: Database | null = null;",
  "",
  "  // ← private constructor, prevents direct new",
  "  private constructor() {",
  "    console.log('Creating Database connection...');",
  "  }",
  "",
  "  // ← static method to get the single instance",
  "  static getInstance(): Database {",
  "    if (!Database.instance) {",
  "      Database.instance = new Database();  // ← lazy creation",
  "    }",
  "    return Database.instance;  // ← always returns the same instance",
  "  }",
  "",
  "  query(sql: string): void {",
  "    console.log(`Executing: ${sql}`);",
  "  }",
  "}",
  "",
  "// Usage",
  "const db1 = Database.getInstance();  // ← first call, creates instance",
  "const db2 = Database.getInstance();   // ← returns existing instance",
  "",
  "console.log(db1 === db2);  // true - same object",
];

const singletonDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "client",
      name: "Client",
      stereotype: "usage",
      attributes: [],
      methods: [],
      position: { x: 80, y: 80 },
    },
    {
      id: "singleton",
      name: "Singleton",
      stereotype: "«singleton»",
      attributes: [
        { visibility: "-", name: "instance", type: "Database" },
      ],
      methods: [
        { visibility: "+", name: "getInstance", params: "", returnType: "Database" },
        { visibility: "-", name: "constructor", params: "", returnType: "" },
      ],
      position: { x: 300, y: 80 },
    },
  ],
  relationships: [
    { from: "client", to: "singleton", type: "dependency", label: "uses" },
  ],
};

export const singletonContent = {
  id: "singleton",
  slug: "singleton",
  title: "",
  titleKey: "content.patterns.singleton.title",
  category: "pattern" as const,
  subcategory: "creational",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.singleton.desc",
  defaultInput: undefined,
  generator: singletonGenerator,
  code: singletonCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(1)",
  },
  tags: [],
  icon: "1️⃣",
  diagram: singletonDiagram,
  codeExamples: {
    typescript: {
      code: `class Database {
  private static instance: Database | null = null;

  private constructor() {
    console.log("Creating Database connection...");
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  query(sql: string): void {
    console.log(\`Executing: \${sql}\`);
  }
}

const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2);  // true`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdlib.h>

typedef struct Database Database;

struct Database {
  int connection_count;
};

// Static instance pointer
static Database* instance = NULL;

// Get singleton instance
Database* db_get_instance(void) {
  if (instance == NULL) {
    instance = (Database*)malloc(sizeof(Database));
    instance->connection_count = 0;
  }
  return instance;
}

// Usage
int main(void) {
  Database* db1 = db_get_instance();
  Database* db2 = db_get_instance();
  // db1 == db2
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <memory>

class Database {
private:
  static std::unique_ptr<Database> instance;
  Database() { }

public:
  static Database& getInstance() {
    if (!instance) {
      instance = std::unique_ptr<Database>(new Database());
    }
    return *instance;
  }

  void query(const std::string& sql) {
    std::cout << "Executing: " << sql << std::endl;
  }
};

std::unique_ptr<Database> Database::instance = nullptr;

// Usage
int main() {
  Database& db1 = Database::getInstance();
  Database& db2 = Database::getInstance();
  // &db1 == &db2
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if not self._initialized:
            print("Creating Database connection...")
            self._initialized = True

    def query(self, sql):
        print(f"Executing: {sql}")


db1 = Database()
db2 = Database()
print(db1 is db2)  # True`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::sync::Mutex;

struct Database {
    connection_count: i32,
}

impl Database {
    fn new() -> Self {
        Database { connection_count: 0 }
    }
}

fn get_instance() -> &'static Mutex<Database> {
    static mut INSTANCE: Option<Mutex<Database>> = None;
    // Note: In real code, use once_cell or std::sync::OnceLock
    unsafe {
        if INSTANCE.is_none() {
            INSTANCE = Some(Mutex::new(Database::new()));
        }
        INSTANCE.as_ref().unwrap()
    }
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "sync"

type Database struct {
    connectionCount int
}

var (
    instance *Database
    once     sync.Once
)

func GetInstance() *Database {
    once.Do(func() {
        instance = &Database{}
    })
    return instance
}

func main() {
    db1 := GetInstance()
    db2 := GetInstance()
    // db1 == db2
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public class Database {
    private static Database instance;

    private Database() {
        System.out.println("Creating Database connection...");
    }

    public static synchronized Database getInstance() {
        if (instance == null) {
            instance = new Database();
        }
        return instance;
    }

    public void query(String sql) {
        System.out.println("Executing: " + sql);
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        Database db1 = Database.getInstance();
        Database db2 = Database.getInstance();
        // db1 == db2
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios
  scenarios: [
    {
      id: "java-runtime",
      i18nKey: "content.patterns.singleton.scenarios.java-runtime",
      domain: "system",
      icon: "☕",
      reference: "Java SDK, java.lang.Runtime, ProcessBuilder",
      codeSnippet: {
        language: "java",
        code: `// java.lang.Runtime — classic JDK singleton
Runtime runtime = Runtime.getRuntime();
System.out.println(runtime.maxMemory());
System.out.println(runtime.availableProcessors());

// Same instance guaranteed across the JVM
Runtime same = Runtime.getRuntime();
System.out.println(runtime == same); // true`,
      },
    },
    {
      id: "spring-bean",
      i18nKey: "content.patterns.singleton.scenarios.spring-bean",
      domain: "library",
      icon: "🌱",
      reference: "Spring Framework, Spring IoC, Jakarta EE",
    },
    {
      id: "log4j-logger",
      i18nKey: "content.patterns.singleton.scenarios.log4j-logger",
      domain: "devtools",
      icon: "📝",
      reference: "Log4j, SLF4J, java.util.logging",
    },
  ] satisfies Scenario[],
};
