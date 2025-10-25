import React from 'react';

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/60">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-sm">© {new Date().getFullYear()} HoloComms. Built for the neon web.</p>
        <div className="text-xs text-slate-500">
          Demo uses WebRTC and local loopback for messaging and media.
        </div>
      </div>
    </footer>
  );
}
