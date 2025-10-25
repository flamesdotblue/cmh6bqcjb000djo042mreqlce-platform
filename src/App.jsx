import React from 'react';
import Navbar from './components/Navbar';
import Hero3D from './components/Hero3D';
import HoloCall from './components/HoloCall';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero3D />
      <main id="app" className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300">
            Quantum Chat, Calls & Holo-Video
          </h2>
          <p className="mt-4 text-slate-300 max-w-2xl">
            Experience a futuristic, 3D-inspired communication hub. Initiate a local peer-to-peer demo that showcases real-time chat, audio, and video calling with a cyberpunk aesthetic.
          </p>
        </section>
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <HoloCall />
        </section>
      </main>
      <Footer />
    </div>
  );
}
