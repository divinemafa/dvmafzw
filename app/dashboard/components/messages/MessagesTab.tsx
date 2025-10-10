/**
 * Messages Tab - Inbox and conversations
 */

'use client';

import { ChatBubbleLeftRightIcon, EnvelopeIcon, EnvelopeOpenIcon } from '@heroicons/react/24/outline';
import type { Message } from '../../types';

interface MessagesTabProps {
  messages?: Message[];
}

export function MessagesTab({ messages = [] }: MessagesTabProps) {
  // Mock stats
  const stats = {
    unread: 5,
    total: 47,
  };

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Unread</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.unread}</p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
              <EnvelopeIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Messages</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-purple-500/20 p-3 text-purple-400">
              <EnvelopeOpenIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Messages</h2>
          <p className="mt-1 text-sm text-white/60">Your conversations</p>
        </div>

        <div className="p-6">
          {messages.length === 0 ? (
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-white/40" />
              <h3 className="mt-4 text-lg font-semibold text-white">No messages yet</h3>
              <p className="mt-2 text-sm text-white/60">
                Your inbox will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.slice(0, 8).map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg border border-white/10 p-4 transition hover:bg-white/10 ${
                    message.isRead ? 'bg-white/5' : 'bg-blue-500/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-white">{message.senderName || message.clientName || 'Unknown'}</h4>
                        <span className="text-xs text-white/40">
                          {message.sentAt ? new Date(message.sentAt).toLocaleDateString() : message.timestamp || 'Recent'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-white/60">{message.subject}</p>
                      <p className="mt-2 text-sm text-white/80">{message.preview}</p>
                    </div>
                    {!message.isRead && (
                      <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
