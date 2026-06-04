import { useTranslations } from "next-intl";

export function VisualizerDemo() {
  const t = useTranslations("reference.visualizerDemo");
  const tp = useTranslations("content.patterns");

  return (
    <section id="visualizer" className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-1">{t("title")}</h2>
            <p className="text-text-secondary">{t("subtitle")}</p>
          </div>
          <div className="flex gap-0.5 bg-bg-input p-0.5 rounded-md">
            {[
              { key: "structure", label: t("tabs.structure") },
              { key: "runtime", label: t("tabs.runtime") },
              { key: "code", label: t("tabs.code") },
            ].map((tab, _i) => (
              <button
                key={tab.key}
                className={`px-5 py-2 rounded-[6px] text-xs font-medium border-none cursor-pointer transition-colors ${
                  _i === 0 ? "bg-bg-card text-text-primary shadow-sm" : "bg-transparent text-text-tertiary hover:text-text-secondary"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visualizer Layout */}
        <div className="grid grid-cols-[220px_1fr_280px] border border-border rounded-xl overflow-hidden min-h-[500px]">
          {/* Sidebar */}
          <div className="bg-bg-elevated border-r border-border p-5">
            <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-4">{t("sidebar.navTitle")}</div>
            {[
              {
                label: t("sidebar.creational"),
                items: [
                  { key: "singleton", label: tp("singleton.title") },
                  { key: "factory-method", label: tp("factory-method.title") },
                  { key: "abstract-factory", label: tp("abstract-factory.title") },
                  { key: "builder", label: tp("builder.title") },
                  { key: "prototype", label: tp("prototype.title") },
                ],
              },
              {
                label: t("sidebar.structural"),
                items: [
                  { key: "adapter", label: tp("adapter.title") },
                  { key: "bridge", label: tp("bridge.title") },
                  { key: "composite", label: tp("composite.title") },
                  { key: "decorator", label: tp("decorator.title") },
                  { key: "facade", label: tp("facade.title") },
                ],
              },
            ].map((group) => (
              <div key={group.label} className="mb-4">
                <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider px-3 mt-2 mb-1">{group.label}</div>
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                      item.key === "decorator" ? "bg-accent-coral-soft text-accent-coral" : "text-text-secondary hover:text-text-primary hover:bg-bg-glass-light"
                    }`}
                  >
                    {item.key === "decorator" ? "🔗" : " "} {item.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Main */}
          <div className="flex flex-col bg-bg-primary">
            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              {/* Decorator Demo */}
              <div className="flex gap-6 items-center justify-center w-full">
                {[
                  { emoji: "☕", label: "Espresso", price: "$2.50", color: "border-border", bg: "bg-bg-card" },
                  { emoji: "🥛", label: "Milk", price: "+$0.50", color: "border-accent-coral", bg: "bg-accent-coral-soft" },
                  { emoji: "🍫", label: "Mocha", price: "+$0.75", color: "border-accent-gold", bg: "bg-accent-gold-soft" },
                ].map((obj, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`w-[70px] h-[70px] ${obj.bg} border-2 ${obj.color} rounded-lg flex items-center justify-center text-2xl mx-auto mb-2`}>
                        {obj.emoji}
                      </div>
                      <div className="text-xs text-text-secondary">{obj.label}</div>
                      <div className="text-[11px] font-code text-accent-teal">{obj.price}</div>
                    </div>
                    {i < 2 && <span className="text-accent-coral text-lg">⊕</span>}
                  </div>
                ))}
              </div>

              {/* Result */}
              <div className="mt-6 px-6 py-4 bg-bg-glass backdrop-blur-sm border border-border rounded-md flex items-center gap-4">
                <span className="text-sm text-text-secondary">{t("result.finalProduct")}</span>
                <span className="font-heading text-lg font-semibold">Mocha</span>
                <span className="font-code text-base text-accent-teal font-semibold">$3.75</span>
                <span className="text-xs text-text-tertiary">= 2.50 + 0.50 + 0.75</span>
              </div>

              {/* Step indicator */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-bg-glass backdrop-blur-sm px-5 py-1.5 rounded-full text-xs text-text-secondary border border-border">
                {t("step.label").replace("{current}", "3").replace("{total}", "5").replace("{action}", "Add Mocha Decorator")}
              </div>

              {/* Playback */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-bg-glass backdrop-blur-md border border-border rounded-xl px-5 py-2.5 flex items-center gap-3 shadow-lg">
                {["⏮", "◀", "▶", "▶▶", "⏭"].map((btn, i) => (
                  <button
                    key={i}
                    className={`w-9 h-9 flex items-center justify-center border-none rounded-md cursor-pointer transition-colors ${
                      btn === "▶"
                        ? "bg-gradient-to-r from-accent-coral to-accent-gold text-white shadow-lg shadow-accent-coral/25 rounded-full w-11 h-11 hover:scale-105"
                        : "bg-transparent text-text-secondary hover:bg-bg-glass-light hover:text-text-primary"
                    }`}
                  >
                    {btn}
                  </button>
                ))}
                <div className="w-[200px] h-1 bg-bg-glass-light rounded-full relative cursor-pointer">
                  <div className="h-full w-[60%] bg-gradient-to-r from-accent-coral to-accent-gold rounded-full transition-all" />
                </div>
                <span className="font-code text-xs text-text-secondary">3 / 5</span>
                <span className="font-code text-xs text-text-tertiary px-2 py-1 border border-border rounded cursor-pointer hover:border-border-hover hover:text-text-primary transition-colors">1×</span>
              </div>
            </div>

            {/* Code Panel */}
            <div className="h-[180px] border-t border-border bg-bg-code flex flex-col">
              <div className="flex items-center justify-between px-5 py-2.5 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{t("codePanel.implementationCode")}</span>
                  <span className="text-[11px] font-code text-text-tertiary px-2 py-0.5 bg-bg-glass-light rounded">TypeScript</span>
                </div>
                <div className="flex gap-3">
                  <button className="text-xs text-text-tertiary px-3 py-1 border border-border rounded hover:text-text-primary hover:border-border-hover transition-colors">{t("buttons.copy")}</button>
                  <button className="text-xs text-text-tertiary px-3 py-1 border border-border rounded hover:text-text-primary hover:border-border-hover transition-colors">{t("buttons.edit")}</button>
                </div>
              </div>
              <div className="flex-1 p-4 font-code text-xs leading-relaxed text-text-tertiary overflow-auto">
                {([
                  [1, "// Decorator Pattern — dynamically add responsibilities to objects"],
                  [2, "interface Coffee { cost(): number; description(): string; }"],
                  [3, ""],
                  [4, "class Espresso implements Coffee {"],
                  [5, "  cost() { return 2.50; }"],
                  [6, "  description() { return 'Espresso'; }"],
                  [7, "}"],
                  [8, "abstract class Decorator implements Coffee {", true],
                  [9, "  constructor(protected coffee: Coffee) {}", true],
                  [10, "  abstract cost(): number;", true],
                  [11, "}"],
                  [12, "class Milk extends Decorator {"],
                  [13, "  cost() { return this.coffee.cost() + 0.50; }"],
                  [14, "  description() { return this.coffee.description() + ' + Milk'; }"],
                  [15, "}"],
                ] as [number, string, boolean?][]).map(([line, text, hl]) => (
                  <div key={line} className={`flex gap-4 px-2 rounded ${hl ? "bg-accent-coral-soft text-text-primary" : ""}`}>
                    <span className="w-7 text-right text-text-tertiary select-none">{line}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="bg-bg-elevated border-l border-border p-5 flex flex-col gap-5 overflow-auto">
            <div>
              <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">{t("infoPanel.description")}</div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t("infoPanel.decoratorDesc")}
              </p>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">{t("infoPanel.complexity")}</div>
              <div className="grid gap-2">
                {[
                  { label: t("infoPanel.timeComplexity"), value: "O(1)" },
                  { label: t("infoPanel.spaceComplexity"), value: "O(n)" },
                ].map((c) => (
                  <div key={c.label} className="flex justify-between items-center px-3 py-2 bg-bg-card rounded text-xs">
                    <span className="text-text-secondary">{c.label}</span>
                    <span className="font-code text-accent-teal font-medium">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-3">{t("infoPanel.sandbox")}</div>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-text-secondary font-medium">{t("infoPanel.selectBase")}</label>
                  <select className="px-4 py-2.5 bg-bg-input border border-border rounded-md text-xs text-text-primary font-code cursor-pointer focus:outline-none focus:border-accent-coral focus:ring-2 focus:ring-accent-coral-soft transition-colors">
                    <option>Espresso ($2.50)</option>
                    <option>Americano ($2.00)</option>
                    <option>Latte Base ($3.00)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium mb-2 block">{t("infoPanel.addDecorators")}</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {["🥛 Milk", "🍫 Mocha", "🍦 Cream"].map((preset) => (
                      <button
                        key={preset}
                        className={`px-2.5 py-1 bg-bg-card border border-border rounded text-xs font-code text-text-tertiary cursor-pointer transition-colors hover:border-border-hover hover:text-text-primary ${preset === "🥛 Milk" ? "border-accent-coral text-accent-coral bg-accent-coral-soft" : ""}`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
