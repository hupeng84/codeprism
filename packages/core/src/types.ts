// ============================================================
// Core Type Definitions
// ============================================================

/** Single frame snapshot — state at one timestep */
export interface Frame<TState = unknown> {
  /** Frame number */
  step: number;
  /** Current data state */
  state: TState;
  /** Human-readable description of what's happening at this step */
  description: string;
  /** Code line to highlight (0-based, -1 = none) */
  highlightLine: number;
  /** Extra metadata for renderers */
  meta?: Record<string, unknown>;
}

/** Frame generator — takes input, yields frames */
export type FrameGenerator<TInput, TState> = (
  input: TInput
) => Generator<Frame<TState>, void, unknown>;

/** Difficulty level for content */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

/** Content category */
export type ContentCategory = 'pattern' | 'structure' | 'algorithm';

// ============================================================
// Real-world application scenarios
// ============================================================

/** Domain taxonomy for a real-world application scenario. */
export type ScenarioDomain =
  | "ui-framework"      // Frontend / UI frameworks
  | "database"          // Databases & storage
  | "system"            // OS / systems programming
  | "ai-ml"             // AI / machine learning
  | "game-dev"          // Game development
  | "network"           // Network / protocols
  | "devtools"          // Tooling / compilers
  | "library"           // Standard library / language built-ins
  | "business"          // Business / enterprise apps
  | "concurrency"       // Concurrent / parallel systems
  | "graphics"          // Graphics / rendering
  | "data-pipeline";    // ETL / streaming / pipelines

/**
 * A real-world application scenario for a design pattern, algorithm,
 * or data structure. Each scenario anchors an abstract concept to a
 * concrete system so learners can connect theory to industry practice.
 */
export interface Scenario {
  /** Stable identifier (e.g. "java-iterable"). Used as the i18n key suffix. */
  id: string;
  /**
   * Full i18n key for the scenario's translatable content.
   * Lookup shape: t(`${i18nKey}.title`) and t(`${i18nKey}.description`).
   */
  i18nKey: string;
  /** Application domain — drives badge color and filtering. */
  domain: ScenarioDomain;
  /** Emoji or short string used as the card's leading icon. */
  icon?: string;
  /** Short real-world anchor (e.g. "Java SDK, C# IEnumerable"). */
  reference?: string;
  /** Optional code snippet showing the concept in actual use. */
  codeSnippet?: {
    language: string;
    code: string;
  };
}

/** Unified content definition */
export interface ContentDefinition<TInput = unknown, TState = unknown> {
  id: string;
  slug: string;
  title: string;
  titleKey: string;
  category: ContentCategory;
  subcategory: string;
  difficulty: Difficulty;
  description: string;
  descKey: string;
  defaultInput: TInput;
  generator: FrameGenerator<TInput, TState>;
  code: string;
  language: string;
  complexity: {
    time: string;
    space: string;
  };
  tags: string[];
  icon: string;
  /** Optional list of real-world application scenarios. */
  scenarios?: Scenario[];
}

/** Steps for playback control */
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'completed';

// ============================================================
// Algorithm-specific types
// ============================================================

/** Sort array state */
export interface SortState {
  array: number[];
  /** indices being compared */
  comparing: number[];
  /** indices being swapped */
  swapping: number[];
  /** indices that are sorted */
  sorted: number[];
}

/** Search array state */
export interface SearchState {
  array: number[];
  /** current search range [low, high] */
  range: [number, number];
  /** mid point */
  mid: number;
  /** found index or -1 */
  found: number;
}

/** Binary tree node (for visualization) */
export interface TreeNode {
  id: string;
  value: number;
  x: number;
  y: number;
  left: TreeNode | null;
  right: TreeNode | null;
  /** highlight state */
  status: 'default' | 'visiting' | 'inserted' | 'deleted' | 'found';
}

/** Tree state */
export interface TreeState {
  root: TreeNode | null;
  /** operation being performed */
  operation: string;
}

// ============================================================
// DP Table types
// ============================================================

/** 2D DP table state for grid-based algorithms (knapsack, LCS, edit-distance) */
export interface TableState {
  grid: number[][];                      // 2D array [row][col]
  rows: number;                          // total row count
  cols: number;                          // total col count
  currentCell: [number, number] | null;  // [row, col] being computed
  comparingCells: [number, number][];    // cells being read for current computation
  sortedCells: [number, number][];       // cells that are finalized
  rowHeaders: string[];                  // e.g., ["(skip)", "item0", "item1", ...]
  colHeaders: string[];                  // e.g., ["0", "1", ..., "W"]
  currentValue: number | null;           // value being written to currentCell
}

// ============================================================
// Graph-specific types
// ============================================================

/** A node in a graph visualization */
export interface GraphNode {
  id: string;
  label: string;
  value: number;
  x: number;
  y: number;
  status: "default" | "visiting" | "visited" | "found" | "current";
}

/** An edge between two graph nodes */
export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  status: "default" | "traversing" | "traversed" | "highlighted";
}

/** Graph state for traversal visualization (DFS/BFS) */
export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visitedOrder: string[];
  operation: string;
}

// ============================================================
// List/Stack/Queue types
// ============================================================

export interface ListNode {
  id: string;
  value: number;
  status: "default" | "active" | "highlighted" | "found";
}

export interface ListState {
  nodes: ListNode[];
  operation: string;
  /** For stack: vertical orientation; for queue: horizontal */
  orientation: "horizontal" | "vertical";
}

// ============================================================
// Hash Table types
// ============================================================

export interface HashEntry {
  key: string;
  value: number;
  status: "default" | "active" | "collision" | "found";
}

export interface HashSlot {
  index: number;
  entries: HashEntry[];
  status: "empty" | "occupied" | "active";
}

export interface HashState {
  slots: HashSlot[];
  operation: string;
  size: number;
}

// ============================================================
// Design Pattern-specific types
// ============================================================

/** Object in a design pattern runtime visualization */
export interface PatternObject {
  id: string;
  name: string;
  type: string;
  state: Record<string, unknown>;
  position: { x: number; y: number };
  status: 'idle' | 'active' | 'highlighted';
}

/** Message passing between objects */
export interface PatternMessage {
  from: string;
  to: string;
  method: string;
  args: unknown[];
  status: 'pending' | 'active' | 'complete';
}

/** Design pattern runtime interaction frame */
export interface InteractionState {
  objects: PatternObject[];
  messages: PatternMessage[];
}

// ============================================================
// UML Class Diagram types
// ============================================================

/** UML attribute (field) in a class box */
export interface UMLAttribute {
  visibility: '+' | '-' | '#' | '~';
  name: string;
  type: string;
}

/** UML method in a class box */
export interface UMLMethod {
  visibility: '+' | '-' | '#' | '~';
  name: string;
  params: string;
  returnType: string;
}

/** UML relationship between two classes */
export interface UMLRelationship {
  from: string;   // class id
  to: string;     // class id
  type: 'extends' | 'implements' | 'composition' | 'aggregation' | 'association' | 'dependency';
  label?: string;
  fromMultiplicity?: string;
  toMultiplicity?: string;
}

/** UML class box */
export interface UMLClass {
  id: string;
  name: string;
  stereotype?: string;  // "«interface»", "«abstract»"
  attributes: UMLAttribute[];
  methods: UMLMethod[];
  position: { x: number; y: number };
}

/** UML class diagram — static structure of a design pattern */
export interface UMLClassDiagram {
  classes: UMLClass[];
  relationships: UMLRelationship[];
}
