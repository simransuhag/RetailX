import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  // OAuthSuccess.js
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const name = params.get("name");
  const userId = params.get("id"); 
  const redirectPath = params.get("redirect");

  if (token && userId) {
    // 1. Token clean karo (agar quotes hain)
    const cleanToken = token.replace(/^"(.*)"$/, '$1'); 
    
    // 2. ✅ EXACT KEYS jo tumhara getUserId function maang raha hai:
    localStorage.setItem("userToken", cleanToken);
    localStorage.setItem("user_id", userId); 
    localStorage.setItem("user_name", name || "Shopper");
    
    // Safety ke liye pura user object bhi save kar lo
    localStorage.setItem("user", JSON.stringify({ id: userId, name: name }));

    // 3. Navbar aur Context ko trigger karne ke liye
    window.dispatchEvent(new Event("userLoginStateChange"));
    window.dispatchEvent(new Event("storage")); 

    // 4. Redirect with a slight delay
    setTimeout(() => {
      navigate(redirectPath || "/customer-dashboard", { replace: true });
    }, 100);

  } else {
    navigate("/auth", { replace: true });
  }
}, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 text-sm font-medium">Verifying credentials...</p>
    </div>
  );
}