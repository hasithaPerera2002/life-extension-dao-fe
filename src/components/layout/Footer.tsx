
import React from 'react';

export function Footer() {
  return (
    <footer className="px-6 py-4 border-t relative z-10 border-white/10 text-sm text-foreground/60 bg-dao-dark">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-3 md:mb-0">
          <p>© 2025 InsuraX</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-dao-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-dao-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-dao-primary transition-colors">Docs</a>
          <a href="#" className="hover:text-dao-secondary transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
