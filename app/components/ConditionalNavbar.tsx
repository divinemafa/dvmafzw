'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar/index';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on Dashboard pages (dashboard has its own sidebar navigation)
  if (pathname === '/dashboard' || pathname?.startsWith('/dashboard')) {
    return null;
  }
  
  return <Navbar />;
}
