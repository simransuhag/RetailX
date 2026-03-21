import { useState } from "react";
import {
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../Components/ui/button";

export default function AdminAuth() {
  const [mode, setMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url =
        mode === "login"
          ? "http://127.0.0.1:5000/api/admin/login"
          : "http://127.0.0.1:5000/api/admin/register";

      const payload =
        mode === "login"
          ? { email, password }
          : { email, password, adminKey };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Authentication failed");

      // ✅ Store admin token
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("role", "admin");

      navigate("/admin");
    } catch (err) {
      alert(err.message);
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
        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {mode === "login" ? "Admin Login" : "Admin Registration"}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            RetailX Secure Admin Portal
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

          <PasswordInput
            value={password}
            setValue={setPassword}
            show={showPassword}
            toggle={() => setShowPassword(!showPassword)}
          />

          {/* ADMIN SECRET (REGISTER ONLY) */}
          {mode === "register" && (
            <Input
              icon={KeyRound}
              placeholder="Admin Secret Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
            />
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98]"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        {/* TOGGLE */}
        <div className="mt-8 text-center text-sm text-slate-500">
          {mode === "login" ? "New Admin?" : "Already an Admin?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="font-bold text-emerald-600 hover:underline"
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* INPUT */
function Input({ icon: Icon, type = "text", placeholder, value, onChange }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm"
      />
    </div>
  );
}

/* PASSWORD INPUT */
function PasswordInput({ value, setValue, show, toggle }) {
  return (
    <div className="relative">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type={show ? "text" : "password"}
        placeholder="••••••••"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="w-full h-12 pl-11 pr-11 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm"
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}