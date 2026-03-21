import React, { useContext } from "react";
import { CartContext } from "../App"; // Ensure this path matches your file structure

const PaymentButton = ({ total, address }) => {
  const { cart } = useContext(CartContext);

  const handlePayment = async () => {
    // 1. Check current cart state
    if (!cart || cart.length === 0) {
      alert("Your cart is empty! Please add items before checking out.");
      return;
    }

    // 2. Validate Address
    if (!address.fullName || !address.address || !address.email) {
      alert("Please complete the shipping address form.");
      return;
    }

    try {
      // 3. Format items for MongoDB
      const itemsToSave = cart.map((item) => ({
        productId: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.image || "",
      }));

      // 4. Persistence: Freeze data in localStorage
      localStorage.setItem("checkout_cart", JSON.stringify(itemsToSave));
      localStorage.setItem("checkout_address", JSON.stringify(address));
      localStorage.setItem("checkout_total", total.toString());

      // 5. Call Backend to get Stripe URL
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
        window.location.href = data.url; // Redirect to Stripe
      } else {
        alert("Payment session could not be created.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Connection error. Please check if the backend is running.");
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