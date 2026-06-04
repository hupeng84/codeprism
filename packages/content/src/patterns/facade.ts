import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Facade Pattern — Frame Generator
 * computer facade scenario - simplify complex subsystems
 */
export function* facadeGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const clientPos = { x: 100, y: 200 };
  const facadePos = { x: 300, y: 200 };
  const cpuPos = { x: 500, y: 100 };
  const memoryPos = { x: 500, y: 180 };
  const diskPos = { x: 500, y: 260 };

  // Objects
  const client: PatternObject = {
    id: "client",
    name: "Application",
    type: "Client",
    state: {},
    position: clientPos,
    status: "idle",
  };

  const computer: PatternObject = {
    id: "facade",
    name: "ComputerFacade",
    type: "Facade",
    state: { simplified: true },
    position: facadePos,
    status: "idle",
  };

  const cpu: PatternObject = {
    id: "cpu",
    name: "CPU",
    type: "Subsystem",
    state: { clock: "3.0GHz" },
    position: cpuPos,
    status: "idle",
  };

  const memory: PatternObject = {
    id: "memory",
    name: "Memory",
    type: "Subsystem",
    state: { size: "16GB" },
    position: memoryPos,
    status: "idle",
  };

  const disk: PatternObject = {
    id: "disk",
    name: "HardDrive",
    type: "Subsystem",
    state: { size: "1TB" },
    position: diskPos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...client },
        { ...computer },
        { ...cpu },
        { ...memory },
        { ...disk },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Client uses complex subsystem directly (without facade)
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...computer, status: "idle" },
        { ...cpu, status: "idle" },
        { ...memory, status: "idle" },
        { ...disk, status: "idle" },
      ],
      messages: [
        { from: "client", to: "cpu", method: "freeze()", args: [], status: "pending" },
        { from: "client", to: "memory", method: "load()", args: [], status: "pending" },
        { from: "client", to: "disk", method: "read()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.0" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "highlighted" },
        { ...computer, status: "idle" },
        { ...cpu, status: "idle" },
        { ...memory, status: "idle" },
        { ...disk, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.1" },
    highlightLine: 10,
  };

  // Step 3: Create facade
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...computer, status: "active" },
        { ...cpu, status: "idle" },
        { ...memory, status: "idle" },
        { ...disk, status: "idle" },
      ],
      messages: [
        { from: "client", to: "facade", method: "startComputer()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.2" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...computer, status: "highlighted" },
        { ...cpu, status: "idle" },
        { ...memory, status: "idle" },
        { ...disk, status: "idle" },
      ],
      messages: [
        { from: "facade", to: "cpu", method: "freeze()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.3" },
    highlightLine: 21,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...computer, status: "active" },
        { ...cpu, status: "active" },
        { ...memory, status: "idle" },
        { ...disk, status: "idle" },
      ],
      messages: [
        { from: "facade", to: "memory", method: "load()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.4" },
    highlightLine: 22,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...computer, status: "active" },
        { ...cpu, status: "idle" },
        { ...memory, status: "active" },
        { ...disk, status: "idle" },
      ],
      messages: [
        { from: "facade", to: "disk", method: "read()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.5" },
    highlightLine: 23,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...computer, status: "highlighted" },
        { ...cpu, status: "idle" },
        { ...memory, status: "idle" },
        { ...disk, status: "idle" },
      ],
      messages: [
        { from: "facade", to: "client", method: "→ Computer ready", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.6" },
    highlightLine: 25,
  };

  // Step 8: Client uses simplified interface
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...computer, status: "idle" },
        { ...cpu, status: "idle" },
        { ...memory, status: "idle" },
        { ...disk, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.7" },
    highlightLine: 25,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "highlighted" },
        { ...computer, status: "idle" },
        { ...cpu, status: "idle" },
        { ...memory, status: "idle" },
        { ...disk, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.facade.frames.8" },
    highlightLine: 30,
  };
}

/** Code snippet */
export const facadeCode = `// Complex subsystem classes
class CPU {
  freeze(): void { console.log("CPU: Freezing..."); }
  jump(position: number): void { console.log(\`CPU: Jumping to \${position}\`); }
}

class Memory {
  load(position: number, data: string): void {
    console.log(\`Memory: Loading at \${position}\`);
  }
}

class HardDrive {
  read(position: number, size: number): string {
    console.log(\`HardDrive: Reading \${size} bytes\`);
    return "data";
  }
}

// Facade - simplified unified interface for subsystems
class ComputerFacade {
  private cpu = new CPU();
  private memory = new Memory();
  private hardDrive = new HardDrive();

  startComputer(): void {
    // ← encapsulates all complex steps
    this.cpu.freeze();
    this.memory.load(0, "bootloader");
    this.hardDrive.read(0, 1024);
    console.log("Computer started!");
  }

  shutdownComputer(): void {
    console.log("Shutting down...");
  }
}

// Client uses simplified facade
const computer = new ComputerFacade();
computer.startComputer();  // ← start computer with one line`;

export const facadeCodeLines = [
  "// Complex subsystem classes",
  "class CPU {",
  "  freeze(): void { console.log('CPU: Freezing...'); }",
  "  jump(position: number): void { console.log(`CPU: Jumping to ${position}`); }",
  "}",
  "",
  "class Memory {",
  "  load(position: number, data: string): void {",
  "    console.log(`Memory: Loading at ${position}`);",
  "  }",
  "}",
  "",
  "class HardDrive {",
  "  read(position: number, size: number): string {",
  "    console.log(`HardDrive: Reading ${size} bytes`);",
  "    return 'data';",
  "  }",
  "}",
  "",
  "// Facade - simplified unified interface for subsystems",
  "class ComputerFacade {",
  "  private cpu = new CPU();",
  "  private memory = new Memory();",
  "  private hardDrive = new HardDrive();",
  "",
  "  startComputer(): void {",
  "    // ← encapsulates all complex steps",
  "    this.cpu.freeze();",
  "    this.memory.load(0, 'bootloader');",
  "    this.hardDrive.read(0, 1024);",
  "    console.log('Computer started!');",
  "  }",
  "",
  "  shutdownComputer(): void {",
  "    console.log('Shutting down...');",
  "  }",
  "}",
  "",
  "// Client uses simplified facade",
  "const computer = new ComputerFacade();",
  "computer.startComputer();  // ← start computer with one line",
];

const facadeDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "client",
      name: "Client",
      stereotype: "class",
      attributes: [],
      methods: [],
      position: { x: 50, y: 150 },
    },
    {
      id: "facade",
      name: "Facade",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "operation()", params: "", returnType: "void" }],
      position: { x: 250, y: 150 },
    },
    {
      id: "subsystemA",
      name: "SubsystemA",
      stereotype: "class",
      attributes: [],
      methods: [],
      position: { x: 450, y: 50 },
    },
    {
      id: "subsystemB",
      name: "SubsystemB",
      stereotype: "class",
      attributes: [],
      methods: [],
      position: { x: 450, y: 150 },
    },
    {
      id: "subsystemC",
      name: "SubsystemC",
      stereotype: "class",
      attributes: [],
      methods: [],
      position: { x: 450, y: 250 },
    },
  ],
  relationships: [
    { from: "facade", to: "subsystemA", type: "dependency", label: "uses" },
    { from: "facade", to: "subsystemB", type: "dependency", label: "uses" },
    { from: "facade", to: "subsystemC", type: "dependency", label: "uses" },
    { from: "client", to: "facade", type: "dependency", label: "uses" },
  ],
};

export const facadeContent = {
  id: "facade",
  slug: "facade",
  title: "",
  titleKey: "content.patterns.facade.title",
  category: "pattern" as const,
  subcategory: "structural",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.facade.desc",
  defaultInput: undefined,
  generator: facadeGenerator,
  code: facadeCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(n)",
  },
  tags: [],
  icon: "🎛️",
  diagram: facadeDiagram,
  codeExamples: {
    typescript: {
      code: `class CPU {
  freeze(): void { console.log("CPU: Freezing..."); }
  jump(position: number): void { console.log(\`CPU: Jumping to \${position}\`); }
}

class Memory {
  load(position: number, data: string): void {
    console.log(\`Memory: Loading at \${position}\`);
  }
}

class HardDrive {
  read(position: number, size: number): string {
    console.log(\`HardDrive: Reading \${size} bytes\`);
    return "data";
  }
}

class ComputerFacade {
  private cpu = new CPU();
  private memory = new Memory();
  private hardDrive = new HardDrive();

  startComputer(): void {
    this.cpu.freeze();
    this.memory.load(0, "bootloader");
    this.hardDrive.read(0, 1024);
    console.log("Computer started!");
  }
}

const computer = new ComputerFacade();
computer.startComputer();`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct CPU CPU;
typedef struct Memory Memory;
typedef struct HardDrive HardDrive;

struct CPU { void (*freeze)(CPU*); };
struct Memory { void (*load)(Memory*, int, const char*); };
struct HardDrive { const char* (*read)(HardDrive*, int, int); };

void cpu_freeze(CPU* c) { printf("CPU: Freezing...\\n"); }
void memory_load(Memory* m, int pos, const char* data) { printf("Memory: Loading\\n"); }
const char* harddrive_read(HardDrive* h, int pos, int size) { printf("HardDrive: Reading\\n"); return "data"; }

void start_computer(void) {
  CPU cpu = { cpu_freeze };
  Memory memory = { memory_load };
  HardDrive drive = { harddrive_read };

  cpu.freeze(&cpu);
  memory.load(&memory, 0, "bootloader");
  drive.read(&drive, 0, 1024);
  printf("Computer started!\\n");
}

int main(void) {
  start_computer();
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>

class CPU {
public:
  void freeze() { std::cout << "CPU: Freezing...\\n"; }
  void jump(long position) { std::cout << "CPU: Jumping\\n"; }
};

class Memory {
public:
  void load(long position, const std::string& data) {
    std::cout << "Memory: Loading\\n";
  }
};

class HardDrive {
public:
  std::string read(long lba, long size) {
    std::cout << "HardDrive: Reading\\n";
    return "data";
  }
};

class ComputerFacade {
  CPU cpu;
  Memory memory;
  HardDrive hardDrive;
public:
  void startComputer() {
    cpu.freeze();
    memory.load(0, "bootloader");
    hardDrive.read(0, 1024);
    std::cout << "Computer started!\\n";
  }
};

int main() {
  ComputerFacade computer;
  computer.startComputer();
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class CPU:
    def freeze(self):
        print("CPU: Freezing...")

    def jump(self, position):
        print(f"CPU: Jumping to {position}")

class Memory:
    def load(self, position, data):
        print(f"Memory: Loading at {position}")

class HardDrive:
    def read(self, position, size):
        print(f"HardDrive: Reading {size} bytes")
        return "data"

class ComputerFacade:
    def __init__(self):
        self.cpu = CPU()
        self.memory = Memory()
        self.hard_drive = HardDrive()

    def start_computer(self):
        self.cpu.freeze()
        self.memory.load(0, "bootloader")
        self.hard_drive.read(0, 1024)
        print("Computer started!")

computer = ComputerFacade()
computer.start_computer()`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `struct CPU;
struct Memory;
struct HardDrive;

impl CPU {
    fn freeze(&self) { println!("CPU: Freezing..."); }
    fn jump(&self, _pos: i64) { println!("CPU: Jumping"); }
}

impl Memory {
    fn load(&self, _pos: i64, _data: &str) { println!("Memory: Loading"); }
}

impl HardDrive {
    fn read(&self, _pos: i64, _size: i64) -> &'static str {
        println!("HardDrive: Reading");
        "data"
    }
}

struct ComputerFacade {
    cpu: CPU,
    memory: Memory,
    hard_drive: HardDrive,
}

impl ComputerFacade {
    fn start_computer(&self) {
        self.cpu.freeze();
        self.memory.load(0, "bootloader");
        self.hard_drive.read(0, 1024);
        println!("Computer started!");
    }
}

fn main() {
    let facade = ComputerFacade {
        cpu: CPU,
        memory: Memory,
        hard_drive: HardDrive,
    };
    facade.start_computer();
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type CPU struct{}
func (c CPU) Freeze() { fmt.Println("CPU: Freezing...") }
func (c CPU) Jump(pos int64) { fmt.Println("CPU: Jumping") }

type Memory struct{}
func (m Memory) Load(pos int64, data string) { fmt.Println("Memory: Loading") }

type HardDrive struct{}
func (h HardDrive) Read(pos int64, size int64) string {
    fmt.Println("HardDrive: Reading")
    return "data"
}

type ComputerFacade struct {
    cpu CPU
    memory Memory
    hardDrive HardDrive
}

func (c ComputerFacade) StartComputer() {
    c.cpu.Freeze()
    c.memory.Load(0, "bootloader")
    c.hardDrive.Read(0, 1024)
    fmt.Println("Computer started!")
}

func main() {
    computer := ComputerFacade{CPU{}, Memory{}, HardDrive{}}
    computer.StartComputer()
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public class CPU {
    public void freeze() { System.out.println("CPU: Freezing..."); }
    public void jump(long position) { System.out.println("CPU: Jumping"); }
}

public class Memory {
    public void load(long position, String data) {
        System.out.println("Memory: Loading");
    }
}

public class HardDrive {
    public String read(long lba, long size) {
        System.out.println("HardDrive: Reading");
        return "data";
    }
}

public class ComputerFacade {
    private CPU cpu = new CPU();
    private Memory memory = new Memory();
    private HardDrive hardDrive = new HardDrive();

    public void startComputer() {
        cpu.freeze();
        memory.load(0, "bootloader");
        hardDrive.read(0, 1024);
        System.out.println("Computer started!");
    }
}

public class Main {
    public static void main(String[] args) {
        ComputerFacade computer = new ComputerFacade();
        computer.startComputer();
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — anchored to systems the learner
  // can recognize from day-to-day engineering work.
  scenarios: [
    {
      id: "jdbc-jdbctemplate",
      i18nKey: "content.patterns.facade.scenarios.jdbc-jdbctemplate",
      domain: "database",
      icon: "🐘",
      reference: "JDBC, Spring JdbcTemplate, SQLAlchemy",
      codeSnippet: {
        language: "java",
        code: `// Spring JdbcTemplate hides Connection, Statement, ResultSet complexity
JdbcTemplate jdbc = new JdbcTemplate(dataSource);
List<User> users = jdbc.query(
  "SELECT id, name FROM users WHERE active = ?",
  new Object[]{true},
  (rs, rowNum) -> new User(rs.getLong("id"), rs.getString("name"))
);`,
      },
    },
    {
      id: "aws-sdk",
      i18nKey: "content.patterns.facade.scenarios.aws-sdk",
      domain: "network",
      icon: "🌐",
      reference: "AWS SDK, Google Cloud SDK, Azure SDK",
    },
    {
      id: "ffmpeg-cli",
      i18nKey: "content.patterns.facade.scenarios.ffmpeg-cli",
      domain: "system",
      icon: "🎬",
      reference: "FFmpeg, ImageMagick, Graphviz",
    },
  ] satisfies Scenario[],
};
