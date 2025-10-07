import { UserCircleIcon } from '@heroicons/react/24/outline';

interface DashboardHeaderProps {
  userName: string;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {userName}! 👋</h1>
        <p className="text-sm text-white/60">Manage your marketplace and grow your business</p>
      </div>
      <a
        href="/profile"
        className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        <UserCircleIcon className="mr-2 inline-block h-5 w-5" />
        Profile
      </a>
    </header>
  );
};
