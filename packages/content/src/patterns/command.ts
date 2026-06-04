import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Command Pattern — Frame Generator
 * remote control scenario - Command interface, ConcreteCommand, Invoker
 * encapsulate requests as objects
 */
export function* commandGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const invokerPos = { x: 100, y: 150 };
  const commandPos = { x: 300, y: 150 };
  const receiverPos = { x: 500, y: 150 };
  const historyPos = { x: 300, y: 320 };

  // Objects
  const invoker: PatternObject = {
    id: "invoker",
    name: "RemoteControl",
    type: "Invoker",
    state: { command: "None" },
    position: invokerPos,
    status: "idle",
  };

  const lightOnCommand: PatternObject = {
    id: "lightOnCmd",
    name: "LightOnCommand",
    type: "ConcreteCommand",
    state: { action: "Turn Light ON" },
    position: commandPos,
    status: "idle",
  };

  const lightReceiver: PatternObject = {
    id: "light",
    name: "Light",
    type: "Receiver",
    state: { status: "OFF" },
    position: receiverPos,
    status: "idle",
  };

  const history: PatternObject = {
    id: "history",
    name: "CommandHistory",
    type: "History",
    state: { commands: [] },
    position: historyPos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker },
        { ...lightOnCommand },
        { ...lightReceiver },
        { ...history },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Client creates command
  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "idle" },
        { ...lightOnCommand, status: "active" },
        { ...lightReceiver, status: "idle" },
        { ...history, status: "idle" },
      ],
      messages: [
        { from: "invoker", to: "lightOnCmd", method: "new LightOnCommand(light)", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.0" },
    highlightLine: 5,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "idle" },
        { ...lightOnCommand, status: "idle" },
        { ...lightReceiver, status: "idle" },
        { ...history, status: "idle" },
      ],
      messages: [
        { from: "invoker", to: "lightOnCmd", method: "new LightOnCommand(light)", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.1" },
    highlightLine: 5,
  };

  // Step 3: Invoker stores command
  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "active", state: { command: "LightOnCommand" } },
        { ...lightOnCommand, status: "idle" },
        { ...lightReceiver, status: "idle" },
        { ...history, status: "idle" },
      ],
      messages: [
        { from: "invoker", to: "lightOnCmd", method: "setCommand(cmd)", args: ["LightOnCommand"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.2" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "idle", state: { command: "LightOnCommand" } },
        { ...lightOnCommand, status: "idle" },
        { ...lightReceiver, status: "idle" },
        { ...history, status: "idle" },
      ],
      messages: [
        { from: "invoker", to: "lightOnCmd", method: "setCommand(cmd)", args: ["LightOnCommand"], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.3" },
    highlightLine: 10,
  };

  // Step 5: Press button - execute command
  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "active", state: { command: "LightOnCommand" } },
        { ...lightOnCommand, status: "active" },
        { ...lightReceiver, status: "idle" },
        { ...history, status: "idle" },
      ],
      messages: [
        { from: "invoker", to: "lightOnCmd", method: "buttonPressed()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.4" },
    highlightLine: 12,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "active" },
        { ...lightOnCommand, status: "active" },
        { ...lightReceiver, status: "active" },
        { ...history, status: "idle" },
      ],
      messages: [
        { from: "lightOnCmd", to: "light", method: "execute()", args: [], status: "active" },
      ],
    },
    description: "LightOnCommand.execute() → Light.turnOn()",
    highlightLine: 15,
  };

  // Step 7: Light turns on
  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "idle" },
        { ...lightOnCommand, status: "idle" },
        { ...lightReceiver, status: "highlighted", state: { status: "ON" } },
        { ...history, status: "idle" },
      ],
      messages: [
        { from: "lightOnCmd", to: "light", method: "execute()", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.5" },
    highlightLine: 16,
  };

  // Step 8: Command saved to history
  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "idle" },
        { ...lightOnCommand, status: "idle" },
        { ...lightReceiver, status: "idle", state: { status: "ON" } },
        { ...history, status: "active", state: { commands: ["LightOnCommand"] } },
      ],
      messages: [
        { from: "lightOnCmd", to: "history", method: "save(command)", args: ["LightOnCommand"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.6" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "idle" },
        { ...lightOnCommand, status: "idle" },
        { ...lightReceiver, status: "idle", state: { status: "ON" } },
        { ...history, status: "idle", state: { commands: ["LightOnCommand"] } },
      ],
      messages: [
        { from: "lightOnCmd", to: "history", method: "save(command)", args: ["LightOnCommand"], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.7" },
    highlightLine: 20,
  };

  // Step 10: Undo
  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "active" },
        { ...lightOnCommand, status: "active" },
        { ...lightReceiver, status: "idle", state: { status: "ON" } },
        { ...history, status: "idle", state: { commands: ["LightOnCommand"] } },
      ],
      messages: [
        { from: "invoker", to: "history", method: "undo()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.8" },
    highlightLine: 21,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "idle" },
        { ...lightOnCommand, status: "active" },
        { ...lightReceiver, status: "active" },
        { ...history, status: "idle" },
      ],
      messages: [
        { from: "lightOnCmd", to: "light", method: "undo()", args: [], status: "active" },
      ],
    },
    description: "LightOnCommand.undo() → Light.turnOff()",
    highlightLine: 22,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...invoker, status: "idle" },
        { ...lightOnCommand, status: "idle" },
        { ...lightReceiver, status: "highlighted", state: { status: "OFF" } },
        { ...history, status: "idle", state: { commands: [] } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.command.frames.9" },
    highlightLine: 22,
  };
}

/** Code snippet */
export const commandCode = `// Command interface
interface Command {
  execute(): void;        // ← execute command
  undo(): void;           // ← undo command
}

// Receiver
class Light {
  turnOn(): void { console.log("Light ON"); }
  turnOff(): void { console.log("Light OFF"); }
}

// ConcreteCommand
class LightOnCommand implements Command {
  constructor(private light: Light) {}
  
  execute(): void {
    this.light.turnOn();   // ← invoke receiver
  }
  
  undo(): void {
    this.light.turnOff();  // ← undo operation
  }
}

// Invoker
class RemoteControl {
  private command: Command;
  
  setCommand(command: Command): void {
    this.command = command;
  }
  
  buttonPressed(): void {
    this.command.execute();  // ← invoke command
  }
  
  undoPressed(): void {
    this.command.undo();     // ← undo command
  }
}`;

export const commandCodeLines = [
  "// Command interface",
  "interface Command {",
  "  execute(): void;        // ← execute command",
  "  undo(): void;           // ← undo command",
  "}",
  "",
  "// Receiver",
  "class Light {",
  "  turnOn(): void { console.log('Light ON'); }",
  "  turnOff(): void { console.log('Light OFF'); }",
  "}",
  "",
  "// ConcreteCommand",
  "class LightOnCommand implements Command {",
  "  constructor(private light: Light) {}",
  "",
  "  execute(): void {",
  "    this.light.turnOn();   // ← invoke receiver",
  "  }",
  "",
  "  undo(): void {",
  "    this.light.turnOff();  // ← undo operation",
  "  }",
  "}",
  "",
  "// Invoker",
  "class RemoteControl {",
  "  private command: Command;",
  "",
  "  setCommand(command: Command): void {",
  "    this.command = command;",
  "  }",
  "",
  "  buttonPressed(): void {",
  "    this.command.execute();  // ← invoke command",
  "  }",
  "",
  "  undoPressed(): void {",
  "    this.command.undo();     // ← undo command",
  "  }",
  "}",
];

const commandDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Command",
      name: "Command",
      stereotype: "interface",
      attributes: [],
      methods: [
        { visibility: "+", name: "execute", params: "", returnType: "void" },
      ],
      position: { x: 400, y: 50 },
    },
    {
      id: "ConcreteCommand",
      name: "ConcreteCommand",
      attributes: [
        { visibility: "-", name: "receiver", type: "Receiver" },
      ],
      methods: [
        { visibility: "+", name: "execute", params: "", returnType: "void" },
      ],
      position: { x: 150, y: 200 },
    },
    {
      id: "Receiver",
      name: "Receiver",
      attributes: [],
      methods: [
        { visibility: "+", name: "action", params: "", returnType: "void" },
      ],
      position: { x: 650, y: 200 },
    },
    {
      id: "Invoker",
      name: "Invoker",
      attributes: [
        { visibility: "-", name: "command", type: "Command" },
      ],
      methods: [
        { visibility: "+", name: "setCommand", params: "command: Command", returnType: "void" },
        { visibility: "+", name: "executeCommand", params: "", returnType: "void" },
      ],
      position: { x: 150, y: 400 },
    },
    {
      id: "Client",
      name: "Client",
      attributes: [],
      methods: [],
      position: { x: 650, y: 400 },
    },
  ],
  relationships: [
    { from: "ConcreteCommand", to: "Command", type: "implements" },
    { from: "ConcreteCommand", to: "Receiver", type: "association" },
    { from: "Invoker", to: "Command", type: "association", label: "has" },
    { from: "Client", to: "Invoker", type: "dependency", label: "configures" },
    { from: "Client", to: "ConcreteCommand", type: "dependency", label: "creates" },
  ],
};

export const commandContent = {
  id: "command",
  slug: "command",
  title: "",
  titleKey: "content.patterns.command.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.command.desc",
  defaultInput: undefined,
  generator: commandGenerator,
  code: commandCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(n)",
  },
  tags: [],
  diagram: commandDiagram,
  icon: "🎮",
  codeExamples: {
    typescript: {
      code: `interface Command {
  execute(): void;
  undo(): void;
}

class Light {
  turnOn(): void { console.log("Light ON"); }
  turnOff(): void { console.log("Light OFF"); }
}

class LightOnCommand implements Command {
  constructor(private light: Light) {}
  execute(): void { this.light.turnOn(); }
  undo(): void { this.light.turnOff(); }
}

class RemoteControl {
  private command: Command;
  setCommand(command: Command): void { this.command = command; }
  buttonPressed(): void { this.command.execute(); }
  undoPressed(): void { this.command.undo(); }
}

const light = new Light();
const cmd = new LightOnCommand(light);
const remote = new RemoteControl();
remote.setCommand(cmd);
remote.buttonPressed();
remote.undoPressed();`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct Command Command;
typedef struct Light Light;

struct Command {
  void (*execute)(Command*);
  void (*undo)(Command*);
};

struct Light {
  void (*turn_on)(Light*);
  void (*turn_off)(Light*);
};

void light_on(Light* l) { printf("Light ON\\n"); }
void light_off(Light* l) { printf("Light OFF\\n"); }

Command create_command(Light* l) {
  Command cmd = { NULL, NULL };
  return cmd;
}

int main(void) {
  Light light = { light_on, light_off };
  light.turn_on(&light);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>

class Command {
public:
  virtual void execute() = 0;
  virtual void undo() = 0;
  virtual ~Command() = default;
};

class Light {
public:
  void turnOn() { std::cout << "Light ON\\n"; }
  void turnOff() { std::cout << "Light OFF\\n"; }
};

class LightOnCommand : public Command {
  Light* light;
public:
  LightOnCommand(Light* l) : light(l) {}
  void execute() override { light->turnOn(); }
  void undo() override { light->turnOff(); }
};

class RemoteControl {
  Command* command;
public:
  void setCommand(Command* cmd) { command = cmd; }
  void buttonPressed() { command->execute(); }
  void undoPressed() { command->undo(); }
};

int main() {
  Light light;
  LightOnCommand cmd(&light);
  RemoteControl remote;
  remote.setCommand(&cmd);
  remote.buttonPressed();
  remote.undoPressed();
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class Command(ABC):
    @abstractmethod
    def execute(self):
        pass

    @abstractmethod
    def undo(self):
        pass

class Light:
    def turn_on(self):
        print("Light ON")

    def turn_off(self):
        print("Light OFF")

class LightOnCommand(Command):
    def __init__(self, light):
        self.light = light

    def execute(self):
        self.light.turn_on()

    def undo(self):
        self.light.turn_off()

class RemoteControl:
    def __init__(self):
        self.command = None

    def set_command(self, command):
        self.command = command

    def button_pressed(self):
        self.command.execute()

    def undo_pressed(self):
        self.command.undo()

light = Light()
cmd = LightOnCommand(light)
remote = RemoteControl()
remote.set_command(cmd)
remote.button_pressed()
remote.undo_pressed()`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Command {
    fn execute(&self);
    fn undo(&self);
}

struct Light;

impl Light {
    fn new() -> Light { Light }
    fn turn_on(&self) { println!("Light ON"); }
    fn turn_off(&self) { println!("Light OFF"); }
}

struct LightOnCommand<'a> {
    light: &'a Light,
}

impl<'a> Command for LightOnCommand<'a> {
    fn execute(&self) { self.light.turn_on(); }
    fn undo(&self) { self.light.turn_off(); }
}

struct RemoteControl<'a> {
    command: Option<&'a dyn Command>,
}

fn main() {
    let light = Light::new();
    let cmd = LightOnCommand { light: &light };
    cmd.execute();
    cmd.undo();
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Command interface {
    Execute()
    Undo()
}

type Light struct{}

func (l Light) TurnOn()  { fmt.Println("Light ON") }
func (l Light) TurnOff() { fmt.Println("Light OFF") }

type LightOnCommand struct {
    light *Light
}

func (c LightOnCommand) Execute() { c.light.TurnOn() }
func (c LightOnCommand) Undo()   { c.light.TurnOff() }

type RemoteControl struct {
    command Command
}

func (r *RemoteControl) SetCommand(cmd Command) { r.command = cmd }
func (r *RemoteControl) ButtonPressed()         { r.command.Execute() }

func main() {
    light := &Light{}
    cmd := LightOnCommand{light: light}
    remote := &RemoteControl{command: cmd}
    remote.ButtonPressed()
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface Command {
    void execute();
    void undo();
}

public class Light {
    public void turnOn() { System.out.println("Light ON"); }
    public void turnOff() { System.out.println("Light OFF"); }
}

public class LightOnCommand implements Command {
    private Light light;
    public LightOnCommand(Light light) { this.light = light; }
    public void execute() { light.turnOn(); }
    public void undo() { light.turnOff(); }
}

public class RemoteControl {
    private Command command;
    public void setCommand(Command cmd) { this.command = cmd; }
    public void buttonPressed() { command.execute(); }
    public void undoPressed() { command.undo(); }
}

public class Main {
    public static void main(String[] args) {
        Light light = new Light();
        Command cmd = new LightOnCommand(light);
        RemoteControl remote = new RemoteControl();
        remote.setCommand(cmd);
        remote.buttonPressed();
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — concrete production systems
  // that use the Command pattern to decouple request invocation
  // from execution.
  scenarios: [
    {
      id: "gui-undo-redo",
      i18nKey: "content.patterns.command.scenarios.gui-undo-redo",
      domain: "ui-framework",
      icon: "🎮",
      reference: "VSCode, Photoshop, Redux DevTools",
    },
    {
      id: "db-transaction",
      i18nKey: "content.patterns.command.scenarios.db-transaction",
      domain: "database",
      icon: "🗄️",
      reference: "PostgreSQL, MongoDB, SQLite",
    },
    {
      id: "job-queue",
      i18nKey: "content.patterns.command.scenarios.job-queue",
      domain: "business",
      icon: "🏭",
      reference: "Sidekiq, Celery, AWS SQS",
      codeSnippet: {
        language: "python",
        code: `# Celery — Command pattern for async task execution
from celery import Celery

app = Celery('tasks', broker='redis://localhost')

@app.task
def send_email(to: str, subject: str):
    mailer.send(to, subject)  # execute command

# Enqueue command object for worker consumption
send_email.delay("user@example.com", "Welcome!")`,
      },
    },
  ] satisfies Scenario[],
};
