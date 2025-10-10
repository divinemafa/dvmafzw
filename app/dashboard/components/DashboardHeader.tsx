import { UserCircleIcon, BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface DashboardHeaderProps {
  userName: string;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <header className="mb-2">
      {/* Compact Header */}
      <div className="relative overflow-hidden bg-white/5 p-3 backdrop-blur-xl">
        <div className="relative flex items-center justify-between">
          {/* Welcome Text */}
          <div>
            <h1 className="text-lg font-bold text-white">
              Welcome, {userName}
            </h1>
            <p className="text-xs text-white/60">
              Marketplace Dashboard
            </p>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Bar (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 bg-white/5 px-3 py-1.5 backdrop-blur-xl">
              <MagnifyingGlassIcon className="h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Search..."
                className="w-24 bg-transparent text-xs text-white placeholder:text-white/40 focus:outline-none focus:w-32 transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative bg-white/5 p-2 backdrop-blur-xl transition hover:bg-white/10">
              <BellIcon className="h-4 w-4 text-white" />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </button>

            {/* Profile Button */}
            <a
              href="/profile"
              className="flex items-center gap-2 bg-white/5 pl-1 pr-2 py-1 backdrop-blur-xl transition hover:bg-white/10"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-xs font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:block text-xs font-medium text-white">Profile</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
