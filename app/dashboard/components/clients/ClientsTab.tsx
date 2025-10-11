/**
 * Clients Tab - Relationship intelligence workspace with compliance-ready insights
 */

'use client';

import {
  ArrowTrendingUpIcon,
  BoltIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useMemo, useState, type ReactNode } from 'react';
import type { Client } from '../../types';

interface ClientsTabProps {
  clients?: Client[];
}

interface ClientsInsightsProps {
  clients?: Client[];
}

type ClientSegment = 'all' | 'vip' | 'at-risk' | 'new' | 'inactive' | 'core';
type ViewMode = 'relationship' | 'retention' | 'billing' | 'compliance';

const frameClasses = [
  'relative isolate flex flex-col overflow-hidden rounded-[32px]',
  'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
  'p-5 md:p-6 xl:p-8 shadow-[0_60px_180px_-90px_rgba(37,99,235,0.65)]',
].join(' ');

const frameOverlayClasses =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.35),transparent_55%)]';

const chipBaseClass = 'whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]';

const segmentLabels: Record<ClientSegment, string> = {
  all: 'All clients',
  vip: 'VIP',
  'at-risk': 'At risk',
  new: 'New',
  inactive: 'Dormant',
  core: 'Core',
};

const segmentColors: Record<ClientSegment, string> = {
  all: 'border-white/15 bg-white/10 text-white/70',
  vip: 'border-amber-300/40 bg-amber-400/20 text-amber-50',
  'at-risk': 'border-rose-300/40 bg-rose-400/20 text-rose-50',
  new: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-50',
  inactive: 'border-cyan-200/40 bg-cyan-300/15 text-cyan-50',
  core: 'border-indigo-300/40 bg-indigo-400/20 text-indigo-50',
};

const consentLabels: Record<NonNullable<Client['consentStatus']>, string> = {
  granted: 'Consent',
  pending: 'Consent pending',
  revoked: 'Consent revoked',
};

const resolveConsentStatus = (
  status: Client['consentStatus'],
): NonNullable<Client['consentStatus']> => status ?? 'pending';

const consentColors: Record<NonNullable<Client['consentStatus']>, string> = {
  granted: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-50',
  pending: 'border-amber-300/40 bg-amber-400/20 text-amber-50',
  revoked: 'border-rose-300/40 bg-rose-400/20 text-rose-50',
};

const tierColors: Record<NonNullable<Client['complianceTier']>, string> = {
  verified: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-50',
  pending: 'border-amber-300/40 bg-amber-400/20 text-amber-50',
  restricted: 'border-rose-300/40 bg-rose-400/20 text-rose-50',
};

const DAY_MS = 86_400_000;

const safeParseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatCurrency = (value: number, currency = 'ZAR') => {
  if (!Number.isFinite(value)) return 'N/A';
  try {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency }).format(value);
  } catch (error) {
    return `R${value.toLocaleString()}`;
  }
};

const buildClientInsights = (clients: Client[]) => {
  const now = Date.now();

  const enriched = clients.map((client) => {
    const created = safeParseDate(client.createdAt || client.joined) ?? null;
    const lastBooking = safeParseDate(client.lastBooking) ?? created;
    const createdTs = created ? created.getTime() : null;
    const lastInteractionTs = lastBooking ? lastBooking.getTime() : createdTs;
    const daysSinceLastInteraction = lastInteractionTs ? Math.round((now - lastInteractionTs) / DAY_MS) : null;
    const lifetimeValue = client.totalSpent || 0;
    const bookingCount = client.totalBookings || 0;
    const isNew = createdTs ? now - createdTs <= 30 * DAY_MS : false;
    const isInactive = daysSinceLastInteraction !== null ? daysSinceLastInteraction > 90 : bookingCount === 0;
    const isVip = lifetimeValue >= 1500 || bookingCount >= 8;
    const isAtRisk = !isInactive && !isNew && (daysSinceLastInteraction !== null ? daysSinceLastInteraction > 45 : false);

    let segment: ClientSegment = 'core';
    if (isVip) segment = 'vip';
    else if (isAtRisk) segment = 'at-risk';
    else if (isInactive) segment = 'inactive';
    else if (isNew) segment = 'new';

    const engagementScore = Math.max(15, Math.min(100,
      (bookingCount * 8) + (lifetimeValue / 40) - (daysSinceLastInteraction ?? 0) * 1.2 + (client.isActive ? 20 : -10),
    ));

    return {
      ...client,
      createdTs,
      lastInteractionTs,
      daysSinceLastInteraction,
      lifetimeValue,
      bookingCount,
      segment,
      isVip,
      isNew,
      isInactive,
      isAtRisk,
      engagementScore: Math.round(engagementScore),
    };
  }).sort((a, b) => (b.lastInteractionTs ?? 0) - (a.lastInteractionTs ?? 0));

  const totals = {
    total: enriched.length,
    active: enriched.filter((client) => client.isActive !== false).length,
    newThisMonth: enriched.filter((client) => client.isNew).length,
    vipCount: enriched.filter((client) => client.isVip).length,
    atRisk: enriched.filter((client) => client.isAtRisk).length,
    dormant: enriched.filter((client) => client.isInactive).length,
    lifetimeValue: enriched.reduce((sum, client) => sum + client.lifetimeValue, 0),
    bookings: enriched.reduce((sum, client) => sum + client.bookingCount, 0),
  };

  const avgLifetimeValue = totals.total ? totals.lifetimeValue / totals.total : 0;
  const retentionHealth = totals.total ? Math.max(0, 100 - (totals.atRisk + totals.dormant) / totals.total * 100) : 0;

  const segmentCounts: Record<ClientSegment, number> = {
    all: enriched.length,
    vip: 0,
    'at-risk': 0,
    new: 0,
    inactive: 0,
    core: 0,
  };
  for (const client of enriched) {
    segmentCounts[client.segment] += 1;
  }

  const repeatClients = enriched.filter((client) => client.bookingCount > 1).length;

  const followUps = enriched
    .filter((client) => client.isAtRisk || client.isInactive)
    .sort((a, b) => (b.daysSinceLastInteraction ?? 0) - (a.daysSinceLastInteraction ?? 0))
    .slice(0, 5);

  const topValueClients = enriched
    .slice()
    .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
    .slice(0, 5);

  const billingSummary = {
    outstandingBalance: enriched.reduce((sum, client) => sum + (client.outstandingBalance || 0), 0),
    openInvoices: enriched.reduce((sum, client) => sum + (client.openInvoices || 0), 0),
    zeroBalance: enriched.filter((client) => (client.outstandingBalance || 0) === 0).length,
  };

  const complianceSummary = {
    verified: enriched.filter((client) => client.complianceTier === 'verified').length,
    pending: enriched.filter((client) => client.complianceTier === 'pending').length,
    restricted: enriched.filter((client) => client.complianceTier === 'restricted').length,
    consentGranted: enriched.filter((client) => client.consentStatus === 'granted').length,
    consentPending: enriched.filter((client) => !client.consentStatus || client.consentStatus === 'pending').length,
    consentRevoked: enriched.filter((client) => client.consentStatus === 'revoked').length,
    outstandingDocuments: enriched.reduce((sum, client) => sum + (client.outstandingDocuments || 0), 0),
  };

  return {
    enriched,
    totals: {
      ...totals,
      avgLifetimeValue,
      retentionHealth,
      repeatRate: totals.total ? Math.round((repeatClients / totals.total) * 100) : 0,
    },
    segmentCounts,
    followUps,
    topValueClients,
    billingSummary,
    complianceSummary,
  };
};

interface ColumnDefinition {
  header: string;
  width: string;
  align?: 'left' | 'right';
  render: (client: ReturnType<typeof buildClientInsights>['enriched'][number]) => ReactNode;
}

const viewModeConfigs: Record<ViewMode, { label: string; description: string; columns: ColumnDefinition[] }> = {
  relationship: {
    label: 'Relationship',
    description: 'Core profile, recent activity, and value.',
    columns: [
      {
        header: 'Client & org',
        width: 'minmax(0,1.6fr)',
        render: (client) => (
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-[12px] font-semibold text-white">{client.name}</span>
              <span className={`${chipBaseClass} ${segmentColors[client.segment]}`}>{segmentLabels[client.segment]}</span>
            </div>
            <p className="truncate text-[11px] text-white/60">{client.email}</p>
            {client.company ? <p className="truncate text-[10px] text-white/40">{client.company}</p> : null}
          </div>
        ),
      },
      {
        header: 'Last touch & channel',
        width: 'minmax(0,1.2fr)',
        render: (client) => (
          <div className="space-y-1 text-[11px] text-white/55">
            <p>Last booking: {client.lastInteractionTs ? new Date(client.lastInteractionTs).toLocaleDateString() : 'N/A'}</p>
            <p className={client.daysSinceLastInteraction && client.daysSinceLastInteraction > 60 ? 'text-rose-200' : 'text-white/55'}>
              {client.daysSinceLastInteraction !== null ? `${client.daysSinceLastInteraction} days idle` : 'No activity yet'}
            </p>
            <p className="text-white/45">Prefers {client.preferredChannel ?? 'email'}</p>
          </div>
        ),
      },
      {
        header: 'Value & bookings',
        width: 'minmax(0,1fr)',
        render: (client) => (
          <div className="space-y-1 text-[11px] text-white/55">
            <p>Total value: {formatCurrency(client.lifetimeValue, client.currency)}</p>
            <p>{client.bookingCount} booking{client.bookingCount === 1 ? '' : 's'}</p>
            {client.tags?.length ? <p className="text-[10px] text-white/45">{client.tags.join(', ')}</p> : null}
          </div>
        ),
      },
      {
        header: 'Health',
        width: '120px',
        align: 'right',
        render: (client) => (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] text-white/60">{client.engagementScore}/100</span>
            <div className="relative h-2 w-16 overflow-hidden rounded-full bg-white/15">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  client.engagementScore >= 70
                    ? 'bg-gradient-to-r from-emerald-300 to-emerald-500'
                    : client.engagementScore >= 45
                      ? 'bg-gradient-to-r from-amber-300 to-amber-500'
                      : 'bg-gradient-to-r from-rose-300 to-rose-500'
                }`}
                style={{ width: `${client.engagementScore}%` }}
              />
            </div>
          </div>
        ),
      },
    ],
  },
  retention: {
    label: 'Retention',
    description: 'Churn risk, milestones, and engagement velocity.',
    columns: [
      {
        header: 'Client',
        width: 'minmax(0,1.3fr)',
        render: (client) => (
          <div className="min-w-0 space-y-1">
            <span className="truncate text-[12px] font-semibold text-white">{client.name}</span>
            <p className="text-[11px] text-white/55">{segmentLabels[client.segment]}</p>
          </div>
        ),
      },
      {
        header: 'Idle days',
        width: 'minmax(0,0.8fr)',
        render: (client) => (
          <p className={`text-[11px] ${client.daysSinceLastInteraction && client.daysSinceLastInteraction > 45 ? 'text-rose-200' : 'text-white/60'}`}>
            {client.daysSinceLastInteraction !== null ? `${client.daysSinceLastInteraction} days` : 'N/A'}
          </p>
        ),
      },
      {
        header: 'Bookings cadence',
        width: 'minmax(0,1fr)',
        render: (client) => (
          <div className="text-[11px] text-white/60">
            <p>{client.bookingCount} total</p>
            {client.createdTs ? <p className="text-white/45">Since {new Date(client.createdTs).toLocaleDateString()}</p> : null}
          </div>
        ),
      },
      {
        header: 'Next milestone',
        width: 'minmax(0,1.2fr)',
        render: (client) => (
          <p className="text-[11px] text-white/55">{client.nextMilestone ?? 'No milestone set'}</p>
        ),
      },
      {
        header: 'Health',
        width: '120px',
        align: 'right',
        render: (client) => (
          <span className={`text-[11px] ${client.engagementScore >= 70 ? 'text-emerald-200' : client.engagementScore >= 45 ? 'text-amber-200' : 'text-rose-200'}`}>
            {client.engagementScore}/100
          </span>
        ),
      },
    ],
  },
  billing: {
    label: 'Billing',
    description: 'Outstanding balances, invoices, and payment cadence.',
    columns: [
      {
        header: 'Client',
        width: 'minmax(0,1.4fr)',
        render: (client) => (
          <div className="min-w-0 space-y-1">
            <span className="truncate text-[12px] font-semibold text-white">{client.name}</span>
            <p className="text-[11px] text-white/55">{client.company ?? 'Individual account'}</p>
          </div>
        ),
      },
      {
        header: 'Outstanding balance',
        width: 'minmax(0,1fr)',
        align: 'right',
        render: (client) => (
          <span className={`text-[11px] ${client.outstandingBalance ? 'text-amber-200' : 'text-white/60'}`}>
            {formatCurrency(client.outstandingBalance || 0, client.currency)}
          </span>
        ),
      },
      {
        header: 'Open invoices',
        width: 'minmax(0,0.8fr)',
        render: (client) => (
          <span className="text-[11px] text-white/60">{client.openInvoices ?? 0}</span>
        ),
      },
      {
        header: 'Last invoice',
        width: 'minmax(0,1fr)',
        render: (client) => (
          <span className="text-[11px] text-white/55">{client.lastInvoiceAt ? new Date(client.lastInvoiceAt).toLocaleDateString() : 'N/A'}</span>
        ),
      },
      {
        header: 'Preferred channel',
        width: 'minmax(0,1fr)',
        render: (client) => (
          <span className="text-[11px] text-white/55">{client.preferredChannel ?? 'email'}</span>
        ),
      },
    ],
  },
  compliance: {
    label: 'Compliance',
    description: 'Consent, verification tier, and outstanding documents.',
    columns: [
      {
        header: 'Client',
        width: 'minmax(0,1.3fr)',
        render: (client) => (
          <div className="min-w-0 space-y-1">
            <span className="truncate text-[12px] font-semibold text-white">{client.name}</span>
            {client.company ? <p className="text-[11px] text-white/50">{client.company}</p> : null}
          </div>
        ),
      },
      {
        header: 'Verification tier',
        width: 'minmax(0,1fr)',
        render: (client) => (
          client.complianceTier ? (
            <span className={`${chipBaseClass} ${tierColors[client.complianceTier]}`}>{client.complianceTier}</span>
          ) : <span className="text-[11px] text-white/55">Not set</span>
        ),
      },
      {
        header: 'Consent',
        width: 'minmax(0,1fr)',
        render: (client) => (
          <span className={`${chipBaseClass} ${consentColors[resolveConsentStatus(client.consentStatus)]}`}>
            {consentLabels[resolveConsentStatus(client.consentStatus)]}
          </span>
        ),
      },
      {
        header: 'Outstanding docs',
        width: 'minmax(0,0.9fr)',
        render: (client) => (
          <span className={`text-[11px] ${client.outstandingDocuments ? 'text-amber-200' : 'text-white/60'}`}>
            {client.outstandingDocuments ?? 0}
          </span>
        ),
      },
      {
        header: 'Next milestone',
        width: 'minmax(0,1.2fr)',
        render: (client) => (
          <p className="text-[11px] text-white/55">{client.nextMilestone ?? 'Assign compliance task'}</p>
        ),
      },
    ],
  },
};

export function ClientsTab({ clients = [] }: ClientsTabProps) {
  const [activeSegment, setActiveSegment] = useState<ClientSegment>('all');
  const [activeView, setActiveView] = useState<ViewMode>('relationship');

  const insights = useMemo(() => buildClientInsights(clients), [clients]);

  const filteredClients = useMemo(() => {
    const base = activeSegment === 'all'
      ? insights.enriched.slice()
      : insights.enriched.filter((client) => client.segment === activeSegment);

    switch (activeView) {
      case 'billing':
        return base.sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0)).slice(0, 24);
      case 'compliance':
        return base.sort((a, b) => (b.outstandingDocuments || 0) - (a.outstandingDocuments || 0)).slice(0, 24);
      case 'retention':
        return base.sort((a, b) => (b.daysSinceLastInteraction || 0) - (a.daysSinceLastInteraction || 0)).slice(0, 24);
      default:
        return base.slice(0, 24);
    }
  }, [activeSegment, activeView, insights.enriched]);

  const activeConfig = viewModeConfigs[activeView];
  const columnTemplate = activeConfig.columns.map((column) => column.width).join(' ');

  return (
    <div className={frameClasses}>
      <div className={frameOverlayClasses} aria-hidden />

      <div className="relative flex flex-col gap-6 text-white">
        <header className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_60px_160px_-130px_rgba(37,99,235,0.75)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/25 via-transparent to-blue-500/30" aria-hidden />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">Client relationship HQ</p>
                  <h1 className="text-3xl font-semibold leading-tight">Customer management</h1>
                  <p className="mt-2 text-sm text-white/70">Control retention, billing, and compliance in a single command center.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
                  >
                    <SparklesIcon className="h-4 w-4" aria-hidden />
                    Launch nurture flow
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/70 transition hover:border-white/30 hover:text-white"
                  >
                    <UserPlusIcon className="h-4 w-4" aria-hidden />
                    Add client
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <header className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">Total clients</span>
                    <UsersIcon className="h-5 w-5 text-blue-200" aria-hidden />
                  </header>
                  <p className="mt-3 text-3xl font-semibold text-white">{insights.totals.total}</p>
                  <p className="mt-1 text-[11px] text-white/55">{insights.totals.active} active relationships</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <header className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">Retention health</span>
                    <ArrowTrendingUpIcon className={`h-5 w-5 ${insights.totals.retentionHealth >= 70 ? 'text-emerald-200' : 'text-amber-200'}`} aria-hidden />
                  </header>
                  <p className="mt-3 text-3xl font-semibold text-white">{insights.totals.retentionHealth.toFixed(0)}%</p>
                  <p className="mt-1 text-[11px] text-white/55">{insights.totals.atRisk + insights.totals.dormant} accounts need attention</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <header className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">Avg. lifetime value</span>
                    <BoltIcon className="h-5 w-5 text-amber-200" aria-hidden />
                  </header>
                  <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(insights.totals.avgLifetimeValue)}</p>
                  <p className="mt-1 text-[11px] text-white/55">Across {insights.totals.bookings} bookings</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <header className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">New this month</span>
                    <UserPlusIcon className="h-5 w-5 text-emerald-200" aria-hidden />
                  </header>
                  <p className="mt-3 text-3xl font-semibold text-white">{insights.totals.newThisMonth}</p>
                  <p className="mt-1 text-[11px] text-white/55">{insights.totals.vipCount} high-value clients onboarded</p>
                </article>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                  <header className="flex items-center justify-between text-white">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">Billing exposure</span>
                    <BoltIcon className="h-5 w-5 text-amber-200" aria-hidden />
                  </header>
                  <p className="mt-3 text-lg font-semibold text-white">{formatCurrency(insights.billingSummary.outstandingBalance)}</p>
                  <p className="mt-1 text-white/55">{insights.billingSummary.openInvoices} open invoices</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                  <header className="flex items-center justify-between text-white">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">Repeat purchase rate</span>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-200" aria-hidden />
                  </header>
                  <p className="mt-3 text-lg font-semibold text-white">{insights.totals.repeatRate}%</p>
                  <p className="mt-1 text-white/55">Clients with multiple bookings</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
                  <header className="flex items-center justify-between text-white">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/55">Compliance workload</span>
                    <ShieldCheckIcon className="h-5 w-5 text-sky-200" aria-hidden />
                  </header>
                  <p className="mt-3 text-lg font-semibold text-white">{insights.complianceSummary.outstandingDocuments} docs</p>
                  <p className="mt-1 text-white/55">Pending across {insights.complianceSummary.pending + insights.complianceSummary.restricted} clients</p>
                </article>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/55">Segments</p>
                    <p className="text-xs text-white/70">Focus retention, billing, or compliance cohorts.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'vip', 'core', 'new', 'at-risk', 'inactive'] as ClientSegment[]).map((segment) => (
                      <button
                        key={segment}
                        type="button"
                        onClick={() => setActiveSegment(segment)}
                        className={`${chipBaseClass} transition ${
                          activeSegment === segment
                            ? `${segmentColors[segment]} border-opacity-80`
                            : 'border-white/15 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
                        }`}
                        aria-pressed={activeSegment === segment}
                      >
                        {segmentLabels[segment]}
                        <span className="ml-1 text-[9px] text-white/65">{segment === 'all' ? insights.totals.total : insights.segmentCounts[segment]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex flex-col justify-between gap-3 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_55px_160px_-130px_rgba(59,130,246,0.65)]">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Engagement cues</p>
              <ul className="space-y-2 text-xs text-white/65">
                <li className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-sky-200" aria-hidden />
                  {insights.followUps.length} follow-ups due this week.
                </li>
                <li className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-rose-200" aria-hidden />
                  {insights.totals.atRisk} clients trending at risk.
                </li>
                <li className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-emerald-200" aria-hidden />
                  {insights.totals.vipCount} VIP advocates ready for referrals.
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-sky-300/40 bg-sky-400/15 px-4 py-3 text-[11px] text-sky-100">
              <p className="font-semibold">Automation tip</p>
              <p className="mt-1 text-sky-50/80">Trigger a loyalty credit when VIP clients go 60 days without booking to prevent churn.</p>
            </div>
          </aside>
        </header>

        <section className="rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_45px_140px_-130px_rgba(148,163,184,0.6)] backdrop-blur-2xl">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-white">
            <div>
              <h2 className="text-sm font-semibold">Client intelligence</h2>
              <p className="text-[11px] text-white/55">{activeConfig.description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(viewModeConfigs) as ViewMode[]).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setActiveView(view)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                    activeView === view
                      ? 'border-white/40 bg-white/20 text-white'
                      : 'border-white/15 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
                  }`}
                  aria-pressed={activeView === view}
                >
                  {viewModeConfigs[view].label}
                </button>
              ))}
            </div>
          </header>

          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div
              className="items-center gap-2 border-b border-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50"
              style={{ display: 'grid', gridTemplateColumns: columnTemplate }}
            >
              {activeConfig.columns.map((column) => (
                <span
                  key={column.header}
                  className={column.align === 'right' ? 'text-right' : 'text-left'}
                >
                  {column.header}
                </span>
              ))}
            </div>
            <div>
              {filteredClients.length ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="items-start gap-2 border-b border-white/5 px-4 py-3 text-xs text-white/70 last:border-b-0"
                    style={{ display: 'grid', gridTemplateColumns: columnTemplate }}
                  >
                    {activeConfig.columns.map((column) => (
                      <div
                        key={column.header}
                        className={column.align === 'right' ? 'text-right' : 'text-left'}
                      >
                        {column.render(client)}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-[11px] text-white/50">No clients match the selected view yet.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function ClientsInsights({ clients = [] }: ClientsInsightsProps) {
  const { segmentCounts, followUps, topValueClients, billingSummary, complianceSummary } = useMemo(
    () => buildClientInsights(clients),
    [clients],
  );

  return (
    <div className="space-y-4 text-white">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_35px_110px_-90px_rgba(37,99,235,0.55)]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Segment breakdown</h3>
            <p className="text-[11px] text-white/55">Cohort sizes based on behaviour.</p>
          </div>
          <UsersIcon className="h-5 w-5 text-blue-200" aria-hidden />
        </header>
        <div className="space-y-2">
          {(Object.keys(segmentLabels) as ClientSegment[]).filter((segment) => segment !== 'all').map((segment) => (
            <div key={segment} className="flex items-center justify-between text-[11px]">
              <span className="text-white/60">{segmentLabels[segment]}</span>
              <span className="text-white/50">{segmentCounts[segment] ?? 0}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_35px_110px_-90px_rgba(251,191,36,0.55)]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Billing snapshot</h3>
            <p className="text-[11px] text-white/55">Outstanding exposure across clients.</p>
          </div>
          <BoltIcon className="h-5 w-5 text-amber-200" aria-hidden />
        </header>
        <div className="space-y-1">
          <p className="text-[11px] text-white/60">Outstanding balance: {formatCurrency(billingSummary.outstandingBalance)}</p>
          <p className="text-[11px] text-white/60">Open invoices: {billingSummary.openInvoices}</p>
          <p className="text-[11px] text-white/55">Zero balance clients: {billingSummary.zeroBalance}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_35px_110px_-90px_rgba(59,130,246,0.55)]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Compliance snapshot</h3>
            <p className="text-[11px] text-white/55">Verification & consent readiness.</p>
          </div>
          <ShieldCheckIcon className="h-5 w-5 text-sky-200" aria-hidden />
        </header>
        <div className="space-y-1">
          <p className="text-[11px] text-white/60">Verified: {complianceSummary.verified}</p>
          <p className="text-[11px] text-white/60">Pending: {complianceSummary.pending}</p>
          <p className="text-[11px] text-white/60">Restricted: {complianceSummary.restricted}</p>
          <p className="text-[11px] text-white/60">Consent granted: {complianceSummary.consentGranted}</p>
          <p className="text-[11px] text-white/60">Consent pending: {complianceSummary.consentPending}</p>
          <p className="text-[11px] text-white/60">Consent revoked: {complianceSummary.consentRevoked}</p>
          <p className="text-[11px] text-white/55">Outstanding documents: {complianceSummary.outstandingDocuments}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_35px_110px_-90px_rgba(248,113,113,0.5)]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Follow-up queue</h3>
            <p className="text-[11px] text-white/55">Prioritize retention saves.</p>
          </div>
          <ExclamationTriangleIcon className="h-5 w-5 text-rose-200" aria-hidden />
        </header>
        <div className="space-y-2">
          {followUps.length ? (
            followUps.map((client) => (
              <div key={client.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span className="truncate text-white">{client.name}</span>
                  <span>{client.daysSinceLastInteraction !== null ? `${client.daysSinceLastInteraction}d idle` : 'No activity'}</span>
                </div>
                <p className="mt-1 text-[11px] text-white/55">Value {formatCurrency(client.lifetimeValue, client.currency)} • {client.bookingCount} bookings</p>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 px-3 py-6 text-center text-[11px] text-white/50">All clients recently engaged 🎉</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_35px_110px_-90px_rgba(251,191,36,0.55)]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Top advocates</h3>
            <p className="text-[11px] text-white/55">Spot high-value champions.</p>
          </div>
          <SparklesIcon className="h-5 w-5 text-amber-200" aria-hidden />
        </header>
        <div className="space-y-2">
          {topValueClients.length ? (
            topValueClients.map((client) => (
              <div key={client.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-white/70">{client.name}</p>
                  <p className="text-[10px] text-white/50">{formatCurrency(client.lifetimeValue, client.currency)} • {client.bookingCount} bookings</p>
                </div>
                <span className="text-[10px] text-emerald-200">{client.engagementScore}/100</span>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-white/55">No advocates identified yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
