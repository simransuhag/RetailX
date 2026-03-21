import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../App';
import { Link } from 'react-router-dom';
import { 
  Trash2, ShoppingBag, ArrowRight, Minus, Plus, 
  ShieldCheck, Truck, ShoppingCart, Star 
} from 'lucide-react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Cart = () => {
  const { cart, setCart } = useContext(CartContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // --- 1. DYNAMIC RECOMMENDATIONS LOGIC (Preserved from your code) ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (cart.length > 0) {
        setLoadingRecs(true);
        const lastItemCategory = cart[cart.length - 1].category;
        try {
          const res = await fetch(`http://localhost:5000/api/products?category=${lastItemCategory}&limit=4`);
          const data = await res.json();
          // Jo items pehle se cart mein hain unhe suggestions mein mat dikhao
          const filtered = data.filter(p => !cart.some(item => (item.id || item._id) === p.id));
          setRecommendations(filtered);
        } catch (err) {
          console.error("Error fetching suggestions:", err);
        } finally {
          setLoadingRecs(false);
        }
      }
    };
    fetchSuggestions();
  }, [cart]);

  // --- 2. QUANTITY & REMOVE LOGIC ---
  const updateQty = (id, change) => {
    setCart(cart.map(item => 
      (item.id || item._id) === id 
        ? { ...item, quantity: Math.max(1, (item.quantity || 1) + change) } 
        : item
    ));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => (item.id || item._id) !== id));
  };

  const addFromRecs = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  // --- 3. CALCULATIONS ---
  const totalOriginalPrice = cart.reduce((acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)), 0);
  const totalDiscountedPrice = cart.reduce((acc, item) => acc + (Number(item.finalPrice || item.price) * (item.quantity || 1)), 0);
  const totalSavings = totalOriginalPrice - totalDiscountedPrice;

  // --- 4. EMPTY CART VIEW (Merged Design) ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="text-slate-400" size={32} />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Your bag is empty.</h2>
          <p className="text-slate-500 mt-2 text-sm max-w-[280px] mx-auto">Items added to your bag will be saved here while you shop.</p>
          <Link to="/" className="mt-8 border border-slate-900 text-slate-900 px-10 py-3 rounded-full text-sm font-semibold hover:bg-slate-900 hover:text-white transition-all duration-300">
            Discover Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // --- 5. MAIN CART VIEW ---
  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* LEFT: CART ITEMS LIST */}
          <div className="lg:w-[62%]">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-6">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">Bag</h1>
                <span className="text-slate-400 text-sm font-medium">{cart.length} Items</span>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.id || item._id} className="py-10 flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-48 h-56 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center p-8 transition-colors hover:bg-slate-100/50 cursor-pointer">
                    <img src={item.imageURL || item.image} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                  </div>

                  <div className="flex-1 flex flex-col py-1">
                    <div className="flex justify-between items-start mb-1">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight hover:text-emerald-600 transition-colors cursor-pointer">{item.name}</h3>
                            <p className="text-sm text-slate-500">{item.brand}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">₹{(item.finalPrice || item.price).toLocaleString()}</p>
                            {item.discount > 0 && (
                                <p className="text-xs text-emerald-600 font-bold mt-1">
                                    -₹{(Number(item.price) - Number(item.finalPrice)).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <div className="flex items-center border border-slate-200 rounded-full px-2 py-1 bg-white">
                        <button onClick={() => updateQty(item.id || item._id, -1)} className="w-8 h-8 flex items-center justify-center hover:text-emerald-600 transition-colors"><Minus size={14}/></button>
                        <span className="px-4 text-xs font-bold text-slate-900">{item.quantity || 1}</span>
                        <button onClick={() => updateQty(item.id || item._id, 1)} className="w-8 h-8 flex items-center justify-center hover:text-emerald-600 transition-colors"><Plus size={14}/></button>
                      </div>
                      
                      <div className="flex gap-6">
                        <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Move to Wishlist</button>
                        <button onClick={() => removeItem(item.id || item._id)} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1.5">
                           Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DYNAMIC RECOMMENDATIONS (Preserved Design from your code with her styling) */}
            {recommendations.length > 0 && (
              <div className="mt-16 pt-10 border-t border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-8 tracking-tight">You might also like</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {recommendations.map((prod) => (
                    <div key={prod.id} className="group">
                      <Link to={`/product/${prod.id}`}>
                        <div className="aspect-square w-full mb-4 bg-slate-50 rounded-2xl flex items-center justify-center p-6 transition-all group-hover:bg-slate-100">
                          <img src={prod.imageURL} className="max-h-full max-w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-110" alt={prod.name} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{prod.name}</h4>
                        <div className="mt-2 flex items-center justify-between">
                           <span className="font-bold text-sm text-slate-900">₹{prod.finalPrice}</span>
                           <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                             {prod.rating} <Star size={10} fill="currentColor" />
                           </span>
                        </div>
                      </Link>
                      <button 
                        onClick={() => addFromRecs(prod)}
                        className="mt-4 w-full py-2 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                      >
                        Add to Bag
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SUMMARY CARD */}
          <div className="lg:w-[38%] sticky top-32">
            <div className="bg-slate-50 rounded-3xl p-10 border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Order Summary</h2>

              <div className="space-y-5">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{totalOriginalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Shipping & Handling</span>
                  <span className="text-emerald-600 font-bold uppercase text-[10px] tracking-widest">Free</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium pb-5 border-b border-slate-200">
                    <span>Discount</span>
                    <span>-₹{totalSavings.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between pt-2">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{totalDiscountedPrice.toLocaleString()}</span>
                </div>

                <div className="pt-8">
                  <Link to="/checkout" state={{ total: totalDiscountedPrice }}>
                    <button className="w-full bg-slate-900 text-white py-5 rounded-full font-bold text-sm hover:bg-emerald-600 active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-emerald-200 flex items-center justify-center gap-2 uppercase tracking-widest group">
                      Checkout
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 gap-5 pt-10 mt-2">
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-emerald-200 transition-colors">
                            <Truck size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-none group-hover:text-slate-900 transition-colors">Free Express Shipping</p>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:border-emerald-200 transition-colors">
                            <ShieldCheck size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-none group-hover:text-slate-900 transition-colors">Certified Authentic Items</p>
                    </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;