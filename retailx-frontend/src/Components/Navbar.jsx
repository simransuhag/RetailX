import { useState, useContext } from "react";
import { ShoppingCart, Search, User, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../App";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { cart } = useContext(CartContext);
  
  // FIX: Yahan change kiya hai. Ab ye sirf unique products count karega.
  const cartCount = cart ? cart.length : 0; 

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LEFT: Logo + Search */}
        <div className="flex items-center gap-10">
          <Link to="/" className="text-xl font-bold text-slate-900 tracking-tight">
            Retail<span className="text-emerald-600">X</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center relative group">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600" />
            <input
              type="text"
              placeholder="Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 pl-10 pr-4 py-2 w-[320px] xl:w-[400px] text-sm rounded-xl border border-transparent focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all"
            />
          </form>
        </div>

        {/* RIGHT: Links + Cart + Auth */}
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-7">
            <NavLink to="/">Home</NavLink>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-emerald-600">
                Categories <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </div>
            <NavLink to="/deals">Deals</NavLink>
            <NavLink to="/admin-auth" className="italic text-slate-500">Admin</NavLink>
            <NavLink to="/seller-auth" className="italic text-slate-500">Seller</NavLink>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          {/* Cart Section */}
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-slate-50 transition-colors">
            <ShoppingCart className="h-5 w-5 text-slate-600 hover:text-emerald-600" />
            
            {/* Badge: Ab ye sirf tabhi badhega jab naya product add hoga */}
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth Buttons */}
          <div className="flex gap-2">
            <Link to="/auth">
              <Button className="rounded-xl px-4 h-9 flex gap-2">
                <User className="h-4 w-4" /> Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      className={`relative text-sm font-medium text-slate-600 hover:text-emerald-600 transition py-1 group ${className}`}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-500 transition-all group-hover:w-full" />
    </Link>
  );
}