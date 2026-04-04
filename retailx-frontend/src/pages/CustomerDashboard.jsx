import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, ChevronLeft, ChevronRight, Scan, 
  ArrowUpRight, ArrowRight, Instagram, Plus
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

  // --- FIX 1: Define user data from localStorage ---
const userName = localStorage.getItem("user_name") || localStorage.getItem("user.name")  || "Guest";  
  // Safely parse userPrefs or default to an empty array
  const userPrefs = (() => {
    try {
      const prefs = localStorage.getItem("user_preferences");
      return prefs ? JSON.parse(prefs) : [];
    } catch (e) {
      return [];
    }
  })();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/recommendations/feed`);
        setFeedData(res.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        // Smooth transition out of loader
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchData();
  }, []);

  // --- FIX 2: Define the missing click handler ---
  const handleProductClick = (p) => {
    const id = p.id || p._id;
    if (id) navigate(`/product/${id}`);
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
        <section className="h-screen w-full relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={heroIdx}
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <motion.img 
                animate={{ scale: [1, 1.1] }}
                transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                src={getImgUrl(feedData.mind_reader[heroIdx])} 
                className="w-full h-full object-cover"
                alt="Hero"
              />
              <div className="absolute inset-0 bg-black/20" />
            </motion.div>
          </AnimatePresence>

          <div className="relative z-10 w-full px-6 md:px-20 text-center text-white">
            <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
              <span className="text-[20px] font-bold uppercase tracking-[0.6em] mb-8 block">Exclusive for {userName}</span>
              <h1 className="text-[12vw] md:text-[8vw] font-serif italic leading-none mb-12 drop-shadow-2xl">
                {feedData.mind_reader[heroIdx]?.name || "Unspoken Art"}
              </h1>
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-20 text-white z-20">
             <button onClick={nextHero} className="group flex items-center gap-4 hover:opacity-70 transition-opacity">
                <span className="text-[20px] font-bold uppercase tracking-widest">Welcome</span>
             </button>
          </div>
        </section>

        {/* --- SECTION 2: THE CURATED GRID --- */}
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
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className={`group cursor-pointer ${idx === 1 ? 'lg:mt-32' : ''}`}
                onClick={() => handleProductClick(p)}
              >
                <div className="relative overflow-hidden aspect-[4/5] bg-[#F5F5F3]">
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
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900">{p.name}</h4>
                    <ArrowUpRight size={14} className="opacity-0 text-[25px] group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                  <p className="text-lg font-serif italic text-[20px] text-zinc-800 font-medium">₹{p.finalPrice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- SECTION 3: STATEMENT BANNER --- */}
        <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[#141414]" />
            <motion.div 
                whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                className="relative z-10 text-center max-w-4xl px-6"
            >
                <h2 className="text-white text-4xl md:text-7xl font-serif italic leading-[1.1] tracking-tight">
                    "Style is a silent language. <br/> We just help you speak it."
                </h2>
                <div className="mt-16 flex flex-col items-center gap-4">
                    <div className="w-px h-16 bg-gradient-to-b from-white to-transparent" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500"> Yves Saint Laurent</span>
                </div>
            </motion.div>
        </section>

        {/* --- SECTION 4: THE DISCOVERY RADAR --- */}
        <section className="py-40 px-6 md:px-20">
          <div className="flex justify-between items-end mb-24">
            <h3 className="text-3xl font-serif italic tracking-tight">Discovery Radar</h3>
            <p className="text-sm text-zinc-500 leading-relaxed font-light">Discover what matches your vibe</p>
            <div className="group flex items-center gap-3 cursor-pointer">
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
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{p.category}</p>
                    <h5 className="text-[11px] font-bold uppercase tracking-tight text-zinc-800 truncate">{p.name}</h5>
                    <p className="text-sm text-[20px] font-serif italic text-zinc-800">₹{p.finalPrice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- SECTION 5: SIGNATURE BOUTIQUE --- */}
        <section className="py-40 px-6 md:px-20 bg-emerald-950 text-white rounded-[60px] mx-auto max-w-[98%] shadow-3xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-end mb-32">
            <div className="md:col-span-5">
               <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-emerald-400 mb-6 block">Made for Your Taste</span>
               {/* --- FIXED: userPrefs access --- */}
               <h3 className="text-5xl font-serif italic leading-tight">Smart Picks for You</h3>
            </div>
            <div className="md:col-span-7 h-[1px] bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-32 gap-x-12">
            {feedData.signature_styles.slice(0, 6).map((p, idx) => (
              <motion.div 
                key={p.id || idx}
                className={`group cursor-pointer ${idx % 2 !== 0 ? 'md:mt-24' : ''}`}
                onClick={() => handleProductClick(p)}
              >
                <div className="aspect-[2/3] overflow-hidden bg-white/5 mb-8 relative rounded-2xl">
                   <img src={getImgUrl(p)} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-90 group-hover:opacity-100" alt={p.name} />
                   <div className="absolute top-6 left-6 text-emerald-400 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-[8px] font-bold uppercase tracking-widest tracking-[0.5em]">№ 00{idx + 1}</span>
                   </div>
                </div>
                <div className="flex justify-between items-baseline px-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-1 text-white">{p.name}</h4>
                    <p className="text-[10px] text-emerald-500 uppercase tracking-widest">{p.category}</p>
                  </div>
                  <p className="text-lg italic font-serif text-emerald-400 font-bold">₹{p.finalPrice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <br />
 
      <Footer />
      <Chatbot />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #1a1a1a; }
      `}} />
    </div>
  );
};

const Loader = () => (
  <div className="h-screen bg-white flex flex-col items-center justify-center">
    <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-8 h-8 rounded-full border border-black mb-8" 
    />
    <p className="text-[9px] font-bold uppercase tracking-[1.2em] text-black animate-pulse">Establishing Connection</p>
  </div>
);

export default CustomerDashboard;