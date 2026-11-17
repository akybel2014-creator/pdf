import React from 'react';
import { Trash2 } from 'lucide-react';

interface HeaderProps {
  hasData: boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ hasData, onReset }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090D16]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <span className="font-display text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 sm:text-base">
          XPart Catalog Normalizer
        </span>

        <button
          type="button"
          onClick={onReset}
          disabled={!hasData}
          className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-slate-800 bg-[#101622] px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-rose-500/50 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-400 shrink-0" aria-hidden="true" />
          <span>Svuota Tutto</span>
        </button>
      </div>
    </header>
  );
};
