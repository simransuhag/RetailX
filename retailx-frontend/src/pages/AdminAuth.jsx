import { useState } from "react";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";

export default function AdminAuth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🌐 Backend URL (Prefix match: /api/admin/login or /api/admin/register)
      const endpoint = mode === "login" ? "/api/admin/login" : "/api/admin/register";
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, adminKey }),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ 1. Token aur Status save karo
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "admin");
        localStorage.setItem("isAdmin", "true");

        alert(mode === "login" ? "Login Successful! Welcome Admin." : "Admin Registered Successfully!");
        navigate("/admin");
      } else {
        // ❌ 2. Backend ne mana kar diya (Invalid Key, Wrong Pass, etc.)
        alert(data.message || "Authentication Failed");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Backend server se connect nahi ho raha! Pehle Flask chalao.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-slate-100"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === "login" ? "Admin Secure Login" : "Admin Registration"}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            RetailX Official Admin Portal
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            icon={Mail} 
            placeholder="admin@retailx.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            icon={Lock} 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* SECRET ADMIN KEY - Mandatory for Admin */}
          <Input
            icon={KeyRound}
            placeholder="Admin Secret Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            required
          />

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Login Securely" : "Register Admin"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* TOGGLE */}
        <div className="mt-8 text-center text-sm text-slate-500">
          {mode === "login" ? "Create a new admin?" : "Already an admin?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-bold text-emerald-600 hover:underline"
          >
            {mode === "login" ? "Register here" : "Login here"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* INPUT COMPONENT */
function Input({ icon: Icon, type = "text", placeholder, value, onChange, required = true }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm"
        required={required}
      />
    </div>
  );
}