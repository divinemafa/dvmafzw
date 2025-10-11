/**
 * Reviews Tab - Reputation intelligence console
 */

'use client';

import {
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  CheckBadgeIcon,
  FaceSmileIcon,
  FireIcon,
  FunnelIcon,
  MegaphoneIcon,
  StarIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useMemo, useState } from 'react';
import type { Review } from '../../types';

interface ReviewsTabProps {
  reviews?: Review[];
}

interface ReviewsInsightsProps {
  reviews?: Review[];
}

type SentimentFilter = 'all' | 'positive' | 'neutral' | 'negative' | 'recent' | 'needs-response';

const frameClasses = [
  'relative isolate flex flex-col overflow-hidden rounded-[32px]',
  'border border-white/10 bg-gradient-to-br from-slate-950/85 via-slate-900/70 to-slate-950/60',
  'p-5 md:p-6 xl:p-8 shadow-[0_60px_180px_-90px_rgba(56,189,248,0.7)]',
].join(' ');

const frameOverlayClasses =
  'pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.35),transparent_60%)]';

const chipBaseClass = 'whitespace-nowrap rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]';

const sentimentLabels: Record<SentimentFilter, string> = {
  all: 'All reviews',
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
  recent: 'Recent 30d',
  'needs-response': 'Needs reply',
};

const sentimentColors: Record<SentimentFilter, string> = {
  all: 'border-white/15 bg-white/10 text-white/70',
  positive: 'border-emerald-300/40 bg-emerald-400/20 text-emerald-50',
  neutral: 'border-cyan-300/40 bg-cyan-300/15 text-cyan-50',
  negative: 'border-rose-300/40 bg-rose-400/20 text-rose-50',
  recent: 'border-indigo-300/40 bg-indigo-400/20 text-indigo-50',
  'needs-response': 'border-amber-300/40 bg-amber-400/20 text-amber-50',
};

const ratingToSentiment = (rating: number): SentimentFilter => {
  if (rating >= 4) return 'positive';
  if (rating <= 2) return 'negative';
  return 'neutral';
};

const getDisplayDate = (review: Review) => {
  if (review.createdAt) {
    const parsed = new Date(review.createdAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (review.date) {
    const fallback = new Date(review.date);
    if (!Number.isNaN(fallback.getTime())) return fallback;
  }
  return null;
};

const buildInsights = (reviews: Review[]) => {
  const enriched = reviews.map((review) => {
    const displayDate = getDisplayDate(review);
    const timestamp = displayDate ? displayDate.getTime() : 0;
    return {
      ...review,
      timestamp,
      sentiment: ratingToSentiment(review.rating),
    };
  }).sort((a, b) => b.timestamp - a.timestamp);

  const totals = {
    count: enriched.length,
    average: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    needsResponse: 0,
    ratingBuckets: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    } as Record<1 | 2 | 3 | 4 | 5, number>,
  };

  if (!enriched.length) {
    return {
      enriched,
      totals,
      distribution: [] as Array<{ label: string; value: number; share: number }>,
    };
  }

  let ratingSum = 0;
  for (const review of enriched) {
    ratingSum += review.rating;
    totals.ratingBuckets[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
    if (review.sentiment === 'positive') totals.positive += 1;
    if (review.sentiment === 'neutral') totals.neutral += 1;
    if (review.sentiment === 'negative') totals.negative += 1;
    if (review.sentiment === 'negative' || review.sentiment === 'neutral') totals.needsResponse += 1;
  }

  totals.average = ratingSum / enriched.length;

  const distribution = (Object.keys(totals.ratingBuckets) as Array<'5' | '4' | '3' | '2' | '1'>).map((rating) => {
    const value = totals.ratingBuckets[Number(rating) as 1 | 2 | 3 | 4 | 5];
    return {
      label: `${rating}-Star`,
      value,
      share: totals.count ? Math.round((value / totals.count) * 100) : 0,
    };
  });

  return {
    enriched,
    totals,
    distribution,
  };
};

export function ReviewsTab({ reviews = [] }: ReviewsTabProps) {
  const [activeFilter, setActiveFilter] = useState<SentimentFilter>('all');

  const { enriched, totals } = useMemo(() => buildInsights(reviews), [reviews]);

  const filteredReviews = useMemo(() => {
    if (activeFilter === 'all') return enriched.slice(0, 12);
    if (activeFilter === 'recent') {
      const thirtyDaysAgo = Date.now() - 1000 * 60 * 60 * 24 * 30;
      return enriched.filter((review) => review.timestamp >= thirtyDaysAgo).slice(0, 12);
    }
    if (activeFilter === 'needs-response') {
      return enriched.filter((review) => review.sentiment !== 'positive').slice(0, 12);
    }
    return enriched.filter((review) => review.sentiment === activeFilter).slice(0, 12);
  }, [activeFilter, enriched]);

  const headlineReview = filteredReviews[0];

  const scoreDelta = totals.average ? ((totals.positive - totals.negative) / Math.max(totals.count, 1)) * 100 : 0;

  return (
    <div className={frameClasses}>
      <div className={frameOverlayClasses} aria-hidden />

      <div className="relative flex flex-col gap-6 text-white">
        <header className="grid gap-4 xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_60px_160px_-130px_rgba(99,102,241,0.8)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-fuchsia-500/20 via-transparent to-sky-500/30" aria-hidden />
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">Reputation pulse</p>
                  <h1 className="text-3xl font-semibold leading-tight">Customer Reviews</h1>
                  <p className="mt-2 text-sm text-white/70">Monitor satisfaction, act on friction points, and spotlight advocates in one console.</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/20"
                >
                  <MegaphoneIcon className="h-4 w-4" aria-hidden />
                  Launch feedback campaign
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <header className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">Average rating</span>
                    <StarIcon className="h-5 w-5 text-yellow-300" aria-hidden />
                  </header>
                  <p className="mt-3 text-3xl font-semibold text-white">{totals.count ? totals.average.toFixed(1) : '—'}</p>
                  <p className="mt-1 text-[11px] text-white/55">{totals.count} review{totals.count === 1 ? '' : 's'} captured</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <header className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">Satisfaction delta</span>
                    <ArrowTrendingUpIcon className={`h-5 w-5 ${scoreDelta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`} aria-hidden />
                  </header>
                  <p className="mt-3 text-3xl font-semibold text-white">{scoreDelta >= 0 ? '+' : ''}{scoreDelta.toFixed(1)}%</p>
                  <p className="mt-1 text-[11px] text-white/55">Positive vs negative share</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <header className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">Needs response</span>
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-amber-200" aria-hidden />
                  </header>
                  <p className="mt-3 text-3xl font-semibold text-white">{totals.needsResponse}</p>
                  <p className="mt-1 text-[11px] text-white/55">Follow up on neutral or negative reviews</p>
                </article>

                <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <header className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">5-star share</span>
                    <FaceSmileIcon className="h-5 w-5 text-cyan-200" aria-hidden />
                  </header>
                  <p className="mt-3 text-3xl font-semibold text-white">{totals.count ? Math.round((totals.ratingBuckets[5] / totals.count) * 100) : 0}%</p>
                  <p className="mt-1 text-[11px] text-white/55">{totals.ratingBuckets[5]} perfect reviews</p>
                </article>
              </div>

              {headlineReview ? (
                <div className="rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 via-white/5 to-transparent px-5 py-4 text-xs text-white/70">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <CheckBadgeIcon className="h-5 w-5 text-emerald-200" aria-hidden />
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/55">Spotlight</p>
                        <p className="text-sm font-semibold text-white">{headlineReview.reviewerName ?? 'Anonymous'} — {headlineReview.rating.toFixed(1)}★</p>
                      </div>
                    </div>
                    <span className={`${chipBaseClass} ${sentimentColors[headlineReview.sentiment]}`}>{sentimentLabels[headlineReview.sentiment]}</span>
                  </div>
                  <p className="mt-2 text-[12px] text-white/65 line-clamp-2">{headlineReview.comment}</p>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="flex flex-col justify-between gap-3 rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_55px_160px_-130px_rgba(59,130,246,0.7)]">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">Filter sentiment</p>
              <div className="flex flex-wrap gap-2">
                {(['all', 'positive', 'neutral', 'negative', 'recent', 'needs-response'] as SentimentFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`${chipBaseClass} transition ${
                      activeFilter === filter
                        ? `${sentimentColors[filter]} border-opacity-80`
                        : 'border-white/15 bg-white/5 text-white/60 hover:border-white/25 hover:text-white'
                    }`}
                    aria-pressed={activeFilter === filter}
                  >
                    {sentimentLabels[filter]}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-cyan-300/40 bg-cyan-400/15 px-4 py-3 text-[11px] text-cyan-950">
              <p className="font-semibold">Automation tip</p>
              <p className="mt-1">Auto-reply to 4★ reviews within 12 hours to nudge users toward publishing testimonials.</p>
            </div>
          </aside>
        </header>

        <section className="rounded-[26px] border border-white/10 bg-white/5 p-5 shadow-[0_45px_140px_-130px_rgba(148,163,184,0.6)] backdrop-blur-2xl">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 text-white">
            <div>
              <h2 className="text-sm font-semibold">Review stream</h2>
              <p className="text-[11px] text-white/55">Latest feedback filtered by the segment above.</p>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <FunnelIcon className="h-4 w-4" aria-hidden />
              <span className="text-[11px] uppercase tracking-[0.24em]">{filteredReviews.length} shown</span>
            </div>
          </header>

          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_80px] items-center gap-2 border-b border-white/5 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
              <span>Reviewer &amp; comment</span>
              <span>Timeline</span>
              <span className="text-right">Rating</span>
            </div>
            <div className="divide-y divide-white/5">
              {filteredReviews.length ? (
                filteredReviews.map((review) => (
                  <div key={review.id} className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_80px] items-start gap-2 px-4 py-3 text-xs text-white/70">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[12px] font-semibold text-white">{review.reviewerName ?? 'Anonymous'}</span>
                        <span className={`${chipBaseClass} ${sentimentColors[review.sentiment]}`}>{sentimentLabels[review.sentiment]}</span>
                      </div>
                      <p className="text-[11px] text-white/60 line-clamp-2">{review.comment}</p>
                    </div>
                    <div className="text-[11px] text-white/55">
                      {review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 'Recent'}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-white">
                      {[...Array(5)].map((_, index) => (
                        <StarSolidIcon
                          key={index}
                          className={`h-3.5 w-3.5 ${index < review.rating ? 'text-yellow-300' : 'text-white/20'}`}
                          aria-hidden
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-[11px] text-white/50">No reviews in this segment yet.</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function ReviewsInsights({ reviews = [] }: ReviewsInsightsProps) {
  const { enriched, totals, distribution } = useMemo(() => buildInsights(reviews), [reviews]);

  const responseQueue = useMemo(() =>
    enriched
      .filter((review) => review.sentiment !== 'positive')
      .slice(0, 4)
      .map((review) => ({
        id: review.id,
        reviewerName: review.reviewerName ?? 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        timestamp: review.timestamp,
      })),
  [enriched]);

  const tagHighlights = useMemo(() => {
    const keywords = ['support', 'quality', 'speed', 'pricing', 'experience', 'response'];
    const found = keywords.map((keyword) => {
      const hits = enriched.filter((review) => review.comment?.toLowerCase().includes(keyword)).length;
      return {
        keyword,
        hits,
        weight: totals.count ? Math.round((hits / totals.count) * 100) : 0,
      };
    }).filter(({ hits }) => hits > 0);

    return found.sort((a, b) => b.hits - a.hits).slice(0, 5);
  }, [enriched, totals.count]);

  return (
    <div className="space-y-4 text-white">
      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_35px_110px_-90px_rgba(79,70,229,0.6)]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Rating distribution</h3>
            <p className="text-[11px] text-white/55">Share across the last {totals.count} reviews.</p>
          </div>
          <StarIcon className="h-5 w-5 text-yellow-300" aria-hidden />
        </header>
        <div className="space-y-2">
          {distribution.map((row) => (
            <div key={row.label} className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-white/55">
                <span>{row.label}</span>
                <span>{row.value} ({row.share}%)</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-300/80 to-amber-400/80" style={{ width: `${row.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_35px_110px_-90px_rgba(56,189,248,0.55)]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Response queue</h3>
            <p className="text-[11px] text-white/55">Prioritize neutral &amp; negative reviews.</p>
          </div>
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-amber-200" aria-hidden />
        </header>
        <div className="space-y-2">
          {responseQueue.length ? (
            responseQueue.map((review) => (
              <div key={review.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span className="truncate text-white">{review.reviewerName}</span>
                  <span>{review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 'Recent'}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] text-white/55">{review.comment}</p>
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(5)].map((_, index) => (
                    <StarSolidIcon
                      key={index}
                      className={`h-3 w-3 ${index < review.rating ? 'text-yellow-300' : 'text-white/20'}`}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-xl border border-dashed border-white/15 px-3 py-6 text-center text-[11px] text-white/50">All reviews responded to 🎉</p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70 shadow-[0_35px_110px_-90px_rgba(14,165,233,0.55)]">
        <header className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Keyword heatmap</h3>
            <p className="text-[11px] text-white/55">Frequent themes in the last 90 days.</p>
          </div>
          <TagIcon className="h-5 w-5 text-sky-200" aria-hidden />
        </header>
        <div className="flex flex-wrap gap-2">
          {tagHighlights.length ? (
            tagHighlights.map((tag) => (
              <span
                key={tag.keyword}
                className="inline-flex items-center gap-1 rounded-full border border-sky-300/40 bg-sky-400/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-50"
              >
                <FireIcon className="h-3.5 w-3.5" aria-hidden />
                {tag.keyword}
                <span className="text-[9px] text-white/60">{tag.weight}%</span>
              </span>
            ))
          ) : (
            <span className="text-[11px] text-white/55">Not enough data yet. Gather more reviews.</span>
          )}
        </div>
      </section>
    </div>
  );
}
