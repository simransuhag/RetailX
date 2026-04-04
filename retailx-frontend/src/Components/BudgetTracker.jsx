import React from 'react';
import { Wallet, AlertCircle, HelpCircle } from 'lucide-react'; // Ek icon extra add kiya hai

const BudgetTracker = ({ spent = 0, limit = 0, cartTotal = 0 }) => {
  // 1. Agar limit set nahi hai (0 ya null), toh flag true hoga
  const isLimitNotSet = !limit || limit <= 0;
  const displayLimit = limit > 0 ? limit : 0; 
  
  const totalImpact = spent + cartTotal;
  
  // 2. Progress calculations
  const spentWidth = isLimitNotSet ? 0 : (spent / displayLimit) * 100;
  const cartWidth = isLimitNotSet ? 0 : (cartTotal / displayLimit) * 100;
  
  const isOverBudget = !isLimitNotSet && totalImpact > displayLimit;
  const remaining = displayLimit - totalImpact;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-2 w-full">
      {/* Header - Agar limit set nahi hai toh Grayish rakhte hain */}
      <div className={`p-3 flex items-center justify-between ${
        isLimitNotSet ? 'bg-slate-50' : (isOverBudget ? 'bg-red-50' : 'bg-blue-50')
      }`}>
        <div className="flex items-center gap-2">
          <Wallet className={isLimitNotSet ? 'text-slate-400' : (isOverBudget ? 'text-red-600' : 'text-blue-600')} size={18} />
          <h3 className="font-bold text-slate-800 text-xs tracking-tight">Budget Tracker</h3>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
          isLimitNotSet ? 'bg-slate-200 text-slate-600' : (isOverBudget ? 'bg-red-200 text-red-700' : 'bg-blue-200 text-blue-700')
        }`}>
          {isLimitNotSet ? 'Budget Not Set' : (isOverBudget ? 'Limit Exceeded' : 'On Track')}
        </span>
      </div>

      <div className="p-4">
        {/* Labels */}
        <div className="flex justify-between items-end mb-3">
          <div className="flex gap-4">
            <div>
              <p className="text-blue-500 text-[9px] uppercase font-black mb-1">Paid</p>
              <p className="text-sm font-bold text-slate-700 leading-none">₹{spent.toLocaleString()}</p>
            </div>
            {cartTotal > 0 && (
              <div className="border-l border-slate-200 pl-4">
                <p className={`${isOverBudget ? 'text-red-500' : 'text-emerald-500'} text-[9px] uppercase font-black mb-1`}>Cart</p>
                <p className={`text-sm font-bold leading-none ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                  +₹{cartTotal.toLocaleString()}
                </p>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-[9px] uppercase font-black mb-1">Limit</p>
            {/* YAHAN CHANGE KIYA HAI: Agar limit 0 hai toh 'Not Set' dikhega */}
            <p className={`text-sm font-bold leading-none ${isLimitNotSet ? 'text-slate-400 italic' : 'text-slate-900'}`}>
              {isLimitNotSet ? 'Not Set' : `₹${displayLimit.toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* --- DUAL COLOR BAR --- */}
        <div className="flex w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner">
          {!isLimitNotSet ? (
            <>
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out border-r border-white/20 shrink-0"
                style={{ width: `${Math.min(spentWidth, 100)}%` }}
              />
              <div 
                className={`h-full transition-all duration-700 ease-in-out shrink-0 ${
                  isOverBudget ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(cartWidth, 100 - spentWidth)}%` }}
              />
            </>
          ) : (
            /* Empty state bar jab budget set na ho */
            <div className="w-full h-full bg-slate-200/50 flex items-center justify-center">
               <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold text-center">Set limit to track progress</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Paid</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">In Cart</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isLimitNotSet ? (
              <div className="flex items-center gap-1 text-slate-400">
                <HelpCircle size={12} />
                <p className="text-[10px] font-black uppercase italic">No Limit Active</p>
              </div>
            ) : isOverBudget ? (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle size={12} />
                <p className="text-[10px] font-black uppercase italic">Over ₹{Math.abs(remaining).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-[10px] font-black text-emerald-600 uppercase italic">₹{remaining.toLocaleString()} Safe</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;