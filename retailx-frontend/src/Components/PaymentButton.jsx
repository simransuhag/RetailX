import React, { useContext } from "react";
import { CartContext } from "../context/CartContext"; 

// Props mein 'items' add karo jo Checkout.jsx bhej raha hai
const PaymentButton = ({ total, address, items = [] }) => {
  const { cartData } = useContext(CartContext);

  const handlePayment = async () => {
    // --- FIX: Pehle props wale items dekho (Direct Checkout), 
    // agar wo khali hain tab context wale items (Cart) uthao.
    const cartItems = items.length > 0 ? items : (cartData?.items || []);

    if (cartItems.length === 0) {
      alert("Your cart is empty! Please add items before checking out.");
      return;
    }

    if (!address.fullName || !address.address || !address.email) {
      alert("Please complete the shipping address form.");
      return;
    }

    try {
      const itemsToSave = cartItems.map((item) => ({
        productId: item.productId || item.id || item._id, 
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.imageURL || item.image || "", 
      }));

      localStorage.setItem("checkout_cart", JSON.stringify(itemsToSave));
      localStorage.setItem("checkout_address", JSON.stringify(address));
      localStorage.setItem("checkout_total", total.toString());

      const res = await fetch("http://127.0.0.1:5000/api/payment/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: total, 
          items: itemsToSave 
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment session could not be created.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Connection error.");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full bg-black text-white py-4 rounded-full font-semibold hover:bg-gray-900 transition-all active:scale-95"
    >
      Pay ₹{total.toLocaleString()}
    </button>
  );
};

export default PaymentButton;