
import React from 'react';
import { Navbar } from './Navbar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Footer } from './Footer';

export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen  flex flex-col">
      <Navbar />
      <div className="flex-1 flex ">
        <main className="flex-1  p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-thin">
          <div className="container   max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
