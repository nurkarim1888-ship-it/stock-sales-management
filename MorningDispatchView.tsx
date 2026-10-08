import React, { useState } from 'react';
import { 
  Sun, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Calendar, 
  Clock, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Product, Salesman, DispatchSession } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MorningDispatchViewProps {
  products: Product[];
  salesmen: Salesman[];
  dispatches: DispatchSession[];
  onConfirmDispatch: (
    salesmanId: string,
    date: string,
    items: { productId: string; issuedQty: number }[],
    notes: string
  ) => void;
  onNavigateToEvening: (dispatchId?: string) => void;
  onAddSalesman: (name: string, phone: string, route: string) => void;
}

export const MorningDispatchView: React.FC<MorningDispatchViewProps> = ({
  products,
  salesmen,
  dispatches,
  onConfirmDispatch,
  onNavigateToEvening,
  onAddSalesman,
}) => {
  const [selectedSalesmanId, setSelectedSalesmanId] = useState<string>(
    salesmen.length > 0 ? salesmen[0].id : ''
  );
  const [dispatchDate, setDispatchDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');

  // Map of productId -> quantity to issue
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  // Modal for adding new salesman on the fly
  const [isAddDsrOpen, setIsAddDsrOpen] = useState(false);
  const [newDsrName, setNewDsrName] = useState('');
  const [newDsrPhone, setNewDsrPhone] = useState('');
  const [newDsrRoute, setNewDsrRoute] = useState('');

  // Active unsettled sessions
  const activeMorningSessions = dispatches.filter((d) => d.status === 'morning_issued');

  const handleQtyChange = (productId: string, val: string) => {
    const num = parseInt(val, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  // Quick preset helper
  const handleSetZeroAll = () => {
    setQuantities({});
  };

  // Calculate totals for currently entered quantities
  const selectedItemsSummary = products
    .filter((p) => (quantities[p.id] || 0) > 0)
    .map((p) => {
      const qty = quantities[p.id] || 0;
      return {
        product: p,
        qty,
        totalVal: qty * p.unitPrice,
        isOverStock: qty > p.stock,
      };
    });

  const hasExceededStock = selectedItemsSummary.some((item) => item.isOverStock);
  const totalIssuedCount = selectedItemsSummary.reduce((sum, i) => sum + i.qty, 0);
  const totalEstimatedValue = selectedItemsSummary.reduce((sum, i) => sum + i.totalVal, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSalesmanId) {
      alert('দয়া করে সেলসম্যান (DSR) নির্বাচন করুন!');
      return;
    }

    if (totalIssuedCount <= 0) {
      alert('অন্তত একটি পণ্যের জন্য বুঝিয়ে দেওয়া পরিমাণ লিখুন!');
      return;
    }

    if (hasExceededStock) {
      alert('সতর্কতা: স্টকের চেয়ে বেশি পরিমাণ পণ্য প্রদান করা যাবে না!');
      return;
    }

    const itemsToDispatch = selectedItemsSummary.map((item) => ({
      productId: item.product.id,
      issuedQty: item.qty,
    }));

    onConfirmDispatch(selectedSalesmanId, dispatchDate, itemsToDispatch, notes);

    // Reset form
    setQuantities({});
    setNotes('');
  };

  const handleCreateDsr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDsrName.trim()) return;
    onAddSalesman(newDsrName.trim(), newDsrPhone.trim(), newDsrRoute.trim());
    setNewDsrName('');
    setNewDsrPhone('');
    setNewDsrRoute('');
    setIsAddDsrOpen(false);
  };

  const selectedSalesman = salesmen.find((s) => s.id === selectedSalesmanId);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-amber-100 text-xs font-semibold mb-2">
            <Sun className="w-4 h-4 text-amber-200" />
            <span>সকালবেলার চালান প্রক্রিয়া</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            সেলসম্যানকে পণ্য বিতরণ (স্টক থেকে স্বয়ংক্রিয় বিয়োগ)
          </h2>
          <p className="text-amber-100 text-sm mt-1 max-w-2xl">
            সকালে ডিএসআরকে মালামাল বুঝিয়ে দেওয়ার সাথে সাথে মূল গুদামের বিক্রয়যোগ্য স্টক থেকে সেই পরিমাণ বিয়োগ হয়ে যাবে।
          </p>
        </div>
      </div>

      {/* Active Field Sessions Alert if any */}
      {activeMorningSessions.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-amber-900 text-base">
                আজ মাঠে সক্রিয় রয়েছে ({activeMorningSessions.length} জন সেলসম্যান)
              </h3>
            </div>
            <span className="text-xs text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full font-medium">
              দিনশেষে এদের হিসাব সম্পন্ন করতে হবে
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeMorningSessions.map((session) => (
              <div 
                key={session.id}
                className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{session.salesmanName}</h4>
                      <p className="text-xs text-slate-500">{session.salesmanRoute || 'রুট নির্ধারিত নেই'}</p>
                    </div>
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {session.challanNo}
                    </span>
                  </div>
                  <div className="mt-2.5 text-xs text-slate-600 flex justify-between bg-slate-50 p-2 rounded-lg">
                    <span>বিতরণকৃত আইটেম: {session.items.length} টি</span>
                    <span className="font-bold text-slate-800">
                      মূল্য: {formatCurrency(session.items.reduce((s, i) => s + (i.issuedQty * i.unitPrice), 0))}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateToEvening(session.id)}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>ফেরত ও সামারি হিসাব করুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Issue Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Top Controls: Salesman and Date */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">সেলসম্যান (DSR) নির্বাচন *</label>
              <button
                type="button"
                onClick={() => setIsAddDsrOpen(true)}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>নতুন ডিএসআর</span>
              </button>
            </div>
            <select
              value={selectedSalesmanId}
              onChange={(e) => setSelectedSalesmanId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            >
              {salesmen.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.route})
                </option>
              ))}
            </select>
            {selectedSalesman && (
              <p className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>মোবাইল: {selectedSalesman.phone || 'নেই'}</span>
                {selectedSalesman.currentDue > 0 && (
                  <span className="text-amber-700 font-bold">পূর্বের বাকি: {formatCurrency(selectedSalesman.currentDue)}</span>
                )}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">চালান তারিখ *</label>
            <div className="relative">
              <input
                type="date"
                required
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">চালান মন্তব্য / রুট নোট (ঐচ্ছিক)</label>
            <input
              type="text"
              placeholder="যেমন: আজকের বিশেষ অর্ডার ডেলিভারি"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Product Selection Table */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <span>পণ্য ও কোয়ান্টিটি এন্ট্রি</span>
              </h3>
              <p className="text-xs text-slate-500">
                সেলসম্যানকে যে পণ্যগুলো বুঝিয়ে দিচ্ছেন, ডানের ঘরে পরিমাণ লিখুন (স্বয়ংক্রিয়ভাবে স্টক থেকে বিয়োগ হবে)
              </p>
            </div>

            <button
              type="button"
              onClick={handleSetZeroAll}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              সব খালি করুন
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 text-center w-12">ক্র.</th>
                  <th className="py-3 px-3">পণ্যের নাম</th>
                  <th className="py-3 px-3 text-right">একক দর</th>
                  <th className="py-3 px-3 text-center">গুদামে বর্তমান স্টক</th>
                  <th className="py-3 px-3 text-center w-40 bg-amber-50/70 text-amber-900">
                    বুঝিয়ে দেওয়া পরিমাণ
                  </th>
                  <th className="py-3 px-3 text-right">মোট প্রাক্কলিত মূল্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product, idx) => {
                  const qty = quantities[product.id] || 0;
                  const itemVal = qty * product.unitPrice;
                  const isExceeded = qty > product.stock;

                  return (
                    <tr 
                      key={product.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        qty > 0 ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-xs text-slate-400 font-semibold">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {product.name}
                        <span className="block text-[11px] text-slate-400 font-normal">একক: {product.unit}</span>
                      </td>

                      <td className="py-3 px-3 text-right font-medium">
                        {formatCurrency(product.unitPrice)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {product.stock} {product.unit}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 bg-amber-50/30">
                        <div className="flex flex-col items-center">
                          <input
                            type="number"
                            min="0"
                            max={product.stock}
                            disabled={product.stock <= 0}
                            placeholder="0"
                            value={quantities[product.id] !== undefined && quantities[product.id] !== 0 ? quantities[product.id] : ''}
                            onChange={(e) => handleQtyChange(product.id, e.target.value)}
                            className={`w-28 text-center py-1.5 px-2 text-sm font-bold rounded-lg border ${
                              isExceeded 
                                ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-300' 
                                : qty > 0 
                                ? 'border-amber-500 bg-white text-amber-900 font-extrabold' 
                                : 'border-slate-300 bg-white'
                            } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          />
                          {isExceeded && (
                            <span className="text-[10px] text-rose-600 font-bold mt-1">
                              স্টক সীমিত! ({product.stock})
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {qty > 0 ? formatCurrency(itemVal) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Confirmation Bar */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs text-slate-400">বিতরণ সামারি:</div>
            <div className="flex items-center gap-4 text-sm">
              <span>মোট আইটেম: <strong className="text-amber-400">{selectedItemsSummary.length} টি</strong></span>
              <span>মোট পিস: <strong className="text-amber-400">{totalIssuedCount}</strong></span>
              <span>মোট প্রাক্কলিত মূল্য: <strong className="text-emerald-400 text-base">{formatCurrency(totalEstimatedValue)}</strong></span>
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <button
              type="submit"
              disabled={totalIssuedCount <= 0 || hasExceededStock}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                totalIssuedCount > 0 && !hasExceededStock
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/25 hover:scale-102'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>মালামাল বুঝিয়ে দিন ও স্টক বিয়োগ করুন</span>
            </button>
          </div>
        </div>
      </form>

      {/* MODAL: Quick Add DSR */}
      {isAddDsrOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-amber-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">নতুন সেলসম্যান (DSR) যোগ করুন</h3>
                <p className="text-xs text-amber-100">বিক্রয় প্রতিনিধির নাম ও রুট যোগ করুন</p>
              </div>
              <button 
                onClick={() => setIsAddDsrOpen(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDsr} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সেলসম্যানের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ কামরুল ইসলাম"
                  value={newDsrName}
                  onChange={(e) => setNewDsrName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  placeholder="যেমন: 01700-112233"
                  value={newDsrPhone}
                  onChange={(e) => setNewDsrPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">রুট / এলাকা</label>
                <input
                  type="text"
                  placeholder="যেমন: রুট ৪ - কলেজ গেট ও স্টেশন রোড"
                  value={newDsrRoute}
                  onChange={(e) => setNewDsrRoute(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDsrOpen(false)}
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
