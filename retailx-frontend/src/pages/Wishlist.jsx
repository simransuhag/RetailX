import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Heart, ShoppingBag, ArrowUpRight, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { CartContext } from "../context/CartContext";


const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ Modal State
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext); 
  const token = localStorage.getItem("userToken");

  const showToast = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  useEffect(() => {
    const fetchWishlist = async (authToken) => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/wishlist/", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setWishlist(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("userToken");
          navigate("/auth");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!token) {
      localStorage.setItem("postAuthRedirect", "/wishlist");
      navigate("/auth");
    } else {
      fetchWishlist(token);
    }
  }, [token, navigate]);

  const addToBagHandler = (product) => {
    addToCart({ ...product, id: product._id || product.id, quantity: 1 });
    showToast(`${product.name} added to bag`);
  };

  const removeFromWishlist = async (productId) => {
    if (!token) return;
    try {
      await axios.post("http://localhost:5000/api/wishlist/toggle", { productId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist((prev) => prev.filter((item) => (item._id || item.id) !== productId));
      showToast("Item removed");
    } catch (err) { console.error(err); }
  };

  // ✅ Final Clear Logic
  const handleClearConfirm = async () => {
    try {
      await axios.delete("http://localhost:5000/api/wishlist/clear", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist([]);
      setIsModalOpen(false);
      showToast("Wishlist cleared");
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#FCFCFB]">
        <div className="w-12 h-12 border-[3px] border-gray-100 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFCFB] text-[#1A1A1A] font-sans">
      <Navbar />

      {/* ✅ CUSTOM LUXURY MODAL PROMPT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white max-w-md w-full p-10 rounded-sm shadow-2xl relative z-[210] text-center"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors">
                <X size={20} strokeWidth={1} />
              </button>
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-500" size={28} strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="text-2xl font-serif italic mb-3">Clear Wishlist?</h2>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                This will permanently remove all items from your saved collection. This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleClearConfirm}
                  className="w-full py-4 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-red-600 transition-colors duration-500"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 bg-transparent text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-black transition-colors"
                >
                  Keep My Items
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✅ TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-zinc-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-6 py-20 md:py-32">
        <header className="mb-16 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-[10px] font-bold uppercase tracking-[0.6em] text-emerald-600 block mb-4">Saved Masterpieces</span>
            <h1 className="text-5xl md:text-7xl font-serif italic mb-6">Wishlist</h1>
            <div className="w-16 h-px bg-zinc-200 mx-auto" />
          </motion.div>

          {wishlist.length > 0 && (
            <div className="flex justify-end mb-8 px-2">
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setIsModalOpen(true)} // ✅ Opens Custom Modal
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-red-500 transition-all duration-300 group"
              >
                <Trash2 size={14} />
                <span>Clear Selection ({wishlist.length})</span>
              </motion.button>
            </div>
          )}
        </header>

        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="mb-8 flex justify-center">
              <div className="p-10 rounded-full bg-zinc-50 border border-zinc-100"><Heart size={40} className="text-zinc-200" strokeWidth={1} /></div>
            </div>
            <p className="font-serif italic text-2xl text-zinc-400 mb-10">Your collection is empty.</p>
            <button onClick={() => navigate("/customer-dashboard")} className="px-12 py-5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-emerald-600 transition-all duration-500">
              Start Discovering
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
            <AnimatePresence mode="popLayout">
              {wishlist.map((product) => (
                <motion.div key={product._id || product.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group relative">
                  <div className="aspect-[3/4] overflow-hidden bg-[#F5F5F3] relative rounded-sm shadow-sm">
                    <Link to={`/product/${product._id || product.id}`} className="block w-full h-full cursor-pointer">
                      <img src={product.imageURL || product.image} className="w-full h-full object-contain transition-transform duration-[2s] group-hover:scale-105" alt={product.name} />
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                         <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30"><ArrowUpRight size={20} className="text-white" /></div>
                      </div>
                    </Link>
                    <button onClick={() => removeFromWishlist(product._id || product.id)} className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-full shadow-xl opacity-0 translate-y-[-10px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-red-50 z-30">
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                    <button onClick={() => addToBagHandler(product)} className="absolute bottom-0 left-0 right-0 py-5 bg-black text-white text-[9px] font-bold uppercase tracking-[0.4em] translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex items-center justify-center gap-2 hover:bg-zinc-800 z-30">
                      <ShoppingBag size={14} /> Add to Bag
                    </button>
                  </div>
                  <div className="mt-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{product.category}</p>
                        <Link to={`/product/${product._id || product.id}`}><h3 className="text-sm font-medium uppercase truncate hover:text-emerald-600 transition-colors">{product.name}</h3></Link>
                      </div>
                      <p className="text-xl font-serif italic">₹{product.finalPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;