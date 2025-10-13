'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ProfileDropdownProps {
  onTrackOrder: () => void;
}

/**
 * ProfileDropdown Component
 * 
 * Dropdown menu for user profile with quick actions:
 * - Track Order (opens tracking modal)
 * - Profile (navigates to profile page)
 */
export default function ProfileDropdown({ onTrackOrder }: ProfileDropdownProps) {
  return (
    <Menu as="div" className="relative">
      {/* Profile Button */}
      <Menu.Button className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-lg hover:from-purple-600 hover:to-blue-600 transition focus:outline-none focus:ring-2 focus:ring-purple-500/50">
        DU
      </Menu.Button>

      {/* Dropdown Menu */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-[#0a1532] border border-white/10 backdrop-blur-2xl shadow-2xl focus:outline-none overflow-hidden z-50">
          <div className="py-1">
            {/* Track Order Option */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onTrackOrder}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    active ? 'bg-white/10' : ''
                  }`}
                >
                  <MagnifyingGlassIcon className="h-5 w-5 text-orange-400" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-white">Track Order</p>
                    <p className="text-xs text-white/60 mt-0.5">Check order status</p>
                  </div>
                </button>
              )}
            </Menu.Item>

            {/* Divider */}
            <div className="border-t border-white/10 my-1" />

            {/* Profile Option */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile"
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    active ? 'bg-white/10' : ''
                  }`}
                >
                  <UserIcon className="h-5 w-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="font-medium text-white">Profile</p>
                    <p className="text-xs text-white/60 mt-0.5">View & edit profile</p>
                  </div>
                </Link>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
