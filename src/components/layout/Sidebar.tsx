
import React from 'react';
import { Home, FileText, UserRound, Shield } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="hidden md:block w-16 lg:w-64 h-full bg-dao-dark-accent border-r border-white/10">
      <div className="p-4 h-full flex flex-col">
        <div className="mb-8 hidden lg:block">
          <h2 className="text-xl font-bold gradient-text">InsuraX</h2>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <SidebarLink href="/" icon={<Home size={20} />} label="Dashboard" />
          <SidebarLink href="/proposals" icon={<FileText size={20} />} label="Proposals" />
          <SidebarLink href="/membership" icon={<UserRound size={20} />} label="Membership" />
          <SidebarLink href="/insurance" icon={<Shield size={20} />} label="Insurance" />
        </nav>
        
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 text-sm text-foreground/60">
            <div className="h-2 w-2 rounded-full bg-dao-primary animate-pulse"></div>
            <span className="hidden lg:inline">Network: Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ 
  href, 
  icon, 
  label 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string;
}) {
  const isActive = window.location.pathname === href;
  
  return (
    <a 
      href={href}
      className={`flex items-center gap-3 p-3 rounded-md transition-all ${
        isActive 
          ? "bg-dao-primary/10 text-dao-primary" 
          : "hover:bg-white/5 text-foreground/80 hover:text-foreground"
      }`}
    >
      <div className="text-inherit">{icon}</div>
      <span className="hidden lg:inline font-medium">{label}</span>
    </a>
  );
}
