import { HomeIcon } from '@heroicons/react/24/outline';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#050814] via-[#0a1532] to-[#120333] text-white">
      {/* Background ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/4 top-16 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute right-1/4 top-32 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-16 left-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-md px-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20">
              <HomeIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-2 text-2xl font-bold">Marketplace Dashboard</h1>
            <p className="text-sm text-white/70">Manage your services and grow your business</p>
          </div>

          <button
            onClick={onLogin}
            className="w-full rounded-lg border border-white/20 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 py-3 text-base font-semibold text-white shadow-xl transition hover:from-blue-600 hover:to-purple-600"
          >
            Login with Demo Account
          </button>

          <p className="mt-4 text-center text-xs text-white/50">
            Demo mode - No authentication required
          </p>
        </div>
      </div>
    </main>
  );
};
