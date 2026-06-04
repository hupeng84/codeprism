"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
  className?: string;
}

export function TabList({ children, className }: TabListProps) {
  return (
    <div className={`flex gap-0.5 bg-bg-input p-0.5 rounded-md ${className || ""}`}>
      {children}
    </div>
  );
}

interface TabTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabTrigger({ value, children, className }: TabTriggerProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabTrigger must be used within Tabs");
  const isActive = ctx.activeTab === value;
  return (
    <button
      onClick={() => ctx.setActiveTab(value)}
      className={`px-5 py-2 rounded-[6px] text-xs font-medium border-none cursor-pointer transition-colors ${
        isActive
          ? "bg-bg-card text-text-primary shadow-sm"
          : "bg-transparent text-text-tertiary hover:text-text-secondary"
      } ${className || ""}`}
    >
      {children}
    </button>
  );
}

interface TabContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export function TabContent({ value, children, className }: TabContentProps) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabContent must be used within Tabs");
  if (ctx.activeTab !== value) return null;
  return <div className={className}>{children}</div>;
}
