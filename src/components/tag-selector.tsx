"use client";

import { cn } from "@/lib/utils";

interface TagSelectorProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function TagSelector({ label, options, value, onChange }: TagSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-[13px] text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-200 border",
                isSelected
                  ? "bg-teal text-white border-teal shadow-sm scale-[1.02]"
                  : "bg-background text-muted-foreground border-border hover:border-teal/40 hover:text-foreground hover:bg-teal-light/30"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>;
}
