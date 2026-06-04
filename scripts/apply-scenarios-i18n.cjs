// One-shot script: apply all pattern scenarios i18n data to en.json + zh.json.
// Reads scenario content from 5 agent reports and patches both locale files.

const fs = require("fs");
const path = require("path");

const EN_PATH = path.resolve("src/messages/en.json");
const ZH_PATH = path.resolve("src/messages/zh.json");

// ============================================================
// Scenarios data — compiled from 5 parallel agent reports.
// Key: pattern slug. Value: scenario records keyed by scenario id.
// Each scenario has en + zh { title, description }.
// ============================================================

const SCENARIOS = {
  singleton: {
    "java-runtime": {
      en: { title: "Java Runtime (java.lang.Runtime)", description: "Java's Runtime.getRuntime() returns the sole JVM process instance — a canonical Singleton used by ProcessBuilder and System.exit()." },
      zh: { title: "Java Runtime (java.lang.Runtime)", description: "Java 的 Runtime.getRuntime() 返回唯一的 JVM 进程实例——ProcessBuilder 和 System.exit() 都使用此经典单例。" },
    },
    "spring-bean": {
      en: { title: "Spring Framework Default Bean Scope", description: "Spring IoC container treats beans without an explicit scope as singletons by default, sharing one instance across the entire ApplicationContext." },
      zh: { title: "Spring 框架默认 Bean 作用域", description: "Spring IoC 容器默认将未指定作用域的 Bean 视为单例，整个 ApplicationContext 共享同一实例。" },
    },
    "log4j-logger": {
      en: { title: "Logging Frameworks (Log4j / SLF4J)", description: "Java's logging facades maintain a single Logger per name, deduplicating output across classloaders and avoiding I/O contention." },
      zh: { title: "日志框架（Log4j / SLF4J）", description: "Java 日志门面为每个名称维护唯一 Logger，跨类加载器去重输出并避免 I/O 争用。" },
    },
  },
  "factory-method": {
    "jdbc-driver-manager": {
      en: { title: "JDBC DriverManager", description: "DriverManager.getConnection() delegates to database-specific drivers via the JDBC URL — each driver subclass implements the factory method." },
      zh: { title: "JDBC 驱动管理器", description: "DriverManager.getConnection() 根据 JDBC URL 委托给对应数据库驱动——每个驱动子类实现工厂方法。" },
    },
    "react-create-element": {
      en: { title: "React.createElement()", description: "React's createElement acts as a factory method that produces different virtual DOM element types based on the tag argument." },
      zh: { title: "React.createElement()", description: "React 的 createElement 充当工厂方法，根据标签参数创建不同的虚拟 DOM 元素类型。" },
    },
    "java-number-format": {
      en: { title: "Java NumberFormat / Calendar", description: "NumberFormat.getXXXInstance() and Calendar.getInstance() let subclasses decide the concrete formatter or calendar to return." },
      zh: { title: "Java NumberFormat / Calendar", description: "NumberFormat.getXXXInstance() 和 Calendar.getInstance() 让子类决定返回的具体格式化器或日历实现。" },
    },
  },
  "abstract-factory": {
    "swing-laf": {
      en: { title: "Swing Look-and-Feel", description: "Each Swing L&F (Metal, Windows, Motif, Nimbus) is a concrete factory creating a family of styled UI components." },
      zh: { title: "Swing 外观与感觉", description: "每种 Swing L&F（Metal、Windows、Motif、Nimbus）是一个具体工厂，创建整套风格一致的 UI 组件。" },
    },
    "jdbc-driver-family": {
      en: { title: "JDBC Driver Families", description: "Each database vendor provides a driver family (Connection, Statement, ResultSet) through a common JDBC interface." },
      zh: { title: "JDBC 驱动族", description: "每个数据库厂商通过统一 JDBC 接口提供整套驱动（Connection、Statement、ResultSet）。" },
    },
    "dotnet-db-provider": {
      en: { title: ".NET DbProviderFactory", description: "DbProviderFactory creates vendor-specific Connection, Command, and DataAdapter objects while keeping client code DB-agnostic." },
      zh: { title: ".NET DbProviderFactory", description: "DbProviderFactory 创建供应商特定的 Connection、Command 和 DataAdapter 对象，客户端代码无需关心具体数据库。" },
    },
  },
  builder: {
    "okhttp-request": {
      en: { title: "OkHttp Request.Builder", description: "OkHttp's fluent Request.Builder constructs immutable HTTP requests step by step with method chaining." },
      zh: { title: "OkHttp Request.Builder", description: "OkHttp 的流式 Request.Builder 通过方法链逐步构建不可变的 HTTP 请求。" },
    },
    "java-string-builder": {
      en: { title: "StringBuilder / StringBuffer", description: "StringBuilder lets you incrementally build strings via append() calls without creating intermediate copies." },
      zh: { title: "StringBuilder / StringBuffer", description: "StringBuilder 通过 append() 调用增量构建字符串，避免创建中间副本。" },
    },
    "lombok-builder": {
      en: { title: "Lombok @Builder", description: "Lombok's @Builder annotation auto-generates a fluent builder for constructing complex POJOs with many optional fields." },
      zh: { title: "Lombok @Builder", description: "Lombok 的 @Builder 注解自动生成流式构建器，用于构建含大量可选字段的复杂 POJO。" },
    },
  },
  prototype: {
    "java-cloneable": {
      en: { title: "Java Object.clone() — Prototype in the Standard Library", description: "Java's Cloneable marker interface and Object.clone() provide a language-level prototype mechanism. Kotlin's data class copy() and C#'s ICloneable extend the same idea." },
      zh: { title: "Java Object.clone() — 标准库中的原型模式", description: "Java 的 Cloneable 接口和 Object.clone() 提供语言级的原型克隆机制。Kotlin data class copy() 和 C# ICloneable 沿用相同思路。" },
    },
    "js-structured-clone": {
      en: { title: "structuredClone() — Deep Cloning Across JavaScript Realms", description: "The HTML Standard's structuredClone() lets you deep-clone any serializable object across realms (iframes, workers), preventing mutation bugs in state-heavy applications." },
      zh: { title: "structuredClone() — JavaScript 跨 Realm 深拷贝", description: "HTML 标准的 structuredClone() 可在跨 Realm（iframe、Worker）深度克隆任意可序列化对象，避免状态密集型应用中的变更 bug。" },
    },
    "react-children-clone": {
      en: { title: "React.cloneElement() — Immutable Element Prototyping", description: "React's cloneElement() creates modified copies of elements without mutating the original, powering patterns like injecting props from parent components." },
      zh: { title: "React.cloneElement() — 不可变元素原型", description: "React 的 cloneElement() 创建元素的修改副本而不改变原对象，支撑父组件注入 props 等模式。" },
    },
  },
  adapter: {
    "slf4j-facade": {
      en: { title: "SLF4J — The Universal Logging Facade", description: "SLF4J provides a single logging API that adapters bridge to Logback, Log4j, or java.util.logging, letting applications swap backends without code changes." },
      zh: { title: "SLF4J — 通用日志门面", description: "SLF4J 提供统一的日志 API，通过适配器桥接 Logback、Log4j 或 java.util.logging，应用无需改代码即可切换后端。" },
    },
    "java-io-streams": {
      en: { title: "InputStreamReader — Adapting Byte Streams to Character Streams", description: "Java's InputStreamReader wraps a byte-oriented InputStream and exposes a char-oriented Reader interface, the classic adapter pattern in the JDK." },
      zh: { title: "InputStreamReader — 字节流到字符流的适配", description: "Java 的 InputStreamReader 包装面向字节的 InputStream，暴露面向字符的 Reader 接口——JDK 中的经典适配器模式。" },
    },
    "stripe-sdk": {
      en: { title: "Stripe SDK — Adapter for Multi-Provider Payment Gateways", description: "Stripe's SDK adapters abstract away differences across payment providers (Stripe, Square, PayPal) behind a unified checkout interface for e-commerce platforms." },
      zh: { title: "Stripe SDK — 多支付提供商适配器", description: "Stripe SDK 适配器在统一结账接口背后，抽象 Stripe、Square、PayPal 等支付提供商的差异。" },
    },
  },
  bridge: {
    "jdbc-drivers": {
      en: { title: "JDBC — Bridging Applications Across Databases", description: "JDBC defines a single connection/query abstraction that each database vendor (MySQL, PostgreSQL, H2) implements via a driver, letting applications switch databases without SQL code changes." },
      zh: { title: "JDBC — 跨数据库桥接", description: "JDBC 定义统一的连接/查询抽象，各数据库厂商（MySQL、PostgreSQL、H2）通过驱动实现，应用可切换数据库而无需改动 SQL 代码。" },
    },
    "graphics-api": {
      en: { title: "OpenGL / DirectX — Abstracting GPU Hardware", description: "Graphics APIs like OpenGL, DirectX, and Vulkan separate the rendering abstraction from GPU-specific implementations, so games render identically on different hardware." },
      zh: { title: "OpenGL / DirectX — 抽象 GPU 硬件", description: "OpenGL、DirectX、Vulkan 等图形 API 将渲染抽象与 GPU 实现分离，游戏在不同硬件上渲染一致。" },
    },
    "logger-backends": {
      en: { title: "Logging Frameworks — Decoupling API from Output", description: "Frameworks like SLF4J and Winston decouple the logging API (abstraction) from output destinations like files, databases, or cloud services (implementation)." },
      zh: { title: "日志框架 — API 与输出解耦", description: "SLF4J、Winston 等框架将日志 API（抽象）与文件、数据库、云服务（实现）等输出目的地解耦。" },
    },
  },
  composite: {
    "dom-tree": {
      en: { title: "DOM API — The Ultimate Composite Tree", description: "The W3C DOM treats every node uniformly: parent elements contain child elements or text nodes, and operations like querySelector traverse the hierarchy recursively." },
      zh: { title: "DOM API — 终极组合树", description: "W3C DOM 统一处理所有节点：父元素包含子元素或文本节点，querySelector 等操作递归遍历层级。" },
    },
    "ast-nodes": {
      en: { title: "Abstract Syntax Trees — Composing Expressions", description: "Compilers model code as an AST where expressions contain sub-expressions. Each node implements a common eval() interface, and evaluation recurses down the tree." },
      zh: { title: "抽象语法树 — 组合表达式", description: "编译器将代码建模为 AST，表达式包含子表达式。每个节点实现统一的 eval() 接口，求值递归向下传播。" },
    },
    "organization-chart": {
      en: { title: "Enterprise Org Charts — Roll-up Reporting", description: "Corporate hierarchies treat departments and employees uniformly — departments aggregate headcount and budget from child units, enabling recursive roll-up reports." },
      zh: { title: "企业组织架构 — 逐级汇总", description: "企业层级将部门和员工统一对待——部门从子单元汇总人数和预算，实现递归报表。" },
    },
  },
  decorator: {
    "java-io-streams": {
      en: { title: "Java I/O Streams", description: "BufferedReader wraps InputStreamReader wraps FileInputStream, composing encoding and buffering behavior through nested decorators." },
      zh: { title: "Java I/O 流", description: "BufferedReader 包装 InputStreamReader 再包装 FileInputStream，通过嵌套装饰器组合编码与缓冲行为。" },
    },
    "react-hocs": {
      en: { title: "React Higher-Order Components", description: "HOCs like withRouter and connect wrap components to inject props, adding cross-cutting concerns without modifying the original." },
      zh: { title: "React 高阶组件", description: "withRouter 和 connect 等 HOC 包装组件以注入 props，在不修改原始组件的情况下添加横切关注点。" },
    },
    "python-decorators": {
      en: { title: "Python Language Decorators", description: "@property, @lru_cache, and @staticmethod use the decorator syntax to augment functions and methods at definition time." },
      zh: { title: "Python 语言装饰器", description: "@property、@lru_cache 和 @staticmethod 在函数和方法定义时使用装饰器语法增强其行为。" },
    },
  },
  facade: {
    "jdbc-jdbctemplate": {
      en: { title: "JDBC & Spring JdbcTemplate", description: "JdbcTemplate wraps Connection, Statement, and ResultSet into a single query call, hiding verbose JDBC boilerplate." },
      zh: { title: "JDBC 与 Spring JdbcTemplate", description: "JdbcTemplate 将 Connection、Statement 和 ResultSet 封装为单次查询调用，隐藏冗长的 JDBC 样板代码。" },
    },
    "aws-sdk": {
      en: { title: "Cloud SDK Facades", description: "AWS SDK, Google Cloud SDK, and Azure SDK each expose a simplified client that orchestrates complex HTTP signing, retries, and serialization." },
      zh: { title: "云 SDK 外观", description: "AWS SDK、Google Cloud SDK 和 Azure SDK 各自提供简化客户端，编排复杂的 HTTP 签名、重试和序列化。" },
    },
    "ffmpeg-cli": {
      en: { title: "FFmpeg Command-Line Interface", description: "FFmpeg's CLI provides a one-line facade over hundreds of codec, muxer, and filter APIs for video processing." },
      zh: { title: "FFmpeg 命令行界面", description: "FFmpeg CLI 以一行命令封装数百种编解码器、复用器和滤镜 API，用于视频处理。" },
    },
  },
  flyweight: {
    "java-integer-cache": {
      en: { title: "Java Integer Cache Pool", description: "JVM caches Integer instances from -128 to 127, sharing identical flyweight objects to reduce heap allocation." },
      zh: { title: "Java Integer 缓存池", description: "JVM 缓存 -128 到 127 的 Integer 实例，共享相同的享元对象以减少堆分配。" },
    },
    "font-glyph-cache": {
      en: { title: "Browser Font Glyph Caching", description: "Browsers reuse rendered glyph bitmaps for each character-code and font pair, avoiding redundant rasterization." },
      zh: { title: "浏览器字体字形缓存", description: "浏览器为每个字符码和字体组合复用已渲染的字形位图，避免重复光栅化。" },
    },
    "game-sprite-atlas": {
      en: { title: "Game Engine Sprite Atlas", description: "Unity and Three.js share a single texture atlas across thousands of instances, varying only position and scale as extrinsic state." },
      zh: { title: "游戏引擎精灵图集", description: "Unity 和 Three.js 在数千个实例间共享同一纹理图集，仅将位置和缩放作为外部状态变化。" },
    },
  },
  proxy: {
    "hibernate-lazy-loading": {
      en: { title: "Hibernate Lazy Loading Proxies", description: "Hibernate generates bytecode proxies for entities with LAZY associations, deferring SQL queries until first access." },
      zh: { title: "Hibernate 懒加载代理", description: "Hibernate 为带 LAZY 关联的实体生成字节码代理，将 SQL 查询延迟到首次访问时触发。" },
    },
    "nginx-cdn": {
      en: { title: "Reverse Proxy & CDN Layer", description: "Nginx and Cloudflare CDN act as transparent proxies, caching responses and load-balancing before reaching origin servers." },
      zh: { title: "反向代理与 CDN 层", description: "Nginx 和 Cloudflare CDN 充当透明代理，在请求到达源服务器之前缓存响应并负载均衡。" },
    },
    "vue3-reactivity": {
      en: { title: "Vue 3 Reactivity Proxy", description: "Vue 3 wraps reactive state in ES Proxy objects to intercept property access and trigger dependency tracking automatically." },
      zh: { title: "Vue 3 响应式代理", description: "Vue 3 将响应式状态包装在 ES Proxy 对象中，自动拦截属性访问并触发依赖追踪。" },
    },
  },
  "chain-of-responsibility": {
    "servlet-filters": {
      en: { title: "Java Servlet Filter Chain", description: "Servlet containers pass requests through a chain of Filter instances, each performing authentication, logging, or encoding before the next." },
      zh: { title: "Java Servlet 过滤器链", description: "Servlet 容器将请求传递给 Filter 实例链，每个过滤器在传递前执行身份验证、日志记录或编码。" },
    },
    "express-middleware": {
      en: { title: "Express.js Middleware Pipeline", description: "Express and Koa compose middleware functions that each call next() to forward the request down the pipeline or short-circuit." },
      zh: { title: "Express.js 中间件管道", description: "Express 和 Koa 组合中间件函数，每个函数调用 next() 将请求转发到管道下游或短路处理。" },
    },
    "okhttp-interceptors": {
      en: { title: "OkHttp Network Interceptors", description: "OkHttp and Retrofit chain interceptors for retries, auth token injection, and logging before the request reaches the wire." },
      zh: { title: "OkHttp 网络拦截器", description: "OkHttp 和 Retrofit 链式调用拦截器进行重试、身份令牌注入和日志记录，然后请求才到达网络层。" },
    },
  },
  command: {
    "gui-undo-redo": {
      en: { title: "GUI Undo/Redo", description: "GUI editors (VSCode, Photoshop) wrap every user action as a Command, enabling undo/redo stacks and macro recording." },
      zh: { title: "GUI 撤销/重做", description: "GUI 编辑器（VSCode、Photoshop）将每次操作封装为命令对象，支持撤销/重做与宏录制。" },
    },
    "db-transaction": {
      en: { title: "Database Transaction", description: "Database engines model SQL transactions as Commands: BEGIN starts, COMMIT executes, ROLLBACK undoes — all chained as atomic units." },
      zh: { title: "数据库事务", description: "数据库引擎将 SQL 事务建模为命令对象，BEGIN/COMMIT/ROLLBACK 构成原子操作链。" },
    },
    "job-queue": {
      en: { title: "Background Job Queue", description: "Job queues (Sidekiq, Celery) serialize each background task into a Command object for retry-capable worker execution." },
      zh: { title: "后台任务队列", description: "任务队列（Sidekiq、Celery）将后台作业序列化为命令对象，由工作进程可靠执行。" },
    },
  },
  interpreter: {
    "sql-parser": {
      en: { title: "SQL Parser", description: "SQL parsers decompose query strings into ASTs where each node is an Expression interpreting against a schema context to yield rows." },
      zh: { title: "SQL 解析器", description: "SQL 解析器将查询字符串分解为 AST，每个节点作为表达式对数据库上下文求值。" },
    },
    "regex-engine": {
      en: { title: "Regular Expression Engine", description: "Regex engines compile patterns into expression trees: literal terminals, group non-terminals, and quantifiers interpret against input strings." },
      zh: { title: "正则表达式引擎", description: "正则引擎将模式编译为表达式树，逐节点对输入字符串进行匹配解释。" },
    },
    "spel-expression": {
      en: { title: "Spring Expression Language", description: "Spring SpEL evaluates annotation expressions as ASTs at runtime for authorization, templating, and dynamic configuration." },
      zh: { title: "Spring 表达式语言", description: "Spring SpEL 在运行时解析注解表达式为 AST，用于鉴权、模板和动态配置。" },
    },
  },
  mediator: {
    "redux-store": {
      en: { title: "Redux / Zustand Store", description: "State stores like Redux act as mediators — components dispatch actions, the store coordinates updates and notifies every subscriber." },
      zh: { title: "Redux / Zustand 状态管理", description: "Redux 等状态库充当中介者——组件派发动作，Store 协调更新并通知所有订阅者。" },
    },
    "executor-service": {
      en: { title: "Thread Pool Executor", description: "Thread pool executors (Java ExecutorService, Go goroutines) mediate between task producers and worker threads, balancing load." },
      zh: { title: "线程池执行器", description: "线程池执行器（Java ExecutorService、Go goroutines）协调任务生产者与工作线程，平衡负载。" },
    },
    "air-traffic-control": {
      en: { title: "Air Traffic Control", description: "Air traffic control systems coordinate aircraft through a central mediator managing takeoff, landing, and collision avoidance." },
      zh: { title: "空中交通管制", description: "空中交通管制系统通过中央中介者协调飞机起降、航线与避碰。" },
    },
  },
  memento: {
    "editor-undo": {
      en: { title: "Text Editor Undo", description: "VSCode and Vim capture file snapshots after each change, stored in a history stack — Ctrl+Z restores the prior memento for infinite undo." },
      zh: { title: "文本编辑器撤销", description: "VSCode 和 Vim 每次变更后保存文件快照至历史栈，Ctrl+Z 恢复至上一备忘录。" },
    },
    "db-rollback": {
      en: { title: "Database Transaction Rollback", description: "Database transaction logs store before-images as mementos — ROLLBACK restores the snapshot, fully aborting the transaction." },
      zh: { title: "数据库事务回滚", description: "数据库事务日志存储变更前镜像作为备忘录，ROLLBACK 恢复快照回滚事务。" },
    },
    "time-travel-debug": {
      en: { title: "Time-Travel Debugging", description: "Redux DevTools snapshots app state after each action, letting developers rewind to any prior state and replay forward." },
      zh: { title: "时间旅行调试", description: "Redux DevTools 在每次操作后快照应用状态，支持回放至任意历史状态。" },
    },
  },
  observer: {
    "dom-events": {
      en: { title: "DOM Events / RxJS", description: "The DOM's EventTarget is the canonical observer: elements register listeners and events broadcast to all subscribers." },
      zh: { title: "DOM 事件 / RxJS", description: "DOM 的 EventTarget 是经典观察者：元素注册监听器，事件广播至所有订阅者。" },
    },
    "kafka-consumer": {
      en: { title: "Kafka Consumer Groups", description: "Kafka topics act as subjects; consumer groups are observers. Each partition fans out messages in a pub-sub topology." },
      zh: { title: "Kafka 消费者组", description: "Kafka 主题作为主体，消费者组为观察者，每个分区以发布-订阅拓扑分发消息。" },
    },
    "redis-pubsub": {
      en: { title: "Redis Pub/Sub", description: "Redis Pub/Sub decouples publishers from subscribers — messages on a channel broadcast to every connected listener." },
      zh: { title: "Redis 发布/订阅", description: "Redis Pub/Sub 解耦发布者与订阅者，频道消息广播至全部已连接监听器。" },
    },
  },
  state: {
    "tcp-state-machine": {
      en: { title: "TCP Connection State Machine", description: "TCP connections use a state machine with states like ESTABLISHED, CLOSE_WAIT, and TIME_WAIT to manage reliable data transmission." },
      zh: { title: "TCP 连接状态机", description: "TCP 连接使用状态机管理可靠传输，包含 ESTABLISHED、CLOSE_WAIT 和 TIME_WAIT 等状态。" },
    },
    "react-use-state": {
      en: { title: "React Component States", description: "React components model UI states (loading, success, error) through the State pattern, where each state drives the rendered output." },
      zh: { title: "React 组件状态", description: "React 组件通过状态模式管理 loading、success、error 等 UI 状态，每个状态驱动不同的渲染输出。" },
    },
    "order-workflow": {
      en: { title: "E-commerce Order Workflow", description: "E-commerce order processing follows a state workflow: PENDING to PAID to SHIPPED to DELIVERED, with each stage restricting transitions." },
      zh: { title: "电商订单工作流", description: "电商订单处理遵循状态工作流：PENDING → PAID → SHIPPED → DELIVERED，每个阶段限制状态转换。" },
    },
  },
  strategy: {
    "java-comparator": {
      en: { title: "Java Comparator Sorting", description: "Java's Comparator interface lets developers swap sorting strategies at runtime without modifying the collection being sorted." },
      zh: { title: "Java Comparator 排序", description: "Java 的 Comparator 接口允许开发者运行时切换排序策略，无需修改被排序的集合。" },
    },
    "http-compression": {
      en: { title: "HTTP Compression Negotiation", description: "HTTP servers negotiate compression (gzip, brotli, zstd) via the Strategy pattern, selecting an algorithm based on client Accept-Encoding." },
      zh: { title: "HTTP 压缩协商", description: "HTTP 服务器通过策略模式协商压缩算法（gzip、brotli、zstd），根据客户端 Accept-Encoding 选择。" },
    },
  },
  "template-method": {
    "java-servlet": {
      en: { title: "Java Servlet Lifecycle", description: "Java HttpServlet defines the service() template — subclasses override doGet/doPost while the request dispatch skeleton stays fixed." },
      zh: { title: "Java Servlet 生命周期", description: "Java HttpServlet 定义 service() 模板，子类重写 doGet/doPost，请求分派骨架保持不变。" },
    },
    "junit-lifecycle": {
      en: { title: "JUnit 5 Test Lifecycle", description: "JUnit 5 test execution follows a template: @BeforeAll → @BeforeEach → @Test → @AfterEach → @AfterAll, with hooks for setup and teardown." },
      zh: { title: "JUnit 5 测试生命周期", description: "JUnit 5 测试执行遵循模板：@BeforeAll → @BeforeEach → @Test → @AfterEach → @AfterAll，提供设置和清理钩子。" },
    },
    "spring-jdbc": {
      en: { title: "Spring JdbcTemplate", description: "Spring's JdbcTemplate encapsulates JDBC boilerplate (connection, statement, result set) into a template, letting callers supply only the SQL." },
      zh: { title: "Spring JdbcTemplate", description: "Spring 的 JdbcTemplate 将 JDBC 样板代码（连接、语句、结果集）封装为模板，调用者只需提供 SQL。" },
    },
  },
  visitor: {
    "java-annotation-processor": {
      en: { title: "Java Annotation Processing", description: "Java annotation processing uses javax.lang.model.element.ElementVisitor to traverse source code elements like packages, types, and methods." },
      zh: { title: "Java 注解处理", description: "Java 注解处理使用 javax.lang.model.element.ElementVisitor 遍历包、类型、方法等源码元素。" },
    },
    "files-walk-file-tree": {
      en: { title: "File System Tree Walker", description: "Java NIO Files.walkFileTree applies the Visitor pattern — a FileVisitor callback receives each file/directory during a recursive traversal." },
      zh: { title: "文件系统遍历", description: "Java NIO Files.walkFileTree 应用访问者模式，FileVisitor 回调在递归遍历中接收每个文件/目录。" },
    },
  },
};

// ============================================================
// Apply patches to both JSON files
// ============================================================

function applyI18n(filePath, langKey) {
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!json.content || !json.content.patterns) {
    throw new Error(`Missing content.patterns in ${filePath}`);
  }
  const patterns = json.content.patterns;
  let updated = 0;
  let missing = [];
  for (const [slug, scenarios] of Object.entries(SCENARIOS)) {
    if (!patterns[slug]) {
      missing.push(slug);
      continue;
    }
    const scenariosObj = {};
    for (const [scenarioId, data] of Object.entries(scenarios)) {
      scenariosObj[scenarioId] = data[langKey];
    }
    patterns[slug].scenarios = scenariosObj;
    updated++;
  }
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log(`[${filePath}] Updated ${updated} patterns, missing: ${missing.length ? missing.join(", ") : "none"}`);
}

applyI18n(EN_PATH, "en");
applyI18n(ZH_PATH, "zh");
console.log("Done.");
