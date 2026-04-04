import { useState, useEffect } from "react";
import { ChevronLeftIcon, ArrowRightIcon, SparklesIcon, ClockIcon, CheckCircleIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";

const HelpCenter = () => {
  const [formData, setFormData] = useState({ orderId: "", issueType: "Delivery Delay", message: "" });
  
  // ✅ 1. Always initialize with an empty array
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    fetchMyComplaints(); 
  }, []);

  const fetchMyComplaints = async () => {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/user/my-complaints", {
      headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` }
    });
    const data = await res.json();
    
    // Agar data khud array hai toh theek, nahi toh check karo data.complaints ko
    if (Array.isArray(data)) {
      setMyComplaints(data);
    } else if (data && Array.isArray(data.complaints)) {
      setMyComplaints(data.complaints); // ✅ Agar backend { complaints: [] } bhej raha hai
    } else {
      setMyComplaints([]); 
    }
  } catch (err) { 
    setMyComplaints([]); 
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // Backend expect kar raha hai: issueType, orderId, message
  const payload = {
    orderId: formData.orderId || "N/A", // Matches data.get('orderId')
    issueType: formData.issueType,     // Matches data.get('issueType')
    message: formData.message          // Matches data.get('message')
  };

  try {
    const res = await fetch("http://127.0.0.1:5000/api/support/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("userToken")}`
      },
      body: JSON.stringify(payload) 
    });

    // ... baaki logic same
      if (res.ok) {
        Swal.fire({
          title: 'Request Received',
          text: 'Our support team has been notified and will contact you shortly.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          customClass: { popup: 'rounded-[2rem] font-sans' }
        });
        setFormData({ orderId: "", issueType: "Delivery Delay", message: "" });
        fetchMyComplaints();
      }
    } catch (err) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Connection Error', 
        text: 'Unable to reach the server. Please check your connection.' 
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] text-zinc-900 font-sans pb-20 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-5%] left-[-2%] w-[45%] h-[45%] bg-emerald-100/50 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[5%] right-[-2%] w-[35%] h-[35%] bg-teal-50/60 rounded-full blur-[100px]"></div>
      </div>

      <nav className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center">
        <button onClick={() => window.history.back()} className="group flex items-center gap-2 text-xs font-bold tracking-widest text-zinc-400 hover:text-emerald-600 transition-all">
          <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> BACK
        </button>
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse"></div>
            <h1 className="text-lg font-black tracking-widest uppercase">RetailX <span className="text-emerald-600">Care</span></h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Support Form */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-5">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-widest rounded-full">
                 <SparklesIcon className="w-4 h-4" /> 24/7 Priority Support
               </div>
               <h2 className="text-6xl font-black tracking-tighter text-zinc-900 leading-[1.1]">
                 How can we <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic font-serif font-medium">assist you?</span>
               </h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.02)] space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ModernInput 
                  label="Order Reference" 
                  placeholder="e.g. #RX-7890"
                  value={formData.orderId}
                  onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                />
                <div className="flex flex-col space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Issue Category</label>
                  <select 
                    className="bg-zinc-100/60 border-none p-5 text-base font-semibold rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all cursor-pointer appearance-none"
                    value={formData.issueType}
                    onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                  >
                    <option>Delivery Delay</option>
                    <option>Refund Request</option>
                    <option>Product Quality</option>
                    <option>Other Queries</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Detailed Description</label>
                <textarea 
                  rows="4"
                  className="bg-zinc-100/60 border-none p-6 text-base font-medium rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all resize-none"
                  placeholder="Please describe your issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 bg-zinc-900 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-emerald-600 hover:shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
              >
                {loading ? "PROCESSING..." : (
                  <>SEND MESSAGE <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </div>

          {/* Right: Activity Tracker */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/40 backdrop-blur-md border border-white/60 p-8 rounded-[3rem] shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">
                    Recent Activity
                   </h3>
                   <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-zinc-100 shadow-sm">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Live Tracker</span>
                   </div>
                </div>
                
                <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                {/* ✅ 3. Optional Chaining safely handles the map */}
                {myComplaints?.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="w-7 h-7" />
                    </div>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">No active tickets</p>
                  </div>
                ) : (
                  myComplaints?.map((ticket, i) => (
                    <div key={ticket._id || i} className="bg-white border border-zinc-100/50 p-6 rounded-3xl flex justify-between items-center group hover:border-emerald-200 transition-all hover:shadow-md">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{ticket.issue_type}</p>
                          <span className="text-[10px] text-zinc-300 font-mono">#{ticket._id?.slice(-4)}</span>
                        </div>
                        <p className="text-sm font-bold text-zinc-800 truncate max-w-[180px]">{ticket.message}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${ticket.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {ticket.status}
                      </div>
                    </div>
                  ))
                )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <ContactCard icon={<ClockIcon />} label="Response Time" value="< 2 Hours" color="text-teal-500" />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

// Helper Components...
const ModernInput = ({ label, ...props }) => (
  <div className="flex flex-col space-y-3">
    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
    <input 
      {...props}
      className="bg-zinc-100/60 border-none p-5 text-base font-semibold rounded-2xl focus:ring-2 ring-emerald-500/20 outline-none transition-all"
    />
  </div>
);

const ContactCard = ({ icon, label, value, color }) => (
  <div className="bg-white border border-white p-8 rounded-[2.5rem] hover:shadow-lg transition-all cursor-pointer group shadow-sm flex flex-col items-center text-center">
    <div className={`w-10 h-10 mb-4 p-2 rounded-xl bg-zinc-50 ${color} group-hover:scale-110 group-hover:bg-emerald-50 transition-all`}>{icon}</div>
    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xs font-black text-zinc-900">{value}</p>
  </div>
);

export default HelpCenter;