import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ArrowRight,
  Sparkles,
  Tag,
  Search
} from "lucide-react";

const CATEGORIES = [
  "Fashion", "Electronics", "Grocery", "Beauty", "Home & Living", "Sports",
  "Books", "Toys", "Health & Wellness", "Jewellery", "Watches", "Shoes",
  "Bags & Accessories", "Kids & Baby", "Pet Supplies", "Automotive",
  "Music & Instruments", "Gaming", "Stationery", "Office Supplies",
  "Kitchen & Dining", "Furniture", "Garden & Outdoors", "Art & Craft",
  "Photography", "Travel & Luggage", "Footwear", "Mobile Accessories",
  "Smart Home", "Computer Accessories", "Cameras & Drones", "Fitness Equipment",
  "Camping & Hiking", "Cycling", "Swimming & Water Sports", "Sportswear",
  "Hair Care", "Skin Care", "Makeup", "Fragrances", "Eyewear", "Sunglasses",
  "Watches & Clocks", "Home Decor", "Lighting", "Bedding & Linen",
  "Cleaning Supplies", "Gourmet Food", "Beverages", "Snacks & Confectionery",
  "Vitamins & Supplements", "Stationery & Office Equipment", "Smartphones",
  "Tablets", "Laptops", "Printers & Scanners"
];

export default function PreferencesPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/auth");
    }
  }, [navigate]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    if (selectedCategories.length < 3) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("userToken");

      const res = await fetch("http://127.0.0.1:5000/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          categories: selectedCategories
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      // --- SYNC DATA FOR CUSTOMER DASHBOARD ---
      localStorage.setItem("user_preferences", JSON.stringify(selectedCategories));

      // --- REDIRECT TO CUSTOMER DASHBOARD ---
      window.location.href = "/dashboard"; 
      
    } catch (err) {
      alert(err.message || "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-8 pt-10 pb-6 text-center border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 mb-4">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Personalize your feed
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Select at least 3 categories to power your AI recommendations
          </p>

          {/* SEARCH BAR */}
          <div className="relative mt-6 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <AnimatePresence>
              {filteredCategories.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <motion.button
                    layout
                    key={category}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => toggleCategory(category)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                      ${isSelected
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                        : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-slate-50"
                      }
                    `}
                  >
                    <span className="truncate">{category}</span>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={3} />
                    ) : (
                      <Tag className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          {filteredCategories.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              No categories found matching "{searchTerm}"
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            <span className={`text-lg font-bold ${selectedCategories.length >= 3 ? "text-emerald-600" : "text-slate-400"}`}>
              {selectedCategories.length}
            </span>
            <span className="ml-2">categories selected</span>
          </div>

          <motion.button
            onClick={handleSubmit}
            disabled={selectedCategories.length < 3 || isSaving}
            whileHover={selectedCategories.length >= 3 ? { scale: 1.02 } : {}}
            whileTap={selectedCategories.length >= 3 ? { scale: 0.98 } : {}}
            className={`
              px-10 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-200
              ${selectedCategories.length >= 3
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Complete Setup
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}