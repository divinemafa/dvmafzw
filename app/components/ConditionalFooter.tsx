'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer/index';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on Exchange and Market pages (they have their own custom footers)
  const hideFooterPages = ['/exchange', '/market'];
  
  if (hideFooterPages.includes(pathname)) {
    return null;
  }
  
  return <Footer />;
}
