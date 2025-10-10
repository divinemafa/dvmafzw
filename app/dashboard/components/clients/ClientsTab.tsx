/**
 * Clients Tab - Customer/client management
 */

'use client';

import { UsersIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import type { Client } from '../../types';

interface ClientsTabProps {
  clients?: Client[];
}

export function ClientsTab({ clients = [] }: ClientsTabProps) {
  // Mock stats
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.isActive).length,
    new: clients.filter(c => {
      if (!c.createdAt && !c.joined) return false;
      const dateStr = c.createdAt || c.joined || '';
      const createdDate = new Date(dateStr);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }).length,
  };

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Total Clients</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Active</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.active}</p>
            </div>
            <div className="rounded-lg bg-green-500/20 p-3 text-green-400">
              <UsersIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">New (30d)</p>
              <p className="mt-2 text-2xl font-bold text-white">{stats.new}</p>
            </div>
            <div className="rounded-lg bg-purple-500/20 p-3 text-purple-400">
              <UserPlusIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Clients</h2>
          <p className="mt-1 text-sm text-white/60">Manage your customer base</p>
        </div>

        <div className="p-6">
          {clients.length === 0 ? (
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <UsersIcon className="mx-auto h-12 w-12 text-white/40" />
              <h3 className="mt-4 text-lg font-semibold text-white">No clients yet</h3>
              <p className="mt-2 text-sm text-white/60">
                Your client list will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.slice(0, 8).map((client) => (
                <div
                  key={client.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {(client.avatarUrl || client.avatar) ? (
                        <img
                          src={client.avatarUrl || client.avatar || ''}
                          alt={client.name}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                          <span className="text-lg font-bold text-white">
                            {client.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-white">{client.name}</h4>
                        <p className="text-sm text-white/60">{client.email}</p>
                        <div className="mt-1 flex gap-4 text-xs text-white/40">
                          <span>{client.totalBookings} bookings</span>
                          <span>${client.totalSpent.toLocaleString()} spent</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        client.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
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
