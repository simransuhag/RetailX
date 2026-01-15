import React, { useState, useEffect, useCallback } from 'react'; 
import { 
  LayoutDashboard, Package, ShoppingCart, User, Plus, Trash2, Edit, 
  Search, Box, DollarSign, Command, Star, X, Save, LogOut, 
  ShieldCheck, Image as ImageIcon, PlusCircle, Minus, MapPin, Phone, Lock, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

// --- STYLE VARIABLE ---
const inputStyle = "w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 transition-all outline-none shadow-sm";

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [sellerData, setSellerData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false); // Add this at the top with other states


  const API_BASE = "http://localhost:5000";

  // --- 🛠️ INITIAL PRODUCT STATE (BACKEND ALIGNED) ---
  const initialProduct = {
    name: '', 
    price: '', 
    category: '', 
    subCategory: '', // Capital 'C' for backend sync
    stock: '', 
    description: '', 
    brand: '', 
    imageURL: '', 
    discount: 0, 
    tags: '',
    highlights: [''], 
    specs: { }
  };
  const [newProduct, setNewProduct] = useState(initialProduct);

  // --- 🔄 FETCH DATA ---
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("sellerToken");
    if (!token) { navigate("/seller-auth"); return; }
    try {
      setLoading(true);
      // Profile Fetch
      const sRes = await fetch(`${API_BASE}/api/seller/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Inventory Fetch (FIXED URL)
      const pRes = await fetch(`${API_BASE}/api/seller/inventory`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (sRes.status === 401 || pRes.status === 401) throw new Error("Unauthorized");

      const sData = await sRes.json();
      const pData = await pRes.json();
      
      setSellerData(sData);
      setProducts(Array.isArray(pData) ? pData : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      if (err.message === "Unauthorized") navigate("/seller-auth");
    } finally { setLoading(false); }
  }, [navigate]); 

  useEffect(() => { fetchData(); }, [fetchData]); 
  

  // --- ➕ ADD / EDIT PRODUCT ---
 // --- ➕ ADD / EDIT PRODUCT (FULLY UPDATED) ---
const handleSubmitProduct = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("sellerToken");

  // Logic: Tags ko clean karke bhej rahe hain
  const formattedProduct = {
    ...newProduct,
    tags: typeof newProduct.tags === 'string' 
      ? newProduct.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "") 
      : newProduct.tags
  };

  const url = editingProduct 
    ? `${API_BASE}/api/seller/product/update/${editingProduct._id}`
    : `${API_BASE}/api/seller/product/add`;
  
  try {
    const res = await fetch(url, {
      method: editingProduct ? 'PUT' : 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify(formattedProduct) // Corrected data bhej rahe hain
    });

    if (res.ok) { 
      setIsModalOpen(false); 
      setEditingProduct(null);
      fetchData(); 
      Swal.fire('Success', 'Product details saved successfully!', 'success');
      setNewProduct(initialProduct);
    } else {
      const errorData = await res.json();
      Swal.fire('Error', errorData.message || 'Action failed', 'error');
    }
  } catch (err) { 
    console.error("Submit Error:", err);
    Swal.fire('Error', 'Connection failed with server', 'error'); 
  }
};

  // --- 🗑️ DELETE PRODUCT ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete ?',
      text: "Are you sure you want to delete this product? This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete'
    });

    if(result.isConfirmed){
      const token = localStorage.getItem("sellerToken");
      try {
        const res = await fetch(`${API_BASE}/api/seller/product/delete/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok){          
          fetchData();
          Swal.fire('Deleted!', 'Product is removed.', 'success');
        }
      } catch (err) { Swal.fire('Error', 'Delete failed', 'error'); }
    }
  };

  // --- 📦 UPDATE STOCK ---
  const updateStock = async (id, currentStock, change) => {
    const newStockVal = Math.max(0, currentStock + change);
    const token = localStorage.getItem("sellerToken");
    try {
      const res = await fetch(`${API_BASE}/api/seller/product/update-stock/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ stock: newStockVal })
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: newStockVal } : p));
      }
    } catch (err) { console.error("Stock update failed"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-emerald-600 animate-pulse uppercase italic tracking-widest">RetailX Syncing...</div>;

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
        <div className="px-8 py-12 flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Command className="text-white h-6 w-6" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">RetailX</span>
        </div>
        <nav className="flex-1 px-4 space-y-3">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <NavItem icon={Box} label="Inventory" active={activeTab === 'Inventory'} onClick={() => setActiveTab('Inventory')} />
          <NavItem icon={ShoppingCart} label="Orders" active={activeTab === 'Orders'} onClick={() => setActiveTab('Orders')} />
          <NavItem icon={User} label="Profile Settings" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
        </nav>
        <div className="p-8 border-t bg-slate-50/50">
          <button onClick={() => { localStorage.clear(); navigate("/seller-auth"); }} className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-black text-xs uppercase tracking-widest">
            <span>Sign Out</span> <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-24 px-12 flex items-center justify-end bg-white/60 backdrop-blur-xl border-b border-slate-200">
          <div className="relative">
            <button 
              onClick={() => setShowLogout(!showLogout)}
              className="flex items-center gap-4 group hover:bg-slate-50 p-2 rounded-2xl transition-all cursor-pointer"
            >
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none mb-1">{sellerData?.storeName}</p>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Seller</p>
              </div>
              <div className="relative">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${sellerData?.storeName}`} 
                  className="h-12 w-12 rounded-2xl ring-4 ring-emerald-50 group-hover:ring-emerald-100 transition-all" 
                  alt="avatar" 
                />
                {/* Active Status Dot */}
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
            </button>

            {/* LOGOUT DROPDOWN */}
            <AnimatePresence>
              {showLogout && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div className="fixed inset-0 z-10" onClick={() => setShowLogout(false)}></div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-56 bg-white border border-slate-200 rounded-3xl shadow-2xl z-20 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                      <p className="text-xs font-bold text-slate-600 truncate">{sellerData?.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        navigate("/seller-auth");
                      }}
                      className="w-full flex items-center gap-3 px-6 py-4 text-red-500 hover:bg-red-50 transition-colors text-xs font-black uppercase tracking-widest"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-12 bg-gradient-to-br from-slate-50 to-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">{activeTab}</h1>
                <p className="text-slate-400 font-bold mt-2">Manage your business operations here.</p>
              </div>
              {activeTab === 'Inventory' && (
                <button onClick={() => { setEditingProduct(null); setNewProduct(initialProduct); setIsModalOpen(true); }} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200">
                  <PlusCircle size={20} /> Add Product
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    {activeTab === 'Overview' && <OverviewView products={products} />}
                    {activeTab === 'Inventory' && (
                    <InventoryView 
                      products={products} 
                      onDelete={handleDelete} 
                      onUpdateStock={updateStock} 
                      onEdit={(p) => { 
                        const productToEdit = {
                          ...p,
                          // Backend ke Array [a, b] ko Frontend ke liye "a, b" string mein convert kiya
                          tags: Array.isArray(p.tags) ? p.tags.join(', ') : (p.tags || '') 
                        };
                        setEditingProduct(p); 
                        setNewProduct(productToEdit); 
                        setIsModalOpen(true); 
                      }} 
                    />
                  )}
                    {/* Placeholder components */}
                    {activeTab === 'Orders' && <div className="p-20 text-center font-black opacity-20 italic">No Orders Yet</div>}
                    {activeTab === 'Profile' && <ProfileView seller={sellerData} />}
                </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] shadow-full w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-12 py-8 border-b flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Package size={24}/></div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">{editingProduct ? "Update Listing" : "Create New Listing"}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmitProduct} className="flex-1 overflow-y-auto p-12 grid grid-cols-12 gap-12">
                <div className="col-span-4 space-y-6">
                  <div className="group relative aspect-square bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-emerald-400">
                    {newProduct.imageURL ? (
                      <img src={newProduct.imageURL} className="h-full w-full object-cover p-2 rounded-[2.5rem]" alt="Preview" />
                    ) : (
                      <div className="text-center p-8">
                        <div className="mx-auto h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                            <ImageIcon className="text-slate-300" size={40} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-loose">No Preview Available</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Image Destination URL</label>
                    <input required placeholder="https://example.com/image.jpg" value={newProduct.imageURL} onChange={(e) => setNewProduct({...newProduct, imageURL: e.target.value})} className="w-full bg-slate-50 p-5 rounded-3xl text-xs font-bold ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                  </div>
                </div>

                <div className="col-span-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <FormGroup label="Product Name">
                        <input required placeholder="e.g. Nike Air Max" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className={inputStyle} />
                    </FormGroup>
                    <FormGroup label="Brand">
                        <input placeholder="e.g. Nike" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} className={inputStyle} />
                    </FormGroup>
                  </div>
                  

                  <div className="grid grid-cols-3 gap-6">
                    <FormGroup label="Price (₹)">
                        <input required type="number" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className={inputStyle} />
                    </FormGroup>
                    <FormGroup label="Stock Qty">
                        <input required type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className={inputStyle} />
                    </FormGroup>
                    <FormGroup label="Discount %">
                        <input type="number" value={newProduct.discount} onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})} className={inputStyle} />
                    </FormGroup>
                  </div>

                  <FormGroup label="Description">
                    <textarea required rows="4" placeholder="Describe your product..." value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className={`${inputStyle} resize-none`} />
                  </FormGroup>

                  {/* --- CATEGORY & SUB-CATEGORY SECTION --- */}
                  <div className="grid grid-cols-2 gap-6">
                    <FormGroup label="Category">
                      <input 
                        required 
                        placeholder="e.g. Electronics" 
                        value={newProduct.category} 
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} 
                        className={inputStyle} 
                      />
                    </FormGroup>

                    <FormGroup label="Sub Category">
                      <input 
                        placeholder="e.g. Smartphones" 
                        value={newProduct.subCategory} 
                        onChange={(e) => setNewProduct({...newProduct, subCategory: e.target.value})} 
                        className={inputStyle} 
                      />
                    </FormGroup>
                  </div>

                  {/* --- TAGS SECTION --- */}
                  <div className="mt-6">
                    <FormGroup label="Search Tags">
                      <input 
                        placeholder="e.g. apple, iphone, mobile (comma separated)" 
                        value={newProduct.tags} 
                        // React state update karte waqt (Simple comma separation)
                        onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})}
                        // onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})} 
                        className={inputStyle} 
                      />
                    </FormGroup>
                  </div>

                    <div className="grid grid-cols-1 gap-6 mt-4">
                    {/* --- PRO HIGHLIGHTS SECTION --- */}
                    <div className="space-y-4 pt-8 border-t border-slate-100">
                      <div className="flex justify-between items-center px-4">
                        <div>
                          <label className="text-[11px] font-black uppercase text-emerald-600 tracking-widest">Product Highlights</label>
                          <p className="text-[10px] text-slate-400 font-bold">Key features that sell your product</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setNewProduct({...newProduct, highlights: [...newProduct.highlights, '']})}
                          className="flex items-center gap-2 text-[10px] font-black bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          <Plus size={14} /> ADD POINT
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {newProduct.highlights.map((h, i) => (
                          <div key={i} className="group flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="flex-1 relative">
                              <input 
                                placeholder={`Highlight Point #${i+1} (e.g. 48 Hours Battery Life)`} 
                                value={h} 
                                onChange={(e) => {
                                  const newH = [...newProduct.highlights];
                                  newH[i] = e.target.value;
                                  setNewProduct({...newProduct, highlights: newH});
                                }} 
                                className={`${inputStyle} !p-4 !bg-white border-slate-100 group-hover:border-emerald-200`} 
                              />
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setNewProduct({...newProduct, highlights: newProduct.highlights.filter((_, idx) => idx !== i)})}
                              className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            >
                              <Trash2 size={18}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* --- PRO TECHNICAL SPECS SECTION --- */}
                    <div className="space-y-4 pt-8 border-t border-slate-100 mt-8">
                      <div className="flex justify-between items-center px-4">
                        <div>
                          <label className="text-[11px] font-black uppercase text-emerald-600 tracking-widest">Technical Specifications</label>
                          <p className="text-[10px] text-slate-400 font-bold">Specific data like Material, Weight, etc.</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            // Bina prompt ke ek empty row add karna
                            const tempId = Date.now(); // Unique key for empty state
                            setNewProduct({...newProduct, specs: {...newProduct.specs, [`New Spec ${tempId}`]: ''}});
                          }}
                          className="flex items-center gap-2 text-[10px] font-black bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                          <PlusCircle size={14} /> ADD SPECIFICATION
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(newProduct.specs).map(([key, val], index) => (
                          <div key={index} className="flex gap-2 p-4 bg-slate-50/50 rounded-[2rem] border border-transparent hover:border-slate-200 transition-all group">
                            <div className="flex-1 space-y-2">
                              {/* Editable Key */}
                              <input 
                                placeholder="Label (e.g. Material)" 
                                value={key.startsWith('New Spec') ? '' : key} 
                                onChange={(e) => {
                                  const newSpecs = { ...newProduct.specs };
                                  const newValue = newSpecs[key];
                                  delete newSpecs[key];
                                  newSpecs[e.target.value] = newValue;
                                  setNewProduct({...newProduct, specs: newSpecs});
                                }}
                                className="w-full bg-transparent text-[10px] font-black uppercase text-slate-400 outline-none border-b border-transparent focus:border-emerald-300"
                              />
                              {/* Value */}
                              <input 
                                placeholder="Value (e.g. Stainless Steel)" 
                                value={val} 
                                onChange={(e) => setNewProduct({...newProduct, specs: {...newProduct.specs, [key]: e.target.value}})}
                                className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none" 
                              />
                            </div>
                            <button 
                              type="button" 
                              onClick={() => {
                                const newSpecs = {...newProduct.specs};
                                delete newSpecs[key];
                                setNewProduct({...newProduct, specs: newSpecs});
                              }}
                              className="self-center p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                            >
                              <X size={16}/>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-emerald-600 transition-all uppercase tracking-[0.2em] shadow-2xl shadow-emerald-100 flex items-center justify-center gap-4">
                    {editingProduct ? "Update Inventory" : "Push to Live Market"} <ChevronRight size={20}/>
                  </button>
                </div>
                </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---
const FormGroup = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-emerald-600 ml-4 tracking-widest">{label}</label>
        {children}
    </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-6 py-5 rounded-[1.5rem] transition-all group ${active ? "bg-emerald-600 text-white shadow-xl shadow-emerald-100" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}>
    <div className="flex items-center gap-4">
        <Icon size={20} className={active ? "text-white" : "group-hover:text-emerald-600"} />
        <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </div>
    {active && <motion.div layoutId="dot" className="h-1.5 w-1.5 bg-white rounded-full" />}
  </button>
);

const InventoryView = ({ products, onDelete, onUpdateStock, onEdit }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
    <table className="w-full text-left">
      <thead className="bg-slate-50/80 border-b border-slate-200">
        <tr>
          <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Product info</th>
          <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Pricing</th>
          <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Live Stock</th>
          <th className="px-10 py-6 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {products.map(p => (
          <tr key={p._id} className="group hover:bg-slate-50/50 transition-colors">
            <td className="px-10 py-6">
              <div className="flex items-center gap-5">
                <img src={p.imageURL} className="h-16 w-16 rounded-2xl object-cover border border-slate-100 shadow-sm" alt="" />
                <div>
                  <p className="font-black text-slate-900 text-base">{p.name}</p>
                  <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{p.category} • {p.brand}</p>
                </div>
              </div>
            </td>
            <td className="px-10 py-6">
              <p className="font-black text-lg text-slate-900">₹{p.price}</p>
              {p.discount > 0 && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-black uppercase">{p.discount}% OFF</span>}
            </td>
            <td className="px-10 py-6">
              <div className="flex items-center justify-center gap-4 bg-white border border-slate-200 w-fit mx-auto px-4 py-2 rounded-2xl shadow-sm">
                <button onClick={() => onUpdateStock(p._id, p.stock, -1)} className="text-slate-400 hover:text-red-500 transition-colors"><Minus size={16}/></button>
                <span className="font-black text-slate-900 min-w-[20px] text-center">{p.stock}</span>
                <button onClick={() => onUpdateStock(p._id, p.stock, 1)} className="text-slate-400 hover:text-emerald-500 transition-colors"><Plus size={16}/></button>
              </div>
            </td>
            <td className="px-10 py-6 text-right">
              <div className="flex justify-end gap-2">
                <button onClick={() => onEdit(p)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Edit size={16}/></button>
                <button onClick={() => onDelete(p._id)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {products.length === 0 && (
        <div className="p-20 text-center flex flex-col items-center">
            <Box size={48} className="text-slate-200 mb-4" />
            <p className="text-slate-400 font-black uppercase text-xs tracking-widest italic">No products in inventory yet</p>
        </div>
    )}
  </div>
);

const OverviewView = ({ products }) => (
  <div className="grid grid-cols-4 gap-8">
    <StatCard label="Total Inventory" value={products.length} icon={Box} color="emerald" />
    <StatCard label="Live Revenue" value="₹0" icon={DollarSign} color="slate" />
    <StatCard label="Active Orders" value="0" icon={ShoppingCart} color="slate" />
    {/* <StatCard label="Trust Score" value="100%" icon={Star} color="emerald" /> */}
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
    <div className={`h-12 w-12 ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-900'} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <Icon size={24}/>
    </div>
    <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">{label}</p>
    <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
  </div>
);

const ProfileView = ({ seller }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        storeName: "",
        email: "",
        registrationId: "",
        contactNumber: "",
        businessAddress: "",
        gstin: "",
        businessType: "Individual"
    });

    useEffect(() => {
        if (seller) {
            setFormData({
                storeName: seller.storeName || "",
                email: seller.email || "",
                registrationId: seller.registrationId || "",
                contactNumber: seller.contactNumber || "",
                businessAddress: seller.businessAddress || "",
                gstin: seller.gstin || "",
                businessType: seller.businessType || "Individual"
            });
        }
    }, [seller]);

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("sellerToken");
            const res = await fetch(`http://localhost:5000/api/seller/profile/update`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Profile is updated!',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
                setEditMode(false);
            } else {
                Swal.fire('Error', data.message || 'Update cannot be done!', 'error');
            }
        } catch (err) {
            console.error("Update Error:", err);
            Swal.fire('Error', 'Cannot connect to server!', 'error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] border shadow-sm p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
                <div className="h-32 w-32 rounded-full bg-slate-900 flex items-center justify-center text-white text-5xl font-black shadow-xl ring-4 ring-slate-50">
                    {formData.storeName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900 italic uppercase">{formData.storeName}</h2>
                    <p className="text-slate-400 font-bold mb-4">{formData.email}</p>
                    <button 
                        onClick={() => editMode ? handleSave() : setEditMode(true)}
                        className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${
                            editMode ? "bg-emerald-500 text-white" : "bg-slate-900 text-white"
                        }`}
                    >
                        {editMode ? "SAVE ALL CHANGES" : "EDIT PROFILE"}
                    </button>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest border-b pb-2">Business Info</h3>
                    <DetailField label="Store Name" value={formData.storeName} editable={editMode} onChange={(e) => setFormData({...formData, storeName: e.target.value})} />
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">Registration ID <Lock size={10}/></label>
                        <p className="p-4 bg-slate-50 text-slate-400 rounded-2xl text-sm font-bold border border-dashed italic cursor-not-allowed">{formData.registrationId}</p>
                    </div>

                    <DetailField label="Business Type" value={formData.businessType} editable={editMode} onChange={(e) => setFormData({...formData, businessType: e.target.value})} />
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-4">
                    <h3 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest border-b pb-2">Compliance & Contact</h3>
                    <DetailField label="GSTIN Number" value={formData.gstin} editable={editMode} onChange={(e) => setFormData({...formData, gstin: e.target.value})} />
                    <DetailField label="Contact Number" value={formData.contactNumber} editable={editMode} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} />
                    <DetailField label="Store Address" value={formData.businessAddress} editable={editMode} onChange={(e) => setFormData({...formData, businessAddress: e.target.value})} />
                </div>
            </div>
        </div>
    );
};

const DetailField = ({ label, value, editable, onChange, placeholder }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
        {editable ? (
            <input 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                className="w-full p-4 bg-slate-50 border-2 border-emerald-100 focus:border-emerald-500 rounded-2xl text-sm font-bold outline-none transition-all" 
            />
        ) : (
            <p className="text-sm font-black text-slate-800 bg-slate-50/50 p-4 rounded-2xl border border-transparent">
                {value || <span className="text-slate-300 italic">Not set</span>}
            </p>
        )}
    </div>
);



const OrdersView = () => (
  <div className="py-20 bg-white rounded-[3rem] border-2 border-dashed flex flex-col items-center">
    <ShoppingCart className="text-slate-100 mb-4" size={48} />
    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Waiting for customer traffic...</p>
  </div>
);

export default SellerDashboard;