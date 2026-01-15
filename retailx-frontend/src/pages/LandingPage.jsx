
import Chatbot from "../Components/Chatbot";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sparkles, Plus, Instagram, Twitter, Facebook } from "lucide-react";
import { Button } from "../Components/ui/button";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";


const SLIDES = [
  { 
    id: 1, 
    title: "FUTURE STYLE", 
    desc: "AI-Curated Fashion for the 2026 Season.",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000", 
  },
  { 
    id: 2, 
    title: "PRECISION TECH", 
    desc: "Experience software that predicts your needs.",
    img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000", 
  },
  { 
    id: 3, 
    title: "MODERN HOME", 
    desc: "Essentials for the modern sanctuary.",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000", 
  }
];

export default function RetailXHome() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate(); 
  // Auto-play timer: 7 seconds for a relaxed professional feel
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* ---------- 1. FULLSCREEN HERO SLIDESHOW ---------- */}
      <section className="relative h-screen w-full flex items-center overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div 
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image Layer */}
            <motion.div 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: "linear" }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                src={SLIDES[index].img} 
                className="w-full h-full object-cover" 
                alt="RetailX Hero" 
              />
              {/* Dark Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            </motion.div>

            {/* Content Layer */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-8 md:px-12 flex flex-col justify-center">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="max-w-3xl"
              >
                <p className="text-emerald-400 font-black tracking-[0.5em] text-xs mb-6 uppercase">
                  RetailX Intelligence
                </p>
                <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter leading-[0.9] mb-8">
                  {SLIDES[index].title.split(" ")[0]} <br />
                  <span className="text-transparent" style={{ WebkitTextStroke: "2px white" }}>
                    {SLIDES[index].title.split(" ")[1]}
                  </span>
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-lg mb-10 leading-relaxed">
                  {SLIDES[index].desc}
                </p>
                <div className="flex flex-wrap gap-4 mt-8">
  {/* Primary Button - Locked to Emerald */}
  <Button 
    className="rounded-full px-8 py-4 text-base bg-[#059669] hover:bg-[#10b981] text-white font-bold border-none transition-all active:scale-95 shadow-lg shadow-emerald-900/20"
  >
    Explore Drop
  </Button>
  
  {/* Outline Button - Transparent with white border */}
  <Button 
    variant="outline" 
    className="rounded-full px-8 py-4 text-base border-2 border-white/40 bg-transparent text-white backdrop-blur-sm hover:bg-white hover:text-black transition-all"
  >
    View Lookbook
  </Button>
</div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators - Modern Vertical Style */}
        <div className="absolute right-8 md:right-12 bottom-12 flex items-center gap-6 z-30">
          <span className="text-white/40 font-mono text-sm">0{index + 1}</span>
          <div className="flex gap-3">
            {SLIDES.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setIndex(i)}
                className={`h-1 transition-all duration-700 rounded-full ${i === index ? "bg-emerald-500 w-16" : "bg-white/20 w-4"}`}
              />
            ))}
          </div>
          <span className="text-white/40 font-mono text-sm">0{SLIDES.length}</span>
        </div>
      </section>

      {/* ---------- 2. LOGO TICKER ---------- */}
      <div className="py-12 bg-white overflow-hidden whitespace-nowrap border-b border-slate-150">
        <motion.div 
          initial={{ x: 0 }}
          animate={{ x: "-50%" }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 items-center text-[80px] md:text-[140px] font-black text-slate-200 uppercase leading-none select-none"
        >
          <span>RetailX Intelligence</span>
          <span className="text-emerald-500/10">RetailX Intelligence</span>
          <span>RetailX Intelligence</span>
          <span className="text-emerald-500/10">RetailX Intelligence</span>
        </motion.div>
      </div>

      {/* ---------- 3. PRODUCT GRID ---------- */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 leading-none">
              WEEKLY <br /> <span className="text-emerald-600">NEW DROPS</span>
            </h2>
            <p className="text-slate-400 mt-4 md:mt-0 text-sm font-medium uppercase tracking-widest">
              Available for a limited time
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden bg-slate-50 aspect-[3/4] rounded-[32px]">
                  <img 
                    src={`/Products/product${i}.jpeg`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <button className="absolute bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-2xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                    <Plus size={24} />
                  </button>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-slate-900">RetailX Curated {i}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Limited Edition</span>
                    <span className="text-lg font-black">₹{(i * 999).toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 4. NEWSLETTER CTA ---------- */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto rounded-[60px] relative overflow-hidden bg-slate-950 p-12 md:p-24 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-8">
              NEVER MISS <br /> A DROP
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <input 
                placeholder="Enter your email" 
                className="bg-white/5 border border-white/10 px-8 py-5 rounded-full text-white w-full sm:w-96 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              
              <Button onClick={() => navigate("/auth")}className="bg-[#37cd9e] text-white rounded-full px-8 py-4 font-bold hover:bg-[#059669] w-full sm:w-auto transition-all duration-300 active:scale-95 shadow-xl shadow-slate-900/10 border-none"
>
Join RetailX
</Button>
            </div>
          </div>
          <Chatbot></Chatbot>
        </div>
      </section>

      <Footer />
    </div>
  );
}