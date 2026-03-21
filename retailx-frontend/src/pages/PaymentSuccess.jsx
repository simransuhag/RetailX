import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useRef } from "react";
import { CartContext } from "../App";
import confetti from "canvas-confetti";
import { CheckCircleIcon, XCircleIcon, ArrowRightIcon, ShoppingBagIcon } from "@heroicons/react/24/solid";

const PaymentSuccess = () => {
  const { setCart } = useContext(CartContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [orderDetails, setOrderDetails] = useState(null);
  const hasSaved = useRef(false);

  useEffect(() => {
    const saveOrderToDatabase = async () => {
      if (hasSaved.current) return;

      const params = new URLSearchParams(location.search);
      const session_id = params.get("session_id");

      const address = JSON.parse(localStorage.getItem("checkout_address"));
      const items = JSON.parse(localStorage.getItem("checkout_cart"));
      const total = localStorage.getItem("checkout_total");

      if (!session_id || !items || !address) {
        setStatus("error");
        return;
      }

      setOrderDetails({ items, total, address });

      try {
        hasSaved.current = true;
        const token = localStorage.getItem("userToken");

        const res = await fetch("http://127.0.0.1:5000/api/orders/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id,
            address,
            items,
            total: Number(total),
          }),
        });

        if (res.ok) {
          // Trigger Confetti
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#000000', '#22c55e', '#3b82f6']
          });

          localStorage.removeItem("checkout_address");
          localStorage.removeItem("checkout_cart");
          localStorage.removeItem("checkout_total");
          localStorage.removeItem("cart");
          setCart([]);
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    saveOrderToDatabase();
  }, [location.search, navigate, setCart]);

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full">
        {status === "processing" && (
          <div className="bg-white p-12 rounded-3xl shadow-xl text-center space-y-6 animate-pulse">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
            <h2 className="text-3xl font-bold text-gray-900">Finalizing your order...</h2>
            <p className="text-gray-500">Please do not refresh the page.</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Main Success Card */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-black p-8 text-center text-white">
                <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-3xl font-black tracking-tight">ORDER CONFIRMED</h1>
                <p className="text-gray-400 mt-2">A confirmation email is on its way to you.</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Order Mini-Summary */}
                <div className="grid grid-cols-2 gap-8 border-b border-gray-100 pb-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Shipping To</h4>
                    <p className="font-bold text-gray-900">{orderDetails?.address.fullName}</p>
                    <p className="text-sm text-gray-500">{orderDetails?.address.address}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount Paid</h4>
                    <p className="text-2xl font-black text-gray-900">₹{Number(orderDetails?.total).toLocaleString()}</p>
                  </div>
                </div>

                {/* Items Preview */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items Ordered</h4>
                    <div className="flex -space-x-3 overflow-hidden">
                        {orderDetails?.items.map((item, idx) => (
                            <img key={idx} src={item.image} alt="" className="inline-block h-12 w-12 rounded-full ring-4 ring-white object-cover bg-gray-100" />
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
                  >
                    View Order History <ArrowRightIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate("/customer-dashboard")}
                    className="flex-1 bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-center text-gray-400 text-sm">Need help? Contact our 24/7 support team.</p>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white p-12 rounded-3xl shadow-xl text-center space-y-6">
            <XCircleIcon className="w-20 h-20 text-red-500 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-900">Oops! Something went wrong</h2>
            <p className="text-gray-500">The payment was successful, but we encountered an error while saving your order. Please keep your transaction ID ready.</p>
            <button 
              onClick={() => navigate("/cart")}
              className="w-full bg-black text-white py-4 rounded-2xl font-bold"
            >
              Contact Support
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;