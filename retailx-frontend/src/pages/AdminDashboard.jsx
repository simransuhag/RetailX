import { useState } from "react";
import {
  Users, ShoppingBag, Package, BarChart3, IndianRupee,
  ShieldCheck, Tag, LogOut, Bell, Search, 
  ChevronRight, ArrowUpRight, Plus, Command, Settings
} from "lucide-react";
import { Card, CardContent } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const [active, setActive] = useState("insights");

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-sans text-slate-900">
      
      {/* ---------- SIDEBAR (Balanced Width) ---------- */}
      <aside className="w-64 border-r border-slate-200/60 flex flex-col sticky top-0 h-screen bg-white">
        <div className="px-7 py-10 flex items-center gap-3">
          <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Command className="text-white h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">RetailX</span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={BarChart3} label="Insights" active={active === "insights"} onClick={() => setActive("insights")} />
          <SidebarItem icon={Users} label="Customers" active={active === "users"} onClick={() => setActive("users")} />
          <SidebarItem icon={Package} label="Inventory" active={active === "products"} onClick={() => setActive("products")} />
          <SidebarItem icon={IndianRupee} label="Payments" active={active === "orders"} onClick={() => setActive("orders")} />
          <SidebarItem icon={Tag} label="Promotions" active={active === "offers"} onClick={() => setActive("offers")} />
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-semibold">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ---------- MAIN WORKSPACE ---------- */}
      <main className="flex-1 flex flex-col">
        
        {/* HEADER (Standard 14px Text) */}
        <header className="h-20 border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1">
            <Search size={18} className="text-slate-400" />
            <input 
              placeholder="Quick search..." 
              className="text-sm font-medium outline-none w-72 placeholder:text-slate-400 bg-transparent" 
            />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative p-2 hover:bg-slate-50 rounded-full transition-colors cursor-pointer">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div className="h-10 w-10 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl w-full mx-auto">
          {/* PAGE TITLE (Visible 24px) */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 capitalize">{active}</h1>
              <p className="text-sm text-slate-500 mt-2 font-medium">Overview of your platform's performance and core metrics.</p>
            </div>
            <Button className="h-12 px-6 text-sm font-bold rounded-xl bg-[#059669] hover:bg-[#10b981] text-white shadow-md transition-transform active:scale-95">
              <Plus size={18} className="mr-2" /> Add New {active.slice(0, -1)}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {active === "insights" && <InsightsView />}
              {active === "users" && <UsersView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ---------- UI HELPERS ---------- */

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all text-sm font-bold ${
        active 
          ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" 
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      <Icon size={18} className={active ? "text-emerald-600" : "text-slate-400"} />
      <span>{label}</span>
    </div>
  );
}

function StatCard({ label, value, trend, up }) {
  return (
    <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-2xl bg-white p-8 group hover:shadow-xl transition-all duration-500">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</p>
      <div className="flex items-center justify-between">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {trend}
        </span>
      </div>
    </Card>
  );
}

/* ---------- PAGE VIEWS ---------- */

function InsightsView() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Platform Users" value="12,450" trend="+12%" up={true} />
        <StatCard label="Total Orders" value="3,210" trend="+5%" up={true} />
        <StatCard label="Revenue" value="₹8.2L" trend="+18%" up={true} />
      </div>
      
      
    </div>
  );
}

function UsersView() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-wider">User Account</th>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-center">Status</th>
            <th className="px-8 py-5 font-bold text-slate-500 uppercase text-[11px] tracking-wider text-right">Settings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {[{ n: "Amit Sharma", e: "amit@retailx.com" }, { n: "Riya Kapoor", e: "riya@retailx.com" }].map((u, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-900 rounded-xl text-white flex items-center justify-center font-bold text-xs uppercase">
                    {u.n.split(' ').map(x => x[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-[15px]">{u.n}</p>
                    <p className="text-xs text-slate-400 font-medium">{u.e}</p>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6 text-center">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-tighter">Verified</span>
              </td>
              <td className="px-8 py-6 text-right">
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors px-4 py-2 hover:bg-indigo-50 rounded-lg">Manage</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}