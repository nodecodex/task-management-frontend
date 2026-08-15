import React from 'react';
import { Button } from "@/components/Component";

export const SectionLabel = ({ children }) => (
  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
    {children}
  </span>
);

export const FieldRow = ({ label, children }) => (
  <div>
    <SectionLabel>{label}</SectionLabel>
    <div className="mt-1.5">{children}</div>
  </div>
);

export const DropdownTrigger = ({ children }) => (
  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors duration-150">
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
