/**
 * useMessagesData Hook
 * Provides normalized message data and calculated metrics for inbox/response features
 * Shared between MessagesTab and InboxResponseCard
 */

'use client';

import { useMemo } from 'react';
import type { Message } from '../types';
import {
  calculateResponseRate,
  calculateAvgResponseTime,
  calculateTrend,
  getNextUnread,
  getUnreadCount,
  getHighPriorityCount,
  type Message as ResponseMessage,
} from '../utils/responseMetrics';

interface NormalizedMessage extends Message {
  channel: 'inbox' | 'sms' | 'support' | 'ai';
  priority: 'low' | 'normal' | 'high';
  slaMinutes?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

/**
 * Normalize messages - creates mock data if empty
 * Same logic as MessagesTab component
 */
const normalizeMessages = (messages: Message[]): NormalizedMessage[] => {
  if (messages.length === 0) {
    return [
      {
        id: 'demo-1',
        senderName: 'Lesedi from Vuma Fitness',
        subject: 'Invoice 1263 paid successfully',
        preview: 'Payment received for the October package. Client asked about adding a friend trial.',
        sentAt: new Date().toISOString(),
        isRead: false,
        channel: 'inbox',
        priority: 'normal',
        slaMinutes: 30,
        sentiment: 'positive',
      },
      {
        id: 'demo-2',
        senderName: 'Thabo Dlamini',
        subject: 'Need to adjust class time',
        preview: 'Hey! Could we move tomorrow to a later slot? My flight is delayed 2 hours.',
        sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        isRead: false,
        channel: 'support',
        priority: 'high',
        slaMinutes: 15,
        sentiment: 'neutral',
      },
      {
        id: 'demo-3',
        senderName: 'WhatsApp Broadcast',
        subject: '14 people replied to your spring promo',
        preview: 'Quick tip: Start a segmented follow-up for the high-intent responders to secure more bookings.',
        sentAt: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
        isRead: true,
        channel: 'ai',
        priority: 'low',
        sentiment: 'positive',
      },
    ];
  }

  return messages.map((message, index) => ({
    ...message,
    channel: 'inbox' as const,
    priority: (index < 2 ? 'high' : 'normal') as 'high' | 'normal',
    slaMinutes: 30,
    sentiment: 'neutral' as const,
  }));
};

export interface MessagesData {
  messages: NormalizedMessage[];
  unreadCount: number;
  highPriorityCount: number;
  responseRate: number;
  avgResponseTime: string;
  trend: ReturnType<typeof calculateTrend>;
  nextUnread: ResponseMessage | null;
}

/**
 * Hook to get normalized messages and calculated metrics
 * @param messages - Optional array of messages (falls back to mock data)
 */
export const useMessagesData = (messages: Message[] = []): MessagesData => {
  const normalizedMessages = useMemo(() => normalizeMessages(messages), [messages]);

  const unreadCount = useMemo(() => getUnreadCount(normalizedMessages), [normalizedMessages]);
  
  const highPriorityCount = useMemo(() => getHighPriorityCount(normalizedMessages), [normalizedMessages]);

  const responseRate = useMemo(() => calculateResponseRate(normalizedMessages), [normalizedMessages]);

  const avgResponseTime = useMemo(() => calculateAvgResponseTime(normalizedMessages), [normalizedMessages]);

  const trend = useMemo(() => calculateTrend(normalizedMessages), [normalizedMessages]);

  const nextUnread = useMemo(() => getNextUnread(normalizedMessages), [normalizedMessages]);

  return {
    messages: normalizedMessages,
    unreadCount,
    highPriorityCount,
    responseRate,
    avgResponseTime,
    trend,
    nextUnread,
  };
};
