// P2+P3 i18n integration: 38 algorithms + 16 structures.

const fs = require("fs");
const path = require("path");

const EN_PATH = path.resolve("src/messages/en.json");
const ZH_PATH = path.resolve("src/messages/zh.json");

// ============================================================
// Scenarios data — compiled from agent reports.
// Key: algorithm/structure slug. Value: { scenarioId: { en, zh } }
// ============================================================

const ALGORITHM_SCENARIOS = {
  // 13 sorting (agent 1)
  "bubble-sort": {
    "ntfs-small-segments": {
      en: { title: "NTFS Small Segment Sorting", description: "NTFS uses bubble sort for small unsorted file segments under 16 entries where overhead of complex sorts isn't justified." },
      zh: { title: "NTFS 小文件段排序", description: "NTFS对小于16条的无序文件段使用冒泡排序，避免复杂排序的额外开销。" },
    },
    "nearly-sorted-reactivity": {
      en: { title: "Nearly-Sorted UI Lists", description: "UI frameworks like React encounter nearly-sorted arrays in reconciliation — optimized bubble sort exits in O(n) with early termination." },
      zh: { title: "近乎有序的UI列表", description: "React等UI框架在协调时遇到近乎有序的数组，优化冒泡排序可通过提前终止在O(n)内完成。" },
    },
    "algorithm-visualization": {
      en: { title: "Algorithm Visualization Tools", description: "Educational platforms like Visualgo and Sorting.at use bubble sort as the introductory sorting visualization." },
      zh: { title: "算法可视化工具", description: "Visualgo和Sorting.at等教育平台使用冒泡排序作为入门排序可视化。" },
    },
  },
  "insertion-sort": {
    "timsort-small-runs": {
      en: { title: "Timsort Small Run Fallback", description: "Java's DualPivotQuicksort and V8's Timsort fall back to insertion sort for subarrays under 32-64 elements." },
      zh: { title: "Timsort 小段回退", description: "Java的DualPivotQuicksort和V8的Timsort对32-64个元素的子数组回退使用插入排序。" },
    },
    "online-card-sorting": {
      en: { title: "Online Card & List Insertion", description: "Card games, Kanban boards, and Trello use insertion sort — each new item is placed into its correct position." },
      zh: { title: "在线卡片与列表插入", description: "纸牌游戏、看板和Trello使用插入排序，将每个新项目插入正确位置。" },
    },
    "nearly-sorted-collections": {
      en: { title: "Nearly-Sorted Data Pipelines", description: "Kafka log compaction and LSM-tree merging produce nearly-sorted runs where insertion sort excels." },
      zh: { title: "近乎有序的数据管道", description: "Kafka日志压缩和LSM树合并产生近乎有序的段，插入排序在此表现优异。" },
    },
  },
  "selection-sort": {
    "flash-memory-minimal-writes": {
      en: { title: "Flash Memory Minimal Writes", description: "Selection sort performs O(n) swaps, making it ideal for EEPROM and NOR flash where write cycles are limited." },
      zh: { title: "闪存最小写入排序", description: "选择排序仅执行O(n)次交换，适合写入周期有限的EEPROM和NOR闪存。" },
    },
    "embedded-constrained-sort": {
      en: { title: "Embedded Constrained Sorting", description: "Arduino sort.h and microcontroller routines use selection sort for its minimal code footprint and zero extra memory." },
      zh: { title: "嵌入式受限排序", description: "Arduino sort.h和微控制器排序例程使用选择排序，代码体积最小且无需额外内存。" },
    },
    "educational-algorithm": {
      en: { title: "CS Education Standard", description: "CS50, MIT 6.006, and Princeton Algorithms teach selection sort as the simplest O(n²) sort." },
      zh: { title: "计算机科学教育标准", description: "CS50、MIT 6.006和普林斯顿算法课程将选择排序作为最简单的O(n²)排序教授。" },
    },
  },
  "shell-sort": {
    "uclibc-embedded-libc": {
      en: { title: "uClibc Embedded qsort", description: "uClibc and musl libc use shell sort with Knuth gap sequence as a lightweight qsort fallback for constrained systems." },
      zh: { title: "uClibc 嵌入式 qsort", description: "uClibc和musl libc使用Knuth间隔序列的希尔排序作为轻量级qsort回退。" },
    },
    "embedded-database-index": {
      en: { title: "Embedded Database Index Sorting", description: "SQLite in-memory sorts and LevelDB memtable operations use shell sort for small index segments." },
      zh: { title: "嵌入式数据库索引排序", description: "SQLite内存排序和LevelDB memtable操作对小索引段使用希尔排序。" },
    },
    "network-packet-buffer": {
      en: { title: "Network Packet Buffer Sorting", description: "Linux kernel inet_frag_queue and BSD mbuf sorting use shell sort for reassembling small packet fragments." },
      zh: { title: "网络数据包缓冲排序", description: "Linux内核inet_frag_queue和BSD mbuf排序使用希尔排序重组小数据包片段。" },
    },
  },
  "counting-sort": {
    "radix-sort-subroutine": {
      en: { title: "Radix Sort Stable Subroutine", description: "Counting sort is the core stable subroutine in radix sort, enabling O(n+k) digit-by-digit sorting." },
      zh: { title: "基数排序稳定子程序", description: "计数排序是基数排序的核心稳定子程序，实现O(n+k)逐位排序。" },
    },
    "histogram-equalization": {
      en: { title: "Image Histogram Equalization", description: "OpenCV equalizeHist and GPU shader pipelines use counting sort for pixel intensity histogram operations." },
      zh: { title: "图像直方图均衡化", description: "OpenCV equalizeHist和GPU着色器管线使用计数排序处理像素强度直方图。" },
    },
    "database-statistics": {
      en: { title: "Database Column Statistics", description: "PostgreSQL ANALYZE and MySQL histogram stats use counting-based approaches for distinct value estimation." },
      zh: { title: "数据库列统计", description: "PostgreSQL ANALYZE和MySQL直方图统计使用基于计数的方法估算不同值。" },
    },
  },
  "radix-sort": {
    "unix-external-sort": {
      en: { title: "Unix External Sort Command", description: "GNU sort and BSD sort historically used radix-based approaches for sorting large text files with limited memory." },
      zh: { title: "Unix外部排序命令", description: "GNU sort和BSD sort历史上使用基于基数的方法在有限内存下排序大文本文件。" },
    },
    "suffix-array-construction": {
      en: { title: "Suffix Array & Text Indexing", description: "Elasticsearch BM25 and Lucene index construction use radix sort for building suffix arrays efficiently." },
      zh: { title: "后缀数组与文本索引", description: "Elasticsearch BM25和Lucene索引构建使用基数排序高效构建后缀数组。" },
    },
    "database-integer-index": {
      en: { title: "Database Integer Primary Key Sort", description: "SQLite autoincrement and MySQL InnoDB primary keys benefit from radix sort's O(dn) complexity on integer data." },
      zh: { title: "数据库整数主键排序", description: "SQLite自增和MySQL InnoDB主键受益于基数排序在整数数据上的O(dn)复杂度。" },
    },
  },
  "bucket-sort": {
    "mapreduce-shuffle": {
      en: { title: "MapReduce Shuffle & Partition", description: "Hadoop and Spark use bucket-based distribution in the shuffle phase, partitioning keys across reducers before per-bucket sorting." },
      zh: { title: "MapReduce Shuffle 与分区", description: "Hadoop和Spark在shuffle阶段使用基于桶的分布，将键分区到reducer后在桶内排序。" },
    },
    "uniform-float-sorting": {
      en: { title: "Uniform Float Distribution Sorting", description: "NumPy percentile and Scikit-learn quantile computations leverage bucket sort for uniformly distributed floating-point data." },
      zh: { title: "均匀浮点分布排序", description: "NumPy百分位数和Scikit-learn分位数计算利用桶排序处理均匀分布的浮点数据。" },
    },
    "dns-record-distribution": {
      en: { title: "DNS Record Bucket Distribution", description: "BIND9 zone sorting and dnsmasq query caches use bucket-based approaches for DNS record organization." },
      zh: { title: "DNS记录桶分布", description: "BIND9区域排序和dnsmasq查询缓存使用基于桶的方法组织DNS记录。" },
    },
  },
  "cocktail-sort": {
    "desktop-widget-sorting": {
      en: { title: "Desktop Widget Bidirectional Sort", description: "WPF ListBox and Qt QListView use bidirectional passes for sorting small UI element collections efficiently." },
      zh: { title: "桌面组件双向排序", description: "WPF ListBox和Qt QListView使用双向遍历高效排序小型UI元素集合。" },
    },
    "teaching-bidirectional": {
      en: { title: "Bidirectional Sort Education", description: "Algorithm textbooks compare cocktail sort against bubble sort to teach bidirectional optimization concepts." },
      zh: { title: "双向排序教学", description: "算法教科书将鸡尾酒排序与冒泡排序对比，教授双向优化概念。" },
    },
    "small-callback-sort": {
      en: { title: "Small Collection Callback Sort", description: "Underscore.js sortBy and Lodash orderBy handle small arrays where bidirectional passes reduce worst-case swaps." },
      zh: { title: "小型集合回调排序", description: "Underscore.js sortBy和Lodash orderBy处理小数组，双向遍历减少最坏情况交换次数。" },
    },
  },
  "comb-sort": {
    "legacy-rendering-sort": {
      en: { title: "Legacy 3D Engine Sorting", description: "OGRE 3D and Irrlicht engine used comb sort for draw call sorting where quicksort overhead was undesirable." },
      zh: { title: "遗留3D引擎排序", description: "OGRE 3D和Irrlicht引擎使用梳排序进行绘制调用排序，避免快速排序的额外开销。" },
    },
    "real-time-game-entities": {
      en: { title: "Real-Time Game Entity Z-Sort", description: "Unity ECS and Godot draw order use comb sort's gap-shrinking to quickly eliminate turtles in entity lists." },
      zh: { title: "实时游戏实体Z轴排序", description: "Unity ECS和Godot绘制顺序使用梳排序的间隔缩减快速消除实体列表中的小值滞后。" },
    },
    "embedded-iot-sorting": {
      en: { title: "Embedded IoT Sensor Sorting", description: "Arduino and ESP-IDF sensor queues use comb sort for its simplicity and O(1) space with near-quick-sort performance." },
      zh: { title: "嵌入式物联网传感器排序", description: "Arduino和ESP-IDF传感器队列使用梳排序，实现O(1)空间和接近快速排序的性能。" },
    },
  },
  "odd-even-sort": {
    "gpu-parallel-sorting": {
      en: { title: "GPU Parallel Sorting Networks", description: "CUDA and OpenCL use odd-even sorting's embarrassingly parallel phases for GPU-accelerated sort operations." },
      zh: { title: "GPU并行排序网络", description: "CUDA和OpenCL利用奇偶排序的天然并行阶段实现GPU加速排序操作。" },
    },
    "sorting-network-hardware": {
      en: { title: "FPGA Sorting Network Implementation", description: "FPGA and ASIC designs implement odd-even compare-exchange units for hardware-accelerated sorting." },
      zh: { title: "FPGA排序网络实现", description: "FPGA和ASIC设计实现奇偶比较交换单元用于硬件加速排序。" },
    },
    "distributed-key-sort": {
      en: { title: "Distributed Key-Value Sorting", description: "Hadoop TeraSort and MPI implementations use odd-even merge for distributed sorting across cluster nodes." },
      zh: { title: "分布式键值排序", description: "Hadoop TeraSort和MPI实现使用奇偶归并在集群节点间进行分布式排序。" },
    },
  },
  "quick-sort": {
    "c-qsort-libc": {
      en: { title: "C Standard Library qsort", description: "glibc qsort combines quicksort with heapsort fallback, avoiding worst-case O(n²) on adversarial inputs via introsort." },
      zh: { title: "C标准库 qsort", description: "glibc qsort结合快速排序与堆排序回退，通过内省排序避免对抗输入的O(n²)最坏情况。" },
    },
    "java-dual-pivot-primitives": {
      en: { title: "Java DualPivotQuicksort", description: "OpenJDK's Arrays.sort for primitives uses dual-pivot quicksort, the fastest general-purpose sort for primitive arrays." },
      zh: { title: "Java 双轴快速排序", description: "OpenJDK的Arrays.sort对基本类型使用双轴快速排序，是基本类型数组最快的通用排序。" },
    },
    "database-in-memory-sort": {
      en: { title: "Database In-Memory Sort Path", description: "PostgreSQL and MySQL use quicksort for in-memory sorting when data fits in memory, before falling back to external sort." },
      zh: { title: "数据库内存排序路径", description: "PostgreSQL和MySQL在数据可放入内存时使用快速排序，在回退到外部排序之前。" },
    },
  },
  "heap-sort": {
    "os-process-scheduler": {
      en: { title: "OS Process Priority Scheduling", description: "Linux CFS and Windows thread pool schedulers use heap-based priority queues to efficiently extract highest-priority tasks." },
      zh: { title: "操作系统进程优先级调度", description: "Linux CFS和Windows线程池调度器使用基于堆的优先级队列高效提取最高优先级任务。" },
    },
    "top-k-queries": {
      en: { title: "Top-K Query & Selection", description: "NumPy argpartition and Spark topK use heap operations to find the K largest or smallest elements in O(n log k)." },
      zh: { title: "Top-K 查询与选择", description: "NumPy argpartition和Spark topK使用堆操作以O(n log k)找到K个最大或最小元素。" },
    },
    "k-way-merge": {
      en: { title: "K-Way Merge in Data Pipelines", description: "Hadoop merge phase and Kafka log compaction use heap-based k-way merging for combining sorted streams." },
      zh: { title: "数据管道K路归并", description: "Hadoop合并阶段和Kafka日志压缩使用基于堆的K路归并合并有序流。" },
    },
  },
  "merge-sort": {
    "java-arrays-sort": {
      en: { title: "Java Arrays.sort for Objects", description: "Java uses Timsort (merge + insertion) for Object sorting, guaranteeing stability so equal elements preserve their original order." },
      zh: { title: "Java Arrays.sort 对象排序", description: "Java 对对象使用 Timsort（归并+插入），保证稳定排序，相等元素保持原始顺序。" },
    },
    "postgres-in-memory-sort": {
      en: { title: "PostgreSQL In-Memory Sort", description: "PostgreSQL uses merge sort for in-memory sorting of query results, maintaining order for ORDER BY operations." },
      zh: { title: "PostgreSQL 内存排序", description: "PostgreSQL 使用归并排序对查询结果进行内存排序，支持 ORDER BY 保持顺序。" },
    },
    "external-sort": {
      en: { title: "External Merge Sort for Large Files", description: "Hadoop MapReduce and Spark use external merge sort to sort terabyte-scale datasets by merging pre-sorted chunks from disk." },
      zh: { title: "大文件外部归并排序", description: "Hadoop MapReduce 和 Spark 使用外部归并排序，通过合并磁盘上的预排序块来处理 TB 级数据。" },
    },
  },
  // 8 DP + misc (agent 2)
  "fibonacci": {
    "trading-retracement": {
      en: { title: "Fibonacci Retracement", description: "Fibonacci retracement levels (23.6%, 38.2%, 50%, 61.8%) identify support and resistance zones in technical analysis." },
      zh: { title: "斐波那契回撤", description: "斐波那契回撤水平用于识别技术分析中的支撑和阻力区域。" },
    },
    "l-system-fractals": {
      en: { title: "L-System Fractals", description: "L-systems use Fibonacci branching rules to generate realistic plant structures and fractal trees in procedural generation." },
      zh: { title: "L系统分形", description: "L系统利用斐波那契分支规则生成逼真的植物结构和分形树。" },
    },
    "memoization-foundation": {
      en: { title: "Memoization Foundation", description: "Fibonacci is the classic example for introducing memoization to avoid exponential recomputation." },
      zh: { title: "记忆化基础", description: "斐波那契是引入记忆化以避免指数级重复计算的经典示例。" },
    },
  },
  "knapsack": {
    "cargo-loading": {
      en: { title: "Cargo Loading Optimization", description: "Airlines and logistics companies pack cargo under weight/volume limits to maximize shipment value per flight." },
      zh: { title: "货物装载优化", description: "航空公司在重量和体积限制下装载货物，以最大化每次航班的运输价值。" },
    },
    "cloud-budget": {
      en: { title: "Cloud Cost Optimization", description: "Cloud cost optimization selects services under a budget cap, each with a cost and performance gain." },
      zh: { title: "云成本优化", description: "云成本优化在预算上限下选择服务，每个服务都有成本和性能收益。" },
    },
    "ai-planning": {
      en: { title: "AI Resource Planning", description: "V8 register allocation uses knapsack-like decisions to select which variables fit in limited CPU registers." },
      zh: { title: "AI资源规划", description: "V8寄存器分配使用类似背包问题的决策来选择适合有限CPU寄存器的变量。" },
    },
  },
  "lcs": {
    "git-diff": {
      en: { title: "Git Diff", description: "Git diff uses LCS to find the minimal edit script between two file versions." },
      zh: { title: "Git差异比对", description: "Git diff使用LCS算法找到两个文件版本之间的最小编辑脚本。" },
    },
    "dna-alignment": {
      en: { title: "DNA Sequence Alignment", description: "Bioinformatics tools align DNA sequences by finding the longest common subsequence of nucleotide bases." },
      zh: { title: "DNA序列比对", description: "生物信息学工具通过寻找核苷酸碱基的最长公共子序列来比对DNA序列。" },
    },
    "plagiarism-detection": {
      en: { title: "Plagiarism Detection", description: "Plagiarism detectors find matching text passages across documents using longest common substring analysis." },
      zh: { title: "抄袭检测", description: "抄袭检测器使用最长公共子串分析在文档间查找匹配的文本段落。" },
    },
  },
  "lis": {
    "patience-sorting": {
      en: { title: "Patience Sorting", description: "Patience sorting deals cards into piles following LIS rules, directly computing the longest increasing subsequence." },
      zh: { title: "耐心排序", description: "耐心排序按照LIS规则将纸牌分成若干堆，直接计算最长递增子序列。" },
    },
    "job-scheduling": {
      en: { title: "Job Scheduling", description: "Scheduling independent jobs with compatible time intervals maximizes throughput using LIS on sorted end times." },
      zh: { title: "作业调度", description: "调度具有兼容时间间隔的独立作业，利用排序后的结束时间的LIS来最大化吞吐量。" },
    },
    "building-bridges": {
      en: { title: "Building Bridges", description: "Maximum non-crossing bridges across a river is solved by sorting one bank and finding LIS on the other." },
      zh: { title: "建桥问题", description: "河流上最大数量的非交叉桥梁，通过对一侧河岸排序并求另一侧的LIS来解决。" },
    },
  },
  "edit-distance": {
    "spell-checker": {
      en: { title: "Spell Checker", description: "Spell checkers suggest corrections by finding dictionary words within a Levenshtein distance threshold." },
      zh: { title: "拼写检查器", description: "拼写检查器通过在编辑距离阈值内查找字典单词来建议更正。" },
    },
    "fuzzy-search": {
      en: { title: "Fuzzy Search", description: "Fuzzy search engines use Levenshtein distance to find similar records with configurable tolerance thresholds." },
      zh: { title: "模糊搜索", description: "模糊搜索引擎使用Levenshtein距离查找具有可配置容差阈值的相似记录。" },
    },
    "dna-sequence-alignment": {
      en: { title: "DNA Sequence Alignment", description: "DNA sequence alignment measures genetic similarity by computing minimum edit operations between nucleotide strings." },
      zh: { title: "DNA序列比对", description: "DNA序列比对通过计算核苷酸字符串之间的最小编辑操作来衡量遗传相似性。" },
    },
  },
  "sliding-window": {
    "rate-limiting": {
      en: { title: "Network Rate Limiting", description: "Network rate limiters count requests in a sliding time window, dropping excess traffic to prevent abuse." },
      zh: { title: "网络速率限制", description: "网络速率限制器在滑动时间窗口内计算请求，丢弃多余流量以防止滥用。" },
    },
    "stock-moving-avg": {
      en: { title: "Stock Moving Average", description: "Moving average and maximum profit calculations use sliding windows over price time series data." },
      zh: { title: "股票移动平均", description: "移动平均和最大利润计算在价格时间序列数据上使用滑动窗口。" },
    },
    "log-analysis": {
      en: { title: "Log Windowed Aggregation", description: "ELK-style log analysis uses sliding windows to compute rolling error rates and metric aggregations." },
      zh: { title: "日志窗口聚合", description: "ELK风格的日志分析使用滑动窗口计算滚动错误率和指标聚合。" },
    },
  },
  "two-pointers": {
    "container-with-water": {
      en: { title: "Container With Most Water", description: "Find two lines that together with the x-axis form a container holding the most water." },
      zh: { title: "盛最多水的容器", description: "找到两条线与x轴围成能容纳最多水的容器。" },
    },
    "merge-sorted-arrays": {
      en: { title: "Merge Sorted Arrays", description: "Database engines merge-sort result sets by advancing pointers through two sorted cursors simultaneously." },
      zh: { title: "合并有序数组", description: "数据库引擎通过同时推进两个有序游标的指针来合并排序结果集。" },
    },
    "cycle-detection": {
      en: { title: "Floyd's Cycle Detection", description: "The tortoise-and-hare algorithm detects infinite loops in linked structures using two-speed pointers." },
      zh: { title: "Floyd循环检测", description: "龟兔算法使用双速指针检测链表结构中的无限循环。" },
    },
  },
  "n-queens": {
    "chess-puzzle-generator": {
      en: { title: "Chess Puzzle Generator", description: "Chess puzzle platforms generate constrained placement challenges similar to N-Queens for training tactical thinking." },
      zh: { title: "象棋谜题生成器", description: "国际象棋谜题平台生成类似N皇后问题的约束放置挑战来训练战术思维。" },
    },
    "register-allocation": {
      en: { title: "CPU Register Allocation", description: "Compilers solve N-Queens-like constraints when mapping variables to a limited set of CPU registers (n=8 for x86-64)." },
      zh: { title: "CPU寄存器分配", description: "编译器在将变量映射到有限的CPU寄存器时求解类似N皇后问题的约束。" },
    },
    "constraint-satisfaction": {
      en: { title: "Constraint Satisfaction", description: "N-Queens is a special case of CSP, the foundation for SAT solvers and AI constraint planners." },
      zh: { title: "约束满足问题", description: "N皇后问题是CSP的特例，是SAT求解器和AI约束规划器的基础。" },
    },
  },
  // 7 search (agent 3)
  "binary-search": {
    "v8-array-indexof": {
      en: { title: "V8 Engine Binary Search Optimization", description: "V8 detects sorted arrays and optimizes Array.indexOf to use binary search internally for O(log n) lookups." },
      zh: { title: "V8 引擎二分查找优化", description: "V8 检测有序数组并优化 Array.indexOf，内部使用二分查找实现 O(log n) 查找。" },
    },
    "git-bisect": {
      en: { title: "Git Bisect Bug Finding", description: "Git bisect uses binary search over commit history to pinpoint the exact commit that introduced a regression." },
      zh: { title: "Git Bisect 定位 Bug", description: "Git bisect 在提交历史上使用二分查找，精确定位引入回归的提交。" },
    },
    "btree-index": {
      en: { title: "B-tree Database Index Lookup", description: "PostgreSQL and InnoDB B-tree indexes perform binary search on each node page to locate keys in O(log n) time." },
      zh: { title: "B-tree 数据库索引查找", description: "PostgreSQL 和 InnoDB 的 B-tree 索引在每个节点页上执行二分查找，以 O(log n) 时间定位键。" },
    },
  },
  "linear-search": {
    "small-array-optimization": {
      en: { title: "Small Array Optimization in STL", description: "libstdc++ std::find uses linear scan for small ranges (<32 elements) where binary search overhead exceeds benefit." },
      zh: { title: "STL 小数组优化", description: "libstdc++ 的 std::find 对小范围（<32 元素）使用线性扫描，因为二分查找的开销超过收益。" },
    },
    "linked-list-traversal": {
      en: { title: "Linked List Traversal", description: "Linked lists have no random access, so finding any element requires sequential traversal from the head node." },
      zh: { title: "链表遍历", description: "链表不支持随机访问，查找任何元素都必须从头节点开始顺序遍历。" },
    },
    "debug-hex-search": {
      en: { title: "Hex Dump Debug Inspection", description: "Debuggers and hex dump tools scan memory byte-by-byte to locate specific patterns or values in raw memory." },
      zh: { title: "十六进制调试检查", description: "调试器和十六进制转储工具逐字节扫描内存，定位原始内存中的特定模式或值。" },
    },
  },
  "interpolation-search": {
    "phone-directory-lookup": {
      en: { title: "Phone Directory Lookup", description: "Phone books and LDAP directories use interpolation to jump directly to a name based on its alphabetical position." },
      zh: { title: "电话簿查找", description: "电话簿和 LDAP 目录使用插值搜索，根据名字的字母位置直接跳转查找。" },
    },
    "uniform-dataset-analytics": {
      en: { title: "Uniform Time-Series Analytics", description: "ClickHouse and InfluxDB use interpolation search on sorted, uniform timestamp segments for O(log log n) lookups." },
      zh: { title: "均匀时间序列分析", description: "ClickHouse 和 InfluxDB 在排序均匀的时间戳段上使用插值搜索，实现 O(log log n) 查找。" },
    },
    "dictionary-attack": {
      en: { title: "Password Dictionary Search", description: "Password cracking tools scan sorted wordlists with interpolation to estimate target position by word frequency." },
      zh: { title: "密码字典搜索", description: "密码破解工具在排序的字典中使用插值搜索，按词频估算目标位置。" },
    },
  },
  "jump-search": {
    "flash-memory-block": {
      en: { title: "Flash Memory Block Read", description: "NAND flash reads in blocks — jump search skips to the target block then linear scans within, avoiding random access penalty." },
      zh: { title: "闪存块读取", description: "NAND 闪存按块读取——跳跃搜索跳到目标块然后线性扫描，避免随机访问的性能损失。" },
    },
    "sorted-cache-index": {
      en: { title: "Sorted Cache Index Lookup", description: "Redis sorted sets and LevelDB memtables use jump-style block scanning for efficient key lookups in sorted structures." },
      zh: { title: "有序缓存索引查找", description: "Redis 有序集合和 LevelDB memtable 使用块式跳跃扫描，高效查找有序结构中的键。" },
    },
    "embedded-sensor-search": {
      en: { title: "Embedded Sensor Calibration", description: "Embedded firmware uses jump search on small sorted calibration tables for fast sensor value lookup." },
      zh: { title: "嵌入式传感器校准", description: "嵌入式固件在小型有序校准表上使用跳跃搜索，快速查找传感器值。" },
    },
  },
  "exponential-search": {
    "unbounded-stream": {
      en: { title: "Unbounded Stream Search", description: "Java Streams and Rust iterators use galloping/exponential search to find bounds on unbounded sorted data before binary searching." },
      zh: { title: "无界流搜索", description: "Java Streams 和 Rust 迭代器使用指数搜索在无界有序数据上找到边界，然后进行二分查找。" },
    },
    "rotating-sorted-array": {
      en: { title: "Rotating Sorted Array Search", description: "Arrays rotated at a pivot (like C++ std::rotate output) can be searched efficiently by first finding the rotation point." },
      zh: { title: "旋转有序数组搜索", description: "围绕枢轴旋转的数组可以通过先找到旋转点来高效搜索。" },
    },
    "galloping-in-sort": {
      en: { title: "Galloping in Timsort Merge", description: "Python's Timsort uses galloping mode (exponential search) during merge to skip long runs of unequal elements." },
      zh: { title: "Timsort 合并中的加速模式", description: "Python 的 Timsort 在合并时使用加速模式（指数搜索）跳过长段不等元素。" },
    },
  },
  "fibonacci-search": {
    "embedded-no-division": {
      en: { title: "Embedded Systems Without Division", description: "Fibonacci search uses only addition and subtraction for index calculation, critical on MCUs without hardware division." },
      zh: { title: "无除法器的嵌入式系统", description: "斐波那契搜索仅使用加减法计算索引，在没有硬件除法器的微控制器上至关重要。" },
    },
    "memory-constrained": {
      en: { title: "Memory-Constrained Game Console", description: "Classic game consoles with limited RAM use Fibonacci search to avoid expensive division operations on sorted lookup tables." },
      zh: { title: "内存受限的游戏主机", description: "内存有限的经典游戏主机使用斐波那契搜索，避免排序查找表上的昂贵除法运算。" },
    },
    "search-engine-index": {
      en: { title: "Search Engine Inverted Index", description: "Elasticsearch and Lucene use Fibonacci-like search strategies on sorted posting lists for efficient term lookups." },
      zh: { title: "搜索引擎倒排索引", description: "Elasticsearch 和 Lucene 在排序的倒排列表上使用类斐波那契搜索策略，实现高效术语查找。" },
    },
  },
  "ternary-search": {
    "unimodal-optimization": {
      en: { title: "Unimodal Function Optimization", description: "Ternary search finds the peak/valley of unimodal functions, used for hyperparameter tuning in ML model optimization." },
      zh: { title: "单峰函数优化", description: "三分搜索找到单峰函数的峰值/谷值，用于机器学习模型优化中的超参数调优。" },
    },
    "game-physics-tuning": {
      en: { title: "Game Physics Parameter Tuning", description: "Game engines use ternary search to find optimal physics parameters (friction, gravity) by testing unimodal cost functions." },
      zh: { title: "游戏物理参数调优", description: "游戏引擎使用三分搜索，通过测试单峰代价函数找到最佳物理参数（摩擦力、重力）。" },
    },
    "signal-peak-detection": {
      en: { title: "Signal Peak Detection", description: "Signal processing tools use ternary search to locate peaks in sensor readings and frequency spectrum data." },
      zh: { title: "信号峰值检测", description: "信号处理工具使用三分搜索定位传感器读数和频谱数据中的峰值。" },
    },
  },
  // 9 graph (agent 4)
  "dfs": {
    "garbage-collector": {
      en: { title: "Garbage Collector Mark-Sweep", description: "V8 mark-sweep, Java G1, and Go tricolor use DFS to find unreachable objects for memory reclamation." },
      zh: { title: "垃圾回收器标记清除", description: "V8 mark-sweep、Java G1和Go三色标记使用DFS查找不可达对象以回收内存。" },
    },
    "compiler-ast": {
      en: { title: "Compiler AST Traversal", description: "Babel, TypeScript compiler, and ESLint use DFS to traverse and transform abstract syntax trees." },
      zh: { title: "编译器AST遍历", description: "Babel、TypeScript编译器和ESLint使用DFS遍历和转换抽象语法树。" },
    },
    "maze-solver": {
      en: { title: "Game Maze Solver", description: "Unity NavMesh, Godot Pathfinding, and roguelike games use DFS to solve mazes and procedural dungeons." },
      zh: { title: "游戏迷宫求解", description: "Unity NavMesh、Godot寻路和Roguelike游戏使用DFS求解迷宫和程序生成地下城。" },
    },
  },
  "bfs": {
    "social-network": {
      en: { title: "Social Network Degrees of Separation", description: "LinkedIn, Facebook, and Twitter use BFS to find shortest connection chains between users." },
      zh: { title: "社交网络连接度", description: "LinkedIn、Facebook和Twitter使用BFS查找用户之间的最短连接链。" },
    },
    "web-crawler": {
      en: { title: "Web Crawler Discovery", description: "Googlebot, Scrapy, and Apache Nutch use BFS to discover and index pages by traversing link graphs." },
      zh: { title: "网络爬虫发现", description: "Googlebot、Scrapy和Apache Nutch使用BFS遍历链接图来发现和索引页面。" },
    },
    "peer-to-peer": {
      en: { title: "Peer-to-Peer Network Lookup", description: "BitTorrent DHT, IPFS, and Kademlia use BFS-like lookups to find nodes in distributed hash tables." },
      zh: { title: "对等网络查找", description: "BitTorrent DHT、IPFS和Kademlia使用类BFS查找在分布式哈希表中定位节点。" },
    },
  },
  "dijkstra": {
    "gps-navigation": {
      en: { title: "GPS Navigation Shortest Route", description: "Google Maps, TomTom, and Waze use Dijkstra with traffic-weighted road graphs to find fastest routes." },
      zh: { title: "GPS导航最短路线", description: "Google Maps、TomTom和Waze使用Dijkstra结合交通权重的道路图查找最快路线。" },
    },
    "ospf-routing": {
      en: { title: "OSPF Network Routing", description: "Cisco OSPF, Juniper IS-IS, and Linux Zebra use Dijkstra for shortest-path routing table computation." },
      zh: { title: "OSPF网络路由", description: "Cisco OSPF、Juniper IS-IS和Linux Zebra使用Dijkstra计算最短路径路由表。" },
    },
    "logistics-optimization": {
      en: { title: "Last-Mile Delivery Logistics", description: "FedEx, UPS ORION, and Amazon Logistics use Dijkstra to optimize delivery routes and reduce fuel costs." },
      zh: { title: "最后一公里配送物流", description: "FedEx、UPS ORION和Amazon Logistics使用Dijkstra优化配送路线并降低燃油成本。" },
    },
  },
  "bellman-ford": {
    "arbitrage-detection": {
      en: { title: "Currency Arbitrage Detection", description: "Bellman-Ford detects negative weight cycles in forex exchange rate graphs, identifying arbitrage opportunities where a circular trade yields profit." },
      zh: { title: "货币套利检测", description: "Bellman-Ford检测外汇汇率图中的负权环，识别循环交易获利机会。" },
    },
    "distance-vector-routing": {
      en: { title: "Distance-Vector Routing Protocol", description: "RIP and IGRP use Bellman-Ford's iterative edge relaxation to propagate routing tables across network hops." },
      zh: { title: "距离矢量路由协议", description: "RIP和IGRP使用Bellman-Ford的边松弛迭代在网络跳间传播路由表。" },
    },
    "apollo-guidance": {
      en: { title: "Apollo Guidance Computer", description: "NASA's Apollo missions used Bellman-Ford-variant algorithms for trajectory optimization and navigation calculations in the Guidance Computer." },
      zh: { title: "阿波罗导航计算机", description: "NASA阿波罗任务使用Bellman-Ford变体算法进行轨道优化和导航计算。" },
    },
  },
  "floyd-warshall": {
    "transitive-closure": {
      en: { title: "Transitive Closure in Database Systems", description: "Floyd-Warshall computes reachability between all entity pairs—used in SQL recursive CTEs, Neo4j graph queries, and access control matrices." },
      zh: { title: "数据库传递闭包", description: "Floyd-Warshall计算所有实体对的可达性，用于SQL递归CTE和图查询。" },
    },
    "vlsi-design": {
      en: { title: "VLSI Routing Optimization", description: "Cadence and Synopsys EDA tools use all-pairs shortest paths to minimize wire length and signal delay across millions of chip gates." },
      zh: { title: "超大规模集成电路布线", description: "Cadence和Synopsys使用全源最短路最小化芯片布线长度和信号延迟。" },
    },
    "flight-route-planner": {
      en: { title: "Airline Route Planning", description: "Sabre and Amadeus compute shortest paths between all airport pairs for multi-city flight booking and crew scheduling optimization." },
      zh: { title: "航线规划", description: "Sabre和Amadeus计算机场间最短路，优化多城市航班预订与机组调度。" },
    },
  },
  "prim": {
    "fiber-optic-network": {
      en: { title: "Fiber Optic Network Design", description: "Verizon FiOS and Google Fiber use Prim's algorithm to find minimum-cost fiber cable layout connecting all neighborhoods." },
      zh: { title: "光纤网络设计", description: "Verizon FiOS和Google Fiber使用Prim算法寻找连接所有社区的最小成本光纤布线方案。" },
    },
    "cluster-analysis": {
      en: { title: "Single-Linkage Clustering", description: "Prim's MST forms the basis of single-linkage hierarchical clustering—used in scikit-learn and bioinformatics gene expression analysis." },
      zh: { title: "单链接聚类", description: "Prim的MST是单链接层次聚类的基础，被scikit-learn和生物信息学基因表达分析使用。" },
    },
    "power-grid": {
      en: { title: "Power Grid Distribution", description: "National Grid and Siemens use Prim's MST to design minimum-length high-voltage transmission lines connecting substations." },
      zh: { title: "电网配电", description: "国家电网和西门子使用Prim的MST设计连接变电站的最短高压输电线路。" },
    },
  },
  "kruskal": {
    "lan-wiring": {
      en: { title: "Office LAN Cabling", description: "Structured cabling systems use Kruskal's algorithm to connect all office rooms with minimum Ethernet cable length." },
      zh: { title: "办公室局域网布线", description: "结构化布线系统使用Kruskal算法以最短以太网线缆连接所有办公室。" },
    },
    "image-segmentation": {
      en: { title: "Graph-Based Image Segmentation", description: "Felzenszwalb's algorithm uses Kruskal-style MST to segment images by merging similar pixels—implemented in OpenCV and Photoshop." },
      zh: { title: "基于图的图像分割", description: "Felzenszwalb算法使用Kruskal风格MST合并相似像素实现图像分割。" },
    },
    "phylogenetic-tree": {
      en: { title: "Phylogenetic Tree Construction", description: "Bioinformatics tools like BLAST and IQ-TREE use MST algorithms to infer evolutionary relationships from genetic distance data." },
      zh: { title: "系统发育树构建", description: "BLAST和IQ-TREE等生物信息学工具使用MST算法从遗传距离推断进化关系。" },
    },
  },
  "topological-sort": {
    "build-systems": {
      en: { title: "Build System Dependency Resolution", description: "Make, Maven, Webpack, and Bazel use topological sort to order compilation units so dependencies build before their dependents." },
      zh: { title: "构建系统依赖解析", description: "Make、Maven、Webpack用拓扑排序确定编译顺序，确保依赖先构建。" },
    },
    "package-managers": {
      en: { title: "Package Manager Dependency Resolution", description: "npm, pip, and Cargo resolve dependency DAGs via topological sort to determine correct install and update order." },
      zh: { title: "包管理器依赖解析", description: "npm、pip和Cargo通过拓扑排序解析依赖DAG以确定安装顺序。" },
    },
    "course-prerequisites": {
      en: { title: "Course Prerequisite Scheduling", description: "Universities use topological sort on prerequisite DAGs to plan valid degree sequences and semester course offerings." },
      zh: { title: "课程先修安排", description: "大学在先修课程DAG上使用拓扑排序规划有效的学位课程序列。" },
    },
  },
  "a-star": {
    "game-pathfinding": {
      en: { title: "Real-Time Strategy Game Pathfinding", description: "Age of Empires, StarCraft, and Civilization use A* for unit navigation on tile-based maps, combining terrain cost with heuristic to goal." },
      zh: { title: "即时战略游戏寻路", description: "《帝国时代》《星际争霸》使用A*结合地形代价与启发式进行单位导航。" },
    },
    "robotics-navigation": {
      en: { title: "Autonomous Robot Navigation", description: "ROS Navigation Stack and Waymo use A* with occupancy grid maps for obstacle-aware path planning in dynamic environments." },
      zh: { title: "自主机器人导航", description: "ROS导航栈和Waymo使用A*在占用栅格地图中规划无碰撞路径。" },
    },
    "eta-estimation": {
      en: { title: "GPS ETA Estimation", description: "Google Maps, Uber, and Lyft use A* with traffic-weighted heuristics to predict accurate arrival times across road networks." },
      zh: { title: "GPS预计到达时间", description: "Google Maps和Uber使用加权启发式A*预测道路网络的准确到达时间。" },
    },
  },
};

const STRUCTURE_SCENARIOS = {
  bst: {
    "database-index": {
      en: { title: "Database Index", description: "PostgreSQL and MySQL InnoDB use B-tree variants as indexes, enabling O(log n) lookups instead of full table scans." },
      zh: { title: "数据库索引", description: "PostgreSQL和MySQL InnoDB使用B树变体作为索引，实现O(log n)查找。" },
    },
    "filesystem-index": {
      en: { title: "Filesystem Index", description: "Linux ext4, NTFS, and APFS use tree-based indexes to locate files by path in logarithmic time." },
      zh: { title: "文件系统索引", description: "Linux ext4、NTFS和APFS使用树形索引以对数时间定位文件。" },
    },
    autocomplete: {
      en: { title: "Autocomplete Suggestions", description: "IDEs like Eclipse JDT and VS Code use BST-based structures for sorted symbol completion." },
      zh: { title: "自动补全建议", description: "IDE如Eclipse和VS Code使用BST结构实现排序符号补全。" },
    },
  },
  "linked-list": {
    "lru-cache-impl": {
      en: { title: "LRU Cache Implementation", description: "Doubly-linked lists power O(1) move-to-front eviction in LRU caches, used by Java LinkedHashMap." },
      zh: { title: "LRU缓存实现", description: "双向链表为LRU缓存的O(1)移动到前端淘汰策略提供支持。" },
    },
    "hash-chaining": {
      en: { title: "Hash Table Chaining", description: "When hash collisions occur, linked lists chain colliding entries in Java HashMap, Go map, and Python dict." },
      zh: { title: "哈希表链地址法", description: "当哈希冲突发生时，Java HashMap和Python dict使用链表链接冲突条目。" },
    },
    "undo-redo": {
      en: { title: "Text Editor Undo/Redo", description: "VS Code, Vim, and Google Docs use linked lists to track edit history for undo/redo operations." },
      zh: { title: "文本编辑器撤销/重做", description: "VS Code和Google Docs使用链表跟踪编辑历史以实现撤销/重做。" },
    },
  },
  stack: {
    "call-stack": {
      en: { title: "Function Call Stack", description: "V8 engine, JVM, and Go runtime use a call stack to track nested function invocations." },
      zh: { title: "函数调用栈", description: "V8引擎、JVM和Go运行时使用调用栈跟踪嵌套函数调用。" },
    },
    "expression-eval": {
      en: { title: "Expression Evaluation", description: "Compilers like the JavaScript parser use stacks for infix-to-postfix conversion and evaluation." },
      zh: { title: "表达式求值", description: "编译器如JavaScript解析器使用栈进行中缀到后缀转换和求值。" },
    },
    "browser-back": {
      en: { title: "Browser Back Button", description: "Chrome, Firefox, and Safari maintain a navigation stack to power the back/forward button." },
      zh: { title: "浏览器后退按钮", description: "Chrome和Firefox维护导航栈来支持前进/后退功能。" },
    },
  },
  queue: {
    "bfs-traversal": {
      en: { title: "BFS Traversal", description: "Linux kernel scheduler and OS page scanners use queues for breadth-first traversal of processes." },
      zh: { title: "广度优先遍历", description: "Linux内核调度器使用队列对进程进行广度优先遍历。" },
    },
    "job-queue": {
      en: { title: "Job Queue (Sidekiq, Celery)", description: "Sidekiq uses Redis lists as FIFO job queues; Celery uses RabbitMQ for distributed task processing." },
      zh: { title: "任务队列 (Sidekiq, Celery)", description: "Sidekiq使用Redis列表作为FIFO任务队列，Celery使用RabbitMQ处理分布式任务。" },
    },
    "message-queue": {
      en: { title: "Message Queue (Kafka, RabbitMQ)", description: "Apache Kafka and RabbitMQ are distributed message queues that decouple producers and consumers." },
      zh: { title: "消息队列 (Kafka, RabbitMQ)", description: "Apache Kafka和RabbitMQ是解耦生产者和消费者的分布式消息队列。" },
    },
  },
  "hash-table": {
    "python-dict": {
      en: { title: "Python dict / Java HashMap", description: "Python dict and Java HashMap are hash tables providing O(1) average-case key-value lookup." },
      zh: { title: "Python字典 / Java HashMap", description: "Python字典和Java HashMap是提供O(1)平均查找的哈希表。" },
    },
    "redis-store": {
      en: { title: "Redis Key-Value Store", description: "Redis and Memcached use hash tables as their core data structure for O(1) key-based access." },
      zh: { title: "Redis键值存储", description: "Redis和Memcached使用哈希表作为核心数据结构实现O(1)键访问。" },
    },
    "compiler-symbol-table": {
      en: { title: "Compiler Symbol Table", description: "GCC, Clang, and the TypeScript compiler use hash tables for fast identifier-to-metadata lookup." },
      zh: { title: "编译器符号表", description: "GCC、Clang和TypeScript编译器使用哈希表进行快速标识符查找。" },
    },
  },
  heap: {
    "priority-queue": {
      en: { title: "Priority Queue", description: "Java PriorityQueue and Python heapq use heaps for O(log n) insert and O(1) peek at the minimum element." },
      zh: { title: "优先队列", description: "Java PriorityQueue和Python heapq使用堆实现O(log n)插入和O(1)查看最小元素。" },
    },
    dijkstra: {
      en: { title: "Dijkstra's Shortest Path", description: "Google Maps and OSRM use min-heaps in Dijkstra's algorithm to find shortest routes efficiently." },
      zh: { title: "Dijkstra最短路径", description: "Google Maps在Dijkstra算法中使用最小堆高效查找最短路径。" },
    },
    "top-k": {
      en: { title: "Top-K Queries", description: "Apache Spark and Elasticsearch use heaps to efficiently find the top-K elements in large datasets." },
      zh: { title: "Top-K查询", description: "Apache Spark和Elasticsearch使用堆在大数据集中高效查找前K个元素。" },
    },
  },
  "avl-tree": {
    "in-memory-sorted-set": {
      en: { title: "In-Memory Sorted Set", description: "Redis internal sorted sets and LevelDB table caches use strictly balanced trees for fast ordered access." },
      zh: { title: "内存有序集合", description: "Redis内部有序集合和LevelDB表缓存使用严格平衡树实现快速有序访问。" },
    },
    "database-index-avl": {
      en: { title: "Database Index (Read-Heavy)", description: "AVL trees guarantee O(log n) lookups with strict balance, ideal for read-heavy in-memory indexes." },
      zh: { title: "数据库索引（读密集）", description: "AVL树以严格平衡保证O(log n)查找，适合读密集的内存索引。" },
    },
    "lookup-heavy": {
      en: { title: "Lookup-Heavy Workloads", description: "Java TreeMap and C++ std::map variants use balanced BSTs when strict worst-case guarantee matters." },
      zh: { title: "查找密集型负载", description: "Java TreeMap在需要严格最坏情况保证时使用平衡BST。" },
    },
  },
  "red-black-tree": {
    "java-tree-map": {
      en: { title: "Java TreeMap / C++ std::map", description: "Java TreeMap and C++ std::map use Red-Black Trees for O(log n) sorted key-value storage." },
      zh: { title: "Java TreeMap / C++ std::map", description: "Java TreeMap和C++ std::map使用红黑树实现O(log n)排序键值存储。" },
    },
    "linux-cfs": {
      en: { title: "Linux CFS Scheduler", description: "The Linux kernel's Completely Fair Scheduler uses a Red-Black Tree to track process virtual runtime." },
      zh: { title: "Linux CFS调度器", description: "Linux内核的完全公平调度器使用红黑树跟踪进程虚拟运行时间。" },
    },
    epoll: {
      en: { title: "Linux epoll", description: "Linux epoll and nginx use Red-Black Trees internally for efficient file descriptor management." },
      zh: { title: "Linux epoll", description: "Linux epoll和nginx内部使用红黑树高效管理文件描述符。" },
    },
  },
  trie: {
    autocomplete: {
      en: { title: "Search Autocomplete", description: "Google Search and VS Code IntelliSense use tries for O(m) prefix-based autocomplete suggestions." },
      zh: { title: "搜索自动补全", description: "Google搜索和VS Code IntelliSense使用Trie实现O(m)前缀自动补全。" },
    },
    "ip-routing": {
      en: { title: "IP Routing Tables", description: "Linux routing tables and BGP routers use tries for longest-prefix-match packet forwarding." },
      zh: { title: "IP路由表", description: "Linux路由表和BGP路由器使用Trie进行最长前缀匹配的数据包转发。" },
    },
    "spell-checker": {
      en: { title: "Spell Checker", description: "Hunspell, Aspell, and browser spell checkers use tries for fast dictionary word lookup." },
      zh: { title: "拼写检查器", description: "Hunspell和浏览器拼写检查使用Trie进行快速字典词查找。" },
    },
  },
  "union-find": {
    "kruskal-mst": {
      en: { title: "Kruskal's MST Algorithm", description: "Union-Find enables O(α(n)) cycle detection in Kruskal's algorithm for minimum spanning trees." },
      zh: { title: "Kruskal最小生成树", description: "并查集在Kruskal算法中实现O(α(n))环检测，用于最小生成树。" },
    },
    "network-connectivity": {
      en: { title: "Network Connectivity", description: "OSPF and routing protocols use Union-Find to dynamically track network component connectivity." },
      zh: { title: "网络连通性", description: "OSPF等路由协议使用并查集动态跟踪网络组件连通性。" },
    },
    "social-network": {
      en: { title: "Social Network Friend-of-Friend", description: "LinkedIn and Facebook use Union-Find variants for friend suggestions and community detection." },
      zh: { title: "社交网络好友推荐", description: "LinkedIn和Facebook使用并查集变体进行好友推荐和社区检测。" },
    },
  },
  "segment-tree": {
    "database-range": {
      en: { title: "Database Range Queries", description: "PostgreSQL and ClickHouse use segment-tree-like structures for efficient range aggregation queries." },
      zh: { title: "数据库范围查询", description: "PostgreSQL和ClickHouse使用类线段树结构进行高效范围聚合查询。" },
    },
    "competitive-prog": {
      en: { title: "Competitive Programming", description: "Segment trees are a staple of competitive programming for O(log n) range sum/min/max queries." },
      zh: { title: "竞赛编程", description: "线段树是竞赛编程中O(log n)范围求和/最小/最大查询的常用工具。" },
    },
    "interval-tree": {
      en: { title: "Interval Trees (Graphics)", description: "GPU rendering and collision detection engines use interval trees for spatial overlap queries." },
      zh: { title: "区间树（图形学）", description: "GPU渲染和碰撞检测引擎使用区间树进行空间重叠查询。" },
    },
  },
  "fenwick-tree": {
    "prefix-sum": {
      en: { title: "Prefix Sum Queries", description: "Fenwick trees provide O(log n) prefix sums, useful in competitive programming and algorithmic trading." },
      zh: { title: "前缀和查询", description: "树状数组提供O(log n)前缀和，适用于竞赛编程和算法交易。" },
    },
    "bit-range-update": {
      en: { title: "BIT Range Updates", description: "PostgreSQL and ClickHouse use Binary Indexed Trees for efficient prefix-based range updates." },
      zh: { title: "BIT范围更新", description: "PostgreSQL和ClickHouse使用树状数组进行高效前缀范围更新。" },
    },
    "competitive-bit": {
      en: { title: "Competitive Programming BIT", description: "The Fenwick Tree is simpler than segment trees for prefix sum use cases, popular in competitive programming." },
      zh: { title: "竞赛编程BIT", description: "树状数组比线段树更简洁，是竞赛编程中前缀和查询的流行选择。" },
    },
  },
  "skip-list": {
    "redis-sorted-sets": {
      en: { title: "Redis Sorted Sets", description: "Redis ZADD and LevelDB memtable use skip lists for O(log n) sorted insertion and range queries." },
      zh: { title: "Redis有序集合", description: "Redis ZADD和LevelDB memtable使用跳表实现O(log n)排序插入和范围查询。" },
    },
    "leveldb-memtable": {
      en: { title: "LevelDB Memtable", description: "LevelDB and RocksDB use concurrent skip lists as their in-memory sorted buffer before flushing to disk." },
      zh: { title: "LevelDB内存表", description: "LevelDB和RocksDB使用并发跳表作为刷盘前的内存排序缓冲。" },
    },
    "hbase-region": {
      en: { title: "Apache HBase Region Store", description: "HBase and Cassandra use skip lists for maintaining sorted data in memory with simpler locking than RBTs." },
      zh: { title: "Apache HBase Region存储", description: "HBase和Cassandra使用跳表维护内存中排序数据，锁竞争比红黑树更简单。" },
    },
  },
  "lru-cache": {
    "memcached-redis": {
      en: { title: "Memcached / Redis Eviction", description: "Redis maxmemory-policy allkeys-lru and Memcached use LRU eviction for O(1) cache management." },
      zh: { title: "Memcached / Redis淘汰策略", description: "Redis maxmemory-policy和Memcached使用LRU淘汰实现O(1)缓存管理。" },
    },
    "os-page-replace": {
      en: { title: "OS Page Replacement", description: "Linux kernel and Windows memory manager use LRU-based algorithms for virtual memory page eviction." },
      zh: { title: "操作系统页面置换", description: "Linux内核和Windows内存管理器使用基于LRU的算法进行虚拟内存页面淘汰。" },
    },
    "cdn-edge-cache": {
      en: { title: "CDN Edge Caching", description: "Cloudflare, AWS CloudFront, and Varnish use LRU caches at edge nodes for content delivery." },
      zh: { title: "CDN边缘缓存", description: "Cloudflare和AWS CloudFront在边缘节点使用LRU缓存进行内容分发。" },
    },
  },
  "graph-bfs": {
    "social-network": {
      en: { title: "Social Network BFS", description: "LinkedIn and Facebook use BFS to find degrees of connection and 'people you may know' suggestions." },
      zh: { title: "社交网络BFS", description: "LinkedIn和Facebook使用BFS查找连接度和「你可能认识的人」推荐。" },
    },
    "road-network": {
      en: { title: "Road Network Navigation", description: "Google Maps and OpenStreetMap use BFS on road graphs for shortest path in unweighted networks." },
      zh: { title: "道路网络导航", description: "Google Maps在道路图上使用BFS查找无权最短路径。" },
    },
    "dependency-resolution": {
      en: { title: "Package Dependency Resolution", description: "npm, Maven, and pip use BFS on dependency graphs to determine installation order." },
      zh: { title: "包依赖解析", description: "npm、Maven和pip在依赖图上使用BFS确定安装顺序。" },
    },
  },
  "bloom-filter": {
    "medium-read": {
      en: { title: "Have You Read This Article", description: "Medium uses Bloom filters to show read articles — false positives are acceptable, false negatives are impossible." },
      zh: { title: "你读过这篇文章吗", description: "Medium使用布隆过滤器显示已读文章，假阳性可接受，假阴性不可能出现。" },
    },
    "db-query-optimization": {
      en: { title: "Database Query Optimization", description: "Cassandra and RocksDB use Bloom filters to skip disk lookups for keys that definitely don't exist." },
      zh: { title: "数据库查询优化", description: "Cassandra和RocksDB使用布隆过滤器跳过不存在键的磁盘查找。" },
    },
    "url-dedup": {
      en: { title: "Web Crawler URL Deduplication", description: "Apache Nutch and Scrapy use Bloom filters to avoid revisiting millions of already-crawled URLs." },
      zh: { title: "网络爬虫URL去重", description: "Apache Nutch和Scrapy使用布隆过滤器避免重复访问已爬取的URL。" },
    },
  },
};

// ============================================================
// Apply to JSON files
// ============================================================

function applyTo(filePath, langKey) {
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!json.content) {
    throw new Error(`Missing content in ${filePath}`);
  }
  let algCount = 0;
  let algMissing = [];
  let structCount = 0;
  let structMissing = [];

  // Apply algorithm scenarios
  if (json.content.algorithms) {
    for (const [slug, scenarios] of Object.entries(ALGORITHM_SCENARIOS)) {
      if (!json.content.algorithms[slug]) {
        algMissing.push(slug);
        continue;
      }
      const obj = {};
      for (const [id, data] of Object.entries(scenarios)) {
        obj[id] = data[langKey];
      }
      json.content.algorithms[slug].scenarios = obj;
      algCount++;
    }
  }

  // Apply structure scenarios
  if (json.content.structures) {
    for (const [slug, scenarios] of Object.entries(STRUCTURE_SCENARIOS)) {
      if (!json.content.structures[slug]) {
        structMissing.push(slug);
        continue;
      }
      const obj = {};
      for (const [id, data] of Object.entries(scenarios)) {
        obj[id] = data[langKey];
      }
      json.content.structures[slug].scenarios = obj;
      structCount++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`[${filePath}] algorithms: ${algCount} updated (missing: ${algMissing.length ? algMissing.join(", ") : "none"}), structures: ${structCount} updated (missing: ${structMissing.length ? structMissing.join(", ") : "none"})`);
}

applyTo(EN_PATH, "en");
applyTo(ZH_PATH, "zh");
console.log("Done.");
