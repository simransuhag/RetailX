import React, { useContext, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom"; // Link already imported
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import BudgetTracker from "../Components/BudgetTracker";
import { Minus, Plus, Trash2, ArrowRight, Edit3, AlertCircle, Tag } from "lucide-react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { cartData, removeFromCart, updateQuantity, fetchCart, updateBudget } = useContext(CartContext);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Calculations
  const currentCartTotal = cartData?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const realTimeSpent = (cartData?.spent || 0) + currentCartTotal;
  const discount = currentCartTotal * 0.20; 
  const deliveryFee = 15;
  const finalTotal = currentCartTotal - discount + deliveryFee;

  const handleEditBudget = async () => {
    const { value: newBudget } = await Swal.fire({
      title: "Edit Monthly Budget",
      input: "number",
      inputValue: cartData?.monthlyBudget || 2000,
      showCancelButton: true,
      confirmButtonColor: "#000",
    });
    if (newBudget) updateBudget(newBudget);
  };

  if (!cartData || !cartData.items) return null;

  // --- EMPTY CART VIEW ---
  if (cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 mt-20">
          <div className="mb-10 w-full max-w-md border rounded-[20px] p-6">
            <p className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-widest">Monthly Budget Status</p>
            <BudgetTracker spent={cartData.spent || 0} limit={cartData.monthlyBudget} />
          </div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Your Bag Is Empty</h1>
          <Link to="/customer-dashboard" className="bg-black text-white px-10 py-4 rounded-full mt-8 flex items-center gap-2 font-medium hover:scale-105 transition-transform">
            Browse Products <ArrowRight size={20} />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 pt-28 pb-20">
        <h1 className="text-5xl font-black uppercase italic mb-10 tracking-tighter">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: ITEM LIST */}
          <div className="lg:col-span-7 border rounded-[20px] p-6 space-y-6">
            <AnimatePresence>
              {cartData.items.map((item, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={item.productId}
                >
                  <div className="flex gap-4">
                    {/* PRODUCT IMAGE - Wrapped with Link */}
                    <Link 
                      to={`/product/${item.productId}`} 
                      className="w-28 h-28 bg-[#F0EEED] rounded-xl flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <img src={item.imageURL || item.image} className="mix-blend-multiply object-contain w-20" alt={item.name} />
                    </Link>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          {/* PRODUCT NAME - Wrapped with Link */}
                          <Link to={`/product/${item.productId}`} className="hover:underline decoration-2">
                            <h3 className="font-bold text-xl">{item.name}</h3>
                          </Link>
                          
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:scale-110 transition-transform">
                          <Trash2 size={22} fill="currentColor" />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <p className="text-2xl font-bold">₹{item.price.toLocaleString()}</p>
                        <div className="flex items-center bg-[#F0F0F0] rounded-full px-4 py-2 gap-5">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="hover:text-gray-500"><Minus size={18} /></button>
                          <span className="font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="hover:text-gray-500"><Plus size={18} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index !== cartData.items.length - 1 && <hr className="mt-6 border-gray-100" />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE (Budget, Summary, etc.) stays exactly the same */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="border rounded-[20px] p-6 bg-white shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Monthly Budget</p>
                <button onClick={handleEditBudget} className="text-gray-400 hover:text-black transition-colors">
                  <Edit3 size={18} />
                </button>
              </div>
              <BudgetTracker 
                spent={cartData.spent}
                limit={cartData.monthlyBudget}
                cartTotal={currentCartTotal}
              />
            </div>

            <div className="border rounded-[20px] p-6 bg-white shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-gray-500 text-lg">
                  <span>Subtotal</span>
                  <span className="text-black font-bold">₹{currentCartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-500">Discount (-20%)</span>
                  <span className="text-red-500 font-bold">-₹{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-lg">
                  <span>Delivery Fee</span>
                  <span className="text-black font-bold">₹{deliveryFee}</span>
                </div>
                
                <hr className="border-gray-100 my-4" />
                
                <div className="flex justify-between text-black text-xl font-bold">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link to="/checkout" state={{ total: finalTotal }} className="block mt-6">
                <button className="w-full bg-black text-white py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:gap-5 transition-all">
                  Go to Checkout <ArrowRight size={20} />
                </button>
              </Link>

              {cartData.monthlyBudget && realTimeSpent > cartData.monthlyBudget && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex gap-3 items-center text-sm border border-red-100">
                  <AlertCircle size={20} />
                  <span className="font-medium">Warning: This order exceeds your monthly budget!</span>
                </div>
              )}
            </div>
          </aside>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;