import type { Frame, InteractionState, PatternObject, Scenario, UMLClassDiagram } from "@codeprism/core";

/**
 * Proxy Pattern — Frame Generator
 * image proxy scenario - lazy loading proxy，show placeholder before real image loads
 */
export function* proxyGenerator(): Generator<Frame<InteractionState>, void, unknown> {
  let step = 0;

  // Positions
  const clientPos = { x: 100, y: 200 };
  const proxyPos = { x: 300, y: 200 };
  const realImagePos = { x: 500, y: 200 };

  // Objects
  const client: PatternObject = {
    id: "client",
    name: "ImageViewer",
    type: "Client",
    state: {},
    position: clientPos,
    status: "idle",
  };

  const imageProxy: PatternObject = {
    id: "proxy",
    name: "ImageProxy",
    type: "Proxy",
    state: { loaded: false, placeholder: "Loading..." },
    position: proxyPos,
    status: "idle",
  };

  const realImage: PatternObject = {
    id: "realImage",
    name: "RealImage",
    type: "RealSubject",
    state: { pixels: "1920x1080", loaded: false },
    position: realImagePos,
    status: "idle",
  };

  // Step 0: Initialize
  yield {
    step: step++,
    state: {
      objects: [
        { ...client },
        { ...imageProxy },
        { ...realImage },
      ],
      messages: [],
    },
    description: "",
    highlightLine: -1,
  };

  // Step 1: Client requests image through proxy
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...imageProxy, status: "idle" },
        { ...realImage, status: "idle" },
      ],
      messages: [
        { from: "client", to: "proxy", method: "display()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.0" },
    highlightLine: 8,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...imageProxy, status: "active" },
        { ...realImage, status: "idle" },
      ],
      messages: [
        { from: "client", to: "proxy", method: "display()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.1" },
    highlightLine: 8,
  };

  // Step 3: Proxy shows placeholder (lazy loading)
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...imageProxy, status: "highlighted", state: { loaded: false, placeholder: "Loading..." } },
        { ...realImage, status: "idle" },
      ],
      messages: [
        { from: "proxy", to: "proxy", method: "checkCache()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.2" },
    highlightLine: 10,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...imageProxy, status: "highlighted", state: { loaded: false, placeholder: "Loading..." } },
        { ...realImage, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.3" },
    highlightLine: 10,
  };

  // Step 5: Client requests to load full image
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...imageProxy, status: "idle" },
        { ...realImage, status: "idle" },
      ],
      messages: [
        { from: "client", to: "proxy", method: "loadFullImage()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.4" },
    highlightLine: 15,
  };

  // Step 6: Proxy creates real image (expensive operation)
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...imageProxy, status: "active" },
        { ...realImage, status: "idle" },
      ],
      messages: [
        { from: "proxy", to: "realImage", method: "new RealImage(file)", args: ["photo.jpg"], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.5" },
    highlightLine: 16,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...imageProxy, status: "active" },
        { ...realImage, status: "active" },
      ],
      messages: [
        { from: "proxy", to: "realImage", method: "loadFromDisk()", args: [], status: "active" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.6" },
    highlightLine: 17,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "idle" },
        { ...imageProxy, status: "idle", state: { loaded: true } },
        { ...realImage, status: "highlighted", state: { pixels: "1920x1080", loaded: true } },
      ],
      messages: [
        { from: "proxy", to: "realImage", method: "loadFromDisk()", args: [], status: "complete" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.7" },
    highlightLine: 18,
  };

  // Step 9: Proxy displays real image
  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "active" },
        { ...imageProxy, status: "highlighted", state: { loaded: true } },
        { ...realImage, status: "idle" },
      ],
      messages: [
        { from: "proxy", to: "client", method: "displayImage()", args: [], status: "pending" },
      ],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.8" },
    highlightLine: 20,
  };

  yield {
    step: step++,
    state: {
      objects: [
        { ...client, status: "highlighted" },
        { ...imageProxy, status: "idle", state: { loaded: true } },
        { ...realImage, status: "idle" },
      ],
      messages: [],
    },
    description: "",
    meta: { descriptionKey: "content.patterns.proxy.frames.9" },
    highlightLine: 20,
  };
}

/** Code snippet */
export const proxyCode = `// Subject interface
interface Image {
  display(): void;
  loadFromDisk(): void;
}

// RealSubject - real object, slow initialization
class RealImage implements Image {
  constructor(private filename: string) {
    console.log(\`Loading \${filename} from disk...\`);
    this.loadFromDisk();  // ← time-consuming operation
  }

  display(): void {
    console.log(\`Displaying \${this.filename}\`);
  }

  loadFromDisk(): void {
    console.log("Loading pixels into memory...");
  }
}

// Proxy - proxy, controls access to RealImage
class ImageProxy implements Image {
  private realImage: RealImage | null = null;

  constructor(private filename: string) {}

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);  // ← lazy loading
    }
    this.realImage.display();
  }
}

// Usage
const image = new ImageProxy("photo.jpg");  // does not load
image.display();                            // starts loading and displays
image.display();                            // uses cache directly`;

export const proxyCodeLines = [
  "// Subject interface",
  "interface Image {",
  "  display(): void;",
  "  loadFromDisk(): void;",
  "}",
  "",
  "// RealSubject - real object, slow initialization",
  "class RealImage implements Image {",
  "  constructor(private filename: string) {",
  "    console.log(`Loading ${filename} from disk...`);",
  "    this.loadFromDisk();  // ← time-consuming operation",
  "  }",
  "",
  "  display(): void {",
  "    console.log(`Displaying ${this.filename}`);",
  "  }",
  "",
  "  loadFromDisk(): void {",
  "    console.log('Loading pixels into memory...');",
  "  }",
  "}",
  "",
  "// Proxy - proxy, controls access to RealImage",
  "class ImageProxy implements Image {",
  "  private realImage: RealImage | null = null;",
  "",
  "  constructor(private filename: string) {}",
  "",
  "  display(): void {",
  "    if (!this.realImage) {",
  "      this.realImage = new RealImage(this.filename);  // ← lazy loading",
  "    }",
  "    this.realImage.display();",
  "  }",
  "}",
  "",
  "// Usage",
  "const image = new ImageProxy('photo.jpg');  // does not load",
  "image.display();                            // starts loading and displays",
  "image.display();                            // uses cache directly",
];

const proxyDiagram: UMLClassDiagram = {
  classes: [
    {
      id: "client",
      name: "Client",
      stereotype: "class",
      attributes: [],
      methods: [],
      position: { x: 100, y: 50 },
    },
    {
      id: "subject",
      name: "Subject",
      stereotype: "interface",
      attributes: [],
      methods: [{ visibility: "+", name: "request()", params: "", returnType: "void" }],
      position: { x: 300, y: 50 },
    },
    {
      id: "realSubject",
      name: "RealSubject",
      stereotype: "class",
      attributes: [],
      methods: [{ visibility: "+", name: "request()", params: "", returnType: "void" }],
      position: { x: 200, y: 200 },
    },
    {
      id: "proxy",
      name: "Proxy",
      stereotype: "class",
      attributes: [{ visibility: "#", name: "realSubject", type: "RealSubject" }],
      methods: [{ visibility: "+", name: "request()", params: "", returnType: "void" }],
      position: { x: 400, y: 200 },
    },
  ],
  relationships: [
    { from: "realSubject", to: "subject", type: "implements" },
    { from: "proxy", to: "subject", type: "implements" },
    { from: "proxy", to: "realSubject", type: "association", label: "forwards to" },
    { from: "client", to: "subject", type: "dependency", label: "uses" },
  ],
};

export const proxyContent = {
  id: "proxy",
  slug: "proxy",
  title: "",
  titleKey: "content.patterns.proxy.title",
  category: "pattern" as const,
  subcategory: "structural",
  difficulty: "intermediate" as const,
  description: "",
  descKey: "content.patterns.proxy.desc",
  defaultInput: undefined,
  generator: proxyGenerator,
  code: proxyCode,
  language: "TypeScript",
  complexity: {
    time: "O(1)",
    space: "O(n)",
  },
  tags: [],
  icon: "🖼️",
  diagram: proxyDiagram,
  codeExamples: {
    typescript: {
      code: `interface Image {
  display(): void;
}

class RealImage implements Image {
  constructor(private filename: string) {
    console.log(\`Loading \${filename}...\`);
  }

  display(): void {
    console.log(\`Displaying \${this.filename}\`);
  }
}

class ImageProxy implements Image {
  private realImage: RealImage | null = null;

  constructor(private filename: string) {}

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

const image = new ImageProxy("photo.jpg");
image.display();
image.display();`,
      language: "typescript",
      languageLabel: "TypeScript",
    },
    c: {
      code: `#include <stdio.h>
#include <stdlib.h>

typedef struct Image Image;
typedef struct RealImage RealImage;

struct Image {
  void (*display)(Image*);
};

struct RealImage {
  Image base;
  char* filename;
};

void real_image_display(Image* img) {
  RealImage* ri = (RealImage*)img;
  printf("Displaying %s\\n", ri->filename);
}

RealImage* create_real_image(char* filename) {
  RealImage* img = malloc(sizeof(RealImage));
  img->base.display = real_image_display;
  img->filename = filename;
  return img;
}

int main(void) {
  printf("Proxy pattern - use ImageProxy struct\\n");
  return 0;
}`,
      language: "c",
      languageLabel: "C",
    },
    cpp: {
      code: `#include <iostream>
#include <memory>

class Image {
public:
  virtual void display() = 0;
  virtual ~Image() = default;
};

class RealImage : public Image {
  std::string filename;
public:
  RealImage(const std::string& fname) : filename(fname) {
    std::cout << "Loading " << filename << "\\n";
  }
  void display() override {
    std::cout << "Displaying " << filename << "\\n";
  }
};

class ImageProxy : public Image {
  std::unique_ptr<RealImage> realImage;
  std::string filename;
public:
  ImageProxy(const std::string& fname) : filename(fname) {}
  void display() override {
    if (!realImage) {
      realImage = std::make_unique<RealImage>(filename);
    }
    realImage->display();
  }
};

int main() {
  std::unique_ptr<Image> image = std::make_unique<ImageProxy>("photo.jpg");
  image->display();
  image->display();
}`,
      language: "cpp",
      languageLabel: "C++",
    },
    python: {
      code: `from abc import ABC, abstractmethod

class Image(ABC):
    @abstractmethod
    def display(self):
        pass

class RealImage(Image):
    def __init__(self, filename):
        self.filename = filename
        print(f"Loading {filename}...")

    def display(self):
        print(f"Displaying {self.filename}")

class ImageProxy(Image):
    def __init__(self, filename):
        self.filename = filename
        self._real_image = None

    def display(self):
        if self._real_image is None:
            self._real_image = RealImage(self.filename)
        self._real_image.display()

image = ImageProxy("photo.jpg")
image.display()
image.display()`,
      language: "python",
      languageLabel: "Python",
    },
    rust: {
      code: `trait Image {
    fn display(&self);
}

struct RealImage {
    filename: String,
}

impl RealImage {
    fn new(filename: &str) -> RealImage {
        println!("Loading {}...", filename);
        RealImage { filename: filename.to_string() }
    }
}

impl Image for RealImage {
    fn display(&self) {
        println!("Displaying {}", self.filename);
    }
}

struct ImageProxy {
    filename: String,
    real_image: Option<RealImage>,
}

impl ImageProxy {
    fn new(filename: &str) -> ImageProxy {
        ImageProxy { filename: filename.to_string(), real_image: None }
    }
}

impl Image for ImageProxy {
    fn display(&self) {
        println!("Displaying {}", self.filename);
    }
}

fn main() {
    let image = ImageProxy::new("photo.jpg");
    image.display();
}`,
      language: "rust",
      languageLabel: "Rust",
    },
    go: {
      code: `package main

import "fmt"

type Image interface {
    Display()
}

type RealImage struct {
    filename string
}

func (r RealImage) Display() {
    fmt.Println("Displaying", r.filename)
}

type ImageProxy struct {
    filename  string
    realImage *RealImage
}

func (p ImageProxy) Display() {
    if p.realImage == nil {
        p.realImage = &RealImage{filename: p.filename}
    }
    p.realImage.Display()
}

func main() {
    var img Image = ImageProxy{filename: "photo.jpg"}
    img.Display()
    img.Display()
}`,
      language: "go",
      languageLabel: "Go",
    },
    java: {
      code: `public interface Image {
    void display();
}

public class RealImage implements Image {
    private String filename;
    public RealImage(String filename) {
        this.filename = filename;
        System.out.println("Loading " + filename + "...");
    }
    public void display() {
        System.out.println("Displaying " + filename);
    }
}

public class ImageProxy implements Image {
    private RealImage realImage;
    private String filename;
    public ImageProxy(String filename) { this.filename = filename; }
    public void display() {
        if (realImage == null) {
            realImage = new RealImage(filename);
        }
        realImage.display();
    }
}

public class Main {
    public static void main(String[] args) {
        Image image = new ImageProxy("photo.jpg");
        image.display();
        image.display();
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
      id: "hibernate-lazy-loading",
      i18nKey: "content.patterns.proxy.scenarios.hibernate-lazy-loading",
      domain: "business",
      icon: "🔒",
      reference: "Hibernate, MyBatis, Spring Data JPA",
      codeSnippet: {
        language: "java",
        code: `// Hibernate returns a proxy that loads the entity on first access
@Entity
public class Order {
  @Id private Long id;

  @OneToMany(fetch = FetchType.LAZY)
  private List<OrderItem> items; // proxy — SQL fires on getItems()
}

// Accessing items triggers the real DB query
Order order = entityManager.find(Order.class, 1L);
order.getItems().forEach(System.out::println); // lazy load here`,
      },
    },
    {
      id: "nginx-cdn",
      i18nKey: "content.patterns.proxy.scenarios.nginx-cdn",
      domain: "network",
      icon: "🌐",
      reference: "Nginx, Cloudflare CDN, HAProxy, Varnish",
    },
    {
      id: "vue3-reactivity",
      i18nKey: "content.patterns.proxy.scenarios.vue3-reactivity",
      domain: "ui-framework",
      icon: "⚛️",
      reference: "Vue 3, MobX, Svelte stores, Preact signals",
    },
  ] satisfies Scenario[],
};
