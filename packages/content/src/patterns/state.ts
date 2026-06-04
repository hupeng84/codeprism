import type { Frame, InteractionState, Scenario, UMLClassDiagram } from "@codeprism/core";

export function* stateGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  const document = { id: 'document', name: 'Document', type: 'Context', state: { title: 'My Doc' }, position: { x: 300, y: 50 }, status: 'idle' as const };
  const draft = { id: 'draft', name: 'DraftState', type: 'State', state: { allowedTransitions: ['review'] }, position: { x: 100, y: 150 }, status: 'idle' as const };
  const review = { id: 'review', name: 'ReviewState', type: 'State', state: { allowedTransitions: ['draft', 'published'] }, position: { x: 300, y: 150 }, status: 'idle' as const };
  const published = { id: 'published', name: 'PublishedState', type: 'State', state: { allowedTransitions: [] }, position: { x: 500, y: 150 }, status: 'idle' as const };

  yield { step: 1, state: { objects: [document, draft, review, published], messages: [] }, description: 'Document starts in Draft state', highlightLine: 1 };
  yield { step: 2, state: { objects: [document, draft, review, published], messages: [{ from: 'document', to: 'draft', method: 'render()', args: [], status: 'pending' as const }] }, description: 'Document renders in Draft mode', highlightLine: 2 };
  yield { step: 3, state: { objects: [document, { ...draft, status: 'active' }, review, published], messages: [{ from: 'document', to: 'draft', method: 'render()', args: [], status: 'complete' as const }] }, description: 'Draft state is active - shows draft controls', highlightLine: 3 };
  yield { step: 4, state: { objects: [{ ...document, status: 'highlighted' }, draft, review, published], messages: [{ from: 'document', to: 'document', method: 'submitForReview()', args: [], status: 'pending' as const }] }, description: 'Author clicks Submit for Review', highlightLine: 6 };
  yield { step: 5, state: { objects: [{ ...document, status: 'active' }, draft, review, published], messages: [{ from: 'document', to: 'document', method: 'submitForReview()', args: [], status: 'active' as const }] }, description: 'Document transitions from Draft to Review', highlightLine: 7 };
  yield { step: 6, state: { objects: [{ ...document, status: 'idle' }, draft, { ...review, status: 'active' }, published], messages: [] }, description: 'Document now in Review state', highlightLine: 7 };
  yield { step: 7, state: { objects: [document, draft, review, published], messages: [{ from: 'document', to: 'review', method: 'render()', args: [], status: 'pending' as const }] }, description: 'Reviewer sees review controls (Approve/Reject)', highlightLine: 8 };
  yield { step: 8, state: { objects: [document, draft, review, published], messages: [{ from: 'document', to: 'document', method: 'approve()', args: [], status: 'pending' as const }] }, description: 'Reviewer approves the document', highlightLine: 11 };
  yield { step: 9, state: { objects: [document, draft, { ...review, status: 'idle' }, published], messages: [{ from: 'document', to: 'document', method: 'approve()', args: [], status: 'active' as const }] }, description: 'Review state completes, transition to Published', highlightLine: 12 };
  yield { step: 10, state: { objects: [document, draft, review, { ...published, status: 'active' }], messages: [] }, description: 'Document is now Published - no more transitions allowed', highlightLine: 12 };
}

export const stateCode = `interface DocumentState {
  render(): void;
  submit(): void;
  approve(): void;
  reject(): void;
}

class DraftState implements DocumentState {
  constructor(private document: Document) {}

  render(): void {
    console.log('Rendering draft editor with edit controls');
  }

  submit(): void {
    console.log('Submitting for review...');
    this.document.transitionTo(new ReviewState(this.document));
  }

  approve(): void {
    throw new Error('Cannot approve a draft');
  }

  reject(): void {
    throw new Error('Cannot reject a draft');
  }
}

class ReviewState implements DocumentState {
  constructor(private document: Document) {}

  render(): void {
    console.log('Rendering review interface with approve/reject');
  }

  submit(): void {
    throw new Error('Already submitted for review');
  }

  approve(): void {
    console.log('Approving document...');
    this.document.transitionTo(new PublishedState(this.document));
  }

  reject(): void {
    console.log('Rejecting - returning to draft...');
    this.document.transitionTo(new DraftState(this.document));
  }
}

class PublishedState implements DocumentState {
  constructor(private document: Document) {}

  render(): void {
    console.log('Rendering published view - no edit controls');
  }

  submit(): void {
    throw new Error('Cannot submit published document');
  }

  approve(): void {
    throw new Error('Already approved');
  }

  reject(): void {
    throw new Error('Cannot reject published document');
  }
}

class Document {
  private state: DocumentState;

  constructor() {
    this.state = new DraftState(this);
  }

  transitionTo(state: DocumentState): void {
    this.state = state;
  }

  submit(): void { this.state.submit(); }
  approve(): void { this.state.approve(); }
  reject(): void { this.state.reject(); }
  render(): void { this.state.render(); }
}

const doc = new Document();
doc.render();
doc.submit();
doc.render();`;

export const stateCodeLines = [
  "interface DocumentState {",
  "  render(): void;",
  "  submit(): void;",
  "  approve(): void;",
  "  reject(): void;",
  "}",
  "",
  "class DraftState implements DocumentState {",
  "  constructor(private document: Document) {}",
  "",
  "  render(): void {",
  "    console.log('Rendering draft editor with edit controls');",
  "  }",
  "",
  "  submit(): void {",
  "    console.log('Submitting for review...');",
  "    this.document.transitionTo(new ReviewState(this.document));",
  "  }",
  "",
  "  approve(): void {",
  "    throw new Error('Cannot approve a draft');",
  "  }",
  "",
  "  reject(): void {",
  "    throw new Error('Cannot reject a draft');",
  "  }",
  "}",
  "",
  "class ReviewState implements DocumentState {",
  "  constructor(private document: Document) {}",
  "",
  "  render(): void {",
  "    console.log('Rendering review interface with approve/reject');",
  "  }",
  "",
  "  submit(): void {",
  "    throw new Error('Already submitted for review');",
  "  }",
  "",
  "  approve(): void {",
  "    console.log('Approving document...');",
  "    this.document.transitionTo(new PublishedState(this.document));",
  "  }",
  "",
  "  reject(): void {",
  "    console.log('Rejecting - returning to draft...');",
  "    this.document.transitionTo(new DraftState(this.document));",
  "  }",
  "}",
  "",
  "class PublishedState implements DocumentState {",
  "  constructor(private document: Document) {}",
  "",
  "  render(): void {",
  "    console.log('Rendering published view - no edit controls');",
  "  }",
  "",
  "  submit(): void {",
  "    throw new Error('Cannot submit published document');",
  "  }",
  "",
  "  approve(): void {",
  "    throw new Error('Already approved');",
  "  }",
  "",
  "  reject(): void {",
  "    throw new Error('Cannot reject published document');",
  "  }",
  "}",
  "",
  "class Document {",
  "  private state: DocumentState;",
  "",
  "  constructor() {",
  "    this.state = new DraftState(this);",
  "  }",
  "",
  "  transitionTo(state: DocumentState): void {",
  "    this.state = state;",
  "  }",
  "",
  "  submit(): void { this.state.submit(); }",
  "  approve(): void { this.state.approve(); }",
  "  reject(): void { this.state.reject(); }",
  "  render(): void { this.state.render(); }",
  "}",
  "",
  "const doc = new Document();",
  "doc.render();",
  "doc.submit();",
  "doc.render();",
];

const stateDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "Context",
      name: "Context",
      attributes: [
        { visibility: "-", name: "state", type: "State" },
      ],
      methods: [
        { visibility: "+", name: "request", params: "", returnType: "void" },
      ],
      position: { x: 150, y: 50 },
    },
    {
      id: "State",
      name: "State",
      stereotype: "«interface»",
      attributes: [],
      methods: [
        { visibility: "+", name: "handle", params: "context: Context", returnType: "void" },
      ],
      position: { x: 450, y: 50 },
    },
    {
      id: "ConcreteStateA",
      name: "ConcreteStateA",
      attributes: [],
      methods: [
        { visibility: "+", name: "handle", params: "context: Context", returnType: "void" },
      ],
      position: { x: 100, y: 250 },
    },
    {
      id: "ConcreteStateB",
      name: "ConcreteStateB",
      attributes: [],
      methods: [
        { visibility: "+", name: "handle", params: "context: Context", returnType: "void" },
      ],
      position: { x: 350, y: 250 },
    },
    {
      id: "ConcreteStateC",
      name: "ConcreteStateC",
      attributes: [],
      methods: [
        { visibility: "+", name: "handle", params: "context: Context", returnType: "void" },
      ],
      position: { x: 600, y: 250 },
    },
  ],
  relationships: [
    { from: "ConcreteStateA", to: "State", type: "implements" },
    { from: "ConcreteStateB", to: "State", type: "implements" },
    { from: "ConcreteStateC", to: "State", type: "implements" },
    { from: "Context", to: "State", type: "association", label: "has" },
  ],
};

export const stateContent = {
  id: "state",
  slug: "state",
  title: "",
  titleKey: "content.patterns.state.title",
  category: "pattern" as const,
  subcategory: "behavioral",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.state.desc",
  defaultInput: undefined,
  code: stateCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(n)",
  },
  tags: [],
  diagram: stateDiagram,
  icon: "🔄",
  codeExamples: {
    typescript: {
      code: `interface DocumentState {
  render(): void;
  submit(): void;
  approve(): void;
}

class DraftState implements DocumentState {
  constructor(private document: Document) {}
  render(): void { console.log("Draft editor"); }
  submit(): void {
    this.document.transitionTo(new ReviewState(this.document));
  }
  approve(): void { throw new Error("Cannot approve draft"); }
}

class ReviewState implements DocumentState {
  constructor(private document: Document) {}
  render(): void { console.log("Review interface"); }
  submit(): void { throw new Error("Already submitted"); }
  approve(): void {
    this.document.transitionTo(new PublishedState(this.document));
  }
}

class PublishedState implements DocumentState {
  constructor(private document: Document) {}
  render(): void { console.log("Published view"); }
  submit(): void { throw new Error("Cannot submit published"); }
  approve(): void { throw new Error("Already approved"); }
}

class Document {
  private state: DocumentState;
  constructor() { this.state = new DraftState(this); }
  transitionTo(state: DocumentState): void { this.state = state; }
  submit(): void { this.state.submit(); }
  approve(): void { this.state.approve(); }
  render(): void { this.state.render(); }
}

const doc = new Document();
doc.render();
doc.submit();
doc.render();`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>

typedef enum { DRAFT, REVIEW, PUBLISHED } State;

typedef struct {
  State state;
} Document;

void document_transition(Document* doc, State s) { doc->state = s; }

const char* state_render(State s) {
  switch(s) {
    case DRAFT: return "Draft editor";
    case REVIEW: return "Review interface";
    case PUBLISHED: return "Published view";
  }
  return "";
}

int main(void) {
  Document doc = {DRAFT};
  printf("%s\\n", state_render(doc.state));
  document_transition(&doc, REVIEW);
  printf("%s\\n", state_render(doc.state));
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

class DocumentState {
public:
  virtual void render() = 0;
  virtual void submit() = 0;
  virtual void approve() = 0;
  virtual ~DocumentState() = default;
};

class Document {
  std::unique_ptr<DocumentState> state;
public:
  Document();
  void transitionTo(std::unique_ptr<DocumentState> s) { state = std::move(s); }
  void submit() { state->submit(); }
  void approve() { state->approve(); }
  void render() { state->render(); }
};

class DraftState : public DocumentState {
  Document* doc;
public:
  DraftState(Document* d) : doc(d) {}
  void render() override { std::cout << "Draft editor\\n"; }
  void submit() override {
    std::cout << "Submitting...\\n";
    doc->transitionTo(std::make_unique<ReviewState>(doc));
  }
  void approve() override { throw std::runtime_error("Cannot approve"); }
};

class ReviewState : public DocumentState {
  Document* doc;
public:
  ReviewState(Document* d) : doc(d) {}
  void render() override { std::cout << "Review interface\\n"; }
  void submit() override { throw std::runtime_error("Already submitted"); }
  void approve() override {
    std::cout << "Approving...\\n";
    doc->transitionTo(std::make_unique<PublishedState>(doc));
  }
};

class PublishedState : public DocumentState {
  Document* doc;
public:
  PublishedState(Document* d) : doc(d) {}
  void render() override { std::cout << "Published view\\n"; }
  void submit() override { throw std::runtime_error("Cannot submit"); }
  void approve() override { throw std::runtime_error("Already approved"); }
};

Document::Document() { state = std::make_unique<DraftState>(this); }

int main() {
  Document doc;
  doc.render();
  doc.submit();
  doc.render();
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class DocumentState(ABC):
    @abstractmethod
    def render(self): pass

    @abstractmethod
    def submit(self): pass

    @abstractmethod
    def approve(self): pass

class DraftState(DocumentState):
    def __init__(self, doc):
        self.doc = doc

    def render(self):
        print("Draft editor")

    def submit(self):
        print("Submitting...")
        self.doc.transition_to(ReviewState(self.doc))

    def approve(self):
        raise Exception("Cannot approve draft")

class ReviewState(DocumentState):
    def __init__(self, doc):
        self.doc = doc

    def render(self):
        print("Review interface")

    def submit(self):
        raise Exception("Already submitted")

    def approve(self):
        print("Approving...")
        self.doc.transition_to(PublishedState(self.doc))

class PublishedState(DocumentState):
    def __init__(self, doc):
        self.doc = doc

    def render(self):
        print("Published view")

    def submit(self):
        raise Exception("Cannot submit published")

    def approve(self):
        raise Exception("Already approved")

class Document:
    def __init__(self):
        self.state = DraftState(self)

    def transition_to(self, state):
        self.state = state

    def submit(self):
        self.state.submit()

    def approve(self):
        self.state.approve()

    def render(self):
        self.state.render()

doc = Document()
doc.render()
doc.submit()
doc.render()`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait DocumentState {
    fn render(&self);
    fn submit(&mut self);
    fn approve(&mut self);
}

struct Document {
    state: Box<dyn DocumentState>,
}

impl Document {
    fn new() -> Document {
        Document { state: Box::new(DraftState) }
    }
    fn transition_to(&mut self, s: Box<dyn DocumentState>) {
        self.state = s;
    }
}

struct DraftState;
struct ReviewState;
struct PublishedState;

impl DocumentState for DraftState {
    fn render(&self) { println!("Draft editor"); }
    fn submit(&mut self) {
        println!("Submitting...");
    }
    fn approve(&mut self) {}
}

impl DocumentState for ReviewState {
    fn render(&self) { println!("Review interface"); }
    fn submit(&mut self) {}
    fn approve(&mut self) {
        println!("Approving...");
    }
}

impl DocumentState for PublishedState {
    fn render(&self) { println!("Published view"); }
    fn submit(&mut self) {}
    fn approve(&mut self) {}
}

fn main() {
    let mut doc = Document::new();
    doc.state.render();
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type DocumentState interface {
    Render()
    Submit()
    Approve()
}

type Document struct {
    state DocumentState
}

func (d *Document) TransitionTo(s DocumentState) {
    d.state = s
}

type DraftState struct{ doc *Document }

func (s DraftState) Render() { fmt.Println("Draft editor") }
func (s DraftState) Submit() {
    fmt.Println("Submitting...")
    s.doc.TransitionTo(ReviewState{doc: s.doc})
}
func (s DraftState) Approve() { panic("Cannot approve") }

type ReviewState struct{ doc *Document }

func (s ReviewState) Render() { fmt.Println("Review interface") }
func (s ReviewState) Submit() { panic("Already submitted") }
func (s ReviewState) Approve() {
    fmt.Println("Approving...")
    s.doc.TransitionTo(ReviewState{s.doc})
}

type PublishedState struct{ doc *Document }

func (s PublishedState) Render() { fmt.Println("Published view") }
func (s PublishedState) Submit() { panic("Cannot submit") }
func (s PublishedState) Approve() { panic("Already approved") }

func main() {
    doc := &Document{}
    doc.TransitionTo(DraftState{doc: doc})
    doc.state.Render()
    doc.state.Submit()
    doc.state.Render()
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public class Main {
    interface DocumentState {
        void render();
        void submit();
        void approve();
    }

    static class DraftState implements DocumentState {
        private Document doc;
        public DraftState(Document doc) { this.doc = doc; }
        public void render() { System.out.println("Draft editor"); }
        public void submit() {
            System.out.println("Submitting...");
            doc.transitionTo(new ReviewState(doc));
        }
        public void approve() { throw new RuntimeException("Cannot approve"); }
    }

    static class ReviewState implements DocumentState {
        private Document doc;
        public ReviewState(Document doc) { this.doc = doc; }
        public void render() { System.out.println("Review interface"); }
        public void submit() { throw new RuntimeException("Already submitted"); }
        public void approve() {
            System.out.println("Approving...");
            doc.transitionTo(new PublishedState(doc));
        }
    }

    static class PublishedState implements DocumentState {
        private Document doc;
        public PublishedState(Document doc) { this.doc = doc; }
        public void render() { System.out.println("Published view"); }
        public void submit() { throw new RuntimeException("Cannot submit"); }
        public void approve() { throw new RuntimeException("Already approved"); }
    }

    static class Document {
        private DocumentState state;
        public Document() { state = new DraftState(this); }
        public void transitionTo(DocumentState s) { state = s; }
        public void submit() { state.submit(); }
        public void approve() { state.approve(); }
        public void render() { state.render(); }
    }

    public static void main(String[] args) {
        Document doc = new Document();
        doc.render();
        doc.submit();
        doc.render();
    }
}`,
      language: "java",
      languageLabel: "Java",
    },
  },
  // Real-world application scenarios — anchors the abstract state machine
  // to concrete systems developers encounter daily.
  scenarios: [
    {
      id: "tcp-state-machine",
      i18nKey: "content.patterns.state.scenarios.tcp-state-machine",
      domain: "network",
      icon: "🌐",
      reference: "Linux TCP stack, FreeBSD TCP, lwIP",
    },
    {
      id: "react-use-state",
      i18nKey: "content.patterns.state.scenarios.react-use-state",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "React, Vue, Svelte",
      codeSnippet: {
        language: "typescript",
        code: `// React uses State pattern for component lifecycle
const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

useEffect(() => {
  setStatus("loading");
  fetchData()
    .then(() => setStatus("success"))
    .catch(() => setStatus("error"));
}, []);`,
      },
    },
    {
      id: "order-workflow",
      i18nKey: "content.patterns.state.scenarios.order-workflow",
      domain: "business",
      icon: "💼",
      reference: "Camunda, Temporal, AWS Step Functions",
    },
  ] satisfies Scenario[],
};
