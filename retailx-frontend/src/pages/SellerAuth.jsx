import { useState } from "react";
import { Mail, Lock, Store, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";

export default function SellerAuth() {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    storeName: "",
    registrationId: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Typing karte hi error gayab ho jaye
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = `http://localhost:5000/api/seller/${mode}`; // Dynamic clean URL
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      localStorage.setItem("sellerToken", data.token);
      localStorage.setItem("role", "seller");
      navigate("/seller");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-10 border border-slate-100 transition-all">
        
        {/* HEADER */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {mode === "login" ? "Seller Login" : "Start Selling"}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            {mode === "login" ? "Access your business dashboard" : "Create your store in minutes"}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl animate-shake">
            ⚠️ {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            icon={Mail}
            name="email"
            type="email"
            placeholder="seller@business.com"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full h-14 pl-12 pr-12 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {mode === "register" && (
            <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
              <Input
                icon={Store}
                name="storeName"
                placeholder="Business/Store Name"
                value={formData.storeName}
                onChange={handleChange}
              />
              <Input
                icon={ShieldCheck}
                name="registrationId"
                placeholder="GSTIN or Shop ID"
                value={formData.registrationId}
                onChange={handleChange}
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
          >
            {loading ? "Syncing..." : mode === "login" ? "Sign In" : "Register Store"}
            {!loading && <ArrowRight size={20} />}
          </Button>
        </form>

        {/* TOGGLE */}
        <div className="mt-10 text-center">
          <p className="text-slate-500 font-bold text-sm">
            {mode === "login" ? "New here?" : "Already a partner?"}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="ml-2 text-blue-600 hover:text-blue-700 underline underline-offset-4"
            >
              {mode === "login" ? "Create Account" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

/* REUSABLE INPUT */
function Input({ icon: Icon, type = "text", placeholder, name, value, onChange }) {
  return (
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full h-14 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
      />
    </div>
  );
}