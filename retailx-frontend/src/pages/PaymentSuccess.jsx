import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import { CartContext } from "../context/CartContext";
import confetti from "canvas-confetti";
import axios from "axios";
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

const PaymentSuccess = () => {
  const { fetchCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("processing");
  const [orderData, setOrderData] = useState(null); 
  const hasSaved = useRef(false);

  useEffect(() => {
    const saveOrderToDatabase = async () => {
      if (hasSaved.current) return;

      // LocalStorage se data uthao (Tere original keys)
      const savedAddress = JSON.parse(localStorage.getItem("checkout_address"));
      const savedItems = JSON.parse(localStorage.getItem("checkout_cart"));
      const savedTotal = localStorage.getItem("checkout_total");

      const params = new URLSearchParams(location.search);
      const session_id = params.get("session_id");

      if (!session_id || !savedItems || !savedAddress) {
        setStatus("error");
        return;
      }

      try {
        const token = localStorage.getItem("userToken");
        // TERA ROUTE: /api/orders/create
        const res = await axios.post("http://localhost:5000/api/orders/create", {
          session_id,
          address: savedAddress,
          items: savedItems,
          total: Number(savedTotal),
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 200 || res.status === 201) {
          // UI ke liye data state mein rakho
          setOrderData({
            address: savedAddress,
            total: savedTotal,
            items: savedItems
          });

          hasSaved.current = true;
          
          // Premium Confetti
          confetti({ 
            particleCount: 150, 
            spread: 70, 
            origin: { y: 0.6 },
            colors: ['#10b981', '#000000', '#6366f1'] 
          });

          // Cleanup
          localStorage.removeItem("checkout_address");
          localStorage.removeItem("checkout_cart");
          localStorage.removeItem("checkout_total");
          
          await fetchCart(); 
          setStatus("success");
        }
      } catch (err) {
        console.error("Order Error:", err);
        setStatus("error");
      }
    };

    saveOrderToDatabase();
  }, [location.search, fetchCart]);

  // --- LOADING STATE ---
  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">VERIFYING PAYMENT...</h2>
          <p className="text-gray-500 font-medium">Sit tight, we're securing your order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full">
        
        {/* --- SUCCESS UI --- */}
        {status === "success" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
              <div className="bg-black p-10 text-center text-white">
                <CheckCircleIcon className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                <h1 className="text-4xl font-black tracking-tighter">ORDER CONFIRMED</h1>
                <p className="text-gray-400 mt-2 font-medium">Check your email for the receipt and tracking link.</p>
              </div>

              <div className="p-10 space-y-10">
                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 border-b border-gray-50 pb-10">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Shipping To</h4>
                    <p className="font-black text-gray-900 text-lg leading-tight">{orderData?.address?.fullName}</p>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{orderData?.address?.address}, {orderData?.address?.city}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Amount Paid</h4>
                    <p className="text-3xl font-black text-gray-900 italic">₹{Number(orderData?.total).toLocaleString()}</p>
                  </div>
                </div>

                {/* Items Stack (Friend's UI Feature) */}
                <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Package Contents</h4>
                    <div className="flex -space-x-4 overflow-hidden">
                        {orderData?.items?.map((item, idx) => (
                            <img 
                              key={idx} 
                              src={item.imageURL || item.image || item.img} 
                              alt={item.name} 
                              className="inline-block h-14 w-14 rounded-2xl ring-4 ring-white object-cover bg-gray-50 shadow-sm" 
                            />
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate("/dashboard")} 
                    className="flex-1 bg-black text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
                  >
                    VIEW ORDERS <ArrowRightIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate("/")} 
                    className="flex-1 bg-gray-50 text-gray-900 py-5 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest">RetailX Secure Checkout</p>
          </div>
        )}

        {/* --- ERROR UI --- */}
        {status === "error" && (
          <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl text-center space-y-6 border border-red-50">
            <XCircleIcon className="w-20 h-20 text-red-500 mx-auto" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">SYNC FAILED</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Payment was successful, but we couldn't link the order to your account. 
              Please contact <strong>support@retailx.io</strong> with your session ID.
            </p>
            <button 
              onClick={() => navigate("/")} 
              className="w-full bg-black text-white py-5 rounded-2xl font-black shadow-lg"
            >
              RETURN TO STORE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;