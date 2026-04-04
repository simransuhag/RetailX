import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// ─── Styles ───────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

    .dv-root *, .dv-root *::before, .dv-root *::after { box-sizing: border-box; }

    .dv-root {
      font-family: 'Outfit', sans-serif;
      background: #F5F3EE;
      min-height: 100vh;
      color: #1A1A2E;
    }

    .dv-playfair { font-family: 'Playfair Display', serif; }

    /* Shimmer skeleton */
    @keyframes dv-shimmer {
      0%   { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
    .dv-skeleton {
      background: linear-gradient(90deg, #E8E4DA 25%, #F0EDE5 50%, #E8E4DA 75%);
      background-size: 600px 100%;
      animation: dv-shimmer 1.5s infinite linear;
      border-radius: 12px;
    }

    /* Pulse */
    @keyframes dv-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.45; }
    }
    .dv-pulse { animation: dv-pulse 1.4s ease-in-out infinite; }

    /* Product card */
    .dv-card {
      background: #FFFFFF;
      border: 1px solid rgba(0,0,0,0.07);
      border-radius: 18px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1),
                  box-shadow 0.28s ease;
    }
    .dv-card:hover {
      transform: translateY(-7px) scale(1.015);
      box-shadow: 0 20px 50px rgba(0,0,0,0.13);
    }
    .dv-card-img {
      width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.5s ease;
    }
    .dv-card:hover .dv-card-img { transform: scale(1.08); }

    /* Ribbon */
    .dv-ribbon {
      position: absolute; top: 12px; left: 0;
      padding: 4px 14px 4px 10px;
      font-size: 9px; font-weight: 900; letter-spacing: 0.1em;
      text-transform: uppercase; color: #fff;
      clip-path: polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%);
      z-index: 2;
    }

    /* Shine effect */
    .dv-shine { position: relative; overflow: hidden; }
    .dv-shine::after {
      content: '';
      position: absolute; top: 0; left: -120%;
      width: 60%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
      transition: left 0.65s ease;
      pointer-events: none;
    }
    .dv-shine:hover::after { left: 160%; }

    /* Divider */
    .dv-hr {
      border: none; height: 1px; margin: 48px 0;
      background: linear-gradient(90deg, transparent, rgba(0,0,0,0.07), transparent);
    }

    /* View-all btn */
    .dv-btn-outline {
      background: transparent;
      border-radius: 999px;
      padding: 8px 22px;
      font-size: 12px; font-weight: 700;
      cursor: pointer; display: inline-flex; align-items: center; gap: 6px;
      transition: background 0.2s, transform 0.15s;
      font-family: 'Outfit', sans-serif;
    }
    .dv-btn-outline:hover { transform: translateX(3px); }

    /* Products grid */
    .dv-products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
      gap: 16px;
    }
  `}</style>
);

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENTS = [
  { color: "#D97706", light: "#FEF3C7", ribbon: "#B45309", border: "#FDE68A" },
  { color: "#DB2777", light: "#FCE7F3", ribbon: "#9D174D", border: "#FBCFE8" },
  { color: "#0891B2", light: "#CFFAFE", ribbon: "#0E7490", border: "#A5F3FC" },
  { color: "#7C3AED", light: "#EDE9FE", ribbon: "#5B21B6", border: "#DDD6FE" },
  { color: "#059669", light: "#D1FAE5", ribbon: "#065F46", border: "#A7F3D0" },
  { color: "#DC2626", light: "#FEE2E2", ribbon: "#991B1B", border: "#FECACA" },
];

const API = "http://127.0.0.1:5000";
const daysLeft = (exp) => Math.max(0, Math.ceil((new Date(exp) - new Date()) / 86400000));
const fmtDate  = (s)   => new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const inr      = (n)   => `₹${Number(n).toLocaleString("en-IN")}`;

// ─── Countdown Component ──────────────────────────────────────────────────────
const Countdown = ({ expiry, accent, light, border }) => {
  const calc = () => {
    const ms = new Date(expiry) - new Date();
    if (ms <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(ms / 86400000),
      h: Math.floor((ms % 86400000) / 3600000),
      m: Math.floor((ms % 3600000) / 60000),
      s: Math.floor((ms % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, [expiry]);
  const pad = (n) => String(n).padStart(2, "0");

  const Box = ({ v, lbl }) => (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: light, border: `1.5px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, fontWeight: 800, color: accent,
        fontVariantNumeric: "tabular-nums",
        boxShadow: `0 2px 8px ${accent}18`,
      }}>{pad(v)}</div>
      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#9CA3AF", marginTop: 3 }}>{lbl}</div>
    </div>
  );
  const Sep = () => (
    <span style={{ color: accent, opacity: 0.5, fontWeight: 800, fontSize: 15, lineHeight: "42px" }}>:</span>
  );

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}
      className={t.d === 0 ? "dv-pulse" : ""}>
      <Box v={t.d} lbl="Days" /><Sep />
      <Box v={t.h} lbl="Hrs"  /><Sep />
      <Box v={t.m} lbl="Min"  /><Sep />
      <Box v={t.s} lbl="Sec"  />
    </div>
  );
};

// ─── Product Card Component ───────────────────────────────────────────────────
// ─── Product Card Component (FIXED VERSION) ───────────────────────────────────
const ProductCard = ({ product, accent, ribbon }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    // Ye line product page par bhej degi, ID ke saath
    navigate(`/product/${product.id || product._id}`);
  };
  // 💡 Debugging: Console mein check karo ki backend kya bhej raha hai
  // Agar yahan 'finalPrice' 764 hai, toh backend ka logic abhi bhi purana hai.
  // Agar yahan 674 hai, toh screen par bhi sahi dikhega.
  console.log(`Checking ${product.name}: MRP=${product.price}, Sale=${product.finalPrice}, Disc=${product.discount}%`);

  return (
    <div className="dv-card dv-shine" onClick={handleClick}> 
      {/* 👆 onClick yahan add kiya hai pura card clickable banane ke liye */}
      
      <div className="dv-ribbon" style={{ background: ribbon }}>
        {product.discount}% OFF
      </div>
      
      {/* 2. Image Section */}
      <div style={{ height: 176, background: "#F9F7F3", overflow: "hidden", position: "relative" }}>
        {product.imageURL ? (
          <img className="dv-card-img" src={product.imageURL} alt={product.name} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
        )}
      </div>

      {/* 3. Content Section */}
      <div style={{ padding: "13px 15px 15px" }}>
        {/* Brand/Category Tag */}
        <div style={{ 
          fontSize: 9, 
          fontWeight: 800, 
          color: accent, 
          textTransform: "uppercase", 
          letterSpacing: "0.05em",
          marginBottom: 5 
        }}>
          {product.brand || product.category || "RetailX Exclusive"}
        </div>

        {/* Product Name */}
        <div style={{ 
          fontSize: 12.5, 
          fontWeight: 600, 
          color: "#374151", 
          marginBottom: 12,
          lineHeight: "1.4",
          height: "35px", // Text overflow handle karne ke liye
          overflow: "hidden"
        }}>
          {product.name}
        </div>

        {/* Price Section */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          {/* Naya Sasta Price (e.g. 674) */}
          <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>
            {inr(product.finalPrice)}
          </div>

          {/* Purana Bada Price (e.g. 899) */}
          <div style={{ 
            fontSize: 10, 
            color: "#9CA3AF", 
            textDecoration: "line-through",
            fontWeight: 500
          }}>
            {inr(product.price)}
          </div>
        </div>
      </div>

      {/* Aesthetic Bottom Bar */}
      <div style={{ 
        height: 3, 
        background: `linear-gradient(90deg, ${accent}, ${accent}30, transparent)` 
      }} />
    </div>
  );
};

// ─── Skeleton Component ───────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ borderRadius: 18, overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
    <div className="dv-skeleton" style={{ height: 176 }} />
    <div style={{ padding: "13px 15px 15px" }}>
      <div className="dv-skeleton" style={{ height: 9, width: "40%", marginBottom: 8 }} />
      <div className="dv-skeleton" style={{ height: 12, width: "92%", marginBottom: 5 }} />
      <div className="dv-skeleton" style={{ height: 16, width: "38%" }} />
    </div>
  </div>
);

const DealSection = ({ deal, index }) => {
  // 🚀 Backend ne pehle se hi deal.products bhej diye hain!
  const products = deal.products || []; 
  const { color: accent, light, ribbon, border } = ACCENTS[index % ACCENTS.length];

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.09, duration: 0.5 }}
    >
      <div style={{
        position: "relative", borderRadius: 22, padding: "26px 30px",
        marginBottom: 22, overflow: "hidden",
        background: `linear-gradient(135deg, ${light} 0%, #FFFFFF 70%)`,
        border: `1.5px solid ${border}`,
        boxShadow: `0 4px 24px ${accent}14`,
      }}>
        <div style={{ position: "relative", zIndex: 1,
          display: "flex", flexWrap: "wrap", gap: 20,
          alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{
                background: `${accent}18`, color: accent,
                border: `1.5px solid ${accent}30`,
                borderRadius: 999, padding: "3px 12px",
                fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase"
              }}>{deal.category}</span>
            </div>
            <h2 className="dv-playfair" style={{ fontSize: "30px", fontWeight: 900, color: "#111827" }}>
              {deal.title}
            </h2>
            <p style={{ color: "#6B7280", fontSize: 12.5 }}>
              {products.length > 0 ? `${products.length} exclusive items` : "No items found in this category"}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
            <div className="dv-playfair" style={{ fontSize: "48px", fontWeight: 900, color: accent }}>
              {deal.discount}% OFF
            </div>
            <Countdown expiry={deal.expiry} accent={accent} light={light} border={border} />
          </div>
        </div>
      </div>

      {/* Grid rendering from pre-fetched products */}
      {products.length > 0 ? (
        <div className="dv-products-grid">
          {products.map((p, i) => (
            <ProductCard 
                key={p.id || i} 
                product={p} 
                accent={accent} 
                ribbon={ribbon} 
                light={light} 
                discount={`${deal.discount}%`} 
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", background: "#FAFAF8", borderRadius: 16 }}>
          <p style={{ color: "#9CA3AF" }}>Fetching latest items...</p>
        </div>
      )}
      <hr className="dv-hr" />
    </motion.section>
  );
};

// ─── Hero Component ───────────────────────────────────────────────────────────
const Hero = ({ count, loading }) => (
  <div style={{ padding: "64px 24px", textAlign: "center", background: "#FFFDF7", borderBottom: "1px solid #EEE" }}>
    <h1 className="dv-playfair" style={{ fontSize: "64px", fontWeight: 900, marginBottom: 10 }}>
      Today's <span style={{ color: "#D97706" }}>Deals</span>
    </h1>
    <p style={{ color: "#9CA3AF" }}>Refreshed daily for you.</p>
  </div>
);

// ─── Root Component ───────────────────────────────────────────────────────────
const DealsView = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/public/deals`)
      .then(r => r.json())
      .then(d => { setDeals(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="dv-root">
      <Styles />
      <Hero count={deals.length} loading={loading} />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "52px 24px" }}>
        {loading ? <p>Loading deals...</p> : (
          <AnimatePresence>
            {deals.map((deal, i) => (
              <DealSection key={deal._id} deal={deal} index={i} />
            ))}
          </AnimatePresence>
        )}
        
      </div>
      
    </div>
  );
};

export default DealsView;