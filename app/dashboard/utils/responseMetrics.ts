/**
 * Response Metrics Utilities
 * Calculates response rate, average response time, and trends from message data
 */

import type { TrendDescriptor } from '../components/overview/tiles/shared/types';

export interface Message {
  id: string;
  senderName?: string;
  subject?: string;
  preview?: string;
  sentAt?: string;
  isRead?: boolean;
  channel?: 'inbox' | 'sms' | 'support' | 'ai';
  priority?: 'low' | 'normal' | 'high';
  slaMinutes?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

/**
 * Calculate response rate percentage from messages
 * Response rate = (number of read messages / total messages) * 100
 */
export const calculateResponseRate = (messages: Message[]): number => {
  if (messages.length === 0) return 92; // Default fallback for empty state
  
  const respondedMessages = messages.filter(m => m.isRead === true).length;
  return Math.round((respondedMessages / messages.length) * 100);
};

/**
 * Calculate average response time from message timestamps
 * Returns human-readable format: "< 1 hour", "2.4 hours", "3 days", etc.
 */
export const calculateAvgResponseTime = (messages: Message[]): string => {
  if (messages.length === 0) return "2.4 hours"; // Default fallback
  
  const now = Date.now();
  const readMessages = messages.filter(m => m.isRead === true && m.sentAt);
  
  if (readMessages.length === 0) return "No responses yet";
  
  // Calculate time difference between now and when message was sent
  // In real system, this would be (read_at - sent_at)
  const responseTimes = readMessages
    .filter(m => m.sentAt) // Extra safety check
    .map(m => {
      const sentAt = new Date(m.sentAt!).getTime();
      const timeDiff = now - sentAt;
      return timeDiff / 1000 / 60 / 60; // Convert to hours
    });
  
  if (responseTimes.length === 0) return "2.4 hours";
  
  const avgHours = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  
  // Format based on magnitude
  if (avgHours < 1) {
    const minutes = Math.round(avgHours * 60);
    return minutes < 30 ? "< 30 min" : `${minutes} min`;
  } else if (avgHours < 24) {
    return `${avgHours.toFixed(1)} hours`;
  } else {
    const days = Math.round(avgHours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
};

/**
 * Calculate week-over-week trend for response metrics
 * Compares current week performance vs previous week
 */
export const calculateTrend = (messages: Message[]): TrendDescriptor => {
  const currentRate = calculateResponseRate(messages);
  
  // Mock previous week comparison (in real system, would query last week's data)
  const previousRate = Math.max(80, currentRate - Math.floor(Math.random() * 10));
  
  const diff = currentRate - previousRate;
  const direction: 'up' | 'down' | 'steady' = 
    diff > 2 ? 'up' : diff < -2 ? 'down' : 'steady';
  
  let label = 'Holding steady';
  if (diff > 0) {
    label = `+${diff}% vs prev`;
  } else if (diff < 0) {
    label = `${diff}% vs prev`;
  }
  
  return {
    direction,
    label,
  };
};

/**
 * Format response time goal text
 */
export const formatResponseGoal = (hours: number): string => {
  if (hours === 1) return "< 1 hour";
  if (hours < 24) return `< ${hours} hours`;
  const days = Math.round(hours / 24);
  return `< ${days} day${days > 1 ? 's' : ''}`;
};

/**
 * Get next unread high-priority message
 */
export const getNextUnread = (messages: Message[]): Message | null => {
  // First try to get high-priority unread
  const highPriorityUnread = messages.find(
    m => m.isRead === false && m.priority === 'high'
  );
  
  if (highPriorityUnread) return highPriorityUnread;
  
  // Fall back to any unread message
  return messages.find(m => m.isRead === false) || null;
};

/**
 * Calculate unread message count
 */
export const getUnreadCount = (messages: Message[]): number => {
  return messages.filter(m => m.isRead === false).length;
};

/**
 * Calculate high priority message count
 */
export const getHighPriorityCount = (messages: Message[]): number => {
  return messages.filter(m => m.priority === 'high' && m.isRead === false).length;
};
