import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext"; // 1. Provider Import kiya

/* PAGES */
import LandingPage from "./pages/LandingPage";
import Cart from "./pages/Cart";
import AuthPage from "./pages/AuthPage";
import PreferencesPage from "./pages/PreferencesPage";
import SearchResults from "./pages/SearchResults";
import ProductPage from "./pages/ProductPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import SellerAuth from "./pages/SellerAuth";
import SellerDashboard from "./pages/SellerDashboard";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import UserDashboard from "./pages/UserDashboard";
import CategoryPage from "./pages/CategoryPage";
import Wishlist from "./pages/Wishlist";
import Returns from "./pages/Returns";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
// import VerifyOtp from "./pages/VerifyOtp";
import Deals from "./pages/Deals";
import HelpCenter from "./pages/HelpCenter";
import OAuthSuccess from "./pages/OAuthSuccess";

function App() {
  return (
    // 2. Poori App ko CartProvider mein wrap kar diya
    <CartProvider> 
      <BrowserRouter>
        <Routes>
          {/* USER ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />

          {/* 3. onAddToCart ki ab zaroorat nahi, Context se handle hoga */}
          <Route path="/product/:id" element={<ProductPage />} />

          {/* SELLER ROUTES */}
          <Route path="/seller-auth" element={<SellerAuth />} />
          <Route path="/seller" element={<SellerDashboard />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/admin" element={<AdminDashboard />} />
        
        {/* 404 Fallback (Optional) */}
        <Route path="*" element={<div className="p-20 text-center">404 - Page Not Found</div>} />


          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route path="/dashboard" element={<UserDashboard />} />

          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/wishlist" element={<Wishlist />} />

          <Route path="/deals" element={<Deals />} />
          
          <Route path="/returns" element={<Returns />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          {/* <Route path="/verify-otp" element={<VerifyOtp />} /> */}

          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />



        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;