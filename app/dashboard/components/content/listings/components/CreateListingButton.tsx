'use client';

import { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { CreateListingModal } from './CreateListingModal';

export const CreateListingButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="relative flex items-center justify-between gap-3 rounded-2xl border border-white/15 bg-gradient-to-r from-[#BD24DF]/40 via-[#6366f1]/30 to-[#2D6ADE]/40 px-5 py-4 text-sm font-semibold text-white shadow-[0_40px_120px_-120px_rgba(56,189,248,0.9)] transition hover:border-white/25 hover:from-[#d040f5]/50 hover:to-[#4f82ff]/50"
      >
        <div className="space-y-1 text-left">
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Create new listing
          </span>
          <span className="text-base font-semibold">Launch a new offer</span>
          <span className="text-[11px] text-white/70">AI drafting ready with smart pricing</span>
        </div>
        <SparklesIcon className="h-6 w-6 text-cyan-200" aria-hidden />
      </button>

      <CreateListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
