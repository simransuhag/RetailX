import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  ShieldCheck
} from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    if (mode === "register") {
      if (!PASSWORD_REGEX.test(password)) {
        setIsLoading(false);
        setError("Password at least 8 chars, 1 uppercase & 1 special char honi chahiye.");
        return;
      }
      if (password !== confirmPassword) {
        setIsLoading(false);
        setError("Passwords match nahi ho rahe.");
        return;
      }
    }

    try {
      // ✅ 1. URL aur Payload Setup
      const baseUrl = "http://localhost:5000"; // localhost use karna safer hai
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email, password } : { name, email, password };

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      // ✅ 2. Token Save karna (Backend 'access_token' bhejta hai)
      const token = data.access_token || data.token;
      localStorage.setItem("userToken", token);
      localStorage.setItem("userName", name || data.user?.name || "User");

      // ✅ 3. Redirect Logic
      if (mode === "register") {
        navigate("/preferences");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Server se connection nahi ho paya.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans text-slate-900 text-[14px]">
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[440px] z-10"
        >
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="mb-8 text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 mb-6">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {mode === "login" ? "Sign in to RetailX" : "Create your account"}
              </h1>
              <p className="text-slate-500 text-sm mt-1.5">
                {mode === "login" ? "Welcome back! Login to continue." : "Start your beauty journey with us."}
              </p>
            </div>

            {error && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="mb-5 p-3.5 rounded-xl bg-red-50 text-red-600 text-[13px] font-semibold border border-red-100">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {mode === "register" && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <Input label="Full Name" icon={User} value={name} setValue={setName} placeholder="John Doe" field="name" focusedField={focusedField} setFocusedField={setFocusedField} />
                  </motion.div>
                )}
              </AnimatePresence>

              <Input label="Email Address" icon={Mail} value={email} setValue={setEmail} placeholder="name@company.com" field="email" focusedField={focusedField} setFocusedField={setFocusedField} />

              <PasswordInput label="Password" value={password} setValue={setPassword} show={showPassword} toggle={() => setShowPassword(!showPassword)} field="password" focusedField={focusedField} setFocusedField={setFocusedField} placeholder="••••••••" />

              {mode === "register" && (
                <PasswordInput label="Confirm Password" value={confirmPassword} setValue={setConfirmPassword} show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} field="confirmPassword" focusedField={focusedField} setFocusedField={setFocusedField} placeholder="••••••••" />
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{mode === "login" ? "Sign In" : "Create Account"} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-500 font-medium">
                {mode === "login" ? "New here?" : "Already a member?"}{" "}
                <button onClick={() => {setMode(mode === "login" ? "register" : "login"); setError("");}} className="text-emerald-600 font-bold hover:underline ml-1">
                  {mode === "login" ? "Register Now" : "Login Instead"}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function Input({ label, icon: Icon, value, setValue, placeholder, field, focusedField, setFocusedField }) {
  return (
    <div className="space-y-2">
      <label className="text-[13px] font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative group">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === field ? "text-emerald-600" : "text-slate-400"}`} />
        <input
          required value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          placeholder={placeholder}
          className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none font-medium"
        />
      </div>
    </div>
  );
}

function PasswordInput({ label, value, setValue, show, toggle, field, focusedField, setFocusedField, placeholder }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[13px] font-bold text-slate-700">{label}</label>
        {field === "password" && <button type="button" className="text-[11px] text-emerald-600 font-bold hover:underline">Forgot?</button>}
      </div>
      <div className="relative group">
        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${focusedField === field ? "text-emerald-600" : "text-slate-400"}`} />
        <input
          required type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          placeholder={placeholder}
          className="w-full pl-11 pr-12 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none font-medium"
        />
        <button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}