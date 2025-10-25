import React from 'react';
import { Rocket, Settings } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3 group">
          <div className="relative h-9 w-9 grid place-items-center rounded-lg bg-gradient-to-br from-fuchsia-600 to-cyan-500">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 group-hover:from-fuchsia-300 group-hover:to-cyan-300 transition-colors">
            HoloComms
          </span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-slate-300">
          <a href="#app" className="hover:text-white transition-colors">Launch</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <button className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 hover:border-white/25 hover:bg-white/5 transition-colors">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
