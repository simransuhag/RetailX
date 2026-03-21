import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useContext } from "react"; 
import { CartContext } from "../App"; 
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const category = searchParams.get("category"); // Category catch kiya
  const navigate = useNavigate(); 
  const { addToCart } = useContext(CartContext); 
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sortBy, setSortBy] = useState(""); 
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000); 
  const [visibleCount, setVisibleCount] = useState(8);

  // --- LOGIC: Fetch results from Backend ---
  useEffect(() => {
    const fetchResults = async () => {
      // Agar dono empty hain toh search mat karo
      if (!query && !category) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        /** * Hum backend ko ek hi 'q' bhejenge. 
         * Backend ab isi 'q' ko name, category, subcategory, aur tags mein search karega.
         */
        const searchTerm = query || category;
        params.append("q", searchTerm);

        const response = await fetch(`http://127.0.0.1:5000/api/search?${params.toString()}`);
        const data = await response.json();
        
        setProducts(data);
        setVisibleCount(8); // Reset count on new search
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, category]);

  // --- LOGIC: Add to Cart and Redirect ---
  const handleAddToCart = (p) => {
    const productForCart = {
      id: p.id,
      name: p.name,
      price: Number(p.finalPrice),
      originalPrice: Number(p.price),
      image: p.imageURL || p.images?.[0] || "https://via.placeholder.com/200",
      seller: "RetailX Seller",
      brand: p.brand
    };
    
    addToCart(productForCart); 
    navigate("/cart"); 
  };

  const brands = useMemo(() => {
    const b = products.map(p => p.brand);
    return ["All", ...new Set(b)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedBrand !== "All") {
      result = result.filter(p => p.brand === selectedBrand);
    }
    result = result.filter(p => p.finalPrice <= maxPrice);
    if (sortBy === "low-to-high") {
      result.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sortBy === "high-to-low") {
      result.sort((a, b) => b.finalPrice - a.finalPrice);
    }
    return result;
  }, [products, selectedBrand, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6 pb-12">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          {/* Dynamic Heading based on Search or Category */}
          <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
            {query ? `Results for "${query}"` : `Category: ${category}`} 
            <span className="text-gray-400 font-normal"> ({filteredProducts.length} items)</span>
          </h1>

          <div className="flex flex-wrap gap-4 items-center">
            <select 
              className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>

            <select 
              className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm">
              <span>Max Price: ₹{maxPrice}</span>
              <input 
                type="range" min="500" max="100000" step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center mt-20 text-gray-500">Searching products...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.slice(0, visibleCount).map((p) => (
                  <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    
                    <Link to={`/product/${p.id}`} className="block">
                      <div className="h-56 bg-white p-4 flex items-center justify-center relative">
                        <img 
                          src={p.imageURL || p.images?.[0] || "https://via.placeholder.com/200"} 
                          alt={p.name} 
                          className="h-full object-contain"
                        />
                        {p.rating > 0 && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            {p.rating} ★
                          </div>
                        )}
                      </div>

                      <div className="p-4 border-t border-gray-50">
                        <p className="text-xs text-gray-400 uppercase tracking-widest">{p.brand}</p>
                        <h3 className="font-semibold text-gray-800 truncate" title={p.name}>{p.name}</h3>
                        
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">₹{p.finalPrice}</span>
                          <span className="text-sm text-gray-400 line-through">₹{p.price}</span>
                          <span className="text-xs text-green-600 font-medium">({p.discount}% Off)</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{p.description}</p>
                      </div>
                    </Link>

                    <div className="px-4 pb-4">
                      {/* Global Add to Cart functionality */}
                      <button 
                        onClick={() => handleAddToCart(p)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-500 text-lg">Hume "{query || category}" ke liye kuch nahi mila.</p>
                </div>
              )}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="flex justify-center mt-12">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-8 py-2.5 bg-white border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                >
                  Load More Items
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer/>
    </div>
  );
}