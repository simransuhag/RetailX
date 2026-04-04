import { useEffect, useState } from "react";
import { 
  MapPin, ShoppingBag, Trash2, Edit3, CheckCircle, Mail, Phone, 
  ArrowLeft, CreditCard, Box, LogOut, Save, X, Plus, ChevronRight, Hash,
  UserCircle, Sparkles, Clock, ShieldCheck, LifeBuoy
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Assuming you use react-router for navigation
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import Swal from "sweetalert2";

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

    const phoneRegex = /^[6-9]\d{9}$/; 

    if (!profileForm.name.trim()) {
      return Swal.fire('Required', 'Please enter your full name.', 'warning');
    }

    if (!phoneRegex.test(profileForm.phone)) {
      return Swal.fire({
        icon: 'error',
        title: 'Invalid Contact Number',
        text: 'Please enter a valid 10-digit mobile number starting with 6-9.',
      });
    }

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
        await Swal.fire({ 
          icon: 'success', 
          title: 'Profile Updated Successfully', 
          showConfirmButton: false, 
          timer: 1500 
        });
        setIsEditingProfile(false);
        fetchDashboard();
      } else {
        const errData = await res.json();
        Swal.fire('Update Failed', errData.message || 'Unable to update profile.', 'error');
      }
    } catch (err) { 
      console.error(err);
      Swal.fire('Error', 'Server connection failed.', 'error');
    }
    setLoading(false);
  };

  const deleteAddress = async (addrId) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: "This address will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, remove it'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/user/delete-address/${addrId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) fetchDashboard();
      } catch (err) { console.error(err); }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    window.location.href = "/";
  };

  if (!data) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans">
      <Navbar />
      <main className="max-w-[1300px] mx-auto px-6 pt-32 pb-20">
        
        {/* DASHBOARD HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Account <span className="text-emerald-500">Overview</span></h1>
            <p className="text-zinc-500 mt-2 font-medium flex items-center gap-2">
               <ShieldCheck size={18} className="text-emerald-500" /> Secure session active
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-zinc-100">
            <button onClick={() => window.history.back()} className="p-3 hover:bg-zinc-50 rounded-xl transition-colors text-zinc-500">
              <ArrowLeft size={20} />
            </button>
            <div className="w-px h-6 bg-zinc-200"></div>
            
            {/* HELP CENTER BUTTON */}
            <button 
              onClick={() => navigate("/help-center")} 
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-100 transition-colors"
            >
              <LifeBuoy size={16} /> Help Center
            </button>

            <button onClick={handleLogout} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-colors">
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* PROFILE SECTION */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div className="relative">
                   <img 
                    src={`https://ui-avatars.com/api/?name=${data.user.name}&background=10b981&color=fff&size=128`} 
                    alt="profile" 
                    className="w-20 h-20 rounded-3xl shadow-inner object-cover"
                   />
                </div>
                {!isEditingProfile && (
                  <button 
                    onClick={() => setIsEditingProfile(true)} 
                    className="p-2 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-900"
                  >
                    <Edit3 size={18} />
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4 relative z-10">
                  <ModernInput 
                    label="Full Name" 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                  <ModernInput 
                    label="Contact Number" 
                    type="tel"
                    maxLength="10"
                    value={profileForm.phone} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setProfileForm({...profileForm, phone: val});
                    }}
                    placeholder="Mobile number"
                  />
                  <div className="flex gap-3 pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Save Changes"}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingProfile(false)} 
                      className="px-6 bg-zinc-100 text-zinc-500 rounded-2xl font-bold text-xs uppercase hover:bg-zinc-200 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-zinc-900">{data.user.name}</h3>
                    <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">Premium Member</p>
                  </div>
                  <div className="space-y-3">
                    <InfoRow icon={<Mail size={16}/>} label="Email Address" value={data.user.email} />
                    <InfoRow icon={<Phone size={16}/>} label="Contact" value={data.user.contact?.phone || "Not linked"} />
                  </div>
                </div>
              )}
            </div>

            {/* ADDRESS MANAGEMENT */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-lg text-zinc-900">Saved Addresses</h3>
                <button className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all">
                  <Plus size={18} />
                </button>
              </div>
              <div className="space-y-4">
                {data.user.addresses?.map((addr) => (
                  <div key={addr.id || addr._id} className="group flex justify-between items-start p-5 bg-zinc-50/50 rounded-3xl border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-all">
                    <div className="flex gap-4">
                      <div className="mt-1 p-2 bg-white rounded-xl shadow-sm text-emerald-500">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{addr.fullName}</p>
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{addr.address}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteAddress(addr.id || addr._id)} className="text-zinc-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* STATS & ORDER HISTORY */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard 
                label="Total Expenditure" 
                value={`₹${data.orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}`} 
                icon={<CreditCard className="text-emerald-500" />}
                trend="+12% from previous month"
              />
              <StatCard 
                label="Order Volume" 
                value={data.orders.length} 
                icon={<ShoppingBag className="text-teal-500" />}
                trend="Last transaction: 2 days ago"
              />
            </div>

            <div className="bg-white rounded-[2.5rem] border border-white shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/30">
                <h3 className="font-bold text-lg text-zinc-900">Order History</h3>
                <span className="px-4 py-1.5 bg-white rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-zinc-100">
                   Recent Activities ({data.orders.length})
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-zinc-50">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Reference ID</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Purchase Date</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Fulfillment</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {data.orders.map((order) => (
                      <tr key={order._id} className="group hover:bg-zinc-50/50 transition-colors">
                        <td className="px-8 py-6 font-mono text-xs font-bold text-emerald-600">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-8 py-6 text-sm text-zinc-600 font-medium">
                          {new Date(order.created_at).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase">
                            <CheckCircle size={10} /> Paid
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right font-bold text-zinc-900 text-base">
                          ₹{order.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ModernInput = ({ label, value, onChange, placeholder, ...props }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">{label}</label>
    <input 
      {...props}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="bg-zinc-50 border-none p-4 text-sm font-semibold rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all w-full text-zinc-800"
    />
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-4 bg-zinc-50/50 rounded-2xl border border-transparent">
    <div className="flex items-center gap-3 text-zinc-400">
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-sm font-bold text-zinc-700">{value}</span>
  </div>
);

const StatCard = ({ label, value, icon, trend }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-sm group hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-zinc-50 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
    </div>
    <div className="space-y-1">
      <h4 className="text-4xl font-bold tracking-tighter text-zinc-900">{value}</h4>
      <p className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
        <Clock size={12} /> {trend}
      </p>
    </div>
  </div>
);

export default UserDashboard;