import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useState } from "react";

/* =======================
   PAGES
======================= */
// User
import LandingPage from "./pages/LandingPage";
import Cart from "./pages/Cart";
import AuthPage from "./pages/AuthPage";
import PreferencesPage from "./pages/PreferencesPage";
import SearchResults from "./pages/SearchResults";
import ProductPage from "./pages/ProductPage"; // 1. ProductPage Import kiya

// Admin
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";

// Seller
import SellerAuth from "./pages/SellerAuth";
import SellerDashboard from "./pages/SellerDashboard";

/* =======================
   CART CONTEXT
======================= */
export const CartContext = createContext();

function App() {
  /* ---------- GLOBAL CART STATE ---------- */
  const [cart, setCart] = useState([]);

  /* ---------- ADD TO CART LOGIC ---------- */
  const addToCart = (product) => {
    setCart((prevCart) => {
      // Note: MongoDB ID field 'id' ya '_id' ho sakti hai
      const productId = product.id || product._id;
      
      const existingItem = prevCart.find(
        (item) => (item.id || item._id) === productId
      );

      if (existingItem) {
        return prevCart.map((item) =>
          (item.id || item._id) === productId
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

          {/* ---------- USER ROUTES ---------- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchResults />} />
          
          {/* 2. DYNAMIC PRODUCT ROUTE ADDED */}
          {/* ':id' ek variable hai jo MongoDB ki ObjectId ko capture karega */}
          <Route path="/product/:id" element={<ProductPage onAddToCart={addToCart} />} />

          {/* ---------- SELLER ROUTES ---------- */}
          <Route path="/seller-auth" element={<SellerAuth />} />
          <Route path="/seller" element={<SellerDashboard />} />

          {/* ---------- ADMIN ROUTES ---------- */}
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/admin" element={<AdminDashboard />} />

        </Routes>
      </BrowserRouter>
    </CartContext.Provider>
  );
}

export default App;