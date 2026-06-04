import type { Frame, InteractionState, Scenario, UMLClassDiagram } from "@codeprism/core";

export function* mementoGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  const originator = { id: 'originator', name: 'Game', type: 'Originator', state: { level: 1, health: 100, score: 0 }, position: { x: 300, y: 80 }, status: 'idle' as const };
  const caretaker = { id: 'caretaker', name: 'SaveManager', type: 'Caretaker', state: { saves: [] }, position: { x: 100, y: 200 }, status: 'idle' as const };
  const memento = { id: 'memento', name: 'GameState #1', type: 'Memento', state: { level: 1, health: 100, score: 0 }, position: { x: 300, y: 200 }, status: 'idle' as const };

  yield { step: 1, state: { objects: [originator, caretaker, memento], messages: [] }, description: 'Game in initial state, SaveManager ready to save', highlightLine: 1 };
  yield { step: 2, state: { objects: [originator, caretaker, memento], messages: [{ from: 'caretaker', to: 'originator', method: 'createMemento()', args: [], status: 'pending' as const }] }, description: 'Caretaker requests a memento from the game', highlightLine: 3 };
  yield { step: 3, state: { objects: [{ ...originator, status: 'active' }, caretaker, memento], messages: [{ from: 'caretaker', to: 'originator', method: 'createMemento()', args: [], status: 'active' as const }] }, description: 'Originator creates a memento with current state', highlightLine: 4 };
  yield { step: 4, state: { objects: [originator, caretaker, { ...memento, status: 'active' }], messages: [{ from: 'originator', to: 'memento', method: 'saveState()', args: [{ level: 1, health: 100, score: 0 }], status: 'pending' as const }] }, description: 'Memento stores the game state snapshot', highlightLine: 5 };
  yield { step: 5, state: { objects: [originator, { ...caretaker, state: { saves: ['GameState #1'] } }, memento], messages: [{ from: 'originator', to: 'memento', method: 'saveState()', args: [{ level: 1, health: 100, score: 0 }], status: 'complete' as const }] }, description: 'Caretaker saves the memento', highlightLine: 6 };
  yield { step: 6, state: { objects: [{ ...originator, state: { level: 1, health: 60, score: 500 }, status: 'highlighted' }, caretaker, memento], messages: [] }, description: 'Game continues - player takes damage, scores points', highlightLine: 7 };
  yield { step: 7, state: { objects: [originator, caretaker, memento], messages: [{ from: 'caretaker', to: 'originator', method: 'restore(memento)', args: ['GameState #1'], status: 'pending' as const }] }, description: 'Player dies - caretaker initiates restore', highlightLine: 10 };
  yield { step: 8, state: { objects: [{ ...originator, state: { level: 1, health: 100, score: 0 }, status: 'active' }, caretaker, memento], messages: [{ from: 'originator', to: 'memento', method: 'restoreState()', args: [{ level: 1, health: 100, score: 0 }], status: 'pending' as const }] }, description: 'Game restored to saved state - back to full health!', highlightLine: 11 };
}

export const mementoCode = `interface Memento {
  getState(): object;
  getDate(): string;
}

class GameMemento implements Memento {
  constructor(
    private state: { level: number; health: number; score: number },
    private date: string
  ) {}

  getState(): object {
    return this.state;
  }

  getDate(): string {
    return this.date;
  }
}

class Game implements Originator {
  constructor(
    public level: number = 1,
    public health: number = 100,
    public score: number = 0
  ) {}

  createMemento(): Memento {
    return new GameMemento(
      { level: this.level, health: this.health, score: this.score },
      new Date().toISOString()
    );
  }

  restore(memento: Memento): void {
    const state = memento.getState() as any;
    this.level = state.level;
    this.health = state.health;
    this.score = state.score;
  }

  play(): void {
    this.health -= 20;
    this.score += 100;
  }
}

class SaveManager implements Caretaker {
  private saves: Memento[] = [];

  save(memento: Memento): void {
    this.saves.push(memento);
  }

  restore(index: number): Memento | null {
    return this.saves[index] || null;
  }
}

// Usage
const game = new Game();
const saveManager = new SaveManager();

saveManager.save(game.createMemento());
game.play();
game.play();
game.restore(saveManager.restore(0)!);`;

export const mementoCodeLines = [
  "interface Memento {",
  "  getState(): object;",
  "  getDate(): string;",
  "}",
  "",
  "class GameMemento implements Memento {",
  "  constructor(",
  "    private state: { level: number; health: number; score: number },",
  "    private date: string",
  "  ) {}",
  "",
  "  getState(): object {",
  "    return this.state;",
  "  }",
  "",
  "  getDate(): string {",
  "    return this.date;",
  "  }",
  "}",
  "",
  "class Game implements Originator {",
  "  constructor(",
  "    public level: number = 1,",
  "    public health: number = 100,",
  "    public score: number = 0",
  "  ) {}",
  "",
  "  createMemento(): Memento {",
  "    return new GameMemento(",
  "      { level: this.level, health: this.health, score: this.score },",
  "      new Date().toISOString()",
  "    );",
  "  }",
  "",
  "  restore(memento: Memento): void {",
  "    const state = memento.getState() as any;",
  "    this.level = state.level;",
  "    this.health = state.health;",
  "    this.score = state.score;",
  "  }",
  "",
  "  play(): void {",
  "    this.health -= 20;",
  "    this.score += 100;",
  "  }",
  "}",
  "",
  "class SaveManager implements Caretaker {",
  "  private saves: Memento[] = [];",
  "",
  "  save(memento: Memento): void {",
  "    this.saves.push(memento);",
  "  }",
  "",
  "  restore(index: number): Memento | null {",
  "    return this.saves[index] || null;",
  "  }",
  "}",
  "",
  "// Usage",
  "const game = new Game();",
  "const saveManager = new SaveManager();",
  "",
  "saveManager.save(game.createMemento());",
  "game.play();",
  "game.play();",
  "game.restore(saveManager.restore(0)!);",
];

const mementoDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Originator",
      name: "Originator",
      attributes: [
        { visibility: "-", name: "state", type: "string" },
      ],
      methods: [
        { visibility: "+", name: "createMemento", params: "", returnType: "Memento" },
        { visibility: "+", name: "restore", params: "m: Memento", returnType: "void" },
      ],
      position: { x: 150, y: 50 },
    },
    {
      id: "Memento",
      name: "Memento",
      attributes: [
        { visibility: "-", name: "state", type: "string" },
      ],
      methods: [
        { visibility: "+", name: "getState", params: "", returnType: "string" },
      ],
      position: { x: 550, y: 50 },
    },
    {
      id: "Caretaker",
      name: "Caretaker",
      attributes: [
        { visibility: "-", name: "mementos", type: "Memento[]" },
      ],
      methods: [
        { visibility: "+", name: "addMemento", params: "", returnType: "void" },
        { visibility: "+", name: "getMemento", params: "", returnType: "Memento" },
      ],
      position: { x: 350, y: 250 },
    },
  ],
  relationships: [
    { from: "Caretaker", to: "Memento", type: "aggregation", label: "stores" },
    { from: "Originator", to: "Memento", type: "dependency", label: "creates/restores" },
  ],
};

export const mementoContent = {
  id: "memento",
  slug: "memento",
  title: "",
  titleKey: "content.patterns.memento.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.memento.desc",
  defaultInput: undefined,
  code: mementoCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  diagram: mementoDiagram,
  icon: "💾",
  codeExamples: {
    typescript: {
      code: `interface Memento {
  getState(): object;
}

class GameMemento implements Memento {
  constructor(private state: { level: number; health: number; score: number }) {}
  getState(): object { return this.state; }
}

class Game {
  constructor(
    public level: number = 1,
    public health: number = 100,
    public score: number = 0
  ) {}

  createMemento(): Memento {
    return new GameMemento({ level: this.level, health: this.health, score: this.score });
  }

  restore(memento: Memento): void {
    const s = memento.getState() as any;
    this.level = s.level;
    this.health = s.health;
    this.score = s.score;
  }

  play(): void { this.health -= 20; this.score += 100; }
}

const game = new Game();
const saves: Memento[] = [];
saves.push(game.createMemento());
game.play();
game.play();
console.log("After play:", game.health);  // 60
game.restore(saves[0]);
console.log("After restore:", game.health);  // 100`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>
#include <string.h>

typedef struct {
  int level;
  int health;
  int score;
} GameState;

typedef struct {
  GameState state;
} Memento;

Memento create_memento(GameState* s) {
  return (Memento){*s};
}

void restore(GameState* target, Memento* m) {
  *target = m->state;
}

int main(void) {
  GameState game = {1, 100, 0};
  Memento saves[10];
  saves[0] = create_memento(&game);
  game.health -= 20;
  game.score += 100;
  printf("After play: %d\\n", game.health);
  restore(&game, &saves[0]);
  printf("After restore: %d\\n", game.health);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

struct Memento {
  virtual ~Memento() = default;
  virtual int getHealth() = 0;
};

class GameMemento : public Memento {
  int level, health, score;
public:
  GameMemento(int l, int h, int s) : level(l), health(h), score(s) {}
  int getHealth() override { return health; }
};

class Game {
  int level, health, score;
public:
  Game(int l=1, int h=100, int s=0) : level(l), health(h), score(s) {}
  std::unique_ptr<Memento> createMemento() {
    return std::make_unique<GameMemento>(level, health, score);
  }
  void restore(Memento* m) { health = m->getHealth(); }
  void play() { health -= 20; score += 100; }
  int getHealth() const { return health; }
};

int main() {
  Game game;
  auto saves = game.createMemento();
  game.play();
  std::cout << "After play: " << game.getHealth() << std::endl;
  game.restore(saves.get());
  std::cout << "After restore: " << game.getHealth() << std::endl;
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `import copy

class Memento:
    def __init__(self, state):
        self.state = copy.deepcopy(state)

    def get_state(self):
        return copy.deepcopy(self.state)

class Game:
    def __init__(self, level=1, health=100, score=0):
        self.level = level
        self.health = health
        self.score = score

    def create_memento(self):
        return Memento({"level": self.level, "health": self.health, "score": self.score})

    def restore(self, memento):
        s = memento.get_state()
        self.health = s["health"]

    def play(self):
        self.health -= 20
        self.score += 100

game = Game()
saves = []
saves.append(game.create_memento())
game.play()
print("After play:", game.health)
game.restore(saves[0])
print("After restore:", game.health)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `use std::collections::VecDeque;

#[derive(Clone)]
struct GameState {
    level: i32,
    health: i32,
    score: i32,
}

struct Game {
    level: i32,
    health: i32,
    score: i32,
}

impl Game {
    fn new() -> Game { Game { level: 1, health: 100, score: 0 } }
    fn create_memento(&self) -> GameState {
        GameState { level: self.level, health: self.health, score: self.score }
    }
    fn restore(&mut self, m: &GameState) {
        self.health = m.health;
    }
    fn play(&mut self) { self.health -= 20; self.score += 100; }
}

fn main() {
    let mut game = Game::new();
    let mut saves = VecDeque::new();
    saves.push_back(game.create_memento());
    game.play();
    println!("After play: {}", game.health);
    game.restore(&saves[0]);
    println!("After restore: {}", game.health);
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type GameState struct {
    Level  int
    Health int
    Score  int
}

type Memento struct {
    state GameState
}

type Game struct {
    level, health, score int
}

func (g *Game) CreateMemento() Memento {
    return Memento{GameState{g.level, g.health, g.score}}
}

func (g *Game) Restore(m Memento) {
    g.health = m.state.Health
}

func (g *Game) Play() {
    g.health -= 20
    g.score += 100
}

func main() {
    game := Game{level: 1, health: 100, score: 0}
    saves := []Memento{game.CreateMemento()}
    game.Play()
    fmt.Println("After play:", game.health)
    game.Restore(saves[0])
    fmt.Println("After restore:", game.health)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public class Main {
    interface Memento { Object getState(); }

    static class GameMemento implements Memento {
        private final int level, health, score;
        GameMemento(int l, int h, int s) { level=l; health=h; score=s; }
        public Object getState() { return new int[]{level, health, score}; }
    }

    public static class Game {
        public int level = 1, health = 100, score = 0;
        public Memento createMemento() {
            return new GameMemento(level, health, score);
        }
        public void restore(Memento m) {
            int[] s = (int[]) m.getState();
            health = s[1];
        }
        public void play() { health -= 20; score += 100; }
    }

    public static void main(String[] args) {
        Game game = new Game();
        java.util.List<Memento> saves = new java.util.ArrayList<>();
        saves.add(game.createMemento());
        game.play();
        System.out.println("After play: " + game.health);
        game.restore(saves.get(0));
        System.out.println("After restore: " + game.health);
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — concrete production systems
  // that use the Memento pattern to capture and restore state.
  scenarios: [
    {
      id: "editor-undo",
      i18nKey: "content.patterns.memento.scenarios.editor-undo",
      domain: "devtools",
      icon: "🔧",
      reference: "VSCode, Vim, JetBrains IDEs",
    },
    {
      id: "db-rollback",
      i18nKey: "content.patterns.memento.scenarios.db-rollback",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL, MySQL, MongoDB",
      codeSnippet: {
        language: "sql",
        code: `-- PostgreSQL transaction — memento via savepoint
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
SAVEPOINT after_debit;      -- save memento
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
ROLLBACK TO after_debit;    -- restore memento
COMMIT;`,
      },
    },
    {
      id: "time-travel-debug",
      i18nKey: "content.patterns.memento.scenarios.time-travel-debug",
      domain: "ui-framework",
      icon: "🚀",
      reference: "Redux DevTools, React DevTools, Replay.io",
    },
  ] satisfies Scenario[],
};
