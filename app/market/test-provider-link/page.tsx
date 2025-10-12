/**
 * Test Provider Link Component
 * 
 * Showcases all variations of the ProviderLink component
 * Visit: /market/test-provider-link
 */

'use client';

import { ProviderLink, ProviderLinkCompact, ProviderAvatar } from '../components/ProviderLink';

export default function TestProviderLinkPage() {
  // Sample provider data
  const providers = [
    {
      username: 'tynoedev',
      display_name: 'tynoedev',
      avatar_url: 'https://swemmmqiaieanqliagkd.supabase.co/storage/v1/object/public/avatars/49c1bf45-f1e6-4f15-978c-a94bc5d1f7ed/avatar-1759936645931.jpg',
      is_verified: false,
      verification_level: 0,
      rating: 0,
      total_reviews: 0,
    },
    {
      username: 'divinemafa',
      display_name: 'Divine Mafa',
      avatar_url: null,
      is_verified: true,
      verification_level: 2,
      rating: 4.8,
      total_reviews: 42,
    },
    {
      username: 'chigwidath',
      display_name: 'Chigwidath',
      avatar_url: null,
      is_verified: true,
      verification_level: 3,
      rating: 4.9,
      total_reviews: 156,
    },
    {
      username: 'testuser',
      display_name: 'Elite Provider',
      avatar_url: null,
      is_verified: true,
      verification_level: 4,
      rating: 5.0,
      total_reviews: 523,
    },
  ];

  return (
    <main className="relative flex min-h-screen justify-center bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] px-4 py-12 text-white">
      <div className="w-full max-w-4xl space-y-12">
        <div>
          <h1 className="text-3xl font-bold text-white">Provider Link Component Test</h1>
          <p className="mt-2 text-sm text-white/70">
            Testing all variations of the ProviderLink component
          </p>
        </div>

        {/* Standard ProviderLink - Different Sizes */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">Standard ProviderLink (Text Only)</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-white/50">Extra Small (xs)</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderLink key={provider.username} provider={provider} size="xs" />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Small (sm) - Default</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderLink key={provider.username} provider={provider} size="sm" />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Medium (md)</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderLink key={provider.username} provider={provider} size="md" />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Large (lg)</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderLink key={provider.username} provider={provider} size="lg" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* With Avatar */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">With Avatar</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-white/50">Small with Avatar</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderLink
                    key={provider.username}
                    provider={provider}
                    size="sm"
                    showAvatar
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Medium with Avatar</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderLink
                    key={provider.username}
                    provider={provider}
                    size="md"
                    showAvatar
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Large with Avatar</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderLink
                    key={provider.username}
                    provider={provider}
                    size="lg"
                    showAvatar
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* With Rating */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">With Rating</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-white/50">Small with Rating</p>
              <div className="flex flex-wrap gap-4">
                {providers.slice(1).map(provider => (
                  <ProviderLink
                    key={provider.username}
                    provider={provider}
                    size="sm"
                    showRating
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Medium with Rating</p>
              <div className="flex flex-wrap gap-4">
                {providers.slice(1).map(provider => (
                  <ProviderLink
                    key={provider.username}
                    provider={provider}
                    size="md"
                    showRating
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* With Avatar + Rating */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">Full Display (Avatar + Rating)</h2>
          <div className="space-y-4">
            {providers.slice(1).map(provider => (
              <div key={provider.username} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                <ProviderLink
                  provider={provider}
                  size="md"
                  showAvatar
                  showRating
                />
              </div>
            ))}
          </div>
        </section>

        {/* Compact Version */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">ProviderLinkCompact (For Grid Cards)</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {providers.map(provider => (
              <div key={provider.username} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-[10px] text-white/50">by</p>
                <ProviderLinkCompact provider={provider} />
              </div>
            ))}
          </div>
        </section>

        {/* Avatar Only */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">ProviderAvatar (Avatar Only)</h2>
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-xs text-white/50">Small Avatars</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderAvatar key={provider.username} provider={provider} size="sm" />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Medium Avatars</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderAvatar key={provider.username} provider={provider} size="md" />
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs text-white/50">Large Avatars</p>
              <div className="flex flex-wrap gap-4">
                {providers.map(provider => (
                  <ProviderAvatar key={provider.username} provider={provider} size="lg" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl">
          <h2 className="text-xl font-semibold text-white">Real-World Usage Examples</h2>
          
          {/* Grid Card Example */}
          <div>
            <p className="mb-4 text-sm font-semibold text-white/70">Grid Card (Compact)</p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 aspect-video w-full rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <h3 className="text-sm font-semibold text-white">Service Title</h3>
              <p className="mt-1 text-[9px] text-white/60">Short description</p>
              <div className="mt-2 flex items-center justify-between text-[9px]">
                <div>
                  <span className="text-white/50">by </span>
                  <ProviderLinkCompact provider={providers[1]} />
                </div>
                <span className="text-white/40">2h response</span>
              </div>
            </div>
          </div>

          {/* List View Example */}
          <div>
            <p className="mb-4 text-sm font-semibold text-white/70">List View (With Rating)</p>
            <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="h-24 w-32 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">Service Title</h3>
                <p className="mt-1 text-xs text-white/60">Description text here</p>
                <div className="mt-2 flex items-center gap-3">
                  <ProviderLink
                    provider={providers[2]}
                    size="sm"
                    showAvatar
                    showRating
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
