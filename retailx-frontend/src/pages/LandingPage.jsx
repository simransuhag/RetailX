import Chatbot from "../Components/Chatbot";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, ArrowUpRight } from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SLIDES = [
  { id: 1, title: "FUTURE STYLE", subtitle: "RetailX", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" },
  { id: 2, title: "PRECISION TECH", subtitle: "Minimalist Innovation", img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2000" },
  { id: 3, title: "MODERN HOME", subtitle: "The Sanctuary Series", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" }
];

export default function RetailXHome() {
  const [index, setIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      // DHAYAN DE: Yahan URL change kiya hai -> /api/products/latest
      const res = await axios.get("http://127.0.0.1:5000/api/products/latest");
      
      // Backend ab khud hi 8 random aur diverse products bhej raha hai
      if (res.data && res.data.length > 0) {
        setProducts(res.data);
      }
    } catch (err) { 
      console.error("Error fetching random products:", err); 
    } finally { 
      setLoading(false); 
    }
  };
  fetchProducts();
}, []);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % SLIDES.length), 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#1A1A1A] overflow-x-hidden font-sans">
      <Navbar />

      {/* --- LUXURY HERO SECTION --- */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }} className="absolute inset-0">
            <motion.img 
                initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 10 }}
                src={SLIDES[index].img} className="w-full h-full object-cover opacity-60" alt="Hero" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 text-center px-6">
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-emerald-400 font-bold tracking-[0.6em] text-[10px] md:text-xs mb-8 uppercase">
            {SLIDES[index].subtitle}
          </motion.p>
          <motion.h1 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="text-[12vw] md:text-[8vw] font-serif italic text-white leading-none drop-shadow-2xl">
            {SLIDES[index].title}
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-12">
             <button onClick={() => document.getElementById('grid').scrollIntoView({behavior: 'smooth'})} className="px-12 py-5 bg-white text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-emerald-500 hover:text-white transition-all duration-500">
                Explore Collection
             </button>
          </motion.div>
        </div>
      </section>

      {/* --- EDITORIAL GRID SECTION --- */}
      <section id="grid" className="py-40 px-6 md:px-24 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 border-b border-zinc-100 pb-16">
          <div className="w-full">
            <h4 className="text-4xl md:text-6xl font-serif italic tracking-tight leading-none whitespace-nowrap">
              The <span className="text-emerald-600">Curated</span> Collection
            </h4>
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.5em] mt-8 md:mt-0"> 2026</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-32">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-6">
               <div className="w-12 h-px bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-bold tracking-[0.5em] text-zinc-400 uppercase">Designing your feed...</p>
            </div>
          ) : products.map((product, idx) => (
            <motion.div 
              key={product._id || product.id} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`group cursor-pointer ${idx % 2 !== 0 ? 'lg:mt-20' : ''}`}
              onClick={() => navigate(`/product/${product._id || product.id}`)}
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F5F3] rounded-sm shadow-sm">
                <img 
                  src={product.imageURL || product.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000"} 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" 
                  alt={product.name}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 shadow-2xl">
                        <Plus size={20} className="text-black" />
                    </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex justify-between items-start">
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.3em]">{product.category}</p>
                    <ArrowUpRight size={16} className="text-zinc-300 group-hover:text-black transition-colors" />
                </div>
                <h3 className="text-sm font-medium text-black uppercase tracking-tight truncate">
                  {product.name}
                </h3>
                <p className="text-xl font-serif italic text-zinc-900">
                  ₹{(product.finalPrice || product.price)?.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- BRAND PHILOSOPHY --- */}
      {/* --- BRAND PHILOSOPHY: COMPACT & ELEGANT --- */}
<section className="relative py-24 bg-[#141414] text-white overflow-hidden rounded-[50px] mx-4 mb-10 shadow-3xl">
  {/* Decorative Subtle Background Element */}
  <div className="absolute top-0 right-0 p-10 opacity-10 font-serif italic text-8xl pointer-events-none">
    RX
  </div>

  <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-emerald-500 mb-6 block">
        The Philosophy
      </span>
      
      <h2 className="text-3xl md:text-5xl font-serif italic mb-10 leading-snug">
        "Modernity is not in the clothes, <br className="hidden md:block"/> 
        it's in the attitude."
      </h2>

      <div className="flex flex-col items-center">
        {/* Shortened the divider line to reduce empty space */}
        <div className="w-px h-12 bg-gradient-to-b from-emerald-500 to-transparent mb-10 opacity-50" />
        
        <button 
          onClick={() => navigate("/auth")}
          className="group flex items-center gap-6 px-10 py-4 border border-white/10 rounded-full hover:bg-white hover:text-black transition-all duration-700 ease-in-out"
        >
          <span className="text-[9px] font-bold uppercase tracking-[0.4em]">
            Become a Member
          </span>
          <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
        </button>
      </div>
    </motion.div>
  </div>
</section>

      <Chatbot />
      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        body { background-color: #FCFCFB; }
      `}} />
    </div>
  );
}