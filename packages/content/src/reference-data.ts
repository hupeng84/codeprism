interface ReferenceSorting {
  name: string;
  category: "Sorting";
  best: string;
  average: string;
  worst: string;
  space: string;
  useCase: string;
}

interface ReferenceSearching {
  name: string;
  category: "Searching";
  best: string;
  average: string;
  worst: string;
  space: string;
  useCase: string;
}

interface ReferenceDataStructure {
  name: string;
  category: "Data Structures";
  access: string;
  search: string;
  insert: string;
  delete: string;
  space: string;
  useCase: string;
}

interface ReferenceGraph {
  name: string;
  category: "Graph Algorithms";
  time: string;
  space: string;
  useCase: string;
}

export interface ReferencePattern {
  name: string;
  category: "Design Patterns";
  /** GoF subcategory: creational, structural, behavioral. */
  subcategory: "Creational" | "Structural" | "Behavioral";
  intent: string;
  applicability: string;
}

export type ReferenceEntry =
  | ReferenceSorting
  | ReferenceSearching
  | ReferenceDataStructure
  | ReferenceGraph
  | ReferencePattern;

const sortingData: ReferenceSorting[] = [
  { name: "Bubble Sort", category: "Sorting", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", useCase: "Educational, small datasets" },
  { name: "Insertion Sort", category: "Sorting", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", useCase: "Small or nearly sorted arrays" },
  { name: "Selection Sort", category: "Sorting", best: "O(n²)", average: "O(n²)", worst: "O(n²)", space: "O(1)", useCase: "Minimize swaps" },
  { name: "Shell Sort", category: "Sorting", best: "O(n log n)", average: "O(n^(4/3))", worst: "O(n²)", space: "O(1)", useCase: "Medium-sized arrays" },
  { name: "Counting Sort", category: "Sorting", best: "O(n + k)", average: "O(n + k)", worst: "O(n + k)", space: "O(k)", useCase: "Integer arrays with small range" },
  { name: "Radix Sort", category: "Sorting", best: "O(nk)", average: "O(nk)", worst: "O(nk)", space: "O(n + k)", useCase: "Fixed-length integers" },
  { name: "Bucket Sort", category: "Sorting", best: "O(n + k)", average: "O(n + k)", worst: "O(n²)", space: "O(n + k)", useCase: "Uniformly distributed floats" },
  { name: "Cocktail Sort", category: "Sorting", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", useCase: "Variation of bubble sort" },
  { name: "Comb Sort", category: "Sorting", best: "O(n log n)", average: "O(n²/2^p)", worst: "O(n²)", space: "O(1)", useCase: "Improvement over bubble sort" },
  { name: "Odd-Even Sort", category: "Sorting", best: "O(n)", average: "O(n²)", worst: "O(n²)", space: "O(1)", useCase: "Parallel processing" },
  { name: "Quick Sort", category: "Sorting", best: "O(n log n)", average: "O(n log n)", worst: "O(n²)", space: "O(log n)", useCase: "General-purpose, in-memory" },
  { name: "Heap Sort", category: "Sorting", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(1)", useCase: "Guaranteed O(n log n)" },
  { name: "Merge Sort", category: "Sorting", best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)", space: "O(n)", useCase: "Stable sort, linked lists" },
];

const searchingData: ReferenceSearching[] = [
  { name: "Binary Search", category: "Searching", best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)", useCase: "Sorted arrays" },
  { name: "Linear Search", category: "Searching", best: "O(1)", average: "O(n)", worst: "O(n)", space: "O(1)", useCase: "Unsorted arrays, small datasets" },
  { name: "Interpolation Search", category: "Searching", best: "O(1)", average: "O(log log n)", worst: "O(n)", space: "O(1)", useCase: "Uniformly distributed sorted data" },
  { name: "Jump Search", category: "Searching", best: "O(1)", average: "O(√n)", worst: "O(√n)", space: "O(1)", useCase: "Sorted arrays, block jumping" },
  { name: "Exponential Search", category: "Searching", best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)", useCase: "Unbounded sorted arrays" },
  { name: "Fibonacci Search", category: "Searching", best: "O(1)", average: "O(log n)", worst: "O(log n)", space: "O(1)", useCase: "Sorted arrays, Fibonacci numbers" },
  { name: "Ternary Search", category: "Searching", best: "O(1)", average: "O(log₃ n)", worst: "O(log₃ n)", space: "O(1)", useCase: "Monotonic functions" },
];

const dataStructuresData: ReferenceDataStructure[] = [
  { name: "Array", category: "Data Structures", access: "O(1)", search: "O(n)", insert: "O(n)", delete: "O(n)", space: "O(n)", useCase: "Random access, contiguous memory" },
  { name: "Linked List", category: "Data Structures", access: "O(n)", search: "O(n)", insert: "O(1)", delete: "O(1)", space: "O(n)", useCase: "Frequent insert/delete" },
  { name: "Stack", category: "Data Structures", access: "O(n)", search: "O(n)", insert: "O(1)", delete: "O(1)", space: "O(n)", useCase: "LIFO, function calls, undo" },
  { name: "Queue", category: "Data Structures", access: "O(n)", search: "O(n)", insert: "O(1)", delete: "O(1)", space: "O(n)", useCase: "FIFO, scheduling, BFS" },
  { name: "Hash Table", category: "Data Structures", access: "-", search: "O(1)", insert: "O(1)", delete: "O(1)", space: "O(n)", useCase: "Fast lookup, key-value pairs" },
  { name: "BST (avg)", category: "Data Structures", access: "O(log n)", search: "O(log n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)", useCase: "Ordered data, dynamic sets" },
  { name: "BST (worst)", category: "Data Structures", access: "O(n)", search: "O(n)", insert: "O(n)", delete: "O(n)", space: "O(n)", useCase: "Degenerate case" },
  { name: "AVL Tree", category: "Data Structures", access: "O(log n)", search: "O(log n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)", useCase: "Strictly balanced, fast lookup" },
  { name: "Red-Black Tree", category: "Data Structures", access: "O(log n)", search: "O(log n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)", useCase: "Self-balancing, std::map" },
  { name: "Heap", category: "Data Structures", access: "O(1)", search: "O(n)", insert: "O(log n)", delete: "O(log n)", space: "O(n)", useCase: "Priority queue, min/max" },
  { name: "Trie", category: "Data Structures", access: "O(k)", search: "O(k)", insert: "O(k)", delete: "O(k)", space: "O(n·k)", useCase: "String prefix matching" },
];

const graphData: ReferenceGraph[] = [
  { name: "BFS", category: "Graph Algorithms", time: "O(V + E)", space: "O(V)", useCase: "Shortest path (unweighted)" },
  { name: "DFS", category: "Graph Algorithms", time: "O(V + E)", space: "O(V)", useCase: "Traversal, cycle detection" },
  { name: "Dijkstra", category: "Graph Algorithms", time: "O((V+E) log V)", space: "O(V)", useCase: "Shortest path (weighted)" },
  { name: "Bellman-Ford", category: "Graph Algorithms", time: "O(V·E)", space: "O(V)", useCase: "Shortest path (negative weights)" },
  { name: "Floyd-Warshall", category: "Graph Algorithms", time: "O(V³)", space: "O(V²)", useCase: "All-pairs shortest path" },
  { name: "Prim", category: "Graph Algorithms", time: "O((V+E) log V)", space: "O(V)", useCase: "Minimum spanning tree" },
  { name: "Kruskal", category: "Graph Algorithms", time: "O(E log E)", space: "O(V)", useCase: "Minimum spanning tree" },
  { name: "Topological Sort", category: "Graph Algorithms", time: "O(V + E)", space: "O(V)", useCase: "Task scheduling" },
  { name: "A*", category: "Graph Algorithms", time: "O(E)", space: "O(V)", useCase: "Optimal pathfinding" },
];

// ── GoF Design Patterns reference ───────────────────────────────────────────
const patternData: ReferencePattern[] = [
  // Creational
  { name: "Singleton", category: "Design Patterns", subcategory: "Creational", intent: "Ensure a class has only one instance with a global access point.", applicability: "When exactly one object is needed to coordinate actions across the system (config managers, thread pools)." },
  { name: "Factory Method", category: "Design Patterns", subcategory: "Creational", intent: "Define an interface for creating objects, letting subclasses decide which class to instantiate.", applicability: "When a class cannot anticipate the class of objects it must create, or when subclasses should specify the created objects." },
  { name: "Abstract Factory", category: "Design Patterns", subcategory: "Creational", intent: "Provide an interface for creating families of related objects without specifying concrete classes.", applicability: "When the system must be configured with one of multiple families of products, or when related product objects are designed to be used together." },
  { name: "Builder", category: "Design Patterns", subcategory: "Creational", intent: "Separate the construction of a complex object from its representation, allowing the same construction process to create different representations.", applicability: "When the algorithm for creating a complex object should be independent of the parts that make up the object." },
  { name: "Prototype", category: "Design Patterns", subcategory: "Creational", intent: "Specify the kinds of objects to create using a prototypical instance, and create new objects by copying this prototype.", applicability: "When the classes to instantiate are specified at run-time (e.g., by dynamic loading), or to avoid building a class hierarchy of factories." },
  // Structural
  { name: "Adapter", category: "Design Patterns", subcategory: "Structural", intent: "Convert the interface of a class into another interface clients expect, enabling classes with incompatible interfaces to work together.", applicability: "When you want to use an existing class but its interface does not match the one you need, or to reuse existing subclasses that lack common functionality." },
  { name: "Bridge", category: "Design Patterns", subcategory: "Structural", intent: "Decouple an abstraction from its implementation so the two can vary independently.", applicability: "When you want to avoid a permanent binding between an abstraction and its implementation, or when both the abstraction and implementation should be extensible via subclassing." },
  { name: "Composite", category: "Design Patterns", subcategory: "Structural", intent: "Compose objects into tree structures to represent part-whole hierarchies, letting clients treat individual objects and compositions uniformly.", applicability: "When you want to represent part-whole hierarchies of objects, or when clients should ignore the difference between compositions of objects and individual objects." },
  { name: "Decorator", category: "Design Patterns", subcategory: "Structural", intent: "Attach additional responsibilities to an object dynamically, providing a flexible alternative to subclassing for extending functionality.", applicability: "When you want to add responsibilities to individual objects dynamically without affecting other objects, or when extension by subclassing is impractical." },
  { name: "Facade", category: "Design Patterns", subcategory: "Structural", intent: "Provide a unified interface to a set of interfaces in a subsystem, making the subsystem easier to use.", applicability: "When you want to provide a simple interface to a complex subsystem, or when there are many dependencies between clients and implementation classes." },
  { name: "Flyweight", category: "Design Patterns", subcategory: "Structural", intent: "Use sharing to support large numbers of fine-grained objects efficiently.", applicability: "When an application uses a huge number of objects that share most of their state, or when storage costs are high because of the sheer quantity of objects." },
  { name: "Proxy", category: "Design Patterns", subcategory: "Structural", intent: "Provide a surrogate or placeholder for another object to control access to it.", applicability: "When a remote proxy should hide the fact that an object resides in a different address space; a virtual proxy should optimize access based on expensive creation; a protection proxy should check permissions." },
  // Behavioral
  { name: "Chain of Responsibility", category: "Design Patterns", subcategory: "Behavioral", intent: "Pass requests along a chain of handlers, where each handler decides either to process the request or to pass it to the next handler.", applicability: "When more than one object may handle a request, and the handler isn't known a priori, or when the set of handlers should be specified dynamically." },
  { name: "Command", category: "Design Patterns", subcategory: "Behavioral", intent: "Encapsulate a request as an object, thereby allowing parameterization of clients with different requests, queue or log requests, and support undoable operations.", applicability: "When you want to parameterize objects by an action to perform, or to specify, queue, and execute requests at different times." },
  { name: "Interpreter", category: "Design Patterns", subcategory: "Behavioral", intent: "Given a language, define a representation for its grammar along with an interpreter that uses the representation to interpret sentences.", applicability: "When the grammar is simple and efficiency is not a critical concern, or when you want to avoid building a parser/combinator library." },
  { name: "Iterator", category: "Design Patterns", subcategory: "Behavioral", intent: "Provide a way to access the elements of an aggregate object sequentially without exposing its underlying representation.", applicability: "When you want to access an aggregate's contents without exposing its internal representation, or to support multiple traversals of aggregate objects." },
  { name: "Mediator", category: "Design Patterns", subcategory: "Behavioral", intent: "Define an object that encapsulates how a set of objects interact, promoting loose coupling by keeping objects from referring to each other explicitly.", applicability: "When a set of objects communicate in well-defined but complex ways, resulting in interdependent relationships that are hard to understand." },
  { name: "Memento", category: "Design Patterns", subcategory: "Behavioral", intent: "Capture and externalize an object's internal state without violating encapsulation, so the object can be restored to this state later.", applicability: "When a snapshot of an object's state must be saved so it can be restored later, or when direct access to the object's state would violate encapsulation." },
  { name: "Observer", category: "Design Patterns", subcategory: "Behavioral", intent: "Define a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.", applicability: "When a change to one object requires changing unknown others, or when an object should be able to notify other objects without making assumptions about those objects." },
  { name: "State", category: "Design Patterns", subcategory: "Behavioral", intent: "Allow an object to alter its behavior when its internal state changes, appearing as if the object changed its class.", applicability: "When an object's behavior depends on its state, and it must change its behavior at run-time depending on that state." },
  { name: "Strategy", category: "Design Patterns", subcategory: "Behavioral", intent: "Define a family of algorithms, encapsulate each one, and make them interchangeable at run-time.", applicability: "When many related classes differ only in their behavior, or when you need different variants of an algorithm at run-time." },
  { name: "Template Method", category: "Design Patterns", subcategory: "Behavioral", intent: "Define the skeleton of an algorithm in a method, deferring some steps to subclasses, letting subclasses redefine certain steps without changing the algorithm's structure.", applicability: "When you want to let subclasses redefine certain steps of an algorithm without changing the algorithm's structure, or to control subclasses' extensions." },
  { name: "Visitor", category: "Design Patterns", subcategory: "Behavioral", intent: "Represent an operation to be performed on elements of an object structure, letting you define a new operation without changing the classes of the elements.", applicability: "When you want to perform many distinct operations across the elements of an object structure without changing the classes, or when the object structure is stable but operations change often." },
];

export function getReferenceData(): ReferenceEntry[] {
  return [...sortingData, ...searchingData, ...dataStructuresData, ...graphData, ...patternData];
}
