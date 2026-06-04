import type { Frame, InteractionState, Scenario, UMLClassDiagram } from "@codeprism/core";

export function* mediatorGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  const chatRoom = { id: 'chatroom', name: 'ChatRoom', type: 'Mediator', state: { users: [] }, position: { x: 300, y: 180 }, status: 'idle' as const };
  const user1 = { id: 'user1', name: 'Alice', type: 'Colleague', state: { message: '' }, position: { x: 100, y: 80 }, status: 'idle' as const };
  const user2 = { id: 'user2', name: 'Bob', type: 'Colleague', state: { message: '' }, position: { x: 500, y: 80 }, status: 'idle' as const };
  const user3 = { id: 'user3', name: 'Charlie', type: 'Colleague', state: { message: '' }, position: { x: 100, y: 280 }, status: 'idle' as const };
  const user4 = { id: 'user4', name: 'Diana', type: 'Colleague', state: { message: '' }, position: { x: 500, y: 280 }, status: 'idle' as const };

  yield { step: 1, state: { objects: [chatRoom, user1, user2, user3, user4], messages: [] }, description: 'Chat room mediator with 4 users initialized', highlightLine: 1 };
  yield { step: 2, state: { objects: [chatRoom, user1, user2, user3, user4], messages: [{ from: 'user1', to: 'chatroom', method: 'register(user)', args: ['Alice'], status: 'pending' as const }] }, description: 'Users register with the chat room', highlightLine: 3 };
  yield { step: 3, state: { objects: [{ ...chatRoom, state: { users: ['Alice', 'Bob', 'Charlie', 'Diana'] }, status: 'active' }, user1, user2, user3, user4], messages: [{ from: 'user1', to: 'chatroom', method: 'register(user)', args: ['Alice'], status: 'complete' as const }] }, description: 'All users registered, chat room is the central hub', highlightLine: 4 };
  yield { step: 4, state: { objects: [chatRoom, user1, user2, user3, user4], messages: [{ from: 'user1', to: 'chatroom', method: 'send(message)', args: ['Hello everyone!'], status: 'pending' as const }] }, description: 'Alice sends a message to the chat room', highlightLine: 6 };
  yield { step: 5, state: { objects: [chatRoom, { ...user1, status: 'active' }, user2, user3, user4], messages: [{ from: 'user1', to: 'chatroom', method: 'send(message)', args: ['Hello everyone!'], status: 'active' as const }] }, description: 'Message received by mediator', highlightLine: 7 };
  yield { step: 6, state: { objects: [chatRoom, user1, user2, user3, user4], messages: [{ from: 'chatroom', to: 'user2', method: 'receive(msg)', args: ['Hello everyone!'], status: 'pending' as const }, { from: 'chatroom', to: 'user3', method: 'receive(msg)', args: ['Hello everyone!'], status: 'pending' as const }, { from: 'chatroom', to: 'user4', method: 'receive(msg)', args: ['Hello everyone!'], status: 'pending' as const }] }, description: 'ChatRoom broadcasts to all other users (Bob, Charlie, Diana)', highlightLine: 8 };
  yield { step: 7, state: { objects: [chatRoom, user1, { ...user2, status: 'active' }, { ...user3, status: 'active' }, { ...user4, status: 'active' }], messages: [{ from: 'chatroom', to: 'user2', method: 'receive(msg)', args: ['Hello everyone!'], status: 'complete' as const }, { from: 'chatroom', to: 'user3', method: 'receive(msg)', args: ['Hello everyone!'], status: 'complete' as const }, { from: 'chatroom', to: 'user4', method: 'receive(msg)', args: ['Hello everyone!'], status: 'complete' as const }] }, description: 'All users receive the broadcast message', highlightLine: 9 };
}

export const mediatorCode = `interface Mediator {
  notify(sender: Colleague, event: string): void;
}

interface Colleague {
  setMediator(mediator: Mediator): void;
  receive(message: string): void;
}

class ChatRoom implements Mediator {
  private colleagues: Colleague[] = [];

  register(colleague: Colleague): void {
    this.colleagues.push(colleague);
    colleague.setMediator(this);
  }

  notify(sender: Colleague, event: string): void {
    this.colleagues
      .filter(c => c !== sender)
      .forEach(c => c.receive(event));
  }
}

class ChatUser implements Colleague {
  private mediator!: Mediator;
  constructor(private name: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(message: string): void {
    console.log(\`\${this.name} sends: \${message}\`);
    this.mediator.notify(this, message);
  }

  receive(message: string): void {
    console.log(\`\${this.name} receives: \${message}\`);
  }
}

// Usage
const chatRoom = new ChatRoom();
const alice = new ChatUser('Alice');
const bob = new ChatUser('Bob');

chatRoom.register(alice);
chatRoom.register(bob);

alice.send('Hello everyone!');`;

export const mediatorCodeLines = [
  "interface Mediator {",
  "  notify(sender: Colleague, event: string): void;",
  "}",
  "",
  "interface Colleague {",
  "  setMediator(mediator: Mediator): void;",
  "  receive(message: string): void;",
  "}",
  "",
  "class ChatRoom implements Mediator {",
  "  private colleagues: Colleague[] = [];",
  "",
  "  register(colleague: Colleague): void {",
  "    this.colleagues.push(colleague);",
  "    colleague.setMediator(this);",
  "  }",
  "",
  "  notify(sender: Colleague, event: string): void {",
  "    this.colleagues",
  "      .filter(c => c !== sender)",
  "      .forEach(c => c.receive(event));",
  "  }",
  "}",
  "",
  "class ChatUser implements Colleague {",
  "  private mediator!: Mediator;",
  "  constructor(private name: string) {}",
  "",
  "  setMediator(mediator: Mediator): void {",
  "    this.mediator = mediator;",
  "  }",
  "",
  "  send(message: string): void {",
  "    console.log(`${this.name} sends: ${message}`);",
  "    this.mediator.notify(this, message);",
  "  }",
  "",
  "  receive(message: string): void {",
  "    console.log(`${this.name} receives: ${message}`);",
  "  }",
  "}",
  "",
  "// Usage",
  "const chatRoom = new ChatRoom();",
  "const alice = new ChatUser('Alice');",
  "const bob = new ChatUser('Bob');",
  "",
  "chatRoom.register(alice);",
  "chatRoom.register(bob);",
  "",
  "alice.send('Hello everyone!');",
];

const mediatorDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Mediator",
      name: "Mediator",
      stereotype: "interface",
      attributes: [],
      methods: [
        { visibility: "+", name: "notify", params: "sender: Colleague, event: string", returnType: "void" },
      ],
      position: { x: 400, y: 50 },
    },
    {
      id: "ConcreteMediator",
      name: "ConcreteMediator",
      attributes: [],
      methods: [
        { visibility: "+", name: "notify", params: "sender: Colleague, event: string", returnType: "void" },
      ],
      position: { x: 400, y: 200 },
    },
    {
      id: "Colleague",
      name: "Colleague",
      stereotype: "interface",
      attributes: [],
      methods: [],
      position: { x: 150, y: 200 },
    },
    {
      id: "ConcreteColleagueA",
      name: "ConcreteColleagueA",
      attributes: [],
      methods: [],
      position: { x: 150, y: 400 },
    },
    {
      id: "ConcreteColleagueB",
      name: "ConcreteColleagueB",
      attributes: [],
      methods: [],
      position: { x: 650, y: 400 },
    },
  ],
  relationships: [
    { from: "ConcreteMediator", to: "Mediator", type: "implements" },
    { from: "ConcreteColleagueA", to: "Colleague", type: "implements" },
    { from: "ConcreteColleagueB", to: "Colleague", type: "implements" },
    { from: "ConcreteMediator", to: "Colleague", type: "association", label: "mediates" },
    { from: "Colleague", to: "Mediator", type: "association", label: "has" },
  ],
};

export const mediatorContent = {
  id: "mediator",
  slug: "mediator",
  title: "",
  titleKey: "content.patterns.mediator.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.mediator.desc",
  defaultInput: undefined,
  code: mediatorCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  diagram: mediatorDiagram,
  icon: "🗣️",
  codeExamples: {
    typescript: {
      code: `interface Mediator {
  notify(sender: Colleague, event: string): void;
}

interface Colleague {
  setMediator(mediator: Mediator): void;
  receive(message: string): void;
}

class ChatRoom implements Mediator {
  private colleagues: Colleague[] = [];

  register(colleague: Colleague): void {
    this.colleagues.push(colleague);
    colleague.setMediator(this);
  }

  notify(sender: Colleague, event: string): void {
    this.colleagues
      .filter(c => c !== sender)
      .forEach(c => c.receive(event));
  }
}

class ChatUser implements Colleague {
  mediator!: Mediator;
  constructor(private name: string) {}

  setMediator(mediator: Mediator): void {
    this.mediator = mediator;
  }

  send(message: string): void {
    console.log(\`\${this.name} sends: \${message}\`);
    this.mediator.notify(this, message);
  }

  receive(message: string): void {
    console.log(\`\${this.name} receives: \${message}\`);
  }
}

const chatRoom = new ChatRoom();
const alice = new ChatUser('Alice');
const bob = new ChatUser('Bob');
chatRoom.register(alice);
chatRoom.register(bob);
alice.send('Hello!');`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef struct User User;
typedef struct ChatRoom ChatRoom;

struct ChatRoom {
  User** users;
  int count;
};

struct User {
  const char* name;
  ChatRoom* room;
};

void user_send(User* u, const char* msg) {
  printf("%s sends: %s\\n", u->name, msg);
}

void user_receive(User* u, const char* msg) {
  printf("%s receives: %s\\n", u->name, msg);
}

int main(void) {
  User alice = {"Alice", NULL};
  User bob = {"Bob", NULL};
  alice.room = bob.room = &(ChatRoom){0};
  user_send(&alice, "Hello!");
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <vector>
#include <memory>

class Colleague {
public:
  virtual void setMediator(class ChatRoom* m) = 0;
  virtual void receive(const std::string& msg) = 0;
  virtual ~Colleague() = default;
};

class ChatRoom {
  std::vector<Colleague*> colleagues;
public:
  void registerUser(Colleague* c) { colleagues.push_back(c); }
  void broadcast(Colleague* sender, const std::string& msg) {
    for (auto c : colleagues) {
      if (c != sender) c->receive(msg);
    }
  }
};

class ChatUser : public Colleague {
  std::string name;
  ChatRoom* mediator;
public:
  ChatUser(const std::string& n) : name(n), mediator(nullptr) {}
  void setMediator(ChatRoom* m) override { mediator = m; }
  void send(const std::string& msg) {
    std::cout << name << " sends: " << msg << "\\n";
    mediator->broadcast(this, msg);
  }
  void receive(const std::string& msg) override {
    std::cout << name << " receives: " << msg << "\\n";
  }
};

int main() {
  auto room = std::make_unique<ChatRoom>();
  ChatUser alice("Alice"), bob("Bob");
  room->registerUser(&alice);
  room->registerUser(&bob);
  alice.send("Hello!");
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class ChatRoom:
    def __init__(self):
        self.users = []

    def register(self, user):
        self.users.append(user)
        user.mediator = self

    def notify(self, sender, message):
        for user in self.users:
            if user != sender:
                user.receive(message)

class ChatUser:
    def __init__(self, name):
        self.name = name
        self.mediator = None

    def send(self, message):
        print(f"{self.name} sends: {message}")
        self.mediator.notify(self, message)

    def receive(self, message):
        print(f"{self.name} receives: {message}")

room = ChatRoom()
alice = ChatUser("Alice")
bob = ChatUser("Bob")
room.register(alice)
room.register(bob)
alice.send("Hello!")`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Mediator: Send + Sync {
    fn notify(&self, sender: &dyn Colleague, msg: &str);
}

trait Colleague {
    fn set_mediator(&mut self, mediator: Box<dyn Mediator>);
    fn send(&self, msg: &str);
    fn receive(&self, msg: &str);
}

struct ChatRoom {
    users: Vec<Box<dyn Colleague>>,
}

impl ChatRoom {
    fn notify(&self, sender: &dyn Colleague, msg: &str) {
        for user in &self.users {
            if user.as_ref() != sender {
                user.receive(msg);
            }
        }
    }
}

fn main() {
    println!("Mediator pattern demo");
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Mediator interface {
    Notify(sender Colleague, msg string)
}

type Colleague interface {
    SetMediator(Mediator)
    Send(string)
    Receive(string)
}

type ChatRoom struct {
    colleagues []Colleague
}

func (c *ChatRoom) Register(colleague Colleague) {
    c.colleagues = append(c.colleagues, colleague)
}

func (c *ChatRoom) Notify(sender Colleague, msg string) {
    for _, u := range c.colleagues {
        if u != sender {
            u.Receive(msg)
        }
    }
}

type ChatUser struct {
    name     string
 mediator Mediator
}

func (u *ChatUser) SetMediator(m Mediator) { u.mediator = m }
func (u *ChatUser) Send(msg string) {
    fmt.Printf("%s sends: %s\\n", u.name, msg)
    u.mediator.Notify(u, msg)
}
func (u *ChatUser) Receive(msg string) {
    fmt.Printf("%s receives: %s\\n", u.name, msg)
}

func main() {
    room := &ChatRoom{}
    alice := &ChatUser{name: "Alice"}
    bob := &ChatUser{name: "Bob"}
    room.Register(alice)
    room.Register(bob)
    alice.Send("Hello!")
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `import java.util.*;

public class Main {
    interface Mediator {
        void notify(Colleague sender, String msg);
    }

    interface Colleague {
        void setMediator(Mediator m);
        void send(String msg);
        void receive(String msg);
    }

    static class ChatRoom implements Mediator {
        private List<Colleague> users = new ArrayList<>();
        public void register(Colleague u) { users.add(u); }
        public void notify(Colleague sender, String msg) {
            for (Colleague u : users) {
                if (u != sender) u.receive(msg);
            }
        }
    }

    static class ChatUser implements Colleague {
        private String name;
        private Mediator mediator;
        public ChatUser(String name) { this.name = name; }
        public void setMediator(Mediator m) { this.mediator = m; }
        public void send(String msg) {
            System.out.println(name + " sends: " + msg);
            mediator.notify(this, msg);
        }
        public void receive(String msg) {
            System.out.println(name + " receives: " + msg);
        }
    }

    public static void main(String[] args) {
        ChatRoom room = new ChatRoom();
        ChatUser alice = new ChatUser("Alice");
        ChatUser bob = new ChatUser("Bob");
        room.register(alice);
        room.register(bob);
        alice.send("Hello!");
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — concrete production systems
  // that use the Mediator pattern to coordinate complex interactions.
  scenarios: [
    {
      id: "redux-store",
      i18nKey: "content.patterns.mediator.scenarios.redux-store",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "Redux, Zustand, Pinia",
    },
    {
      id: "executor-service",
      i18nKey: "content.patterns.mediator.scenarios.executor-service",
      domain: "concurrency",
      icon: "🧵",
      reference: "Java ExecutorService, Go goroutines, .NET TPL",
      codeSnippet: {
        language: "java",
        code: `// Java ExecutorService — mediator between task producers and threads
ExecutorService executor = Executors.newFixedThreadPool(4);
Future<Integer> future = executor.submit(() -> {
    return computeExpensiveResult();  // worker executes
});
Integer result = future.get();  // collect result
executor.shutdown();`,
      },
    },
    {
      id: "air-traffic-control",
      i18nKey: "content.patterns.mediator.scenarios.air-traffic-control",
      domain: "system",
      icon: "🌐",
      reference: "Eurocontrol, FAA ATC, Drones",
    },
  ] satisfies Scenario[],
};
