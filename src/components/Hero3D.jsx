import React from 'react';
import Spline from '@splinetool/react-spline';

export default function Hero3D() {
  const handleScroll = () => {
    const el = document.getElementById('app');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative h-[80vh] md:h-[88vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/EF7JOSsHLk16Tlw9/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow">
          Communicate in the Neon Future
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          A cyberpunk-inspired hub for chats, calls and holo-video. Experiment with a live, local peer-to-peer demo right in your browser.
        </p>
        <div className="mt-8 flex gap-4">
          <button onClick={handleScroll} className="px-6 py-3 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-500 text-white font-semibold shadow-lg shadow-fuchsia-500/30 hover:brightness-110 transition">
            Launch HoloComms
          </button>
          <a href="#features" className="px-6 py-3 rounded-full border border-white/20 text-slate-200 hover:bg-white/10 transition">
            Learn More
          </a>
        </div>
      </div>

      <div id="features" className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-slate-300">
        <p className="text-xs uppercase tracking-[0.3em]">3D • Realtime • WebRTC</p>
      </div>
    </section>
  );
}
