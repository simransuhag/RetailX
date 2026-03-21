import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import PaymentButton from "../Components/PaymentButton";
import {
  LockClosedIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  TruckIcon,
  ChevronLeftIcon
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

const Checkout = () => {
  const location = useLocation();
  const total = location.state?.total || 0;
  const items = location.state?.items || [];

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const res = await fetch("http://127.0.0.1:5000/api/user/dashboard-data", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const result = await res.json();

        if (res.ok && result.user) {
          if (result.user.addresses?.length > 0) {
            const latest = result.user.addresses[result.user.addresses.length - 1];
            setFormData({
              email: result.user.email || "",
              phone: result.user.contact?.phone || "",
              fullName: latest.fullName || "",
              address: latest.address || "",
              city: latest.city || "",
              zipCode: latest.zipCode || "",
            });
            setIsEditing(false); 
          } else {
            setFormData(prev => ({ ...prev, email: result.user.email }));
          }
        }
      } catch (err) {
        console.error("Session fetch failed", err);
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-2 border-gray-100 border-t-black rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Verifying Session</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Minimalistic Header */}
      <header className="border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors">
          <ChevronLeftIcon className="w-4 h-4" /> BACK
        </button>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* LEFT: Checkout Content */}
          <div className="flex-1 space-y-16">
            
            {/* Step 1: Shipping */}
            <section>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2">Shipping Details</h2>
                  <p className="text-gray-500 text-sm">Where should we deliver your order?</p>
                </div>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="text-xs font-black border-b-2 border-black pb-1 hover:text-gray-500 transition-colors">
                    CHANGE
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="bg-[#f9f9fb] rounded-3xl p-8 flex justify-between items-center group cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsEditing(true)}>
                  <div className="space-y-1">
                    <p className="font-bold text-lg">{formData.fullName}</p>
                    <p className="text-gray-500 text-sm">{formData.address}, {formData.city}</p>
                    <p className="text-gray-500 text-sm">{formData.zipCode}</p>
                    <p className="pt-4 text-xs font-medium text-gray-400">{formData.email} • {formData.phone}</p>
                  </div>
                  <CheckBadgeIcon className="w-8 h-8 text-black" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 animate-in fade-in duration-700">
                  <InputGroup label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                  <InputGroup label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                  <div className="md:col-span-2">
                    <InputGroup label="Street Address" name="address" value={formData.address} onChange={handleChange} />
                  </div>
                  <InputGroup label="City" name="city" value={formData.city} onChange={handleChange} />
                  <InputGroup label="PIN Code" name="zipCode" value={formData.zipCode} onChange={handleChange} />
                  
                  <div className="md:col-span-2 pt-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="w-full bg-black text-white py-5 rounded-full font-bold text-sm hover:bg-zinc-800 transition-all active:scale-[0.98]"
                    >
                      Confirm Shipping Information
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Step 2: Payment Method (Visual Only) */}
            <section className={`transition-opacity duration-500 ${isEditing ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
               <h2 className="text-3xl font-bold tracking-tight mb-8">Payment Method</h2>
               <div className="border border-black rounded-3xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="bg-gray-100 p-3 rounded-xl">
                        <ShieldCheckIcon className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold">Stripe Secure Checkout</p>
                        <p className="text-xs text-gray-500">Pay via Credit Card, Apple Pay, or UPI</p>
                     </div>
                  </div>
                  <div className="flex gap-2 opacity-60 grayscale scale-75">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                  </div>
               </div>
            </section>
          </div>

          {/* RIGHT: Order Summary Sidebar */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-[#f9f9fb] rounded-[2.5rem] p-10 space-y-10 sticky top-32">
              <div>
                <h3 className="text-xl font-bold mb-8">Your Order</h3>
                <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">ITEM {i + 1}</p>
                        <p className="text-sm font-bold leading-tight">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm font-bold">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600 font-bold uppercase tracking-tighter text-xs italic">Complimentary</span>
                </div>
                <div className="flex justify-between items-end pt-6 border-t border-gray-200">
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-4xl font-black tracking-tighter">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4">
                <PaymentButton total={total} items={items} address={formData} />
                <p className="text-[10px] text-center text-gray-400 mt-6 leading-relaxed">
                  By completing your purchase, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Refund Policy</span>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

/* Component: Refined Input Group */
const InputGroup = ({ label, ...props }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">
      {label}
    </label>
    <input 
      {...props}
      className="bg-white border-b border-gray-200 px-1 py-4 text-sm font-medium focus:border-black focus:outline-none transition-all placeholder:text-gray-200"
      placeholder={`Enter ${label.toLowerCase()}...`}
    />
  </div>
);

export default Checkout;