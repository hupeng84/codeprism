import type { Frame, FrameGenerator, SortState, TableState, SearchState, InteractionState, GraphState, UMLClassDiagram, Scenario } from "@codeprism/core";

/** Multi-language code example entry */
export interface CodeExample {
  /** Source code as a string */
  code: string;
  /** Programming language identifier for Monaco syntax highlighting */
  language: string;
  /** Display label for the language tab */
  languageLabel: string;
}
import {
  bubbleSortContent,
  bubbleSortCodeLines,
  bubbleSortGenerator,
} from "./algorithms/bubble-sort";
import {
  insertionSortContent,
  insertionSortCodeLines,
  insertionSortGenerator,
} from "./algorithms/insertion-sort";
import {
  selectionSortContent,
  selectionSortCodeLines,
  selectionSortGenerator,
} from "./algorithms/selection-sort";
import {
  shellSortContent,
  shellSortCodeLines,
  shellSortGenerator,
} from "./algorithms/shell-sort";
import {
  countingSortContent,
  countingSortCodeLines,
  countingSortGenerator,
} from "./algorithms/counting-sort";
import {
  radixSortContent,
  radixSortCodeLines,
  radixSortGenerator,
} from "./algorithms/radix-sort";
import {
  bucketSortContent,
  bucketSortCodeLines,
  bucketSortGenerator,
} from "./algorithms/bucket-sort";
import {
  cocktailSortContent,
  cocktailSortCodeLines,
  cocktailSortGenerator,
} from "./algorithms/cocktail-sort";
import {
  combSortContent,
  combSortCodeLines,
  combSortGenerator,
} from "./algorithms/comb-sort";
import {
  oddEvenSortContent,
  oddEvenSortCodeLines,
  oddEvenSortGenerator,
} from "./algorithms/odd-even-sort";
import {
  quickSortContent,
  quickSortCodeLines,
  quickSortGenerator,
} from "./algorithms/quick-sort";
import {
  heapSortContent,
  heapSortCodeLines,
  heapSortGenerator,
} from "./algorithms/heap-sort";
import {
  mergeSortContent,
  mergeSortCodeLines,
  mergeSortGenerator,
} from "./algorithms/merge-sort";
import {
  binarySearchContent,
  binarySearchCodeLines,
  binarySearchGenerator,
} from "./algorithms/binary-search";
import {
  linearSearchContent,
  linearSearchCodeLines,
  linearSearchGenerator,
} from "./algorithms/linear-search";
import {
  interpolationSearchContent,
  interpolationSearchCodeLines,
  interpolationSearchGenerator,
} from "./algorithms/interpolation-search";
import {
  jumpSearchContent,
  jumpSearchCodeLines,
  jumpSearchGenerator,
} from "./algorithms/jump-search";
import {
  exponentialSearchContent,
  exponentialSearchCodeLines,
  exponentialSearchGenerator,
} from "./algorithms/exponential-search";
import {
  fibonacciSearchContent,
  fibonacciSearchCodeLines,
  fibonacciSearchGenerator,
} from "./algorithms/fibonacci-search";
import {
  ternarySearchContent,
  ternarySearchCodeLines,
  ternarySearchGenerator,
} from "./algorithms/ternary-search";
import { bstContent, bstCodeLines, bstGenerator } from "./structures/bst";
import { linkedListContent, linkedListCodeLines, linkedListGenerator } from "./structures/linked-list";
import { stackContent, stackCodeLines, stackGenerator } from "./structures/stack";
import { queueContent, queueCodeLines, queueGenerator } from "./structures/queue";
import { hashTableContent, hashTableCodeLines, hashTableGenerator } from "./structures/hash-table";
import { heapContent, heapCodeLines, heapGenerator } from "./structures/heap";
import { avlTreeContent, avlTreeCodeLines, avlTreeGenerator } from "./structures/avl-tree";
import { redBlackTreeContent, redBlackTreeCodeLines, redBlackTreeGenerator } from "./structures/red-black-tree";
import { trieContent, trieCodeLines, trieGenerator } from "./structures/trie";
import { unionFindContent, unionFindCodeLines, unionFindGenerator } from "./structures/union-find";
import { segmentTreeContent, segmentTreeCodeLines, segmentTreeGenerator } from "./structures/segment-tree";
import { fenwickTreeContent, fenwickTreeCodeLines, fenwickTreeGenerator } from "./structures/fenwick-tree";
import { skipListContent, skipListCodeLines, skipListGenerator } from "./structures/skip-list";
import { lruCacheContent, lruCacheCodeLines, lruCacheGenerator } from "./structures/lru-cache";
import { graphContent, graphCodeLines, graphGenerator } from "./structures/graph";
import { bloomContent as bloomFilterContent, bloomCodeLines as bloomFilterCodeLines, bloomFilterGenerator } from "./structures/bloom-filter";
import {
  decoratorContent,
  decoratorCodeLines,
  decoratorGenerator,
} from "./patterns/decorator";
import {
  observerContent,
  observerCodeLines,
  observerGenerator,
} from "./patterns/observer";
import { dfsContent, dfsCodeLines, dfsGenerator } from "./algorithms/dfs";
import { bfsContent, bfsCodeLines, bfsGenerator } from "./algorithms/bfs";
import { dijkstraContent, dijkstraCodeLines, dijkstraGenerator } from "./algorithms/dijkstra";
import { bellmanFordContent, bellmanFordCodeLines, bellmanFordGenerator } from "./algorithms/bellman-ford";
import { floydWarshallContent, floydWarshallCodeLines, floydWarshallGenerator } from "./algorithms/floyd-warshall";
import { primContent, primCodeLines, primGenerator, kruskalContent, kruskalCodeLines, kruskalGenerator } from "./algorithms/prim-kruskal";
import { topoContent as topoSortContent, topoCodeLines as topoSortCodeLines, topologicalSortGenerator as topoSortGenerator } from "./algorithms/topological-sort";
import { aStarContent, aStarCodeLines, aStarGenerator } from "./algorithms/a-star";
import { fibonacciContent, fibonacciCodeLines, fibonacciGenerator } from "./algorithms/fibonacci";
import { knapsackContent, knapsackCodeLines, knapsackGenerator } from "./algorithms/knapsack";
import { lcsContent, lcsCodeLines, lcsGenerator } from "./algorithms/lcs";
import { lisContent, lisCodeLines, lisGenerator } from "./algorithms/lis";
import { editDistanceContent, editDistanceCodeLines, editDistanceGenerator } from "./algorithms/edit-distance";
import { slidingWindowContent, slidingWindowCodeLines, slidingWindowGenerator } from "./algorithms/sliding-window";
import { twoPointersContent, twoPointersCodeLines, twoPointersGenerator } from "./algorithms/two-pointers";
import { nQueensContent, nQueensCodeLines, nQueensGenerator } from "./algorithms/n-queens";
// Pattern imports
import {
  iteratorContent,
  iteratorCodeLines,
  iteratorGenerator,
} from "./patterns/iterator";
import {
  mediatorContent,
  mediatorCodeLines,
  mediatorGenerator,
} from "./patterns/mediator";
import {
  mementoContent,
  mementoCodeLines,
  mementoGenerator,
} from "./patterns/memento";
import {
  stateContent,
  stateCodeLines,
  stateGenerator,
} from "./patterns/state";
import {
  strategyContent,
  strategyCodeLines,
  strategyGenerator,
} from "./patterns/strategy";
import {
  templateMethodContent,
  templateMethodCodeLines,
  templateMethodGenerator,
} from "./patterns/template-method";
import {
  visitorContent,
  visitorCodeLines,
  visitorGenerator,
} from "./patterns/visitor";
import {
  commandContent,
  commandCodeLines,
  commandGenerator,
} from "./patterns/command";
import {
  proxyContent,
  proxyCodeLines,
  proxyGenerator,
} from "./patterns/proxy";
import {
  compositeContent,
  compositeCodeLines,
  compositeGenerator,
} from "./patterns/composite";
import {
  flyweightContent,
  flyweightCodeLines,
  flyweightGenerator,
} from "./patterns/flyweight";
import {
  chainOfResponsibilityContent,
  chainOfResponsibilityCodeLines,
  chainOfResponsibilityGenerator,
} from "./patterns/chain-of-responsibility";
import {
  abstractFactoryContent,
  abstractFactoryCodeLines,
  abstractFactoryGenerator,
} from "./patterns/abstract-factory";
import {
  builderContent,
  builderCodeLines,
  builderGenerator,
} from "./patterns/builder";
import {
  prototypeContent,
  prototypeCodeLines,
  prototypeGenerator,
} from "./patterns/prototype";
import {
  factoryMethodContent,
  factoryMethodCodeLines,
  factoryMethodGenerator,
} from "./patterns/factory-method";
import {
  singletonContent,
  singletonCodeLines,
  singletonGenerator,
} from "./patterns/singleton";
import {
  adapterContent,
  adapterCodeLines,
  adapterGenerator,
} from "./patterns/adapter";
import {
  facadeContent,
  facadeCodeLines,
  facadeGenerator,
} from "./patterns/facade";
import {
  bridgeContent,
  bridgeCodeLines,
  bridgeGenerator,
} from "./patterns/bridge";
import {
  interpreterContent,
  interpreterCodeLines,
  interpreterGenerator,
} from "./patterns/interpreter";

// ── Algorithm Content ──

/**
 * Algorithm content definition.
 * Contains metadata, generator, and code for a specific algorithm.
 */
export interface AlgorithmContent {
  /** Unique identifier for the algorithm */
  id: string;
  /** URL-friendly slug for routing */
  slug: string;
  /** Display name in Chinese */
  title: string;
  /** i18n key for English title */
  titleKey: string;
  /** Content category */
  category: "algorithm";
  /** Algorithm subcategory (e.g., "sorting", "searching", "dp") */
  subcategory: string;
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Description in Chinese */
  description: string;
  /** i18n key for English description */
  descKey: string;
  /** Default input array for visualization */
  defaultInput: number[];
  /** Generator function that produces visualization frames */
  generator: FrameGenerator<number[], SortState | TableState>;
  /** Source code as a single string */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Time and space complexity */
  complexity: { time: string; space: string };
  /** Content tags for filtering */
  tags: string[];
  /** Emoji icon for display */
  icon: string;
  /** Source code split into lines (optional, computed if not provided) */
  codeLines?: string[];
  /** Multi-language code examples (keyed by language identifier) */
  codeExamples?: Record<string, CodeExample>;
  /** Real-world application scenarios (optional, see Scenario). */
  scenarios?: Scenario[];
}

/** Registry of all algorithm content, keyed by slug */
export const algorithms: Record<string, AlgorithmContent> = {
  "bubble-sort": {
    ...bubbleSortContent,
    generator: bubbleSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: bubbleSortCodeLines,
  },
  "insertion-sort": {
    ...insertionSortContent,
    generator: insertionSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: insertionSortCodeLines,
  },
  "selection-sort": {
    ...selectionSortContent,
    generator: selectionSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: selectionSortCodeLines,
  },
  "shell-sort": {
    ...shellSortContent,
    generator: shellSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: shellSortCodeLines,
  },
  "counting-sort": {
    ...countingSortContent,
    generator: countingSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: countingSortCodeLines,
  },
  "radix-sort": {
    ...radixSortContent,
    generator: radixSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: radixSortCodeLines,
  },
  "bucket-sort": {
    ...bucketSortContent,
    generator: bucketSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: bucketSortCodeLines,
  },
  "cocktail-sort": {
    ...cocktailSortContent,
    generator: cocktailSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: cocktailSortCodeLines,
  },
  "comb-sort": {
    ...combSortContent,
    generator: combSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: combSortCodeLines,
  },
  "odd-even-sort": {
    ...oddEvenSortContent,
    generator: oddEvenSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: oddEvenSortCodeLines,
  },
  "quick-sort": {
    ...quickSortContent,
    generator: quickSortGenerator as FrameGenerator<number[], SortState>,
    codeLines: quickSortCodeLines,
  },
  "heap-sort": {
    ...heapSortContent,
    generator: heapSortGenerator,
    codeLines: heapSortCodeLines,
  },
  "merge-sort": {
    ...mergeSortContent,
    generator: mergeSortGenerator,
    codeLines: mergeSortCodeLines,
  },
  "fibonacci": {
    ...fibonacciContent,
    generator: fibonacciGenerator as FrameGenerator<number[], SortState>,
    codeLines: fibonacciCodeLines,
  },
  "knapsack": {
    ...knapsackContent,
    generator: knapsackGenerator as FrameGenerator<number[], SortState | TableState>,
    codeLines: knapsackCodeLines,
  },
  "lcs": {
    ...lcsContent,
    generator: lcsGenerator as FrameGenerator<number[], SortState | TableState>,
    codeLines: lcsCodeLines,
  },
  "lis": {
    ...lisContent,
    generator: lisGenerator as FrameGenerator<number[], SortState>,
    codeLines: lisCodeLines,
  },
  "edit-distance": {
    ...editDistanceContent,
    generator: editDistanceGenerator as FrameGenerator<number[], SortState | TableState>,
    codeLines: editDistanceCodeLines,
  },
  "sliding-window": {
    ...slidingWindowContent,
    generator: slidingWindowGenerator as FrameGenerator<number[], SortState>,
    codeLines: slidingWindowCodeLines,
  },
  "two-pointers": {
    ...twoPointersContent,
    generator: twoPointersGenerator as FrameGenerator<number[], SortState>,
    codeLines: twoPointersCodeLines,
  },
  "n-queens": {
    ...nQueensContent,
    generator: nQueensGenerator as FrameGenerator<number[], SortState>,
    codeLines: nQueensCodeLines,
  },
};

/**
 * Get an algorithm by its slug.
 * @param slug - The URL-friendly identifier for the algorithm
 * @returns The algorithm content, or undefined if not found
 */
export function getAlgorithm(slug: string): AlgorithmContent | undefined {
  return algorithms[slug];
}

/**
 * Get all algorithm content as an array.
 * @returns Array of all algorithm content definitions
 */
export function getAllAlgorithms(): AlgorithmContent[] {
  return Object.values(algorithms);
}

// ── Search Content ──

/**
 * Search algorithm content definition.
 * Contains metadata, generator, and code for a specific search algorithm.
 */
export interface SearchContent {
  /** Unique identifier for the search algorithm */
  id: string;
  /** URL-friendly slug for routing */
  slug: string;
  /** Display name in Chinese */
  title: string;
  /** i18n key for English title */
  titleKey: string;
  /** Content category */
  category: "search";
  /** Search subcategory (e.g., "linear", "binary") */
  subcategory: string;
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Description in Chinese */
  description: string;
  /** i18n key for English description */
  descKey: string;
  /** Default input array for visualization */
  defaultInput: number[];
  /** Generator function that produces visualization frames */
  generator: FrameGenerator<number[], SearchState>;
  /** Source code as a single string */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Time and space complexity */
  complexity: { time: string; space: string };
  /** Content tags for filtering */
  tags: string[];
  /** Emoji icon for display */
  icon: string;
  /** Source code split into lines (optional, computed if not provided) */
  codeLines?: string[];
  /** Multi-language code examples (keyed by language identifier) */
  codeExamples?: Record<string, CodeExample>;
  /** Real-world application scenarios (optional, see Scenario). */
  scenarios?: Scenario[];
}

/** Registry of all search algorithm content, keyed by slug */
export const searches: Record<string, SearchContent> = {
  "binary-search": {
    ...binarySearchContent,
    generator: binarySearchGenerator,
    codeLines: binarySearchCodeLines,
  },
  "linear-search": {
    ...linearSearchContent,
    generator: linearSearchGenerator,
    codeLines: linearSearchCodeLines,
  },
  "interpolation-search": {
    ...interpolationSearchContent,
    generator: interpolationSearchGenerator,
    codeLines: interpolationSearchCodeLines,
  },
  "jump-search": {
    ...jumpSearchContent,
    generator: jumpSearchGenerator,
    codeLines: jumpSearchCodeLines,
  },
  "exponential-search": {
    ...exponentialSearchContent,
    generator: exponentialSearchGenerator,
    codeLines: exponentialSearchCodeLines,
  },
  "fibonacci-search": {
    ...fibonacciSearchContent,
    generator: fibonacciSearchGenerator,
    codeLines: fibonacciSearchCodeLines,
  },
  "ternary-search": {
    ...ternarySearchContent,
    generator: ternarySearchGenerator,
    codeLines: ternarySearchCodeLines,
  },
};

/**
 * Get a search algorithm by its slug.
 * @param slug - The URL-friendly identifier for the search algorithm
 * @returns The search content, or undefined if not found
 */
export function getSearch(slug: string): SearchContent | undefined {
  return searches[slug];
}

/**
 * Get all search algorithm content as an array.
 * @returns Array of all search content definitions
 */
export function getAllSearches(): SearchContent[] {
  return Object.values(searches);
}

// ── Graph Content ──

/** Generator type for graph visualization frames */
export type GraphFrameGenerator = () => Generator<Frame<GraphState>, void, unknown>;

/**
 * Graph algorithm content definition.
 * Contains metadata, generator, and code for a specific graph algorithm.
 */
export interface GraphContent {
  /** Unique identifier for the graph algorithm */
  id: string;
  /** URL-friendly slug for routing */
  slug: string;
  /** Display name in Chinese */
  title: string;
  /** i18n key for English title */
  titleKey: string;
  /** Content category */
  category: "graph";
  /** Graph algorithm subcategory (e.g., "traversal", "shortest-path") */
  subcategory: string;
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Description in Chinese */
  description: string;
  /** i18n key for English description */
  descKey: string;
  /** Default input (undefined for graph algorithms - they use built-in graphs) */
  defaultInput?: undefined;
  /** Generator function that produces visualization frames */
  generator: GraphFrameGenerator;
  /** Source code as a single string */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Time and space complexity */
  complexity: { time: string; space: string };
  /** Content tags for filtering */
  tags: string[];
  /** Emoji icon for display */
  icon: string;
  /** Source code split into lines (optional, computed if not provided) */
  codeLines?: string[];
  /** Multi-language code examples (keyed by language identifier) */
  codeExamples?: Record<string, CodeExample>;
  /** Real-world application scenarios (optional, see Scenario). */
  scenarios?: Scenario[];
}

/** Registry of all graph algorithm content, keyed by slug */
export const graphs: Record<string, GraphContent> = {
  dfs: {
    ...dfsContent,
    generator: dfsGenerator,
    codeLines: dfsCodeLines,
  },
  bfs: {
    ...bfsContent,
    generator: bfsGenerator,
    codeLines: bfsCodeLines,
  },
  dijkstra: {
    ...dijkstraContent,
    generator: dijkstraGenerator,
    codeLines: dijkstraCodeLines,
  },
  "bellman-ford": {
    ...bellmanFordContent,
    generator: bellmanFordGenerator,
    codeLines: bellmanFordCodeLines,
  },
  "floyd-warshall": {
    ...floydWarshallContent,
    generator: floydWarshallGenerator,
    codeLines: floydWarshallCodeLines,
  },
  prim: {
    ...primContent,
    generator: primGenerator,
    codeLines: primCodeLines,
  },
  kruskal: {
    ...kruskalContent,
    generator: kruskalGenerator,
    codeLines: kruskalCodeLines,
  },
  "topological-sort": {
    ...topoSortContent,
    generator: topoSortGenerator,
    codeLines: topoSortCodeLines,
  },
  "a-star": {
    ...aStarContent,
    generator: aStarGenerator,
    codeLines: aStarCodeLines,
  },
};

/**
 * Get a graph algorithm by its slug.
 * @param slug - The URL-friendly identifier for the graph algorithm
 * @returns The graph content, or undefined if not found
 */
export function getGraph(slug: string): GraphContent | undefined {
  return graphs[slug];
}

/**
 * Get all graph algorithm content as an array.
 * @returns Array of all graph content definitions
 */
export function getAllGraphs(): GraphContent[] {
  return Object.values(graphs);
}

// ── Pattern Content ──

/** Generator type for pattern visualization frames */
export type PatternFrameGenerator = () => Generator<Frame<InteractionState>, void, unknown>;

/**
 * Design pattern content definition.
 * Contains metadata, generator, and code for a specific GoF design pattern.
 */
export interface PatternContent {
  /** Unique identifier for the pattern */
  id: string;
  /** URL-friendly slug for routing */
  slug: string;
  /** Display name in Chinese */
  title: string;
  /** i18n key for English title */
  titleKey: string;
  /** Content category */
  category: "pattern";
  /** Pattern subcategory (e.g., "creational", "structural", "behavioral") */
  subcategory: string;
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Description in Chinese */
  description: string;
  /** i18n key for English description */
  descKey: string;
  /** Default input (undefined for patterns - they use built-in scenarios) */
  defaultInput?: undefined;
  /** Generator function that produces visualization frames */
  generator: PatternFrameGenerator;
  /** Source code as a single string */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Time and space complexity */
  complexity: { time: string; space: string };
  /** Content tags for filtering */
  tags: string[];
  /** Emoji icon for display */
  icon: string;
  /** Source code split into lines (optional, computed if not provided) */
  codeLines?: string[];
  /** Multi-language code examples (keyed by language identifier) */
  codeExamples?: Record<string, CodeExample>;
  /** Real-world application scenarios (optional, see Scenario). */
  scenarios?: Scenario[];
  /** Optional UML class diagram for the pattern */
  diagram?: UMLClassDiagram;
}

// ── Structure Content ──

/**
 * Data structure content definition.
 * Contains metadata, generator, and code for a specific data structure.
 */
export interface StructureContent {
  /** Unique identifier for the data structure */
  id: string;
  /** URL-friendly slug for routing */
  slug: string;
  /** Display name in Chinese */
  title: string;
  /** i18n key for English title */
  titleKey: string;
  /** Content category */
  category: "structure";
  /** Structure subcategory (e.g., "linear", "tree", "hash") */
  subcategory: string;
  /** Difficulty level */
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Description in Chinese */
  description: string;
  /** i18n key for English description */
  descKey: string;
  /** Default input (undefined for structures - they use built-in examples) */
  defaultInput?: undefined;
  /** Generator function that produces visualization frames */
  generator: () => Generator<Frame<unknown>, void, unknown>;
  /** Source code as a single string */
  code: string;
  /** Programming language for syntax highlighting */
  language: string;
  /** Time and space complexity */
  complexity: { time: string; space: string };
  /** Content tags for filtering */
  tags: string[];
  /** Emoji icon for display */
  icon: string;
  /** Source code split into lines (optional, computed if not provided) */
  codeLines?: string[];
  /** Multi-language code examples (keyed by language identifier) */
  codeExamples?: Record<string, CodeExample>;
  /** Real-world application scenarios (optional, see Scenario). */
  scenarios?: Scenario[];
}

/** Registry of all data structure content, keyed by slug */
export const structures: Record<string, StructureContent> = {
  bst: {
    ...bstContent,
    generator: bstGenerator,
    codeLines: bstCodeLines,
  },
  "linked-list": {
    ...linkedListContent,
    generator: linkedListGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: linkedListCodeLines,
  },
  stack: {
    ...stackContent,
    generator: stackGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: stackCodeLines,
  },
  queue: {
    ...queueContent,
    generator: queueGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: queueCodeLines,
  },
  "hash-table": {
    ...hashTableContent,
    generator: hashTableGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: hashTableCodeLines,
  },
  heap: {
    ...heapContent,
    generator: heapGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: heapCodeLines,
  },
  "avl-tree": {
    ...avlTreeContent,
    generator: avlTreeGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: avlTreeCodeLines,
  },
  "red-black-tree": {
    ...redBlackTreeContent,
    generator: redBlackTreeGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: redBlackTreeCodeLines,
  },
  "trie": {
    ...trieContent,
    generator: trieGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: trieCodeLines,
  },
  "union-find": {
    ...unionFindContent,
    generator: unionFindGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: unionFindCodeLines,
  },
  "segment-tree": {
    ...segmentTreeContent,
    generator: segmentTreeGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: segmentTreeCodeLines,
  },
  "fenwick-tree": {
    ...fenwickTreeContent,
    generator: fenwickTreeGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: fenwickTreeCodeLines,
  },
  "skip-list": {
    ...skipListContent,
    generator: skipListGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: skipListCodeLines,
  },
  "lru-cache": {
    ...lruCacheContent,
    generator: lruCacheGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: lruCacheCodeLines,
  },
  "graph-bfs": {
    ...graphContent,
    generator: graphGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: graphCodeLines,
  },
  "bloom-filter": {
    ...bloomFilterContent,
    generator: bloomFilterGenerator as unknown as () => Generator<Frame<unknown>, void, unknown>,
    codeLines: bloomFilterCodeLines,
  },
};

/**
 * Get a data structure by its slug.
 * @param slug - The URL-friendly identifier for the data structure
 * @returns The structure content, or undefined if not found
 */
export function getStructure(slug: string): StructureContent | undefined {
  return structures[slug];
}

/**
 * Get all data structure content as an array.
 * @returns Array of all structure content definitions
 */
export function getAllStructures(): StructureContent[] {
  return Object.values(structures);
}

// ── Patterns ──

/** Registry of all design pattern content, keyed by slug */
export const patterns: Record<string, PatternContent> = {
  // Creational patterns
  "singleton": {
    ...singletonContent,
    generator: singletonGenerator,
    codeLines: singletonCodeLines,
  },
  "factory-method": {
    ...factoryMethodContent,
    generator: factoryMethodGenerator,
    codeLines: factoryMethodCodeLines,
  },
  "abstract-factory": {
    ...abstractFactoryContent,
    generator: abstractFactoryGenerator,
    codeLines: abstractFactoryCodeLines,
  },
  "builder": {
    ...builderContent,
    generator: builderGenerator,
    codeLines: builderCodeLines,
  },
  "prototype": {
    ...prototypeContent,
    generator: prototypeGenerator,
    codeLines: prototypeCodeLines,
  },
  // Structural patterns
  "adapter": {
    ...adapterContent,
    generator: adapterGenerator,
    codeLines: adapterCodeLines,
  },
  "bridge": {
    ...bridgeContent,
    generator: bridgeGenerator,
    codeLines: bridgeCodeLines,
  },
  "composite": {
    ...compositeContent,
    generator: compositeGenerator,
    codeLines: compositeCodeLines,
  },
  "decorator": {
    ...decoratorContent,
    generator: decoratorGenerator,
    codeLines: decoratorCodeLines,
  },
  "facade": {
    ...facadeContent,
    generator: facadeGenerator,
    codeLines: facadeCodeLines,
  },
  "flyweight": {
    ...flyweightContent,
    generator: flyweightGenerator,
    codeLines: flyweightCodeLines,
  },
  "proxy": {
    ...proxyContent,
    generator: proxyGenerator,
    codeLines: proxyCodeLines,
  },
  // Behavioral patterns
  "chain-of-responsibility": {
    ...chainOfResponsibilityContent,
    generator: chainOfResponsibilityGenerator,
    codeLines: chainOfResponsibilityCodeLines,
  },
  "command": {
    ...commandContent,
    generator: commandGenerator,
    codeLines: commandCodeLines,
  },
  "interpreter": {
    ...interpreterContent,
    generator: interpreterGenerator,
    codeLines: interpreterCodeLines,
  },
  "iterator": {
    ...iteratorContent,
    generator: iteratorGenerator,
    codeLines: iteratorCodeLines,
  },
  "mediator": {
    ...mediatorContent,
    generator: mediatorGenerator,
    codeLines: mediatorCodeLines,
  },
  "memento": {
    ...mementoContent,
    generator: mementoGenerator,
    codeLines: mementoCodeLines,
  },
  "observer": {
    ...observerContent,
    generator: observerGenerator,
    codeLines: observerCodeLines,
  },
  "state": {
    ...stateContent,
    generator: stateGenerator,
    codeLines: stateCodeLines,
  },
  "strategy": {
    ...strategyContent,
    generator: strategyGenerator,
    codeLines: strategyCodeLines,
  },
  "template-method": {
    ...templateMethodContent,
    generator: templateMethodGenerator,
    codeLines: templateMethodCodeLines,
  },
  "visitor": {
    ...visitorContent,
    generator: visitorGenerator,
    codeLines: visitorCodeLines,
  },
};

/**
 * Get a design pattern by its slug.
 * @param slug - The URL-friendly identifier for the pattern
 * @returns The pattern content, or undefined if not found
 */
export function getPattern(slug: string): PatternContent | undefined {
  return patterns[slug];
}

/**
 * Get all design pattern content as an array.
 * @returns Array of all pattern content definitions
 */
export function getAllPatterns(): PatternContent[] {
  return Object.values(patterns);
}

// ── Unified lookup ──

/**
 * Get content by category and slug.
 * This is the main lookup function for all content types.
 * @param category - The content category (algorithm, pattern, structure, search, graph)
 * @param slug - The URL-friendly identifier for the content
 * @returns The content definition, or undefined if not found
 */
export function getContent(category: string, slug: string) {
  if (category === "algorithm") return getAlgorithm(slug);
  if (category === "pattern") return getPattern(slug);
  if (category === "structure") return getStructure(slug);
  if (category === "search") return getSearch(slug);
  if (category === "graph") return getGraph(slug);
  return undefined;
}

// ── Type guards ──

/**
 * Type guard to check if content is an algorithm.
 * @param c - Content to check
 * @returns True if the content is an algorithm
 */
export function isAlgorithmContent(
  c: AlgorithmContent | PatternContent
): c is AlgorithmContent {
  return c.category === "algorithm";
}

/** Union type for all content types */
export type AnyContent = AlgorithmContent | PatternContent | StructureContent | SearchContent | GraphContent;

/**
 * Type guard to check if content is a pattern.
 * @param c - Content to check
 * @returns True if the content is a pattern
 */
export function isPatternContent(
  c: AnyContent
): c is PatternContent {
  return c.category === "pattern";
}

/**
 * Type guard to check if content is a data structure.
 * @param c - Content to check
 * @returns True if the content is a data structure
 */
export function isStructureContent(
  c: AnyContent
): c is StructureContent {
  return c.category === "structure";
}

/**
 * Type guard to check if content is a search algorithm.
 * @param c - Content to check
 * @returns True if the content is a search algorithm
 */
export function isSearchContent(
  c: AnyContent
): c is SearchContent {
  return c.category === "search";
}

/**
 * Type guard to check if content is a graph algorithm.
 * @param c - Content to check
 * @returns True if the content is a graph algorithm
 */
export function isGraphContent(
  c: AnyContent
): c is GraphContent {
  return c.category === "graph";
}

// ── Frame helpers ──

/**
 * Generate all visualization frames for a content item.
 * For algorithms and search, uses the provided input or default input.
 * For patterns, structures, and graphs, uses built-in examples.
 * @param content - The content definition
 * @param customInput - Optional custom input array (only for algorithms/search)
 * @returns Array of visualization frames
 */
export function getContentFrames(
  content: AnyContent,
  customInput?: number[]
): Frame<unknown>[] {
  const frames: Frame<unknown>[] = [];
  if (content.category === "algorithm" || content.category === "search") {
    const input = customInput ?? content.defaultInput;
    for (const f of content.generator(input)) {
      frames.push(f);
    }
  } else {
    for (const f of content.generator()) {
      frames.push(f);
    }
  }
  return frames;
}

/**
 * Get the source code lines for a content item.
 * Uses pre-split codeLines if available, otherwise splits the code string.
 * @param content - The content definition
 * @returns Array of code lines
 */
export function getContentCodeLines(content: AnyContent): string[] {
  return content.codeLines ?? content.code.split("\n");
}

// ── Reference Data ──

export { getReferenceData } from "./reference-data";
export type { ReferenceEntry, ReferencePattern } from "./reference-data";

export { BADGES, CATEGORY_TOTALS, evaluateBadges, badgeProgress } from "./badges";
export type { BadgeId, BadgeDef } from "./badges";
