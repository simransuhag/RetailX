import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../App';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Star, ShoppingCart } from 'lucide-react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const Cart = () => {
  const { cart, setCart } = useContext(CartContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // --- 1. DYNAMIC RECOMMENDATIONS LOGIC ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (cart.length > 0) {
        setLoadingRecs(true);
        // Cart ke sabse latest item ki category lete hain
        const lastItemCategory = cart[cart.length - 1].category;
        try {
          // Humne backend mein jo 'limit=4' banaya tha wahi use kar rhe hain
          const res = await fetch(`http://localhost:5000/api/products?category=${lastItemCategory}&limit=4`);
          const data = await res.json();
          // Filter: Jo items pehle se cart mein hain unhe suggestions mein mat dikhao
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

  // Recommendations se item add karne ke liye function
  const addFromRecs = (product) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  // --- 3. CALCULATIONS ---
  const totalOriginalPrice = cart.reduce((acc, item) => acc + (Number(item.price || 0) * (item.quantity || 1)), 0);
  const totalDiscountedPrice = cart.reduce((acc, item) => acc + (Number(item.finalPrice || item.price) * (item.quantity || 1)), 0);
  const totalSavings = totalOriginalPrice - totalDiscountedPrice;

  // --- 4. EMPTY CART VIEW ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center mt-10">
          <div className="relative">
             <div className="w-64 h-64 bg-blue-50 rounded-full flex items-center justify-center">
                <ShoppingCart size={120} className="text-blue-200" />
             </div>
             <div className="absolute -bottom-2 -right-2 bg-white p-4 rounded-full shadow-lg">
                <ShoppingBag size={40} className="text-blue-600" />
             </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mt-8">Your Cart is Empty!</h2>
          <p className="text-gray-500 mt-3 max-w-md leading-relaxed">
            Looks like you haven't added anything to your cart yet. 
            Don't miss out on our great deals!
          </p>
          <Link 
            to="/" 
            className="mt-8 bg-blue-600 text-white px-12 py-3.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center gap-2 group"
          >
            Explore Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // --- 5. MAIN CART VIEW ---
  return (
    <div className="bg-[#f1f3f6] min-h-screen font-sans pb-20 pt-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-5">
          
          {/* LEFT: CART ITEMS */}
          <div className="lg:w-[70%] space-y-4">
            <div className="bg-white shadow-sm border border-gray-200 rounded-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-gray-800">My Cart ({cart.length})</h2>
              </div>

              {cart.map((item) => (
                <div key={item.id || item._id} className="p-5 border-b flex flex-col sm:flex-row gap-6 hover:bg-gray-50 transition">
                  <div className="w-28 h-28 flex-shrink-0 mx-auto sm:mx-0">
                    <img src={item.imageURL || item.image} alt={item.name} className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-1 uppercase font-bold tracking-wide">Brand: {item.brand}</p>
                    
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xl font-bold text-gray-900">₹{(item.finalPrice || item.price).toLocaleString()}</span>
                      <span className="text-gray-400 line-through text-xs">₹{Number(item.price).toLocaleString()}</span>
                      <span className="text-green-600 text-xs font-bold">{item.discount}% Off</span>
                    </div>

                    <div className="flex items-center gap-8 mt-6">
                      <div className="flex items-center border rounded-sm overflow-hidden shadow-sm h-8">
                        <button onClick={() => updateQty(item.id || item._id, -1)} className="px-3 bg-gray-50 hover:bg-gray-200 transition font-bold">-</button>
                        <span className="px-6 text-sm font-bold bg-white flex items-center">{item.quantity || 1}</span>
                        <button onClick={() => updateQty(item.id || item._id, 1)} className="px-3 bg-gray-50 hover:bg-gray-200 transition font-bold">+</button>
                      </div>
                      
                      <button onClick={() => removeItem(item.id || item._id)} className="text-gray-900 font-bold hover:text-red-600 text-xs transition-colors uppercase tracking-wider">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DYNAMIC RECOMMENDATIONS */}
            {recommendations.length > 0 && (
              <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 uppercase tracking-tight">You might be interested in</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {recommendations.map((prod) => (
                    <div key={prod.id} className="group cursor-pointer">
                      <Link to={`/product/${prod.id}`}>
                        <div className="h-32 w-full mb-3 flex items-center justify-center">
                          <img src={prod.imageURL} className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300" alt={prod.name} />
                        </div>
                        <h4 className="text-[11px] font-medium text-gray-700 h-8 overflow-hidden leading-tight line-clamp-2">{prod.name}</h4>
                        <div className="mt-2 flex items-center justify-between">
                           <span className="font-bold text-sm text-gray-900">₹{prod.finalPrice}</span>
                           <span className="text-[9px] bg-green-700 text-white px-1 rounded flex items-center">
                              {prod.rating}★
                           </span>
                        </div>
                      </Link>
                      <button 
                        onClick={() => addFromRecs(prod)}
                        className="mt-3 w-full border border-blue-600 text-blue-600 py-1 rounded-sm font-bold text-[10px] hover:bg-blue-600 hover:text-white transition uppercase"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: PRICE SUMMARY */}
          <div className="lg:w-[30%]">
            <div className="bg-white shadow-sm border border-gray-200 rounded-sm sticky top-24">
              <h3 className="p-4 border-b text-gray-500 font-bold uppercase text-xs tracking-widest">Price Details</h3>
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Price ({cart.length} items)</span>
                  <span>₹{totalOriginalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="text-green-600">-₹{totalSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-dashed pb-4">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total Amount</span>
                  <span>₹{totalDiscountedPrice.toLocaleString()}</span>
                </div>
                
                <p className="text-green-600 text-xs font-bold py-1 border-t border-b border-gray-50">
                   You will save ₹{totalSavings.toLocaleString()} on this order
                </p>
                
                <button className="w-full bg-[#fb641b] text-white py-3 rounded-sm font-bold text-base shadow hover:bg-[#e65a16] transition uppercase tracking-wide">
                  Place Order
                </button>
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