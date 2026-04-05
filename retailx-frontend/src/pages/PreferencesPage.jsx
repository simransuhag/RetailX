import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Check,
  ArrowRight,
  Sparkles,
  Tag,
  Loader2 // Ek loading icon aur add kiya hai
} from "lucide-react";

export default function PreferencesPage() {
  const [categories, setCategories] = useState([]); // Database se aayengi
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state
  const navigate = useNavigate();

  // Step 1: Categories fetch karna aur Auth check
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/auth");
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [navigate]);

  // Step 2: Selection logic
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Step 3: Submission logic
  const handleSubmit = async () => {
    if (selectedCategories.length < 3) return;
    setIsSaving(true);

    try {
      const token = localStorage.getItem("userToken");
      const res = await fetch("http://localhost:5000/api/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          categories: selectedCategories
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Sync LocalStorage
      localStorage.setItem("user_preferences", JSON.stringify(selectedCategories));
      if (data.user && data.user.name) {
        localStorage.setItem("user_name", data.user.name);
      }

      navigate("/customer-dashboard");
    } catch (err) {
      console.error("Error saving preferences:", err);
      alert(err.message || "Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-8 pt-10 pb-6 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 mb-4">
            <Sparkles className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Personalize your feed
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Select at least 3 categories to get started
          </p>
        </div>

        {/* CATEGORY GRID */}
        <div className="p-8 max-h-[380px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">Fetching categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No categories found in database.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category, index) => {
                const isSelected = selectedCategories.includes(category);

                return (
                  <motion.button
                    key={category}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.01 }}
                    onClick={() => toggleCategory(category)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition
                      ${isSelected
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-white border-slate-200 text-slate-600 hover:border-emerald-300"
                      }
                    `}
                  >
                    <span className="truncate">{category}</span>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                    ) : (
                      <Tag className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            <span className={selectedCategories.length >= 3 ? "text-emerald-600 font-bold" : ""}>
              {selectedCategories.length}
            </span>{" "}
            categories selected
          </p>

          <motion.button
            onClick={handleSubmit}
            disabled={selectedCategories.length < 3 || isSaving || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              px-10 py-3 rounded-xl font-semibold text-sm flex items-center gap-2
              ${selectedCategories.length >= 3 && !isLoading
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
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