'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer/index';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on Exchange, Market, and Dashboard pages
  const hideFooterPages = ['/exchange', '/market', '/dashboard'];
  
  if (hideFooterPages.includes(pathname) || pathname?.startsWith('/dashboard')) {
    return null;
  }
  
  return <Footer />;
}
