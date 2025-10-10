/**
 * FloatingChatButton - Bottom-right floating action button
 * Provides quick access to support/help chat
 */

'use client';

import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function FloatingChatButton() {
  const [isPulsing, setIsPulsing] = useState(true);

  return (
    <button
      onClick={() => {
        setIsPulsing(false);
        // TODO: Open chat modal
        alert('Chat support coming soon!');
      }}
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-white/20 bg-gradient-to-r from-purple-500 to-blue-500 p-4 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-purple-500/50"
    >
      {/* Pulsing Ring Effect */}
      {isPulsing && (
        <span className="absolute inset-0 animate-ping rounded-full bg-purple-500 opacity-75" />
      )}
      
      {/* Icon */}
      <ChatBubbleLeftRightIcon className="relative h-6 w-6 text-white" />
      
      {/* Expandable Label (Desktop) */}
      <span className="relative hidden max-w-0 overflow-hidden text-sm font-semibold text-white transition-all duration-300 group-hover:max-w-xs group-hover:pr-2 lg:block">
        Chat Support
      </span>
      
      {/* New Message Indicator (optional) */}
      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
        1
      </span>
    </button>
  );
}
