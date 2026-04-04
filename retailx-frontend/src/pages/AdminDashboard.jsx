import { useState, useEffect } from "react";
import { 
  Users, Package, BarChart3, Tag, LogOut, Bell, Search, Plus, Command, Clock, Trash2, ShoppingBag, CreditCard, CheckCircle, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* --- SHARED API HELPER --- */
const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    let token = localStorage.getItem("adminToken")?.replace(/^"(.*)"$/, '$1');
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    
    const res = await fetch(`http://127.0.0.1:5000${endpoint}`, config);
    
    if (!res.ok) {
      const errorData = await res.json();
      console.error("Backend Error:", errorData);
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
};

const getHeaders = () => {
  let token = localStorage.getItem("adminToken")?.replace(/^"(.*)"$/, '$1');
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
};

/* --- SUB-VIEW: COMPLAINTS (NEW) --- */
const ComplaintsView = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    const data = await apiRequest("/api/admin/complaints");
    if (data) setComplaints(data);
    setLoading(false);
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const res = await apiRequest("/api/admin/complaints/status", "PATCH", { 
      id: id, 
      status: newStatus 
    });

    if (res) {
      // UI update instantly without refresh
      setComplaints(complaints.map(c => c._id === id ? { ...c, status: newStatus } : c));
    } else {
      alert("Status update fail ho gaya!");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold">Loading Support Tickets...</div>;

  return (
    <div className="space-y-4">
      {complaints.map((c) => (
        <div key={c._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {c.status === 'Pending' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">{c.issue_type}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${c.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {c.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 italic">"{c.message}"</p>
              <div className="flex gap-4 mt-3 text-[11px] font-medium text-slate-400">
                <span className="flex items-center gap-1"><Users size={12}/> User ID: {c.user_id.slice(-6)}</span>
                <span className="flex items-center gap-1"><Package size={12}/> Order: {c.order_id}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end md:self-center">
            {c.status === "Pending" && (
              <button 
                onClick={() => handleUpdateStatus(c._id, "Resolved")}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                Mark Resolved
              </button>
            )}
            {c.status === "Resolved" && (
               <button 
               onClick={() => handleUpdateStatus(c._id, "Pending")}
               className="text-slate-400 hover:text-amber-600 px-4 py-2 text-sm font-bold transition-all"
             >
               Re-open
             </button>
            )}
          </div>
        </div>
      ))}
      {complaints.length === 0 && (
        <div className="p-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold">
          All clear! No pending complaints.
        </div>
      )}
    </div>
  );
};

/* --- VIEWS --- */
const UsersView = () => {
  const [users, setUsers] = useState([]);
  const fetchUsers = () => {
    fetch("http://127.0.0.1:5000/api/admin/users", { headers: getHeaders() })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []));
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) setUsers(users.filter((user) => user._id !== userId));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4 text-right">Action</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
              <td className="p-4 font-bold text-slate-700">{u.name || "Customer"}</td>
              <td className="p-4 text-slate-500 text-sm">{u.email}</td>
              <td className="p-4 text-right">
                <button onClick={() => handleDelete(u._id)} className="text-red-400 p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const OrdersView = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchOrders = async () => {
      let token = localStorage.getItem("adminToken")?.replace(/^"(.*)"$/, '$1');
      const res = await fetch(`http://127.0.0.1:5000/api/admin/orders`, { 
        headers: { "Authorization": `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    };
    fetchOrders();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      {data?.map(o => (
        <div key={o._id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><ShoppingBag size={20}/></div>
            <div>
              <p className="font-bold text-slate-800">{o.email}</p>
              <p className="text-xs text-slate-400">Order ID: {o._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-slate-900">${o.total}</p>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded uppercase tracking-tighter">{o.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const SellersView = () => {
  const [sellers, setSellers] = useState([]);
  const fetchSellers = () => {
    fetch("http://127.0.0.1:5000/api/admin/sellers", { headers: getHeaders() })
      .then(res => res.json())
      .then(data => setSellers(Array.isArray(data) ? data : []));
  };
  useEffect(() => { fetchSellers(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Remove this seller?")) {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/sellers/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (res.ok) setSellers(sellers.filter(s => s._id !== id));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <tr><th className="p-4">Store</th><th className="p-4">Reg ID</th><th className="p-4">Email</th><th className="p-4 text-right">Action</th></tr>
        </thead>
        <tbody>
          {sellers.map(s => (
            <tr key={s._id} className="border-b border-slate-50 hover:bg-slate-50/50">
              <td className="p-4 font-bold text-slate-800">{s.storeName}</td>
              <td className="p-4 text-xs font-mono text-slate-400">{s.registrationId}</td>
              <td className="p-4 text-slate-500 text-sm">{s.email}</td>
              <td className="p-4 text-right">
                <button onClick={() => handleDelete(s._id)} className="text-red-400 p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InsightsView = () => {
  const [stats, setStats] = useState({ users: 0, sellers: 0, products: 0, orders: 0, revenue: 0, pending_complaints: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await apiRequest("/api/admin/stats");
      if (data) setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Sellers", value: stats.sellers, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pending Support", value: stats.pending_complaints, icon: Bell, color: "text-red-600", bg: "bg-red-50" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold">Loading Stats...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`h-12 w-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4`}><card.icon size={24} /></div>
            <p className="text-slate-500 text-sm font-medium">{card.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>
      <div className="bg-slate-900 rounded-3xl p-8 text-white flex justify-between items-center relative overflow-hidden">
        <div className="z-10">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Gross Revenue</p>
          <h2 className="text-5xl font-black mt-2">₹{stats.revenue.toLocaleString()}</h2>
        </div>
        <BarChart3 size={80} className="opacity-20" />
      </div>
    </div>
  );
};

const DealsView = () => {
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", discount: "", expiry: "", category: "" });

  const loadData = async () => {
    const dealsData = await apiRequest("/api/admin_ops/deals");
    const catsData = await apiRequest("/api/admin_ops/categories");
    if (dealsData) setDeals(dealsData);
    if (catsData) setCategories(catsData);
  };
  useEffect(() => { loadData(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    const res = await apiRequest("/api/admin_ops/deals", "POST", formData);
    if (res) { setShowModal(false); loadData(); }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {deals.map(d => (
        <div key={d._id} className="bg-white p-6 rounded-2xl border border-slate-100 relative group">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase mb-2 inline-block">{d.category}</span>
          <h3 className="font-bold text-slate-900">{d.title}</h3>
          <p className="text-3xl font-black text-emerald-600 my-2">{d.discount}% OFF</p>
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Clock size={14}/> {d.expiry}</div>
        </div>
      ))}
      <button onClick={() => setShowModal(true)} className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-slate-400 hover:border-emerald-500 flex flex-col items-center justify-center">
        <Plus size={32}/><span className="font-bold mt-2">New Deal</span>
      </button>
      
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <form onSubmit={submit} className="bg-white p-8 rounded-3xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold">Create Deal</h3>
            <input placeholder="Title" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, title: e.target.value})} required />
            <select className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, category: e.target.value})} required>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Discount %" className="p-3 border rounded-xl" onChange={e => setFormData({...formData, discount: e.target.value})} required />
              <input type="date" className="p-3 border rounded-xl" onChange={e => setFormData({...formData, expiry: e.target.value})} required />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-slate-400 font-bold">Cancel</button>
              <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold">Publish</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* --- MAIN DASHBOARD --- */
export default function AdminDashboard() {
  const [active, setActive] = useState("insights");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/";
  };

  const menu = [
    { id: "insights", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Manage Users", icon: Users },
    { id: "sellers", label: "Manage Sellers", icon: Package },
    { id: "orders", label: "Global Orders", icon: Search },
    { id: "offers", label: "Platform Deals", icon: Tag },
    { id: "complaints", label: "Support", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-slate-900">
      <aside className="w-64 border-r border-slate-100 flex flex-col sticky top-0 h-screen bg-white">
        <div className="p-8 flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100"><Command size={24}/></div>
          <span className="font-black text-xl tracking-tighter">RETAIL<span className="text-emerald-600">X</span></span>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {menu.map(item => (
            <div key={item.id} onClick={() => setActive(item.id)} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all text-sm font-bold ${active === item.id ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm" : "text-slate-400 hover:bg-slate-50"}`}>
              <item.icon size={18}/> {item.label}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-12 max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight capitalize">{active.replace('_', ' ')}</h1>
            <p className="text-slate-400 font-medium">Platform management and monitoring.</p>
          </div>
          <div className="relative">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="h-12 w-12 bg-emerald-50 rounded-full border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition-all shadow-sm">
              <Users size={20} />
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-20">
                    <div className="px-4 py-2 border-b border-slate-50"><p className="text-xs font-black text-slate-400 uppercase">Admin</p></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold"><LogOut size={16} />Logout</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {active === "insights" && <InsightsView />}
            {active === "users" && <UsersView />}
            {active === "orders" && <OrdersView />}
            {active === "offers" && <DealsView />}
            {active === "sellers" && <SellersView />}
            {active === "complaints" && <ComplaintsView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}