import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Observer Pattern — Frame Generator
 * Shows weather station notifying multiple displays of temperature changes.
 */
export function* observerGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions for objects
  const subjectPos = { x: 150, y: 200 };
  const observer1Pos = { x: 450, y: 120 };
  const observer2Pos = { x: 450, y: 320 };

  // Objects
  const weatherStation: PatternObject = {
    id: "weatherStation",
    name: "WeatherStation",
    type: "ConcreteSubject",
    state: { temperature: 0 },
    position: subjectPos,
    status: "idle",
  };

  const phoneDisplay: PatternObject = {
    id: "phoneDisplay",
    name: "PhoneDisplay",
    type: "ConcreteObserver",
    state: { temperature: "--" },
    position: observer1Pos,
    status: "idle",
  };

  const windowDisplay: PatternObject = {
    id: "windowDisplay",
    name: "WindowDisplay",
    type: "ConcreteObserver",
    state: { temperature: "--" },
    position: observer2Pos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation },
        { ...phoneDisplay },
        { ...windowDisplay },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Attach observers
  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "active" },
        { ...phoneDisplay, status: "idle" },
        { ...windowDisplay, status: "idle" },
      ],
      messages: [
        { from: "weatherStation", to: "phoneDisplay", method: "attach(observer)", args: ["phoneDisplay"], status: "active" },
        { from: "weatherStation", to: "windowDisplay", method: "attach(observer)", args: ["windowDisplay"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.0" },
    highlightLine: 6,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "active" },
        { ...phoneDisplay, status: "idle" },
        { ...windowDisplay, status: "idle" },
      ],
      messages: [
        { from: "weatherStation", to: "phoneDisplay", method: "attach(observer)", args: ["phoneDisplay"], status: "complete" },
        { from: "weatherStation", to: "windowDisplay", method: "attach(observer)", args: ["windowDisplay"], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.1" },
    highlightLine: 6,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "idle" },
        { ...phoneDisplay, status: "idle" },
        { ...windowDisplay, status: "idle" },
      ],
      messages: [
        { from: "weatherStation", to: "phoneDisplay", method: "attach(observer)", args: ["phoneDisplay"], status: "complete" },
        { from: "weatherStation", to: "windowDisplay", method: "attach(observer)", args: ["windowDisplay"], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.2" },
    highlightLine: 7,
  };

  // Step 4: Set temperature to 25
  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "active", state: { temperature: 25 } },
        { ...phoneDisplay, status: "idle", state: { temperature: "--" } },
        { ...windowDisplay, status: "idle", state: { temperature: "--" } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.3" },
    highlightLine: 9,
  };

  // Step 5: Notify observers (PhoneDisplay)
  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "active", state: { temperature: 25 } },
        { ...phoneDisplay, status: "highlighted", state: { temperature: "--" } },
        { ...windowDisplay, status: "idle", state: { temperature: "--" } },
      ],
      messages: [
        { from: "weatherStation", to: "phoneDisplay", method: "notifyObservers()", args: [], status: "active" },
        { from: "phoneDisplay", to: "weatherStation", method: "update(25)", args: [25], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.4" },
    highlightLine: 15,
  };

  // Step 6: PhoneDisplay receives update
  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "active", state: { temperature: 25 } },
        { ...phoneDisplay, status: "highlighted", state: { temperature: 25 } },
        { ...windowDisplay, status: "idle", state: { temperature: "--" } },
      ],
      messages: [
        { from: "weatherStation", to: "phoneDisplay", method: "notifyObservers()", args: [], status: "active" },
        { from: "phoneDisplay", to: "weatherStation", method: "update(25)", args: [25], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.5" },
    highlightLine: 16,
  };

  // Step 7: Notify WindowDisplay
  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "active", state: { temperature: 25 } },
        { ...phoneDisplay, status: "idle", state: { temperature: 25 } },
        { ...windowDisplay, status: "highlighted", state: { temperature: "--" } },
      ],
      messages: [
        { from: "weatherStation", to: "windowDisplay", method: "notifyObservers()", args: [], status: "active" },
        { from: "windowDisplay", to: "weatherStation", method: "update(25)", args: [25], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.6" },
    highlightLine: 15,
  };

  // Step 8: WindowDisplay receives update
  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "idle", state: { temperature: 25 } },
        { ...phoneDisplay, status: "idle", state: { temperature: 25 } },
        { ...windowDisplay, status: "highlighted", state: { temperature: 25 } },
      ],
      messages: [
        { from: "weatherStation", to: "windowDisplay", method: "notifyObservers()", args: [], status: "active" },
        { from: "windowDisplay", to: "weatherStation", method: "update(25)", args: [25], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.7" },
    highlightLine: 16,
  };

  // Step 9: Clear messages, idle state
  yield {
    step: step++,
    state: {
      objects: [
        { ...weatherStation, status: "idle", state: { temperature: 25 } },
        { ...phoneDisplay, status: "idle", state: { temperature: 25 } },
        { ...windowDisplay, status: "idle", state: { temperature: 25 } },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.observer.frames.8" },
    highlightLine: 18,
  };
}

/** Code snippet */
export const observerCode = `// Subject (Observable)
class WeatherStation {
  private observers: Observer[] = [];
  private temperature: number = 0;

  attach(observer: Observer) {
    this.observers.push(observer);  // ← register observer
  }

  setTemperature(temp: number) {    // ← set temperature
    this.temperature = temp;
    this.notifyObservers();
  }

  notifyObservers() {               // ← notify all observers
    for (const obs of this.observers) {
      obs.update(this.temperature);
    }
  }
}

// Observer interface
interface Observer {
  update(temperature: number): void;
}

// ConcreteObserver
class PhoneDisplay implements Observer {
  update(temp: number) {            // ← receive update
    console.log(\`Phone: \${temp}°C\`);
  }
}`;

export const observerCodeLines = [
  "// Subject (Observable)",
  "class WeatherStation {",
  "  private observers: Observer[] = [];",
  "  private temperature: number = 0;",
  "",
  "  attach(observer: Observer) {",
  "    this.observers.push(observer);  // ← register observer",
  "  }",
  "",
  "  setTemperature(temp: number) {    // ← set temperature",
  "    this.temperature = temp;",
  "    this.notifyObservers();",
  "  }",
  "",
  "  notifyObservers() {               // ← notify all observers",
  "    for (const obs of this.observers) {",
  "      obs.update(this.temperature);",
  "    }",
  "  }",
  "}",
  "",
  "// Observer interface",
  "interface Observer {",
  "  update(temperature: number): void;",
  "}",
  "",
  "// ConcreteObserver",
  "class PhoneDisplay implements Observer {",
  "  update(temp: number) {            // ← receive update",
  '    console.log(\`Phone: \${temp}°C\`);',
  "  }",
  "}",
];

export const observerDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "subject",
      name: "Subject",
      stereotype: "«abstract»",
      attributes: [
        { visibility: "#", name: "observers", type: "Observer[]" },
      ],
      methods: [
        { visibility: "+", name: "attach", params: "observer: Observer", returnType: "void" },
        { visibility: "+", name: "detach", params: "observer: Observer", returnType: "void" },
        { visibility: "+", name: "notify", params: "", returnType: "void" },
      ],
      position: { x: 300, y: 50 },
    },
    {
      id: "observer",
      name: "Observer",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "update", params: "temp: number", returnType: "void" },
      ],
      position: { x: 300, y: 280 },
    },
    {
      id: "concrete-subject",
      name: "WeatherStation",
      attributes: [
        { visibility: "-", name: "temperature", type: "number" },
        { visibility: "-", name: "humidity", type: "number" },
      ],
      methods: [
        { visibility: "+", name: "getTemperature", params: "", returnType: "number" },
        { visibility: "+", name: "setTemperature", params: "temp: number", returnType: "void" },
      ],
      position: { x: 80, y: 50 },
    },
    {
      id: "concrete-observer",
      name: "PhoneDisplay",
      attributes: [
        { visibility: "-", name: "weatherStation", type: "WeatherStation" },
      ],
      methods: [
        { visibility: "+", name: "update", params: "temp: number", returnType: "void" },
      ],
      position: { x: 520, y: 280 },
    },
  ],
  relationships: [
    { from: "concrete-subject", to: "subject", type: "extends" },
    { from: "concrete-observer", to: "observer", type: "implements" },
    { from: "subject", to: "observer", type: "aggregation" },
    { from: "concrete-subject", to: "concrete-observer", type: "association", label: "notifies" },
  ],
};

export const observerContent = {
  id: "observer",
  slug: "observer",
  title: "",
  titleKey: "content.patterns.observer.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "beginner" as const,
  description: "",
  descKey: "content.patterns.observer.desc",
  defaultInput: undefined,
  generator: observerGenerator,
  code: observerCode,
  language: "TypeScript",
  complexity: {
    time: "O(n)",
    space: "O(n)",
  },
  tags: [],
  icon: "👁️",
  diagram: observerDiagram,
  codeExamples: {
    typescript: {
      code: `interface Observer { update(temperature: number): void; }

class WeatherStation {
  private observers: Observer[] = [];
  private temperature = 0;

  attach(observer: Observer): void { this.observers.push(observer); }

  setTemperature(temp: number): void {
    this.temperature = temp;
    this.notifyObservers();
  }

  notifyObservers(): void {
    this.observers.forEach(obs => obs.update(this.temperature));
  }
}

class PhoneDisplay implements Observer {
  update(temperature: number): void {
    console.log(\`Phone: \${temperature}°C\`);
  }
}

const station = new WeatherStation();
station.attach(new PhoneDisplay());
station.setTemperature(25);`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

struct Observer { void (*update)(int); };

struct WeatherStation {
  struct Observer** observers;
  int count;
  int temperature;
};

void attach(struct WeatherStation* ws, struct Observer* obs) {
  ws->observers[ws->count++] = obs;
}

void notify(struct WeatherStation* ws) {
  for (int i = 0; i < ws->count; i++)
    ws->observers[i]->update(ws->temperature);
}

void phone_update(int temp) { printf("Phone: %dC\\n", temp); }

int main(void) {
  struct WeatherStation ws = {0};
  struct Observer phone = {phone_update};
  attach(&ws, &phone);
  ws.temperature = 25;
  notify(&ws);
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <vector>
#include <memory>

class Observer {
public:
  virtual void update(int temperature) = 0;
  virtual ~Observer() = default;
};

class WeatherStation {
  std::vector<std::unique_ptr<Observer>> observers;
  int temperature = 0;
public:
  void attach(std::unique_ptr<Observer> obs) { observers.push_back(std::move(obs)); }
  void setTemperature(int temp) {
    temperature = temp;
    for (auto& obs : observers) obs->update(temperature);
  }
};

class PhoneDisplay : public Observer {
  void update(int temperature) override {
    std::cout << "Phone: " << temperature << "C" << std::endl;
  }
};

int main() {
  WeatherStation station;
  station.attach(std::make_unique<PhoneDisplay>());
  station.setTemperature(25);
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `class Observer:
    def update(self, temperature):
        raise NotImplementedError

class WeatherStation:
    def __init__(self):
        self.observers = []
        self.temperature = 0

    def attach(self, observer):
        self.observers.append(observer)

    def set_temperature(self, temperature):
        self.temperature = temperature
        self.notify_observers()

    def notify_observers(self):
        for obs in self.observers:
            obs.update(self.temperature)

class PhoneDisplay(Observer):
    def update(self, temperature):
        print(f"Phone: {temperature}C")

station = WeatherStation()
station.attach(PhoneDisplay())
station.set_temperature(25)`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Observer { fn update(&self, temperature: i32); }

struct WeatherStation<'a> {
    observers: Vec<&'a dyn Observer>,
    temperature: i32,
}

impl<'a> WeatherStation<'a> {
    fn new() -> Self { WeatherStation { observers: Vec::new(), temperature: 0 } }
    fn attach(&mut self, obs: &'a dyn Observer) { self.observers.push(obs); }
    fn set_temperature(&mut self, temp: i32) {
        self.temperature = temp;
        for obs in &self.observers { obs.update(self.temperature); }
    }
}

struct PhoneDisplay;
impl Observer for PhoneDisplay {
    fn update(&self, temperature: i32) { println!("Phone: {}C", temperature); }
}

fn main() {
    let mut station = WeatherStation::new();
    let phone = PhoneDisplay;
    station.attach(&phone);
    station.set_temperature(25);
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Observer interface{ Update(temperature int) }

type WeatherStation struct {
    observers   []Observer
    temperature int
}

func (ws *WeatherStation) Attach(obs Observer) { ws.observers = append(ws.observers, obs) }

func (ws *WeatherStation) SetTemperature(temp int) {
    ws.temperature = temp
    for _, obs := range ws.observers { obs.Update(ws.temperature) }
}

type PhoneDisplay struct{}

func (PhoneDisplay) Update(temperature int) { fmt.Printf("Phone: %dC\\n", temperature) }

func main() {
    station := &WeatherStation{}
    station.Attach(PhoneDisplay{})
    station.SetTemperature(25)
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `import java.util.*;

interface Observer { void update(int temperature); }

class WeatherStation {
    private List<Observer> observers = new ArrayList<>();
    private int temperature;

    public void attach(Observer obs) { observers.add(obs); }

    public void setTemperature(int temp) {
        this.temperature = temp;
        for (Observer obs : observers) obs.update(temperature);
    }
}

class PhoneDisplay implements Observer {
    public void update(int temperature) {
        System.out.println("Phone: " + temperature + "C");
    }
}

public class Main {
    public static void main(String[] args) {
        WeatherStation station = new WeatherStation();
        station.attach(new PhoneDisplay());
        station.setTemperature(25);
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — concrete production systems
  // that use the Observer pattern to broadcast state changes.
  scenarios: [
    {
      id: "dom-events",
      i18nKey: "content.patterns.observer.scenarios.dom-events",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "DOM addEventListener, React useEffect, RxJS",
    },
    {
      id: "kafka-consumer",
      i18nKey: "content.patterns.observer.scenarios.kafka-consumer",
      domain: "data-pipeline",
      icon: "🏭",
      reference: "Apache Kafka, RabbitMQ, AWS SNS",
      codeSnippet: {
        language: "java",
        code: `// Kafka consumer group — Observer pattern
Properties props = new Properties();
props.put("bootstrap.servers", "localhost:9092");
props.put("group.id", "email-service");

KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);
consumer.subscribe(Arrays.asList("orders"));  // attach to subject

while (true) {
    var records = consumer.poll(Duration.ofMillis(100));
    for (var record : records) {
        System.out.println(record.value());  // receive notification
    }
}`,
      },
    },
    {
      id: "redis-pubsub",
      i18nKey: "content.patterns.observer.scenarios.redis-pubsub",
      domain: "network",
      icon: "🌐",
      reference: "Redis Pub/Sub, WebSockets, MQTT",
    },
  ] satisfies Scenario[],
};
