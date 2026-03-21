import { useEffect, useState } from "react";
import { 
  MapPin, ShoppingBag, Trash2, Edit3, CheckCircle, Mail, Phone, 
  ArrowLeft, CreditCard, Box, LogOut, Save, X, Plus, ChevronRight, Hash
} from "lucide-react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("userToken");

  const fetchDashboard = async () => {
    if (!token) {
      window.location.href = "/login";
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:5000/api/user/dashboard-data", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem("userToken");
        window.location.href = "/login";
        return;
      }
      const result = await res.json();
      if (res.ok) {
        setData(result);
        setProfileForm({ 
          name: result.user.name || "", 
          phone: result.user.contact?.phone || "" 
        });
      }
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/api/user/update-profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        setIsEditingProfile(false);
        fetchDashboard();
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteAddress = async (addrId) => {
    if (!window.confirm("Confirm deletion?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/user/delete-address/${addrId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchDashboard();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.location.href = "/login";
  };

  if (!data) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-6 h-6 border border-zinc-800 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-8 pt-32 pb-20">
        
        {/* TOP NAVIGATION / ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 border-b border-zinc-100 pb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase">
              <span className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse"></span>
              Secure Session
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-colors">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform"/> Return
            </button>
            <div className="w-px h-4 bg-zinc-200 self-center"></div>
            <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
              Terminate
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* PROFILE ARCHITECTURE */}
          <div className="lg:col-span-4 space-y-12">
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Identity</h2>
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
                    <Edit3 size={14} />
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="group">
                    <input 
                      className="w-full border-b border-zinc-200 py-2 focus:border-zinc-900 outline-none transition-all text-sm font-medium"
                      placeholder="NAME"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    />
                  </div>
                  <div className="group">
                    <input 
                      className="w-full border-b border-zinc-200 py-2 focus:border-zinc-900 outline-none transition-all text-sm font-medium"
                      placeholder="CONTACT"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="bg-zinc-900 text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all">
                      {loading ? "Syncing..." : "Commit Changes"}
                    </button>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="text-[10px] font-bold uppercase tracking-widest">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-zinc-900 flex items-center justify-center">
                      <img src={`https://ui-avatars.com/api/?name=${data.user.name}&background=18181b&color=fff&size=128`} alt="user" className="opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">{data.user.name}</h3>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Verified Account</p>
                    </div>
                  </div>
                  <div className="grid gap-4 text-sm">
                    <div className="flex justify-between border-b border-zinc-50 pb-2">
                      <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Email</span>
                      <span className="font-medium">{data.user.email}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-50 pb-2">
                      <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Phone</span>
                      <span className="font-medium">{data.user.contact?.phone || "Undefined"}</span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="pt-8 border-t border-zinc-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Logistics Hubs</h2>
              </div>
              <div className="space-y-4">
                {data.user.addresses?.map((addr) => (
                  <div key={addr.id || addr._id} className="group flex justify-between items-start p-4 bg-zinc-50 hover:bg-zinc-100 transition-colors border-l-2 border-transparent hover:border-zinc-900">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-wider">{addr.fullName}</p>
                      <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">{addr.address}</p>
                    </div>
                    <button onClick={() => deleteAddress(addr.id || addr._id)} className="text-zinc-300 hover:text-red-500 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* LEDGER / TRANSACTION SECTION */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* AGGREGATE STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-100 border border-zinc-100">
               <div className="bg-white p-10">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-4">Cumulative Expenditure</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-light">₹</span>
                    <span className="text-5xl font-bold tracking-tighter">
                    {data.orders?.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString() || 0}                    </span>
                  </div>
               </div>
               <div className="bg-white p-10 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-4">Registry Units</p>
                  <div className="flex justify-between items-end">
                    <span className="text-5xl font-bold tracking-tighter">{data.orders.length}</span>
                    <Box size={40} strokeWidth={1} className="text-zinc-200" />
                  </div>
               </div>
            </div>

            {/* LEDGER TABLE */}
            <section className="bg-white border border-zinc-100">
              <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-100">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Orders</h3>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-zinc-900 rounded-full"></div>
                  <div className="w-2 h-2 bg-zinc-200 rounded-full"></div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-50 text-left">
                      <th className="px-8 py-6">Index ID</th>
                      <th className="px-8 py-6">Fulfillment Date</th>
                      <th className="px-8 py-6">Status</th>
                      <th className="px-8 py-6 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {data.orders.map((order) => (
                      <tr key={order._id} className="group hover:bg-zinc-50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <Hash size={12} className="text-zinc-300" />
                             <span className="text-xs font-mono font-bold text-zinc-900">
                               {order._id.slice(-8).toUpperCase()}
                             </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-xs font-medium text-zinc-500">
                             {new Date(order.created_at).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-1.5">
                             <div className="w-1 h-1 bg-zinc-900 rounded-full"></div>
                             <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-900">order confirmed </span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <span className="text-sm font-bold tracking-tight">₹{order.total.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;