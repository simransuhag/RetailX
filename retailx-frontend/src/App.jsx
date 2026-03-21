import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useState } from "react";

import LandingPage from "./pages/LandingPage";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import PreferencesPage from "./pages/PreferencesPage";
import AdminAuth from "./pages/AdminAuth";
import SellerDashboard from "./pages/SellerDashboard";
import SellerAuth from "./pages/SellerAuth";
import CategoryPage from "./pages/CategoryPage";
import SearchResults from "./pages/SearchResults";
import ProductPage from "./pages/ProductPage";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import UserDashboard from "./pages/UserDashboard";
import CustomerDashboard from "./pages/CustomerDashboard"; 
import Wishlist from "./pages/Wishlist";
import Deals from "./pages/Deals";
// ✅ CONTEXT CREATE
export const CartContext = createContext();



function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    console.log("ADD TO CART CLICKED:", product);
    
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  return (
      <CartContext.Provider value={{ cart, setCart, addToCart }}>

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/seller-auth" element={<SellerAuth />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
         <Route path="/search" element={<SearchResults />} />
          
          {/* 2. DYNAMIC PRODUCT ROUTE ADDED */}
          {/* ':id' ek variable hai jo MongoDB ki ObjectId ko capture karega */}
        <Route path="/product/:id" element={<ProductPage />} />

<Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
  <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
<Route path="/wishlist" element={<Wishlist />} />
          <Route path="/deals" element={<Deals />} />
        </Routes>
      </BrowserRouter>
    </CartContext.Provider>
  );
}

export default App;