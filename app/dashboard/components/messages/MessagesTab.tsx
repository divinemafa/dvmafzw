/**
 * Messages Tab - Unified inbox with compact communication controls
 */

'use client';

import { useMemo, useState, type ComponentType } from 'react';
import {
  BoltIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  PhoneIcon,
  UserGroupIcon,
  PencilIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type { Message } from '../../types';

interface MessagesTabProps {
  messages?: Message[];
}

interface NormalizedMessage extends Message {
  channel: 'inbox' | 'sms' | 'support' | 'ai';
  priority: 'low' | 'normal' | 'high';
  slaMinutes?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

const primaryFrameClass = [
  'relative isolate overflow-hidden rounded-[32px]',
  'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
  'p-5 md:p-6 xl:p-8 shadow-[0_50px_160px_-80px_rgba(76,29,149,0.55)]',
].join(' ');

const frameOverlayClass =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(129,140,248,0.22),transparent_60%)]';

const microCardClass = [
  'relative isolate flex flex-col justify-between overflow-hidden rounded-[24px]',
  'border border-white/10 bg-white/5 p-4 backdrop-blur-2xl',
].join(' ');

const microOverlayClass =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_70%)]';

const neutralStrengthClass = 'rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50';

type ManagementViewKey = 'history' | 'filter' | 'archive' | 'trash';

const managementAccentStyles: Record<ManagementViewKey, {
  buttonActive: string;
  buttonInactive: string;
  iconActive: string;
  iconInactive: string;
  iconColorActive: string;
  iconColorInactive: string;
  countActive: string;
  countInactive: string;
}> = {
  history: {
    buttonActive: 'border-indigo-300/50 bg-indigo-400/15 shadow-md shadow-indigo-500/20',
    buttonInactive: 'border-white/12 bg-white/5 hover:border-indigo-300/35 hover:bg-indigo-400/10',
    iconActive: 'border-indigo-300/50 bg-indigo-400/20',
    iconInactive: 'border-indigo-300/35 bg-indigo-400/10',
    iconColorActive: 'text-indigo-50',
    iconColorInactive: 'text-indigo-200',
    countActive: 'text-indigo-100',
    countInactive: 'text-white/60',
  },
  filter: {
    buttonActive: 'border-blue-300/50 bg-blue-400/15 shadow-md shadow-blue-500/20',
    buttonInactive: 'border-white/12 bg-white/5 hover:border-blue-300/35 hover:bg-blue-400/10',
    iconActive: 'border-blue-300/50 bg-blue-400/20',
    iconInactive: 'border-blue-300/35 bg-blue-400/10',
    iconColorActive: 'text-blue-50',
    iconColorInactive: 'text-blue-200',
    countActive: 'text-blue-100',
    countInactive: 'text-white/60',
  },
  archive: {
    buttonActive: 'border-amber-300/50 bg-amber-400/15 shadow-md shadow-amber-500/20',
    buttonInactive: 'border-white/12 bg-white/5 hover:border-amber-300/35 hover:bg-amber-400/10',
    iconActive: 'border-amber-300/50 bg-amber-400/20',
    iconInactive: 'border-amber-300/35 bg-amber-400/10',
    iconColorActive: 'text-amber-50',
    iconColorInactive: 'text-amber-200',
    countActive: 'text-amber-100',
    countInactive: 'text-white/60',
  },
  trash: {
    buttonActive: 'border-rose-300/50 bg-rose-400/15 shadow-md shadow-rose-500/20',
    buttonInactive: 'border-white/12 bg-white/5 hover:border-rose-300/35 hover:bg-rose-400/10',
    iconActive: 'border-rose-300/50 bg-rose-400/20',
    iconInactive: 'border-rose-300/35 bg-rose-400/10',
    iconColorActive: 'text-rose-50',
    iconColorInactive: 'text-rose-200',
    countActive: 'text-rose-100',
    countInactive: 'text-white/60',
  },
};

const sidebarFrameClass = [
  'relative isolate overflow-hidden rounded-[20px]',
  'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
  'p-4 shadow-[0_40px_120px_-70px_rgba(56,189,248,0.45)] backdrop-blur-3xl',
].join(' ');

const sidebarOverlayClass =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_60%)]';

const mockReplyTemplates = [
  {
    title: 'Booking confirmation',
    body: 'Thanks for reaching out! Your booking is confirmed for {{date}} at {{time}}. Let us know if anything changes.',
  },
  {
    title: 'Follow-up review',
    body: 'Hi {{name}}, thanks for trusting us. We would love a quick review about your experience this week.',
  },
  {
    title: 'Payment reminder',
    body: 'Gentle reminder that the outstanding balance of {{amount}} is due. Reply with PAY to settle instantly.',
  },
];

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
    channel: 'inbox',
    priority: index < 2 ? 'high' : 'normal',
    slaMinutes: 30,
    sentiment: 'neutral',
  }));
};

type SidebarSectionId = 'channels' | 'slas' | 'quickReplies' | 'engagement' | 'collaboration';

interface SidebarSection {
  label: string;
  badge?: string;
  content: JSX.Element;
}

export function MessagesTab({ messages = [] }: MessagesTabProps) {
  const conversationData = useMemo(() => normalizeMessages(messages), [messages]);
  const unreadCount = conversationData.filter((item) => item.isRead === false).length;
  const highPriority = conversationData.filter((item) => item.priority === 'high').length;
  const awaitingReply = conversationData.filter((item) => item.isRead === true).length;

  const weeklyHeat = useMemo(() => [12, 9, 14, 11, 16, 7, 5], []);
  const [selectedId, setSelectedId] = useState(conversationData[0]?.id ?? null);
  const [activeSidebarSection, setActiveSidebarSection] = useState<SidebarSectionId>('channels');
  const [showAutoTriage, setShowAutoTriage] = useState(false);
  const [editingReply, setEditingReply] = useState(false);
  const [customReply, setCustomReply] = useState('');
  const [replyMode, setReplyMode] = useState<'suggested' | 'custom'>('suggested');
  const [activeView, setActiveView] = useState<'inbox' | 'history' | 'archive' | 'trash'>('inbox');
  const [showFilterModal, setShowFilterModal] = useState(false);

  const selectedConversation = conversationData.find((item) => item.id === selectedId) ?? conversationData[0] ?? null;

  const generateSuggestedReply = (conversation: NormalizedMessage | null) => {
    if (!conversation) return '';
    return `Hi ${conversation.senderName?.split(' ')[0] || 'there'}, we can shift your session to 18:00. Does that work? I can send the updated invite immediately.`;
  };

  const suggestedReply = useMemo(() => generateSuggestedReply(selectedConversation), [selectedConversation]);

  const sidebarSections = useMemo<Record<SidebarSectionId, SidebarSection>>(
    () => ({
      channels: {
        label: 'Channels',
        badge: conversationData.length.toString(),
        content: (
          <div className="grid grid-cols-2 gap-2 text-[10px] text-white/60">
            {[
              { label: 'Inbox', count: conversationData.length },
              { label: 'SMS', count: 6 },
              { label: 'AI nudges', count: 4 },
              { label: 'Escalations', count: highPriority },
            ].map((item) => (
              <span key={item.label} className="rounded-[14px] border border-white/12 bg-white/5 px-2 py-1 text-left">
                {item.label}
                <span className="ml-1 text-white/35">{item.count}</span>
              </span>
            ))}
          </div>
        ),
      },
      slas: {
        label: 'SLAs',
        badge: 'On track',
        content: (
          <ul className="space-y-2 text-[10px] text-white/65">
            {[
              { label: 'VIP', target: 'Reply in 10m', actual: '6m avg' },
              { label: 'Standard', target: 'Reply in 30m', actual: '22m avg' },
              { label: 'After hours', target: 'Reply in 2h', actual: '58m avg' },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/5 px-2.5 py-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-white">{row.label}</p>
                  <p>{row.target}</p>
                </div>
                <span className="rounded-full border border-emerald-300/40 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-emerald-200">
                  {row.actual}
                </span>
              </li>
            ))}
          </ul>
        ),
      },
      quickReplies: {
        label: 'Replies',
        badge: `${mockReplyTemplates.length}`,
        content: (
          <ul className="space-y-1.5 text-[10px] text-white/65">
            {mockReplyTemplates.map((template) => (
              <li key={template.title} className="rounded-[14px] border border-white/10 bg-white/5 px-2.5 py-2">
                <p className="text-xs font-semibold text-white">{template.title}</p>
                <p className="mt-1 line-clamp-2 text-white/50">{template.body}</p>
              </li>
            ))}
          </ul>
        ),
      },
      engagement: {
        label: 'Heat',
        badge: '7d',
        content: (
          <div className="grid grid-cols-2 gap-2 text-center text-[9px] text-white/55">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="rounded-[14px] border border-white/10 bg-white/5 p-2.5">
                <p className="text-white/65">{day}</p>
                <p className="mt-1 text-base font-semibold text-white">{weeklyHeat[index]}</p>
                <p className="text-white/35">convos</p>
              </div>
            ))}
          </div>
        ),
      },
      collaboration: {
        label: 'Collab',
        badge: 'Live',
        content: (
          <div className="space-y-2 text-[10px] text-white/65">
            {[
              { title: 'Escalated to finance', owner: 'Nomsa', due: 'Today 16:00' },
              { title: 'Awaiting documents', owner: 'Theo', due: 'Tomorrow 10:00' },
              { title: 'AI drafted follow-ups', owner: 'Automation', due: 'Ready now' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/5 px-2.5 py-2">
                <div className="space-y-0.5 text-left">
                  <p className="text-xs font-semibold text-white">{item.title}</p>
                  <p className="text-white/45">{item.owner}</p>
                </div>
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.25em] text-white/50">
                  {item.due}
                </span>
              </div>
            ))}
          </div>
        ),
      },
    }),
    [conversationData, highPriority, weeklyHeat]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <aside className="lg:col-span-3 space-y-3">
          {/* Stat Cards in Column */}
          <MessageStatCard label="Unread" value={unreadCount} icon={EnvelopeIcon} accent="indigo" trend="+3 new today" />
          <MessageStatCard label="High priority" value={highPriority} icon={BoltIcon} accent="rose" trend="Respond < 15m" />
          <MessageStatCard label="Awaiting reply" value={awaitingReply} icon={EnvelopeOpenIcon} accent="blue" trend="Follow up" />
          
          {/* Workflow Snapshot */}
          <div className={sidebarFrameClass}>
            <span className={sidebarOverlayClass} />
            <header className="flex items-start justify-between text-white">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-semibold">Ops palette</p>
                <h3 className="text-base font-bold mt-1">Workflow snapshot</h3>
              </div>
              {sidebarSections[activeSidebarSection]?.badge ? (
                <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/55">
                  {sidebarSections[activeSidebarSection]?.badge}
                </span>
              ) : null}
            </header>
            <div className="mt-3 inline-flex w-full flex-wrap gap-1.5">
              {(Object.keys(sidebarSections) as SidebarSectionId[]).map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSidebarSection(section)}
                  className={`relative rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.3em] transition-all duration-200 ${
                    activeSidebarSection === section
                      ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/30'
                      : 'bg-white/5 text-white/50 ring-1 ring-white/10 hover:bg-white/10 hover:text-white/70 hover:ring-white/20'
                  }`}
                >
                  {sidebarSections[section]?.label}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-[16px] border border-white/8 bg-white/5 p-3 text-white/70">
              {sidebarSections[activeSidebarSection]?.content}
            </div>
          </div>

          {/* Search & Storage Section */}
          <div className={sidebarFrameClass}>
            <span className={sidebarOverlayClass} />
            
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-sm text-white placeholder-white/30 focus:border-indigo-300/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition"
              />
            </div>

            {/* Storage Info */}
            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-semibold">Storage</p>
                <span className="text-[10px] font-semibold text-white/60">67%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[67%] bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
              </div>
              <p className="mt-1.5 text-[10px] text-white/45">2.1 GB of 3 GB used</p>
            </div>
          </div>
        </aside>

        <section className="lg:col-span-9">
          <div className={primaryFrameClass}>
            <span className={frameOverlayClass} />
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Conversation Control</h2>
                <p className="text-xs text-white/45">Review, respond, and orchestrate every message from one command center.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="group rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
                >
                  <span className="flex items-center gap-1.5">
                    <EnvelopeIcon className="h-3.5 w-3.5" />
                    New
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAutoTriage(!showAutoTriage)}
                  className={`group rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                    showAutoTriage
                      ? 'border-emerald-300/60 bg-emerald-400/20 text-emerald-100 shadow-lg shadow-emerald-500/25'
                      : 'border-emerald-300/40 bg-emerald-400/10 text-emerald-200 hover:border-emerald-300/60 hover:bg-emerald-400/15'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    Auto-triage
                  </span>
                </button>
              </div>
            </header>

            {/* Auto-Triage Panel */}
            {showAutoTriage && (
              <div className="mt-5 rounded-[24px] border border-emerald-300/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-5 backdrop-blur-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-emerald-100 flex items-center gap-2">
                      <SparklesIcon className="h-5 w-5" />
                      Auto-Triage Intelligence
                    </h3>
                    <p className="text-xs text-emerald-200/60 mt-1">AI-powered message prioritization and routing</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAutoTriage(false)}
                    className="rounded-full border border-white/15 bg-white/5 p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">Priority Sort</p>
                      <span className="rounded-full bg-rose-400/20 px-2 py-0.5 text-[9px] font-bold text-rose-100">{highPriority}</span>
                    </div>
                    <p className="text-xs text-white/70">High-priority messages auto-flagged based on urgency keywords and SLA risk.</p>
                  </div>
                  
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">Smart Route</p>
                      <span className="rounded-full bg-indigo-400/20 px-2 py-0.5 text-[9px] font-bold text-indigo-100">Active</span>
                    </div>
                    <p className="text-xs text-white/70">Automatically assign conversations to the right team member based on expertise.</p>
                  </div>
                  
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">AI Drafts</p>
                      <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[9px] font-bold text-emerald-100">Live</span>
                    </div>
                    <p className="text-xs text-white/70">Generate contextual reply suggestions for every incoming message instantly.</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs font-semibold text-white mb-2">Triage Rules</p>
                    <ul className="space-y-1.5 text-[11px] text-white/60">
                      <li className="flex items-center gap-2">
                        <CheckIcon className="h-3 w-3 text-emerald-300" />
                        Payment keywords → Billing team
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="h-3 w-3 text-emerald-300" />
                        Booking changes → Operations
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="h-3 w-3 text-emerald-300" />
                        Complaints → Priority escalation
                      </li>
                    </ul>
                  </div>
                  
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs font-semibold text-white mb-2">Performance Today</p>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Messages triaged</span>
                        <span className="font-semibold text-white">147</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Avg. response time</span>
                        <span className="font-semibold text-emerald-300">8m 42s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Auto-resolved</span>
                        <span className="font-semibold text-indigo-300">23</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                      {activeView === 'inbox' && 'Conversation queue'}
                      {activeView === 'history' && 'Message history'}
                      {activeView === 'archive' && 'Archived conversations'}
                      {activeView === 'trash' && 'Deleted messages'}
                    </p>
                    {activeView !== 'inbox' && (
                      <button
                        type="button"
                        onClick={() => setActiveView('inbox')}
                        className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50 hover:border-indigo-300/40 hover:bg-indigo-400/10 hover:text-indigo-200 transition"
                      >
                        Back to inbox
                      </button>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40">
                    {activeView === 'inbox' && `${conversationData.length} total`}
                    {activeView === 'history' && `${conversationData.length} past`}
                    {activeView === 'archive' && '12 archived'}
                    {activeView === 'trash' && '3 deleted'}
                  </span>
                </div>
                
                {activeView === 'inbox' && (
                  <div className="mt-3 space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {conversationData.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`group relative w-full rounded-2xl border px-3 py-3 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 ${
                        selectedId === item.id
                          ? 'border-indigo-300/40 bg-gradient-to-br from-indigo-500/15 to-purple-500/10 text-white shadow-lg shadow-indigo-500/20'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:shadow-md'
                      }`}
                    >
                      {/* Unread indicator */}
                      {!item.isRead && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50" />
                      )}
                      
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold ${!item.isRead ? 'text-white' : 'text-white/80'}`}>
                              {item.senderName || item.clientName || 'Unknown'}
                            </p>
                            {!item.isRead && (
                              <span className="rounded-full bg-indigo-400/20 px-1.5 py-0.5 text-[8px] font-bold text-indigo-200 uppercase tracking-wider">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 mt-0.5 line-clamp-1">{item.subject || 'General enquiry'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${
                            item.priority === 'high'
                              ? 'border-rose-300/40 bg-rose-400/20 text-rose-100 shadow-sm shadow-rose-500/20'
                              : 'border-white/15 bg-white/10 text-white/60'
                          }`}
                          >
                            {item.priority === 'high' ? 'Urgent' : 'Queue'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-white/45">
                        <span className="flex items-center gap-1">
                          <div className={`h-1.5 w-1.5 rounded-full ${item.isRead ? 'bg-white/30' : 'bg-indigo-400'}`} />
                          {item.sentAt ? new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="h-3 w-3" />
                          {item.slaMinutes ? `${item.slaMinutes}m` : '—'}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          <PhoneIcon className="h-3 w-3" />
                          {item.channel}
                        </span>
                      </div>
                    </button>
                  ))}
                  </div>
                )}

                {activeView === 'history' && (
                  <div className="mt-3 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar text-white/70">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ClockIcon className="h-5 w-5 text-indigo-300" />
                        <p className="text-sm font-semibold text-white">Past Conversations</p>
                      </div>
                      <p className="text-xs text-white/60 mb-4">View your complete message history organized by date.</p>
                      
                      <div className="space-y-3">
                        {conversationData.map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:border-indigo-300/30 hover:bg-indigo-400/10 transition"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white">{item.senderName || 'Unknown'}</p>
                                <p className="text-xs text-white/50 mt-1 line-clamp-2">{item.preview || 'No preview available'}</p>
                              </div>
                              <span className="text-[10px] text-white/40">
                                {item.sentAt ? new Date(item.sentAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeView === 'archive' && (
                  <div className="mt-3 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar text-white/70">
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-400/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ArchiveBoxIcon className="h-5 w-5 text-amber-300" />
                        <p className="text-sm font-semibold text-white">Archived Messages</p>
                      </div>
                      <p className="text-xs text-white/60 mb-4">Messages you've archived for safekeeping. Restore them anytime.</p>
                      
                      <div className="space-y-2">
                        {[
                          { id: 'arch-1', name: 'Summer Campaign Results', date: 'Sep 2024', category: 'Marketing' },
                          { id: 'arch-2', name: 'Q3 Customer Feedback', date: 'Aug 2024', category: 'Support' },
                          { id: 'arch-3', name: 'Payment Confirmation Thread', date: 'Jul 2024', category: 'Billing' },
                        ].map((item) => (
                          <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-white">{item.name}</p>
                                <p className="text-xs text-white/45 mt-1">{item.category} • Archived {item.date}</p>
                              </div>
                              <button
                                type="button"
                                className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200 hover:bg-amber-400/15 transition"
                              >
                                Restore
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeView === 'trash' && (
                  <div className="mt-3 space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar text-white/70">
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-400/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrashIcon className="h-5 w-5 text-rose-300" />
                        <p className="text-sm font-semibold text-white">Deleted Messages</p>
                      </div>
                      <p className="text-xs text-white/60 mb-4">Items in trash will be permanently deleted after 30 days.</p>
                      
                      <div className="space-y-2">
                        {[
                          { id: 'trash-1', name: 'Spam: Get rich quick!', date: '2 days ago', reason: 'Marked as spam' },
                          { id: 'trash-2', name: 'Old booking inquiry', date: '5 days ago', reason: 'Manual deletion' },
                          { id: 'trash-3', name: 'Duplicate message thread', date: '1 week ago', reason: 'Auto-cleanup' },
                        ].map((item) => (
                          <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-white/70 line-through">{item.name}</p>
                                <p className="text-xs text-white/45 mt-1">{item.reason} • {item.date}</p>
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  className="rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200 hover:bg-emerald-400/15 transition"
                                >
                                  Restore
                                </button>
                                <button
                                  type="button"
                                  className="rounded-lg border border-rose-300/30 bg-rose-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200 hover:bg-rose-400/15 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                    {activeView === 'inbox' && 'Conversation detail'}
                    {activeView === 'history' && 'History detail'}
                    {activeView === 'archive' && 'Archive detail'}
                    {activeView === 'trash' && 'Trash detail'}
                  </p>
                  {selectedConversation && activeView === 'inbox' && (
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setReplyMode('suggested')}
                        className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] transition ${
                          replyMode === 'suggested'
                            ? 'bg-indigo-400/20 text-indigo-100 ring-1 ring-indigo-300/40'
                            : 'bg-white/5 text-white/50 ring-1 ring-white/10 hover:bg-white/10'
                        }`}
                      >
                        AI
                      </button>
                      <button
                        type="button"
                        onClick={() => setReplyMode('custom')}
                        className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.25em] transition ${
                          replyMode === 'custom'
                            ? 'bg-indigo-400/20 text-indigo-100 ring-1 ring-indigo-300/40'
                            : 'bg-white/5 text-white/50 ring-1 ring-white/10 hover:bg-white/10'
                        }`}
                      >
                        Custom
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Inbox Detail View */}
                {activeView === 'inbox' && selectedConversation ? (
                  <div className="mt-3 space-y-3 text-sm text-white/70">
                    <div className="flex items-center justify-between gap-3 text-white">
                      <div>
                        <p className="text-base font-semibold">{selectedConversation.senderName || selectedConversation.clientName || 'Unknown contact'}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-white/45">{selectedConversation.channel}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                        selectedConversation.sentiment === 'negative'
                          ? 'border-rose-300/40 bg-rose-400/20 text-rose-100'
                          : selectedConversation.sentiment === 'positive'
                          ? 'border-emerald-300/40 bg-emerald-400/20 text-emerald-100'
                          : 'border-white/15 bg-white/10 text-white/60'
                      }`}
                      >
                        {selectedConversation.sentiment ?? 'Neutral'}
                      </span>
                    </div>
                    
                    {/* Message Body */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/60">
                      <p className="leading-relaxed">{selectedConversation.preview || 'Message body coming soon.'}</p>
                    </div>
                    
                    {/* Metadata */}
                    <div className="grid gap-2 text-[11px] text-white/50">
                      <p>Received at {selectedConversation.sentAt ? new Date(selectedConversation.sentAt).toLocaleString() : 'Just now'}</p>
                      <p>SLA target: respond in {selectedConversation.slaMinutes ?? 30} minutes.</p>
                      <p>Assigned owner: Customer desk • Team Mercury.</p>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 text-[11px] text-white/55">
                      {['billing', 'booking', 'follow-up'].map((tag) => (
                        <span key={tag} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 hover:border-white/25 hover:bg-white/10 cursor-pointer transition">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* Reply Section */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-white/80 font-semibold flex items-center gap-2">
                          {replyMode === 'suggested' ? (
                            <>
                              <SparklesIcon className="h-4 w-4 text-indigo-300" />
                              AI Suggested Reply
                            </>
                          ) : (
                            <>
                              <PencilIcon className="h-4 w-4 text-indigo-300" />
                              Custom Reply
                            </>
                          )}
                        </p>
                        {!editingReply && replyMode === 'suggested' && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingReply(true);
                              setCustomReply(suggestedReply);
                            }}
                            className="group flex items-center gap-1.5 text-[10px] text-white/50 hover:text-white transition"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        )}
                      </div>
                      
                      {editingReply || replyMode === 'custom' ? (
                        <div className="space-y-2">
                          <textarea
                            value={customReply || suggestedReply}
                            onChange={(e) => setCustomReply(e.target.value)}
                            placeholder="Type your custom reply..."
                            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
                            rows={4}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReply(false);
                                setCustomReply('');
                              }}
                              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 hover:border-white/30 hover:text-white transition"
                            >
                              <XMarkIcon className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReply(false);
                                // Save custom reply logic here
                              }}
                              className="flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-100 hover:bg-emerald-400/20 transition"
                            >
                              <CheckIcon className="h-3.5 w-3.5" />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="leading-relaxed text-white/70">{suggestedReply}</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="flex items-center gap-1.5 rounded-full border border-indigo-300/40 bg-indigo-400/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100 hover:bg-indigo-400/20 hover:shadow-lg hover:shadow-indigo-500/25 transition"
                            >
                              <PaperAirplaneIcon className="h-3.5 w-3.5" />
                              Send Now
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReply(true);
                                setCustomReply(suggestedReply);
                              }}
                              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 hover:border-white/30 hover:text-white transition"
                            >
                              <PencilIcon className="h-3.5 w-3.5" />
                              Modify
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ) : activeView === 'inbox' ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-10 text-center text-white/55">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-white/30 mb-3" />
                    <p className="text-sm">Select a conversation to view details</p>
                  </div>
                ) : null}

                {/* History Detail View */}
                {activeView === 'history' && (
                  <div className="mt-3 space-y-4 text-white/70">
                    <div className="rounded-2xl border border-indigo-300/20 bg-indigo-400/5 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full border border-indigo-300/40 bg-indigo-400/15 p-3">
                          <ClockIcon className="h-6 w-6 text-indigo-200" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Message History</h3>
                          <p className="text-xs text-white/50">Complete timeline of past conversations</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-semibold text-white">October 2024</p>
                            <span className="text-[10px] text-white/40">This month</span>
                          </div>
                          <p className="text-xs text-white/60">
                            {conversationData.length} conversations • Average response time: 18 minutes
                          </p>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-semibold text-white">Top Contact</p>
                            <span className="text-[10px] text-white/40">Most active</span>
                          </div>
                          <p className="text-xs text-white/60">
                            Lesedi from Vuma Fitness • 8 conversations
                          </p>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-sm font-semibold text-white mb-2">Quick Stats</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                              <p className="text-white/40">Total messages</p>
                              <p className="text-base font-bold text-white mt-1">142</p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                              <p className="text-white/40">Resolution rate</p>
                              <p className="text-base font-bold text-emerald-300 mt-1">94%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold text-white mb-3">Timeline Filters</p>
                      <div className="flex flex-wrap gap-2">
                        {['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'].map((period) => (
                          <button
                            key={period}
                            type="button"
                            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60 hover:border-indigo-300/40 hover:bg-indigo-400/10 hover:text-indigo-200 transition"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Archive Detail View */}
                {activeView === 'archive' && (
                  <div className="mt-3 space-y-4 text-white/70">
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-400/5 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full border border-amber-300/40 bg-amber-400/15 p-3">
                          <ArchiveBoxIcon className="h-6 w-6 text-amber-200" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Archived Storage</h3>
                          <p className="text-xs text-white/50">Safely stored conversations</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-sm font-semibold text-white">Storage Info</p>
                            <span className="text-[10px] text-white/40">12 items</span>
                          </div>
                          <p className="text-xs text-white/60">
                            Archived conversations are kept indefinitely and can be restored anytime.
                          </p>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-sm font-semibold text-white mb-2">Quick Actions</p>
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              className="w-full rounded-lg border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/15 transition text-left"
                            >
                              Restore selected items
                            </button>
                            <button
                              type="button"
                              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 transition text-left"
                            >
                              Export archive data
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs font-semibold text-white mb-3">Archive Categories</p>
                      <div className="space-y-2 text-xs">
                        {[
                          { label: 'Marketing', count: 4 },
                          { label: 'Support', count: 5 },
                          { label: 'Billing', count: 3 },
                        ].map((cat) => (
                          <div key={cat.label} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                            <span className="text-white/70">{cat.label}</span>
                            <span className="rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/50">
                              {cat.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Trash Detail View */}
                {activeView === 'trash' && (
                  <div className="mt-3 space-y-4 text-white/70">
                    <div className="rounded-2xl border border-rose-300/20 bg-rose-400/5 p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-full border border-rose-300/40 bg-rose-400/15 p-3">
                          <TrashIcon className="h-6 w-6 text-rose-200" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">Trash Bin</h3>
                          <p className="text-xs text-white/50">Items pending permanent deletion</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="rounded-xl border border-rose-300/20 bg-rose-400/10 p-3">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="rounded-full bg-rose-400/20 p-1">
                              <span className="text-rose-200 text-xs">⚠️</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-rose-100">Auto-Delete Warning</p>
                              <p className="text-xs text-rose-200/70 mt-1">
                                Items in trash will be permanently deleted after 30 days. Restore important items now.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-sm font-semibold text-white mb-2">Trash Summary</p>
                          <div className="space-y-2 text-xs text-white/60">
                            <div className="flex items-center justify-between">
                              <span>Total items</span>
                              <span className="font-semibold text-white">3</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Oldest item</span>
                              <span className="font-semibold text-white">1 week ago</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Days until deletion</span>
                              <span className="font-semibold text-rose-300">23 days</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <p className="text-sm font-semibold text-white mb-2">Bulk Actions</p>
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              className="w-full rounded-lg border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-400/15 transition text-left"
                            >
                              Restore all items
                            </button>
                            <button
                              type="button"
                              className="w-full rounded-lg border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-400/15 transition text-left"
                            >
                              Empty trash permanently
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Horizontal Message Management Bar */}
      <div className="mt-3 lg:mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`group relative overflow-hidden rounded-[16px] border px-2 py-1.5 text-left transition sm:px-2.5 sm:py-2 ${
              activeView === 'history'
                ? managementAccentStyles.history.buttonActive
                : managementAccentStyles.history.buttonInactive
            }`}
          >
            <span className={microOverlayClass} />
            <div className="relative flex items-center gap-2">
              <div className={`rounded-lg border p-1.5 ${
                activeView === 'history'
                  ? managementAccentStyles.history.iconActive
                  : managementAccentStyles.history.iconInactive
              }`}>
                <ClockIcon
                  className={`h-3.5 w-3.5 ${
                    activeView === 'history'
                      ? managementAccentStyles.history.iconColorActive
                      : managementAccentStyles.history.iconColorInactive
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">History</p>
                <p className="text-[9px] text-white/50">View past messages</p>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  activeView === 'history'
                    ? managementAccentStyles.history.countActive
                    : managementAccentStyles.history.countInactive
                }`}
              >
                {conversationData.length}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowFilterModal(true)}
            className={`group relative overflow-hidden rounded-[16px] border px-2 py-1.5 text-left transition sm:px-2.5 sm:py-2 ${
              showFilterModal
                ? managementAccentStyles.filter.buttonActive
                : managementAccentStyles.filter.buttonInactive
            }`}
          >
            <span className={microOverlayClass} />
            <div className="relative flex items-center gap-2">
              <div className={`rounded-lg border p-1.5 ${
                showFilterModal
                  ? managementAccentStyles.filter.iconActive
                  : managementAccentStyles.filter.iconInactive
              }`}>
                <FunnelIcon
                  className={`h-3.5 w-3.5 ${
                    showFilterModal
                      ? managementAccentStyles.filter.iconColorActive
                      : managementAccentStyles.filter.iconColorInactive
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">Filter</p>
                <p className="text-[9px] text-white/50">Sort & organize</p>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  showFilterModal
                    ? managementAccentStyles.filter.countActive
                    : managementAccentStyles.filter.countInactive
                }`}
              >
                All
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('archive')}
            className={`group relative overflow-hidden rounded-[16px] border px-2 py-1.5 text-left transition sm:px-2.5 sm:py-2 ${
              activeView === 'archive'
                ? managementAccentStyles.archive.buttonActive
                : managementAccentStyles.archive.buttonInactive
            }`}
          >
            <span className={microOverlayClass} />
            <div className="relative flex items-center gap-2">
              <div className={`rounded-lg border p-1.5 ${
                activeView === 'archive'
                  ? managementAccentStyles.archive.iconActive
                  : managementAccentStyles.archive.iconInactive
              }`}>
                <ArchiveBoxIcon
                  className={`h-3.5 w-3.5 ${
                    activeView === 'archive'
                      ? managementAccentStyles.archive.iconColorActive
                      : managementAccentStyles.archive.iconColorInactive
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">Archive</p>
                <p className="text-[9px] text-white/50">Archived chats</p>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  activeView === 'archive'
                    ? managementAccentStyles.archive.countActive
                    : managementAccentStyles.archive.countInactive
                }`}
              >
                12
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('trash')}
            className={`group relative overflow-hidden rounded-[16px] border px-2 py-1.5 text-left transition sm:px-2.5 sm:py-2 ${
              activeView === 'trash'
                ? managementAccentStyles.trash.buttonActive
                : managementAccentStyles.trash.buttonInactive
            }`}
          >
            <span className={microOverlayClass} />
            <div className="relative flex items-center gap-2">
              <div className={`rounded-lg border p-1.5 ${
                activeView === 'trash'
                  ? managementAccentStyles.trash.iconActive
                  : managementAccentStyles.trash.iconInactive
              }`}>
                <TrashIcon
                  className={`h-3.5 w-3.5 ${
                    activeView === 'trash'
                      ? managementAccentStyles.trash.iconColorActive
                      : managementAccentStyles.trash.iconColorInactive
                  }`}
                />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">Trash</p>
                <p className="text-[9px] text-white/50">Deleted items</p>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  activeView === 'trash'
                    ? managementAccentStyles.trash.countActive
                    : managementAccentStyles.trash.countInactive
                }`}
              >
                3
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-16 sm:pt-20">
          <div className="relative w-full max-w-md mx-4 sm:mx-0 rounded-[24px] border border-white/20 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 p-5 sm:p-6 shadow-2xl backdrop-blur-3xl animate-in fade-in zoom-in duration-200 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <span className="pointer-events-none absolute inset-0 -z-10 rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.15),transparent_60%)]" />
          
          <header className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-blue-300" />
                Filter Messages
              </h3>
              <p className="text-xs text-white/50 mt-1">Sort and organize your conversations</p>
            </div>
            <button
              type="button"
              onClick={() => setShowFilterModal(false)}
              className="rounded-full border border-white/15 bg-white/5 p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </header>

          <div className="space-y-4">
            {/* Status Filter */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
              <p className="text-sm font-semibold text-white mb-3">Status</p>
              <div className="space-y-2">
                {['All Messages', 'Unread Only', 'Read Only', 'Starred'].map((status) => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="status"
                      className="h-4 w-4 text-indigo-500 border-white/20 bg-white/5 focus:ring-2 focus:ring-indigo-400/50"
                    />
                    <span className="text-sm text-white/70 group-hover:text-white transition">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
              <p className="text-sm font-semibold text-white mb-3">Priority</p>
              <div className="space-y-2">
                {['All Priorities', 'High Priority', 'Normal', 'Low'].map((priority) => (
                  <label key={priority} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-500 border-white/20 bg-white/5 rounded focus:ring-2 focus:ring-indigo-400/50"
                    />
                    <span className="text-sm text-white/70 group-hover:text-white transition">{priority}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Channel Filter */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
              <p className="text-sm font-semibold text-white mb-3">Channel</p>
              <div className="space-y-2">
                {['All Channels', 'Email', 'SMS', 'WhatsApp', 'Support'].map((channel) => (
                  <label key={channel} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-500 border-white/20 bg-white/5 rounded focus:ring-2 focus:ring-indigo-400/50"
                    />
                    <span className="text-sm text-white/70 group-hover:text-white transition">{channel}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              onClick={() => setShowFilterModal(false)}
              className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/60 hover:border-white/30 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setShowFilterModal(false)}
              className="w-full rounded-full border border-blue-300/40 bg-blue-400/15 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100 hover:bg-blue-400/20 transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}

interface MessageStatCardProps {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  accent: 'indigo' | 'rose' | 'blue';
  trend: string;
}

const accentMap: Record<MessageStatCardProps['accent'], string> = {
  indigo: 'border-indigo-300/40 bg-indigo-400/15 text-indigo-100',
  rose: 'border-rose-300/40 bg-rose-400/20 text-rose-100',
  blue: 'border-blue-300/40 bg-blue-400/20 text-blue-100',
};

const MessageStatCard = ({ label, value, icon: Icon, accent, trend }: MessageStatCardProps) => (
  <div className="relative isolate overflow-hidden rounded-[20px] border border-white/10 bg-white/5 p-3 backdrop-blur-2xl">
    <span className={microOverlayClass} />
    <div className="flex items-center justify-between text-white">
      <div className="flex-1">
        <p className="text-[9px] uppercase tracking-[0.3em] text-white/40 font-semibold">{label}</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-[10px] text-white/45">{trend}</p>
        </div>
      </div>
      <span className={`rounded-xl border p-2 ${accentMap[accent]}`}>
        <Icon className="h-4 w-4" />
      </span>
    </div>
  </div>
);

interface MessagesInsightsProps {
  messages?: Message[];
}

export function MessagesInsights({ messages = [] }: MessagesInsightsProps) {
  const normalized = useMemo(() => normalizeMessages(messages), [messages]);
  const unread = normalized.filter((item) => !item.isRead).length;
  const urgent = normalized.filter((item) => item.priority === 'high').length;
  const slaAtRisk = normalized.filter((item) => (item.slaMinutes ?? 0) < 20).length;

  return (
    <div className="space-y-4">
      <section className={microCardClass}>
        <span className={microOverlayClass} />
        <header className="flex items-center justify-between text-white">
          <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">AI triage</p>
          <span className={neutralStrengthClass}>Live</span>
        </header>
        <ul className="mt-3 space-y-2 text-xs text-white/70">
          <li className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold text-white">Urgent queue</p>
            <p className="text-white/55">{urgent} high-priority requests. Escalate to voice if response exceeds 10 minutes.</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold text-white">Quiet channel</p>
            <p className="text-white/55">SMS responses dipped this week. Launch reminder broadcast.</p>
          </li>
        </ul>
      </section>

      <section className={microCardClass}>
        <span className={microOverlayClass} />
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Team capacity</p>
        <div className="mt-3 space-y-3 text-xs text-white/70">
          {[
            { name: 'Nomsa', status: 'On duty', load: '3 threads' },
            { name: 'Theo', status: 'Reviewing', load: '2 threads' },
            { name: 'Automation', status: 'Drafting replies', load: '6 templates' },
          ].map((agent) => (
            <div key={agent.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-2 text-white">
                <UserGroupIcon className="h-4 w-4 text-white/50" />
                <div>
                  <p className="text-sm font-semibold">{agent.name}</p>
                  <p className="text-white/45">{agent.status}</p>
                </div>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                {agent.load}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className={microCardClass}>
        <span className={microOverlayClass} />
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Campaign suggestions</p>
        <ul className="mt-3 space-y-2 text-xs text-white/70">
          <li className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold text-white">Post-experience follow-up</p>
            <p className="text-white/55">{unread} new clients visited this week. Send a quick review request to capture feedback.</p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="text-sm font-semibold text-white">Win-back drip</p>
            <p className="text-white/55">Identify dormant contacts and schedule a WhatsApp incentive campaign.</p>
          </li>
        </ul>
      </section>
    </div>
  );
}
