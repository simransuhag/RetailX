import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Plus, Check, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { CartContext } from "../App";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart } = useContext(CartContext);
  
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [activeTab, setActiveTab] = useState('description');

  // ✅ WISHLIST STATES
  const [isFavorite, setIsFavorite] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isInCart = cart.some(item => (item.id === id || item._id === id));

  const isAuthenticated = () => {
    return !!localStorage.getItem("userToken");
  };

  // ✅ FETCH PRODUCT & WISHLIST STATUS
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        setCurrentProduct(data);
        window.scrollTo(0, 0);

        // Fetch Addons
        const resAddons = await fetch(`http://localhost:5000/api/products?category=accessories&limit=5`);
        const addonsData = await resAddons.json();
        setFrequentlyBought(Array.isArray(addonsData) ? addonsData.filter(p => p._id !== id && p.id !== id).slice(0, 3) : []);

        // Fetch Similar
        const resSimilar = await fetch(`http://localhost:5000/api/products?category=${data.category}&limit=10`);
        const similarData = await resSimilar.json();
        setSimilarProducts(Array.isArray(similarData) ? similarData.filter(p => p._id !== id && p.id !== id) : []);

        // ✅ Check Wishlist Status
        const token = localStorage.getItem("userToken");
        if (token) {
          const resWish = await fetch("http://localhost:5000/api/wishlist/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const wishData = await resWish.json();
          const isInWishlist = wishData.some(p => (p._id === id || p.id === id));
          setIsFavorite(isInWishlist);
        }

      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  // ✅ TOGGLE WISHLIST FUNCTION
  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      localStorage.setItem("postAuthRedirect", `/product/${id}`);
      navigate("/auth");
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/wishlist/toggle", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: id })
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsFavorite(data.status === "added");
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const toggleAddon = (prod) => {
    if (selectedAddons.find(a => (a.id === prod.id || a._id === prod._id))) {
      setSelectedAddons(selectedAddons.filter(a => (a.id !== prod.id && a._id !== prod._id)));
    } else {
      setSelectedAddons([...selectedAddons, prod]);
    }
  };

  const handleFullPurchase = () => {
    if (!isAuthenticated()) {
      localStorage.setItem("postAuthRedirect", `/product/${id}`);
      navigate("/auth");
      return;
    }
    if (!isInCart && currentProduct) addToCart(currentProduct);
    selectedAddons.forEach(addon => addToCart(addon));
    navigate("/cart");
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-white">
      <div className="w-12 h-12 border-[3px] border-gray-100 border-t-black rounded-full animate-spin"></div>
      <p className="text-black text-[10px] font-bold uppercase tracking-[0.4em]">Initializing Studio</p>
    </div>
  );

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-12">
          <Link to="/" className="hover:text-black transition">Studio</Link>
          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
          <span>{currentProduct?.category}</span>
          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
          <span className="text-black">{currentProduct?.brand}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">
          
          {/* LEFT: GALLERY */}
          <div className="w-full lg:w-[55%] space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-[4/5] bg-[#F7F7F7] rounded-sm flex items-center justify-center p-12 relative overflow-hidden group"
            >
              <img 
                src={currentProduct?.imageURL || currentProduct?.image} 
                alt={currentProduct?.name} 
                className="max-h-full max-w-full object-contain transition-transform duration-1000 group-hover:scale-105" 
              />
              
              {/* ✅ UPDATED WISHLIST BUTTON */}
              <button 
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="absolute top-8 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all duration-300 z-10"
              >
                <Heart 
                  size={20} 
                  strokeWidth={isFavorite ? 0 : 1.5} 
                  fill={isFavorite ? "#ef4444" : "none"} 
                  className={`${isFavorite ? "text-red-500" : "text-black"} ${wishlistLoading ? "opacity-30" : "opacity-100"}`}
                />
              </button>
            </motion.div>
            
            <div className="grid grid-cols-3 gap-6">
                {[1,2,3].map((i) => (
                    <div key={i} className="aspect-square bg-[#F7F7F7] rounded-sm opacity-50 hover:opacity-100 cursor-pointer transition-opacity"></div>
                ))}
            </div>
          </div>

          {/* RIGHT: CHECKOUT */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-32">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">{currentProduct?.brand}</p>
                <h1 className="text-4xl xl:text-5xl font-medium text-black leading-[1.1] tracking-tight">
                    {currentProduct?.name}
                </h1>
                
                <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-1 text-sm font-bold">
                        <Star size={14} className="fill-black" />
                        <span>{currentProduct?.rating}</span>
                        <span className="text-gray-300 font-normal ml-1">({currentProduct?.reviewsCount})</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">In Stock & Ready to ship</p>
                </div>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-light text-black">
                    ₹{currentProduct?.finalPrice?.toLocaleString()}
                </span>
                {currentProduct?.price > currentProduct?.finalPrice && (
                    <span className="text-gray-400 line-through text-lg">₹{currentProduct?.price?.toLocaleString()}</span>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-6">
                <button onClick={() => {
                  if (!isAuthenticated()) {
                    localStorage.setItem("postAuthRedirect", `/product/${id}`);
                    navigate("/auth");
                    return;
                  }
                  if (isInCart) navigate("/cart");
                  else addToCart(currentProduct);
                }}
                  className={`w-full py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 ${isInCart ? 'bg-gray-100 text-black border border-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                >
                    {isInCart ? <><Check size={16} /> Added to Bag</> : <><ShoppingBag size={16} /> Add to Bag</>}
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated()) {
                      localStorage.setItem("postAuthRedirect", `/product/${id}`);
                      navigate("/auth");
                      return;
                    }
                    navigate("/checkout");
                  }}
                  className="w-full py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] border border-black hover:bg-black hover:text-white transition-all"
                >
                  Direct Checkout
                </button>
              </div>

              {/* TRUST BADGES */}
              <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-100">
                <div className="flex flex-col items-center text-center gap-2">
                    <Truck size={18} strokeWidth={1} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 italic">Free Global Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <ShieldCheck size={18} strokeWidth={1} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 italic">2 Year Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <RotateCcw size={18} strokeWidth={1} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 italic">30 Day Returns</span>
                </div>
              </div>

              {/* BUNDLE SYSTEM */}
              {frequentlyBought.length > 0 && (
                <div className="pt-4">
                    <div className="flex justify-between items-end mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Complete the Set</h3>
                        <p className="text-[10px] font-bold text-gray-400">Save 10% on bundles</p>
                    </div>
                    <div className="space-y-3">
                        {frequentlyBought.map((item) => {
                            const isSelected = selectedAddons.find(a => (a.id === item.id || a._id === item._id));
                            return (
                                <div 
                                    key={item._id || item.id}
                                    onClick={() => toggleAddon(item)}
                                    className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg p-2 border border-gray-100">
                                        <img src={item?.imageURL || item?.image} className="w-full h-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[10px] font-bold text-black uppercase truncate max-w-[150px]">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">₹{item.finalPrice?.toLocaleString()}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${isSelected ? 'bg-black border-black text-white' : 'border-gray-200 text-transparent'}`}>
                                        <Check size={10} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {selectedAddons.length > 0 && (
                        <button onClick={handleFullPurchase} className="mt-4 w-full py-3 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition-all">
                            Add Ensemble (₹{((currentProduct?.finalPrice || 0) + selectedAddons.reduce((acc, curr) => acc + (curr?.finalPrice || 0), 0)).toLocaleString()})
                        </button>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TABS SECTION */}
        <div className="mt-40 border-t border-gray-100 pt-20">
            <div className="flex gap-12 mb-16 overflow-x-auto no-scrollbar border-b border-gray-50">
                {['description', 'specifications', 'reviews'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-6 text-[11px] font-black uppercase tracking-[0.3em] relative transition-colors ${activeTab === tab ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
                    >
                        {tab}
                        {activeTab === tab && <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
                    </button>
                ))}
            </div>

            <div className="max-w-4xl">
                <AnimatePresence mode="wait">
                    {activeTab === 'description' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 border border-gray-100">
                        <div className="bg-white p-10 space-y-6">
                          <div className="flex justify-between items-start">
                            <span className="text-4xl font-light text-gray-200">01</span>
                            <div className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest">Design</div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Masterful Engineering</h4>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                              {currentProduct?.description?.split('.')[0] || "Precision crafted for ultimate performance."}.
                            </p>
                          </div>
                        </div>
                        <div className="bg-white p-10 space-y-6">
                          <div className="flex justify-between items-start">
                            <span className="text-4xl font-light text-gray-200">02</span>
                            <div className="px-3 py-1 bg-gray-100 text-black text-[9px] font-black uppercase tracking-widest">Build</div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Material Excellence</h4>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">Developed using architectural-grade materials ensuring durability.</p>
                          </div>
                        </div>
                        <div className="bg-white p-10 space-y-6">
                          <div className="flex justify-between items-start">
                            <span className="text-4xl font-light text-gray-200">03</span>
                            <div className="px-3 py-1 bg-gray-100 text-black text-[9px] font-black uppercase tracking-widest">Utility</div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Intuitive Interface</h4>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">Features ergonomic touchpoints and a streamlined workflow.</p>
                          </div>
                        </div>
                        <div className="bg-white p-10 space-y-6">
                          <div className="flex justify-between items-start">
                            <span className="text-4xl font-light text-gray-200">04</span>
                            <div className="px-3 py-1 bg-gray-100 text-black text-[9px] font-black uppercase tracking-widest">Commitment</div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em]">Studio Standard</h4>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">Every unit undergoes a 12-point quality inspection.</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'specifications' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4">
                            {currentProduct?.specs && Object.entries(currentProduct.specs).map(([k, v]) => (
                                <div key={k} className="flex justify-between py-4 border-b border-gray-50">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{k}</span>
                                    <span className="text-sm font-medium text-black">{v}</span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-40">
            <div className="flex justify-between items-end mb-12">
                <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Curated Selection</p>
                    <h3 className="text-3xl font-medium text-black tracking-tight">You might also appreciate</h3>
                </div>
                <div className="flex gap-4">
                    <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {similarProducts.map(p => (
                <Link key={p._id || p.id} to={`/product/${p._id || p.id}`} className="group space-y-4">
                  <div className="aspect-[4/5] bg-[#F7F7F7] rounded-sm flex items-center justify-center p-8 overflow-hidden relative">
                    <img src={p?.imageURL || p?.image} className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                            <Plus size={18} />
                        </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{p?.brand}</p>
                    <p className="text-sm font-medium text-black truncate mt-1 group-hover:underline">{p?.name}</p>
                    <p className="text-sm font-light text-gray-600 mt-1">₹{p?.finalPrice?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      </main>
      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default ProductPage;