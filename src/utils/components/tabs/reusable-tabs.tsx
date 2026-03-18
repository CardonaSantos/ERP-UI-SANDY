"use client";
import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface ReusableTabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  variant?: "default" | "compact" | "minimal";
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  activeTab: string;
  handleTabChange?: (value: string) => void;
}

export function ReusableTabs({
  tabs,
  // defaultValue,
  className,
  variant = "default",
  handleTabChange,
  activeTab,
}: ReusableTabsProps) {
  const variantStyles = {
    default: {
      list: "w-full sm:w-auto overflow-x-auto",
      trigger: "min-w-[80px] sm:min-w-[100px] text-sm",
      content: "mt-4",
    },
    compact: {
      list: "w-full sm:w-auto overflow-x-auto h-8",
      trigger: "min-w-[60px] sm:min-w-[80px] text-xs px-2 h-full",
      content: "mt-3",
    },
    minimal: {
      list: "w-full sm:w-auto overflow-x-auto bg-transparent p-0 gap-2",
      trigger:
        "min-w-[70px] sm:min-w-[90px] text-sm border-b-2 border-transparent rounded-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none",
      content: "mt-4 pt-4 border-t border-border",
    },
  };

  const styles = variantStyles[variant];
  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn("w-full", className)}
    >
      <TabsList
        className={cn(
          "flex w-full items-center gap-1 rounded-none border-b bg-transparent p-0",
          styles.list
        )}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "px-3 py-2 text-xs sm:text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-foreground",
              styles.trigger
            )}
          >
            {tab.icon && (
              <span className="mr-1.5 hidden sm:inline ">{tab.icon}</span>
            )}
            <span className="truncate">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("pt-3", styles.content)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
