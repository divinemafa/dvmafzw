/**
 * Calendar Tab - Schedule and availability management
 */

'use client';

import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import type { CalendarEvent, TimeSlot } from '../../types';

interface CalendarTabProps {
  events?: CalendarEvent[];
  timeSlots?: TimeSlot[];
}

export function CalendarTab({ events = [], timeSlots = [] }: CalendarTabProps) {
  // Mock upcoming events
  const upcomingEvents = 3;

  return (
    <>
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Upcoming Events</p>
              <p className="mt-2 text-2xl font-bold text-white">{upcomingEvents}</p>
            </div>
            <div className="rounded-lg bg-purple-500/20 p-3 text-purple-400">
              <CalendarIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Available Slots</p>
              <p className="mt-2 text-2xl font-bold text-white">{timeSlots.length}</p>
            </div>
            <div className="rounded-lg bg-blue-500/20 p-3 text-blue-400">
              <ClockIcon className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-2xl">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold text-white">Calendar</h2>
          <p className="mt-1 text-sm text-white/60">Manage your schedule</p>
        </div>

        <div className="p-6">
          {events.length === 0 ? (
            <div className="rounded-lg bg-white/5 p-8 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-white/40" />
              <h3 className="mt-4 text-lg font-semibold text-white">No events scheduled</h3>
              <p className="mt-2 text-sm text-white/60">
                Your calendar events will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{event.title}</h4>
                      <p className="mt-1 text-sm text-white/60">{event.description}</p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-white/40">
                        <span>
                          {event.startTime ? new Date(event.startTime).toLocaleString() : 
                           event.start ? new Date(event.start).toLocaleString() : 'TBD'}
                        </span>
                        <span>→</span>
                        <span>
                          {event.endTime ? new Date(event.endTime).toLocaleString() : 
                           event.end ? new Date(event.end).toLocaleString() : 'TBD'}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        event.type === 'booking'
                          ? 'bg-blue-500/20 text-blue-400'
                          : event.type === 'meeting'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {event.type}
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
