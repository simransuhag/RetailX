import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2"; // Ensure this is imported
import {
  Star,
  Plus,
  Check,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw
} from "lucide-react";

import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { CartContext } from "../context/CartContext";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const { cartData, addToCart } = useContext(CartContext);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const isInCart = cartData?.items?.some(
    (item) => item.productId === id || item._id === id
  );

  /* ---------------- FETCH DATA ---------------- */
/* ---------------- FETCH DATA (Updated for Google Login) ---------------- */
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Direct localStorage se token uthao (State dependency hatao)
      const token = localStorage.getItem("userToken");
      
      const res = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await res.json();
      setCurrentProduct(data);
      window.scrollTo(0, 0);

      // 2. Wishlist Fetch Logic
      if (token) {
        try {
          const wishRes = await fetch(`http://localhost:5000/api/wishlist/`, {
            headers: { 
              // Bearer ke baad space check karo
              "Authorization": `Bearer ${token.replace(/"/g, '')}`, 
              "Content-Type": "application/json"
            }
          });
          
          if (wishRes.ok) {
            const wishlistItems = await wishRes.json();
            // Check karo ki items array hai ya nahi
            const items = Array.isArray(wishlistItems) ? wishlistItems : (wishlistItems.products || []);
            setIsFavorite(items.some(item => (item._id || item.id) === id));
          }
        } catch (err) {
          console.error("Wishlist fetch error:", err);
        }
      }

      // Similar Products logic (Same as before)
      const simRes = await fetch(`http://localhost:5000/api/products?category=${data.category}&limit=18`);
      const simData = await simRes.json();
      setSimilarProducts(simData.filter((p) => (p._id || p.id) !== id).slice(0, 12));
      setFrequentlyBought(simData.filter((p) => (p._id || p.id) !== id).slice(0, 3));

    } catch (err) {
      console.log("Main Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [id]); // ID change hone par fresh fetch

  /* ---------------- HELPERS ---------------- */
  
  // Professional Wishlist Toggle with Redirect
  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("userToken");
    
    if (!token) {
      Swal.fire({
        title: "Sign in Required",
        text: "Apne favorites ko save karne ke liye login karein!",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#000",
        cancelButtonColor: "#d33",
        confirmButtonText: "Login Now",
        cancelButtonText: "Later"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/auth");
        }
      });
      return;
    }

    setIsFavorite(!isFavorite);
    try {
      const res = await fetch(`http://localhost:5000/api/wishlist/toggle`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ productId: id }),
      });
      if (!res.ok) setIsFavorite(!isFavorite);
    } catch (err) {
      setIsFavorite(!isFavorite);
    }
  };

  // Professional Add to Cart with Auth Check
  const handleAddToCart = () => {
    const token = localStorage.getItem("userToken");
    
    if (isInCart) {
      return navigate("/cart");
    }

    if (!token) {
      Swal.fire({
        title: "Login Required",
        text: "Shopping shuru karne ke liye pehle login karein.",
        icon: "warning",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#000",
        showCancelButton: true,
      }).then((result) => {
        if (result.isConfirmed) navigate("/auth");
      });
      return;
    }

    addToCart({
      productId: currentProduct._id || currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.finalPrice,
      image: currentProduct.imageURL,
    });
  };

  const toggleAddon = (prod) => {
    const pid = prod._id || prod.id;
    setSelectedAddons((prev) =>
      prev.some((a) => (a._id || a.id) === pid)
        ? prev.filter((a) => (a._id || a.id) !== pid)
        : [...prev, prod]
    );
  };

  const handleBundleBuy = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      Swal.fire({ title: "Login Required", icon: "warning", confirmButtonColor: "#000" }).then(() => navigate("/auth"));
      return;
    }

    if (!isInCart && currentProduct) {
      await addToCart({
        productId: currentProduct._id || currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.finalPrice,
        image: currentProduct.imageURL,
      });
    }
    for (const addon of selectedAddons) {
      await addToCart({
        productId: addon._id || addon.id,
        name: addon.name,
        price: addon.finalPrice,
        image: addon.imageURL,
      });
    }
    navigate("/cart");
  };

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    scrollRef.current.scrollTo({
      left: dir === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth,
      behavior: "smooth",
    });
  };
  const handleDirectCheckout = () => {
  if (!currentProduct) return;

  // Checkout page par data bhej rahe hain
  navigate("/checkout", { 
    state: { 
      items: [{
        productId: currentProduct._id || currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.finalPrice,
        image: currentProduct.imageURL,
        quantity: 1 
      }],
      total: currentProduct.finalPrice // Checkout.jsx 'total' key expect kar raha hai
    } 
  });
};
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-white">
        <div className="w-12 h-12 border-[3px] border-gray-100 border-t-black rounded-full animate-spin"></div>
        <p className="text-black text-[10px] font-bold uppercase tracking-[0.4em]">Initializing Studio</p>
      </div>
    );

  if (!currentProduct) return <div className="h-screen flex items-center justify-center">Product Not Found</div>;

  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-32 pb-20">
        <nav className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-12">
          <Link to="/" className="hover:text-black transition">Studio</Link>
          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
          <span>{currentProduct?.category}</span>
          <span className="w-1 h-1 rounded-full bg-gray-200"></span>
          <span className="text-black">{currentProduct?.brand}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24 items-start">
          {/* IMAGE SECTION */}
          <div className="w-full lg:w-[55%] space-y-6">
            <div className="aspect-[4/5] bg-[#F7F7F7] rounded-sm flex items-center justify-center p-12 relative overflow-hidden group">
              <img
                src={currentProduct?.imageURL}
                alt={currentProduct?.name}
                className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
              <button
                onClick={handleWishlistToggle}
                className="absolute top-8 right-8 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all z-10"
              >
                <Heart
                  size={20}
                  strokeWidth={isFavorite ? 0 : 1.5}
                  fill={isFavorite ? "#ef4444" : "none"}
                  className={isFavorite ? "text-red-500" : "text-black"}
                />
              </button>
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="w-full lg:w-[45%] lg:sticky lg:top-32 space-y-8">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">{currentProduct?.brand}</p>
              <h1 className="text-4xl font-medium leading-[1.1] mt-2">{currentProduct?.name}</h1>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-1 text-sm font-bold">
                  <Star size={14} className="fill-black" />
                  <span>{currentProduct?.rating || 4.2}</span>
                  <span className="text-gray-400 ml-1">({currentProduct?.reviewsCount || 1200})</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">In Stock & Ready to Ship</p>
              </div>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-light text-black">
                ₹{currentProduct?.finalPrice?.toLocaleString()}
              </span>

              {currentProduct?.hasDeal ? (
                <>
                  <span className="text-gray-400 line-through text-lg">
                    ₹{currentProduct?.price?.toLocaleString()}
                  </span>
                  <motion.span 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded-sm font-black uppercase tracking-widest border border-red-100"
                  >
                    Flash Deal: {currentProduct?.discount}% OFF
                  </motion.span>
                </>
              ) : (
                currentProduct?.price > currentProduct?.finalPrice && (
                  <span className="text-gray-400 line-through text-lg">
                    ₹{currentProduct?.price?.toLocaleString()}
                  </span>
                )
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-3 pt-6">
              <button
                onClick={handleAddToCart}
                className={`w-full py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 ${
                  isInCart ? "bg-gray-100 text-black border border-gray-200" : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isInCart ? <><Check size={16} /> Added to Bag</> : <><ShoppingBag size={16} /> Add to Bag</>}
              </button>

              {/* ✅ Conditional Direct Checkout */}
              {localStorage.getItem("userToken") && (
                <button 
                  onClick={handleDirectCheckout}
                  className="w-full py-5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] border border-black hover:bg-black hover:text-white transition-all"
                >
                  Direct Checkout
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 py-8 border-y border-gray-100">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck size={18} strokeWidth={1} /><span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 italic">Free Global Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck size={18} strokeWidth={1} /><span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 italic">2 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw size={18} strokeWidth={1} /><span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 italic">30 Day Returns</span>
              </div>
            </div>

            {/* BUNDLE SYSTEM */}
            {frequentlyBought.length > 0 && (
              <div className="pt-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Complete the Set</h3>
                <div className="space-y-3">
                  {frequentlyBought.map((item) => {
                    const sel = selectedAddons.some((a) => (a._id || a.id) === (item._id || item.id));
                    return (
                      <div key={item._id || item.id} onClick={() => toggleAddon(item)}
                        className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${sel ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <div className="w-12 h-12 bg-white rounded-lg p-2 border border-gray-100">
                          <img src={item.imageURL} alt="" className="w-full object-contain" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-[10px] font-bold uppercase truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-400">₹{item.finalPrice?.toLocaleString()}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${sel ? "bg-black border-black text-white" : "border-gray-200 text-transparent"}`}>
                          <Check size={10} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedAddons.length > 0 && (
                  <button onClick={handleBundleBuy} className="mt-4 w-full py-3 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                    Add Ensemble (₹{((currentProduct.finalPrice || 0) + selectedAddons.reduce((acc, curr) => acc + (curr.finalPrice || 0), 0)).toLocaleString()})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="mt-40 border-t border-gray-100 pt-20">
          <div className="flex gap-12 mb-12 border-b">
            {["description", "specifications", "reviews"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] relative ${activeTab === tab ? "text-black" : "text-gray-400"}`}>
                {tab}
                {activeTab === tab && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />}
              </button>
            ))}
          </div>
          <div className="max-w-4xl min-h-[200px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "description" && <p className="text-gray-600 text-sm leading-relaxed">{currentProduct.description}</p>}
                {activeTab === "specifications" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20">
                    {currentProduct?.specs && Object.entries(currentProduct.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b py-4">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{key}</span>
                        <span className="text-sm font-medium">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === "reviews" && <p className="text-sm text-gray-500">No reviews yet for this masterpiece.</p>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-40">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-[10px] text-gray-400 uppercase italic tracking-widest">Curated Selection</p>
              <h3 className="text-3xl font-medium tracking-tight">You Might Also Like</h3>
            </div>
            <div className="flex gap-4">
              <button onClick={() => scroll("left")} className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition-all"><ChevronLeft size={20} /></button>
              <button onClick={() => scroll("right")} className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>
          <div ref={scrollRef} className="flex gap-8 overflow-x-auto no-scrollbar pb-4 scroll-smooth">
            {similarProducts.map((p) => (
              <Link key={p._id || p.id} to={`/product/${p._id || p.id}`} className="min-w-[280px] group">
                <div className="aspect-[4/5] bg-[#F7F7F7] p-6 rounded-sm flex items-center justify-center overflow-hidden relative">
                  <img src={p.imageURL} alt="" className="max-h-full max-w-full object-contain group-hover:scale-105 transition-all duration-500" />
                </div>
                <p className="text-[9px] text-gray-400 uppercase mt-3 font-bold tracking-widest">{p.brand}</p>
                <p className="text-sm font-medium truncate mt-1 group-hover:underline">{p.name}</p>
                <p className="text-sm text-gray-600 mt-1">₹{p.finalPrice?.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default ProductPage;