import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, ChevronLeft, ChevronRight, Scan, 
  ArrowUpRight, ArrowRight, Instagram, Plus, Star
} from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Chatbot from "../Components/Chatbot";

const API_BASE = "http://127.0.0.1:5000";

const CustomerDashboard = () => {
  const [feedData, setFeedData] = useState({ mind_reader: [], signature_styles: [], discovery_radar: [] });
  const [loading, setLoading] = useState(true);
  const [heroIdx, setHeroIdx] = useState(0);
  const navigate = useNavigate();

  const userName = localStorage.getItem("user_name") || "Guest";

  // --- Auto Hero Change ---
  useEffect(() => {
    if (feedData.mind_reader.length > 0) {
      const timer = setInterval(() => {
        setHeroIdx((prev) => (prev + 1) % feedData.mind_reader.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [feedData.mind_reader]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/recommendations/feed`);
        setFeedData(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchData();
  }, []);

  const handleProductClick = (p) => {
    const id = p.id || p._id;
    if (id) {
      window.scrollTo(0, 0); // Always scroll to top on navigate
      navigate(`/product/${id}`);
    }
  };

  const getImgUrl = (item) => {
    const path = item?.imageURL || item?.imageUrl || item?.image_url || item?.image;
    if (!path || path.includes("photo-1490481651871")) {
      return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop";
    }
    return path.startsWith("http") ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const nextHero = () => setHeroIdx((prev) => (prev + 1) % (feedData.mind_reader.length || 1));

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#1A1A1A] font-sans selection:bg-black selection:text-white overflow-x-hidden">
      <Navbar />

      <main>
        {/* --- SECTION 1: EDITORIAL HERO --- */}
        <section className="h-screen w-full relative flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={heroIdx}
              initial={{ opacity: 0, scale: 1.1 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
              className="absolute inset-0"
            >
              <img 
                src={getImgUrl(feedData.mind_reader[heroIdx])} 
                className="w-full h-full object-cover"
                alt="Hero"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 w-full px-6 md:px-20 text-center text-white">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
            >
              <span className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.8em] mb-6 block opacity-80">
                Curated for {userName}
              </span>
              <h1 className="text-[14vw] md:text-[9vw] font-serif italic leading-[0.85] mb-8 drop-shadow-2xl">
                {feedData.mind_reader[heroIdx]?.name || "Unspoken Art"}
              </h1>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleProductClick(feedData.mind_reader[heroIdx])}
                className="mt-8 px-10 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-emerald-400 hover:text-white transition-all duration-500"
              >
                View Collection
              </motion.button>
            </motion.div>
          </div>

          {/* Hero Navigation Dots */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
            {feedData.mind_reader.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 transition-all duration-500 rounded-full ${i === heroIdx ? 'w-12 bg-emerald-400' : 'w-4 bg-white/30'}`} 
              />
            ))}
          </div>
        </section>

        {/* --- SECTION 2: THE CURATED GRID (SIGNATURE STYLE) --- */}
        <section className="py-32 px-6 md:px-24">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-24 gap-6">
            <div className="max-w-md">
                <h3 className="text-5xl font-serif italic mb-6 leading-tight">Signature <br/> Style</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-light">A selection of pieces defined by clean lines and uncompromising craftsmanship.</p>
            </div>
            <div className="flex items-center gap-8">
                <div className="hidden md:block w-40 h-[1px] bg-zinc-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Curated Edit 2026</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-32">
            {feedData.signature_styles.slice(0, 6).map((p, idx) => (
              <motion.div 
                key={p.id || idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className={`group cursor-pointer ${idx === 1 ? 'lg:mt-32' : ''}`}
                onClick={() => handleProductClick(p)}
              >
                <div className="relative overflow-hidden aspect-[4/5] bg-[#F5F5F3] rounded-sm">
                   <img 
                    src={getImgUrl(p)} 
                    className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-110" 
                    alt={p.name}
                   />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500">
                            <Plus size={20} className="text-black" />
                        </div>
                   </div>
                </div>
                <div className="mt-8 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">{p.name}</h4>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-tighter mt-1">{p.brand || "Limited Edition"}</p>
                    </div>
                    <ArrowUpRight size={18} className="opacity-0 text-zinc-400 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500" />
                  </div>
                  <p className="text-xl font-serif italic text-zinc-800 font-medium">₹{p.finalPrice.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- SECTION 3: STATEMENT BANNER --- */}
        <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[#141414]" />
            <motion.div 
                whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
                viewport={{ once: true }}
                className="relative z-10 text-center max-w-4xl px-6"
            >
                <h2 className="text-white text-4xl md:text-7xl font-serif italic leading-[1.1] tracking-tight">
                    "Style is a silent language. <br/> We just help you speak it."
                </h2>
                <div className="mt-16 flex flex-col items-center gap-4">
                    <div className="w-px h-16 bg-gradient-to-b from-white to-transparent opacity-30" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500"> Yves Saint Laurent</span>
                </div>
            </motion.div>
        </section>

        {/* --- SECTION 4: THE DISCOVERY RADAR --- */}
        <section className="py-40 px-6 md:px-20">
          <div className="flex justify-between items-end mb-24">
            <div>
              <h3 className="text-3xl font-serif italic tracking-tight mb-2">Discovery Radar</h3>
              <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">New Arrivals matching your vibe</p>
            </div>
            <div className="group flex items-center gap-3 cursor-pointer pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Explore All</span>
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-16 gap-x-10">
            {feedData.discovery_radar.map((p, idx) => (
              <motion.div 
                key={p.id || idx} 
                whileHover={{ y: -10 }}
                className="group cursor-pointer" 
                onClick={() => handleProductClick(p)}
              >
                <div className="aspect-[3/4] overflow-hidden mb-6 bg-zinc-100 rounded-sm">
                  <img src={getImgUrl(p)} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={p.name} />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">{p.category}</p>
                    <h5 className="text-[11px] font-bold uppercase tracking-tight text-zinc-800 truncate">{p.name}</h5>
                    <p className="text-lg font-serif italic text-zinc-800">₹{p.finalPrice.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- SECTION 5: SMART PICKS (EMERALD BOUTIQUE) --- */}
        <section className="py-40 px-6 md:px-20 bg-emerald-950 text-white rounded-[60px] mx-auto max-w-[98%] shadow-3xl overflow-hidden mb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end mb-32">
            <div className="md:col-span-5">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-emerald-400 mb-6 block">Made for Your Taste</span>
               <h3 className="text-5xl font-serif italic leading-tight">Smart Picks for You</h3>
            </div>
            <div className="md:col-span-7 h-[1px] bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-32 gap-x-12">
            {feedData.signature_styles.slice(0, 6).map((p, idx) => (
              <motion.div 
                key={p.id || idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`group cursor-pointer ${idx % 2 !== 0 ? 'md:mt-24' : ''}`}
                onClick={() => handleProductClick(p)}
              >
                <div className="aspect-[2/3] overflow-hidden bg-white/5 mb-8 relative rounded-2xl">
                   <img src={getImgUrl(p)} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" alt={p.name} />
                   <div className="absolute top-6 left-6 text-emerald-400 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                      <span className="text-[9px] font-bold uppercase tracking-[0.4em]">ITEM № {idx + 1}</span>
                   </div>
                </div>
                <div className="flex justify-between items-baseline px-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-1 text-white">{p.name}</h4>
                    <p className="text-[10px] text-emerald-500 uppercase tracking-widest">{p.category}</p>
                  </div>
                  <p className="text-lg italic font-serif text-emerald-400 font-bold">₹{p.finalPrice.toLocaleString()}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
      <Chatbot />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        ::selection { background-color: #10b981; color: white; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #fdfdfd; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
      `}} />
    </div>
  );
};

const Loader = () => (
  <div className="h-screen bg-white flex flex-col items-center justify-center">
    <motion.div 
        animate={{ 
          scale: [1, 1.2, 1], 
          rotate: [0, 180, 360],
          borderRadius: ["20%", "50%", "20%"] 
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-10 h-10 border-2 border-emerald-500 mb-10" 
    />
    <p className="text-[10px] font-bold uppercase tracking-[1.2em] text-zinc-400 animate-pulse">Syncing Style Profile</p>
  </div>
);

export default CustomerDashboard;