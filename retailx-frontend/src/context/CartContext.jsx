import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from "sweetalert2";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartData, setCartData] = useState({
    items: [],
    spent: 0,
    monthlyBudget: null,
    percentUsed: 0,
    remaining: null
  });

  // FIX: Safely get User ID without crashing
  // CartContext.js mein getUserId function ko replace karein
// CartContext.js ke andar getUserId
const getUserId = () => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) return null; // Token nahi toh koi ID nahi

    // Pehle direct 'user_id' key check karo
    let id = localStorage.getItem("user_id");

    // Agar 'user_id' nahi mili, toh 'user' object parse karke dekho
    if (!id || id === "undefined") {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined" && savedUser !== "null") {
        const user = JSON.parse(savedUser);
        id = user?.id || user?._id;
      }
    }

    return id || null;
  } catch (error) {
    console.error("CartContext error", error);
    return null;
  }
};

  /* =======================
      FETCH CART
     ======================= */
  const fetchCart = useCallback(async () => {
    const userId = getUserId();
    // Agar userId nahi hai toh request mat bhejo
    if (!userId) {
      setCartData({ items: [], spent: 0, monthlyBudget: null, percentUsed: 0, remaining: null });
      return;
    }
    
    try {
      const res = await axios.get(`http://localhost:5000/api/cart?userId=${userId}`);
      setCartData(res.data);
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  }, []);

  /* =======================
      UPDATE BUDGET
     ======================= */
  const updateBudget = async (newLimit) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const budgetValue = newLimit === null ? null : parseFloat(newLimit);
      const res = await axios.post('http://localhost:5000/api/cart/budget', {
        userId,
        monthlyBudget: budgetValue
      });

      setCartData(res.data);

      Swal.fire({
        icon: budgetValue !== null ? "success" : "info",
        title: budgetValue !== null ? "Budget Updated" : "Budget Removed",
        text: budgetValue !== null ? "Your monthly budget has been updated." : "Tracking disabled.",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (err) {
      console.error("Budget update error:", err);
      Swal.fire({ icon: "error", title: "Update Failed", text: "Please try again." });
    }
  };

  /* =======================
      ADD TO CART
     ======================= */
  const addToCart = async (product) => {
    const userId = getUserId();

    const finalProductId = product._id || product.id || product.productId;

    if (!userId) {
      Swal.fire({ icon: "warning", title: "Login Required", text: "Please login to add items." });
      return;
    }

    if (!finalProductId) {
      console.error("Critical Error: No Product ID found in object", product);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/cart/add', {
        userId,
        productId: finalProductId,
        name: product.name,
        price: parseFloat(product.price || product.finalPrice || 0),
        imageURL: product.imageURL || product.image || 'https://placehold.co/200',
        brand: product.brand || "RetailX Collection",
        category: product.category || "General",
        quantity: 1
      });

      setCartData(res.data);
      Swal.fire({ icon: "success", title: "Added to Cart", timer: 1500, showConfirmButton: false });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Cannot Add Product",
        text: err.response?.data?.error || "Check your budget or connection.",
      });
    }
  };

  /* =======================
      UPDATE QUANTITY
     ======================= */
  const updateQuantity = async (productId, newQuantity) => {
    const userId = getUserId();
    if (!userId || newQuantity < 1) return;

    try {
      const res = await axios.post('http://localhost:5000/api/cart/update', {
        userId,
        productId,
        quantity: newQuantity
      });
      setCartData(res.data);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Update Failed", text: "Unable to update quantity." });
    }
  };

  /* =======================
      REMOVE FROM CART
     ======================= */
  const removeFromCart = async (productId) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const res = await axios.post('http://localhost:5000/api/cart/remove', {
        userId,
        productId
      });
      setCartData(res.data);
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  // CartProvider ke andar ye useEffect add karo
useEffect(() => {
  const handleAuthChange = () => {
    fetchCart(); // Jaise hi login ho, cart fetch karlo
  };

  window.addEventListener("userLoginStateChange", handleAuthChange);
  window.addEventListener("storage", handleAuthChange);

  return () => {
    window.removeEventListener("userLoginStateChange", handleAuthChange);
    window.removeEventListener("storage", handleAuthChange);
  };
}, [fetchCart]);

  return (
    <CartContext.Provider value={{
      cartData,
      addToCart,
      fetchCart,
      updateQuantity,
      removeFromCart,
      updateBudget
    }}>
      {children}
    </CartContext.Provider>
  );
};