import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Plus, Check, Heart, ChevronDown, ChevronUp, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { CartContext } from "../App";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart } = useContext(CartContext);
  const scrollRef = useRef(null); // Ref for the similar products container
  
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [interestProducts, setInterestProducts] = useState([]); 
  const [frequentlyBought, setFrequentlyBought] = useState([]);
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);

  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const isInCart = cart.some(item => (item._id === id || item.id === id));

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/product/${id}`);
        const data = await response.json();
        setCurrentProduct(data);
        window.scrollTo(0, 0);

        const resSimilar = await fetch(`http://localhost:5000/api/products?category=${data.category}&limit=24`);
        const sData = await resSimilar.json();
        const filtered = sData.filter(p => (p._id || p.id) !== id);
        
        setSimilarProducts(filtered.slice(0, 12));
        setFrequentlyBought(filtered.slice(0, 3)); 

        const differentPool = filtered.length > 12 
          ? filtered.slice(12, 18) 
          : [...filtered].reverse().slice(0, 6);
        setInterestProducts(differentPool);

      } catch (err) {
        setError("Data fetching failed");
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  // Scroll logic for the Similar Products section
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getTechnicalSpecs = () => {
    if (!currentProduct) return null;
    const target = currentProduct.specs || currentProduct.specifications;
    if (target && typeof target === 'object' && Object.keys(target).length > 0) {
      return Object.entries(target);
    }
    return null;
  };

  const technicalData = getTechnicalSpecs();

  const toggleAddon = (addonId) => {
    setSelectedAddonIds(prev => 
      prev.includes(addonId) ? prev.filter(i => i !== addonId) : [...prev, addonId]
    );
  };

  const handleBulkAddToCart = () => {
    if (!isInCart) addToCart(currentProduct);
    const addonsToAdd = frequentlyBought.filter(item => selectedAddonIds.includes(item._id || item.id));
    addonsToAdd.forEach(addon => {
      const isAddonInCart = cart.some(item => (item._id === addon._id || item.id === addon.id));
      if(!isAddonInCart) addToCart(addon);
    });
    navigate('/cart');
  };

  const discount = currentProduct?.price && currentProduct?.finalPrice 
    ? Math.round(((currentProduct.price - currentProduct.finalPrice) / currentProduct.price) * 100) 
    : 0;

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#2874f0] text-2xl">Loading...</div>;

  return (
    <div className="bg-[#f1f3f6] min-h-screen font-sans text-[#212121]">
      <Navbar />
      <main className="max-w-[1280px] mx-auto py-4 px-2 mt-12">
        
        <div className="flex flex-col md:flex-row gap-4 items-start mb-6">
          {/* LEFT COLUMN: IMAGE & ACTION BUTTONS */}
          <div className="md:w-[40%] md:sticky md:top-[75px] w-full">
            <div className="bg-white p-3 border border-gray-200 rounded-sm shadow-sm relative">
              <button onClick={() => setIsWishlisted(!isWishlisted)} className="absolute right-6 top-6 z-10 p-2 bg-white rounded-full shadow-md border border-gray-100 transition-transform active:scale-90">
                <Heart size={20} className={isWishlisted ? "fill-[#ff4343] text-[#ff4343]" : "text-gray-400"} />
              </button>
              <div className="border border-gray-100 p-2 mb-4 h-[450px] flex items-center justify-center overflow-hidden">
                <img src={currentProduct?.imageURL} alt={currentProduct?.name} className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => isInCart ? navigate('/cart') : addToCart(currentProduct)} className="flex-1 bg-[#ff9f00] text-white py-4 rounded-sm font-bold uppercase shadow flex items-center justify-center gap-2">
                   <Plus size={18} /> {isInCart ? "Go to Cart" : "Add to Cart"}
                </button>
                <button className="flex-1 bg-[#fb641b] text-white py-4 rounded-sm font-bold uppercase shadow">Buy Now</button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PRODUCT INFO */}
          <div className="md:w-[60%] w-full space-y-4">
            <div className="bg-white p-6 border border-gray-200 rounded-sm shadow-sm">
              <h1 className="text-xl font-bold mb-2 leading-tight text-[#212121]">{currentProduct?.name}</h1>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#388e3c] text-white text-[12px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                  {currentProduct?.rating || 0} <Star size={12} className="fill-current" />
                </span>
                <span className="text-[#878787] text-sm font-bold">{(currentProduct?.reviewsCount || 0).toLocaleString()} Ratings</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold">₹{currentProduct?.finalPrice?.toLocaleString()}</span>
                <span className="text-gray-500 line-through text-lg font-medium">₹{currentProduct?.price?.toLocaleString()}</span>
                <span className="text-[#388e3c] text-lg font-bold">{discount}% off</span>
              </div>

              {/* DESCRIPTION */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-2">Description</h3>
                <p className={`text-sm leading-relaxed text-gray-700 ${!isDescOpen ? 'line-clamp-3' : ''}`}>{currentProduct?.description}</p>
                <button onClick={() => setIsDescOpen(!isDescOpen)} className="text-[#2874f0] text-sm font-bold mt-1">
                    {isDescOpen ? 'Read Less' : 'Read More'}
                </button>
              </div>

              {/* HIGHLIGHTS */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-4">Highlights</h3>
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 overflow-hidden transition-all duration-500 ${!isHighlightsOpen ? 'max-h-[160px]' : 'max-h-[2000px]'}`}>
                    {currentProduct?.highlights?.length > 0 ? currentProduct.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2 group">
                            <CheckCircle2 size={16} className="text-[#388e3c] mt-0.5 shrink-0" />
                            <span className="text-sm text-gray-700 leading-snug">{h}</span>
                        </div>
                    )) : <p className="text-sm text-gray-400">No highlights available</p>}
                </div>
                {currentProduct?.highlights?.length > 6 && (
                  <button onClick={() => setIsHighlightsOpen(!isHighlightsOpen)} className="text-[#2874f0] text-sm font-bold mt-4 flex items-center gap-1">
                      {isHighlightsOpen ? <><ChevronUp size={16}/> Show Less</> : <><ChevronDown size={16}/> Show More Highlights</>}
                  </button>
                )}
              </div>

              {/* SPECIFICATIONS */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-bold text-gray-400 uppercase text-xs tracking-wider mb-3">Specifications</h3>
                <div className={`overflow-hidden transition-all duration-300 ${!isSpecsOpen ? 'max-h-40' : 'max-h-[3000px]'}`}>
                    <table className="w-full text-sm border-collapse">
                        <tbody>
                            {technicalData ? (
                                technicalData.map(([key, val], idx) => (
                                    <tr key={idx} className="border-b border-gray-100 last:border-0">
                                        <td className="py-3 text-gray-500 w-1/3 align-top font-medium">{key}</td>
                                        <td className="py-3 text-gray-900 w-2/3">{val}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td className="py-2 text-gray-400 italic">No technical specifications provided</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {technicalData && technicalData.length > 4 && (
                    <button onClick={() => setIsSpecsOpen(!isSpecsOpen)} className="text-[#2874f0] text-sm font-bold mt-4 flex items-center gap-1 border border-gray-200 px-4 py-2 rounded-sm hover:bg-gray-50">
                        {isSpecsOpen ? <><ChevronUp size={16}/> View Less</> : <><ChevronDown size={16}/> View More</>}
                    </button>
                )}
              </div>

              {/* FREQUENTLY BOUGHT TOGETHER */}
              {frequentlyBought.length > 0 && (
                <div className="mt-10 border-t pt-6">
                  <h3 className="font-bold text-lg mb-4">Frequently Bought Together</h3>
                  <div className="bg-[#f9f9f9] border border-gray-200 p-6 rounded-md shadow-inner flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                      <div className="w-20 h-20 border-2 border-gray-200 p-2 rounded bg-white"><img src={currentProduct?.imageURL} className="w-full h-full object-contain" alt="main" /></div>
                      {frequentlyBought.map((addon) => {
                        const isSelected = selectedAddonIds.includes(addon._id || addon.id);
                        return (
                          <React.Fragment key={addon._id || addon.id}>
                            <Plus size={18} className="text-gray-400" />
                            <div className="flex flex-col items-center gap-2">
                              <div onClick={() => toggleAddon(addon._id || addon.id)} className={`relative w-20 h-20 border-2 p-2 rounded cursor-pointer transition-all ${isSelected ? 'border-[#2874f0] bg-blue-50' : 'border-gray-200 bg-white'}`}>
                                <img src={addon.imageURL} className="w-full h-full object-contain" alt="addon" />
                                <div className={`absolute -top-2 -right-2 rounded-full p-0.5 border shadow-sm ${isSelected ? 'bg-[#2874f0] text-white' : 'bg-white text-gray-300'}`}>
                                  {isSelected ? <Check size={12} /> : <Plus size={12} />}
                                </div>
                              </div>
                              <Link to={`/product/${addon._id || addon.id}`} className="text-[10px] font-bold text-[#2874f0] hover:underline uppercase tracking-tighter">View</Link>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="lg:border-l pl-6 border-gray-300">
                      <p className="text-xl font-bold">₹{(currentProduct?.finalPrice + frequentlyBought.filter(i => selectedAddonIds.includes(i._id || i.id)).reduce((acc, curr) => acc + curr.finalPrice, 0)).toLocaleString()}</p>
                      <button onClick={handleBulkAddToCart} className="mt-2 bg-[#fb641b] text-white px-6 py-2 rounded-sm font-bold text-sm shadow hover:brightness-110">ADD {selectedAddonIds.length + 1} ITEMS</button>
                    </div>
                  </div>
                </div>
              )}

              {/* RATINGS */}
              <div className="mt-10 border-t pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">Ratings</h3>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 text-3xl font-bold">
                      {currentProduct?.rating || 0} <Star className="fill-black" size={24} />
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      {(currentProduct?.reviewsCount || 0).toLocaleString()} Ratings
                    </p>
                  </div>

                  <div className="flex-1 w-full space-y-2 max-w-[300px]">
                    {[
                      { star: 5, color: "bg-[#388e3c]", weight: 0.45 },
                      { star: 4, color: "bg-[#388e3c]", weight: 0.30 },
                      { star: 3, color: "bg-[#388e3c]", weight: 0.15 },
                      { star: 2, color: "bg-[#ff9f00]", weight: 0.07 },
                      { star: 1, color: "bg-[#ff4343]", weight: 0.03 },
                    ].map((row) => {
                      const hasRatings = currentProduct?.reviewsCount > 0;
                      const barWidth = hasRatings ? (row.weight * 100) : 0;
                      const countDisplay = hasRatings ? Math.floor(currentProduct.reviewsCount * row.weight) : 0;

                      return (
                        <div key={row.star} className="flex items-center gap-4 text-xs font-bold">
                          <div className="flex items-center gap-1 w-6">{row.star} <Star size={10} className="fill-current" /></div>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${row.color} transition-all duration-1000`} 
                              style={{ width: `${barWidth}%` }}
                            ></div>
                          </div>
                          <div className="text-gray-400 w-10 text-right">{countDisplay.toLocaleString()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SIMILAR PRODUCTS WITH ARROW NAVIGATION */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm mb-6 relative group">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold">Similar Products</h3>
          </div>
          
          <div className="relative overflow-hidden">
            {/* Left Arrow - Only visible on hover */}
            <button 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 p-3 h-24 rounded-r-md shadow-[2px_0_10px_rgba(0,0,0,0.1)] border border-gray-200 hidden group-hover:flex items-center hover:bg-white transition-all"
            >
              <ChevronLeft size={28} className="text-gray-800" />
            </button>

            {/* Scroll Container */}
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto gap-2 p-4 no-scrollbar scroll-smooth"
            >
              {similarProducts.map(p => (
                <Link 
                  key={p._id || p.id} 
                  to={`/product/${p._id || p.id}`} 
                  className="min-w-[220px] max-w-[220px] p-4 border border-transparent hover:border-gray-100 hover:shadow-lg transition-all flex flex-col items-center bg-white"
                >
                  <div className="h-44 w-full flex items-center justify-center mb-4 transition duration-300">
                    <img src={p.imageURL} className="max-h-full max-w-full object-contain" alt={p.name} />
                  </div>
                  <p className="text-sm font-semibold text-center truncate w-full mb-1">{p.name}</p>
                  <div className="flex flex-col items-center gap-1">
                      <p className="text-[#388e3c] font-bold text-base">₹{p.finalPrice?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400 line-through">₹{p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Arrow - Only visible on hover */}
            <button 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/95 p-3 h-24 rounded-l-md shadow-[-2px_0_10px_rgba(0,0,0,0.1)] border border-gray-200 hidden group-hover:flex items-center hover:bg-white transition-all"
            >
              <ChevronRight size={28} className="text-gray-800" />
            </button>
          </div>
        </div>

        {/* YOU MIGHT BE INTERESTED IN */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm mb-10 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-[#fefefe] flex justify-between items-center">
            <h3 className="text-lg font-bold uppercase tracking-tight text-gray-600">You Might Be Interested In</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-l">
            {interestProducts.map((p) => (
              <Link key={p._id + "_interest"} to={`/product/${p._id || p.id}`} className="border-r border-b border-gray-100 p-8 flex flex-col items-center hover:shadow-[0_0_20px_rgba(0,0,0,0.15)] transition-all z-10 bg-white group">
                <div className="h-32 w-32 mb-6 flex items-center justify-center group-hover:scale-110 transition duration-300">
                  <img src={p.imageURL} className="max-h-full max-w-full object-contain" alt={p.name} />
                </div>
                <p className="text-sm font-bold text-[#2874f0] mb-1 group-hover:underline text-center">{p.brand || "Top Rated"}</p>
                <p className="text-[12px] text-[#388e3c] font-bold">From ₹{p.finalPrice?.toLocaleString()}</p>
                {/* <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-tighter text-center">Special Offer</p> */}
              </Link>
            ))}
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;