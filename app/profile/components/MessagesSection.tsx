/**
 * Messages Section Component (Placeholder)
 * 
 * TODO: Implement real messaging system with database integration
 */

import { InboxIcon } from '@heroicons/react/24/outline';

export function MessagesSection() {
  return (
    <div className="flex h-full min-h-[500px] items-center justify-center rounded-xl border border-white/10 bg-white/5 p-12 backdrop-blur-2xl">
      <div className="text-center">
        <InboxIcon className="mx-auto mb-4 h-16 w-16 text-white/30" />
        <h3 className="mb-2 text-lg font-semibold text-white/60">Messages Coming Soon</h3>
        <p className="text-sm text-white/40">
          The messaging system is under development.
          <br />
          You&apos;ll be able to communicate with clients and service providers here.
        </p>
      </div>
    </div>
  );
}
