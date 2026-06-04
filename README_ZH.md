# CodePrism

<div align="center">

![许可](https://img.shields.io/badge/License-PolyForm%20Noncommercial%20-blue.svg)
![Node](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![pnpm](https://img.shields.io/badge/pnpm-10.33-orange.svg)

**交互式可视化教程平台 — 让抽象的计算概念变得直观可见**

[⭐ GitHub](https://github.com/hupeng84/codeprism) | [English](README.md) | [在线演示](https://codeprism.hujunxi.com) | [文档](#)

</div>

---

## ✨ CodePrism 是什么？

CodePrism 将抽象的计算概念转化为直观的视觉体验。观看算法逐步执行，实时观察数据结构的演变，通过交互式 UML 图和对象交互理解设计模式。

## 🚀 在线预览

<!-- 截图区域 - 请替换为你的实际截图 -->
<div align="center">

| 首页 | 算法可视化器 |
|:---:|:---:|
| ![首页](screenshots/homepage.png) | ![算法可视化器](screenshots/algorithm-visualizer.png) |
| **模式探索器** | **数据结构视图** |
| ![模式探索器](screenshots/pattern-explorer.png) | ![数据结构](screenshots/data-structure.png) |

*点击图片可放大查看*

</div>

## ✨ 核心特性

### 🏗️ 设计模式
23 种 GoF 设计模式，提供丰富的交互功能：
- **UML 类图** - 可视化的结构表示
- **运行时对象交互** - 实时观察对象的交互过程
- **代码同步** - 高亮代码跟随可视化进程

### 🧱 数据结构
从基础到高级，全部可视化呈现：
- **线性结构** - 数组、链表、栈、队列的插入、删除、搜索操作
- **树形结构** - BST、AVL、红黑树、Trie、线段树
- **图结构** - 路径搜索、遍历、最小生成树
- **高级结构** - 堆、哈希表、布隆过滤器、LRU 缓存

### ⚡ 算法
逐步执行，深入洞察：
- **排序算法** - 13 种算法，从冒泡排序到归并排序
- **搜索算法** - 二分、线性、插值等多种搜索
- **图算法** - BFS、DFS、Dijkstra、A*、Kruskal
- **逐帧播放控制** - 完整掌控执行过程
- **代码高亮同步** - 实时显示正在执行的代码行
- **变量追踪** - 观察状态变化的每一个瞬间

### 🎨 精美界面
- **暗色主题** - 长时间学习也不累眼睛
- **流畅动画** - 60fps 的过渡和交互效果
- **响应式设计** - 支持桌面、平板和手机
- **Monaco 编辑器** - 专业级代码阅读体验

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **框架** | Next.js 15 (App Router) |
| **语言** | TypeScript |
| **样式** | Tailwind CSS v4 |
| **状态管理** | Zustand |
| **代码编辑器** | Monaco Editor |
| **可视化** | Mermaid + React X Mermaid |
| **图表布局** | Dagre + XYFlow |
| **包管理器** | pnpm + Turborepo |

## 📦 项目结构

```
codeprism/
├── src/                      # Next.js App Router
│   └── app/                  # 路由页面
├── packages/
│   ├── core/                 # 核心可视化引擎
│   │   ├── engine/           # 播放控制器
│   │   └── renderers/        # Canvas 渲染器
│   ├── content/              # 教程内容
│   │   ├── algorithms/       # 算法实现
│   │   ├── structures/       # 数据结构实现
│   │   └── patterns/         # 设计模式实现
│   └── ui/                   # 共享 UI 组件
├── public/                   # 静态资源
├── tests/                    # E2E 测试 (Playwright)
└── docs/                     # 文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 22.0.0
- pnpm >= 10.33.0

### 安装

```bash
# 克隆仓库
git clone https://github.com/hupeng84/codeprism.git
cd codeprism

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

### 构建生产版本

```bash
pnpm build
pnpm start
```

### 运行测试

```bash
# 单元测试
pnpm test

# E2E 测试
pnpm test:e2e

# 可视化 E2E 测试
pnpm test:e2e:ui
```

## 📋 可用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建所有包 |
| `pnpm start` | 启动生产服务器 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试 |
| `pnpm test:coverage` | 生成覆盖率报告 |
| `pnpm lint` | 代码检查 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm clean` | 清理构建产物 |

## 🐳 Docker 部署

### 使用 Docker Compose（推荐）

```bash
# 构建并启动
docker compose up -d

# 查看日志
docker compose logs -f

# 停止
docker compose down
```

### 直接使用 Docker

```bash
# 构建镜像
docker build -t codeprism .

# 运行容器
docker run -d -p 3000:3000 --name codeprism codeprism
```

### 生产环境 SSL 配置

```bash
# 1. 创建 nginx.conf
# 2. 将 SSL 证书放置在 ./certs/ 目录
# 3. 使用 SSL 配置启动
docker compose --profile ssl up -d
```

## 📚 内容概览

### 排序算法 (13)
| 算法 | 时间复杂度 | 类别 |
|------|------------|------|
| 冒泡排序 | O(n²) | 交换排序 |
| 快速排序 | O(n log n) | 分治排序 |
| 归并排序 | O(n log n) | 分治排序 |
| 堆排序 | O(n log n) | 选择排序 |
| ... | ... | ... |

### 搜索算法 (7)
- 二分搜索、线性搜索、插值搜索
- 跳跃搜索、指数搜索、斐波那契搜索、三分搜索

### 数据结构 (16)
- **线性结构**: 数组、链表、栈、队列
- **树形结构**: BST、AVL、红黑树、Trie、线段树、树状数组
- **图结构**: 图、跳表
- **高级结构**: 哈希表、堆、并查集、LRU 缓存、布隆过滤器

### 设计模式 (23)

| 类别 | 模式 |
|------|------|
| **行为型** | 观察者、命令、迭代器、中介者、备忘录、状态、策略、模板方法、访问者 |
| **创建型** | 抽象工厂、建造者、原型、工厂方法、单例 |
| **结构型** | 适配器、桥接、组合、装饰器、外观、享元、代理 |

## 🤝 贡献指南

欢迎贡献！请随时提交 Pull Request。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 **PolyForm Noncommercial License** 许可。

> **商业使用声明**: 未经明确授权，禁止对本项目及衍生项目进行商业使用。

详见 [LICENSE](LICENSE) 文件。

## ⭐ Star History · Star 趋势

<div align="center">

<a href="https://star-history.com/#hupeng84/codeprism&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=hupeng84/codeprism&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=hupeng84/codeprism&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=hupeng84/codeprism&type=Date" />
  </picture>
</a>

</div>

## ☕ 支持 / 打赏

如果 CodePrism 帮你学到了一些新东西，欢迎请我喝杯咖啡 —— 它只是杯咖啡，不是合同。打赏不会影响功能优先级或 Issue 处理顺序。

扫码支持一下:

<div align="center">

| 微信支付 WeChat Pay | 支付宝 Alipay |
|:---:|:---:|
| ![微信支付](.github/sponsor/wechat-pay.jpg) | ![支付宝](.github/sponsor/alipay.jpg) |

</div>

---

<div align="center">

**由 ❤️ [hupeng](https://github.com/hupeng84) 制作**

**如果 CodePrism 对你有帮助，请给它一个 ⭐**

</div>