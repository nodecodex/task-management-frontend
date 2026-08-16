import React from 'react';
import { Button } from "@/components/Component";

export const SectionLabel = ({ children }) => (
  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0">
    {children}
  </div>
);

export const FieldRow = ({ label, children }) => (
  <div className="block space-y-1.5">
    <SectionLabel>{label}</SectionLabel>
    <div className="w-full">{children}</div>
  </div>
);

export const DropdownTrigger = ({ children }) => (
  <div className="flex items-center justify-between px-3 min-h-[36px] rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors duration-150 shadow-sm">
    {children}
  </div>
);

export const IconBtn = ({ title, onClick, children }) => (
  <Button
    type="button"
    title={title}
    onClick={onClick}
    className="p-0 inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors duration-150"
  >
    {children}
  </Button>
);
