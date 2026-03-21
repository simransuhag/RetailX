import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- DATA ---
const HERO_SLIDES = [
  { id: 1, title: "The Onyx Collection", subtitle: "LIMITED EDITION", desc: "Premium obsidian-finish tech and accessories.", img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1200", color: "from-slate-950 to-black" },
  { id: 2, title: "Summer Linen", subtitle: "2026 ESSENTIALS", desc: "Sustainable cotton for the modern minimalist.", img: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1200", color: "from-stone-600 to-orange-100" }
];

const FLASH_PRODUCTS = [
  { id: 101, name: "Polaris Smart Watch", price: 12999, old: 18000, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500" },
  { id: 102, name: "Noir Audio Buds", price: 4500, old: 7000, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500" },
  { id: 103, name: "Canvas Tote XL", price: 1200, old: 2500, img: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=500" },
  { id: 104, name: "Studio Desk Lamp", price: 3200, old: 5500, img: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=500" }
];

export default function LuxuryRetailPage() {
  const [heroIdx, setHeroIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 22, seconds: 10 });

  // Simple Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-slate-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase py-3 text-center">
        Free Worldwide Shipping on Orders Over ₹5,000 — Shop Now
      </div>

      {/* 2. MAIN HERO (SLIDESHOW) */}
      <section className="relative h-[85vh] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img src={HERO_SLIDES[heroIdx].img} className="w-full h-full object-cover" alt="Hero" />
            <div className="absolute inset-0 bg-black/40" />
            
            <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-center items-start text-white">
              <motion.span initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xs font-black tracking-[0.5em] mb-4 text-indigo-400">
                {HERO_SLIDES[heroIdx].subtitle}
              </motion.span>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-7xl md:text-9xl font-bold mb-8 tracking-tighter">
                {HERO_SLIDES[heroIdx].title}
              </motion.h1>
              <div className="flex gap-6">
                <button className="bg-white text-black px-12 py-5 rounded-full font-bold hover:scale-105 transition-all shadow-xl">Shop Now</button>
                <button onClick={() => setHeroIdx((heroIdx + 1) % HERO_SLIDES.length)} className="border border-white/40 backdrop-blur-md px-12 py-5 rounded-full font-bold hover:bg-white hover:text-black transition-all">Next</button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 3. TRUST BADGES / USP SECTION */}
      <section className="border-b border-slate-100 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "Express Delivery", desc: "Ships within 24 hours", icon: "📦" },
            { label: "Secure Payment", desc: "PCI-DSS Compliant", icon: "🔒" },
            { label: "7-Day Return", desc: "No questions asked", icon: "🔄" },
            { label: "Ethical Sourcing", desc: "100% Sustainable", icon: "🌿" }
          ].map((usp, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-3xl mb-4">{usp.icon}</span>
              <h4 className="font-bold text-sm uppercase tracking-wider">{usp.label}</h4>
              <p className="text-slate-400 text-xs mt-1">{usp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FLASH DEALS WITH COUNTDOWN */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-2">Flash Steals</h2>
            <p className="text-slate-500 italic">Limited quantities. Refreshed daily.</p>
          </div>
          <div className="flex items-center gap-4 bg-rose-50 px-8 py-4 rounded-3xl border border-rose-100">
            <span className="text-rose-600 font-black text-xs uppercase tracking-widest">Ending In</span>
            <div className="flex gap-3 text-2xl font-black text-rose-600 font-mono">
              <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span className="animate-pulse">:</span>
              <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span className="animate-pulse">:</span>
              <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {FLASH_PRODUCTS.map((p) => (
            <motion.div key={p.id} whileHover={{ y: -10 }} className="group cursor-pointer">
              <div className="relative aspect-[3/4] mb-6 overflow-hidden rounded-[2.5rem] bg-slate-100">
                <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={p.name} />
                <div className="absolute bottom-6 left-6 right-6 translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="w-full bg-white py-4 rounded-2xl font-bold text-sm shadow-2xl">Quick Add +</button>
                </div>
              </div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-bold text-indigo-600">₹{p.price.toLocaleString()}</span>
                <span className="text-slate-400 line-through text-sm italic">₹{p.old.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. "SHOP THE LOOK" EDITORIAL (Large Element) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800" className="w-full h-full object-cover" alt="Editorial" />
            </div>
            {/* Interactive Dot on Image */}
            <div className="absolute top-1/3 right-1/4 group">
              <div className="w-4 h-4 bg-white rounded-full animate-ping absolute" />
              <div className="w-4 h-4 bg-white rounded-full relative shadow-xl" />
              <div className="absolute left-6 top-0 bg-white p-4 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all w-48 pointer-events-none">
                <p className="font-bold text-xs uppercase">Structured Blazer</p>
                <p className="text-indigo-600 font-bold">₹8,999</p>
              </div>
            </div>
          </div>
          <div className="lg:pl-20">
            <span className="text-indigo-600 font-black text-xs tracking-[0.3em] uppercase mb-6 block">Editorial No. 14</span>
            <h2 className="text-5xl font-bold mb-8 leading-[1.1]">The Art of <br /> Modern Living.</h2>
            <p className="text-slate-500 text-lg mb-10 leading-relaxed">
              Discover a curated selection of pieces designed to elevate your everyday rituals. From morning coffee to evening repose, we believe in the beauty of function.
            </p>
            <button className="text-slate-900 font-bold border-b-2 border-slate-900 pb-2 hover:text-indigo-600 hover:border-indigo-600 transition-all">Explore the Lookbook</button>
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER / FOOTER PREVIEW */}
      <section className="bg-slate-900 py-32 text-center text-white px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Join the RetailX Circle</h2>
          <p className="text-slate-400 mb-10">Get early access to drops, member-only pricing, and our weekly digital journal.</p>
          <div className="flex flex-col md:flex-row gap-4">
            <input type="email" placeholder="Email Address" className="flex-1 bg-white/10 border border-white/20 rounded-full px-8 py-4 text-white focus:outline-none focus:border-indigo-400" />
            <button className="bg-white text-black px-12 py-4 rounded-full font-bold">Subscribe</button>
          </div>
        </div>
      </section>

    </div>
  );
}