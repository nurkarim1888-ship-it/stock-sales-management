import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Phone, 
  MapPin, 
  Plus, 
  ArrowDownLeft, 
  FileText, 
  CheckCircle, 
  Printer,
  Calendar
} from 'lucide-react';
import { Salesman, DispatchSession } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';

interface DsrLedgerViewProps {
  salesmen: Salesman[];
  dispatches: DispatchSession[];
  onAddSalesman: (name: string, phone: string, route: string) => void;
  onCollectDueCash: (salesmanId: string, amount: number, note: string) => void;
  onOpenPrintSlip: (session: DispatchSession) => void;
}

export const DsrLedgerView: React.FC<DsrLedgerViewProps> = ({
  salesmen,
  dispatches,
  onAddSalesman,
  onCollectDueCash,
  onOpenPrintSlip,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDsrName, setNewDsrName] = useState('');
  const [newDsrPhone, setNewDsrPhone] = useState('');
  const [newDsrRoute, setNewDsrRoute] = useState('');

  // Collect due modal
  const [collectingDsr, setCollectingDsr] = useState<Salesman | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectNote, setCollectNote] = useState<string>('বাকি আদায় জমা');

  const [selectedDsrFilter, setSelectedDsrFilter] = useState<string>('all');

  const totalOutstandingDue = salesmen.reduce((sum, s) => sum + (s.currentDue || 0), 0);

  const handleCreateDsr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDsrName.trim()) return;
    onAddSalesman(newDsrName.trim(), newDsrPhone.trim(), newDsrRoute.trim());
    setNewDsrName('');
    setNewDsrPhone('');
    setNewDsrRoute('');
    setIsAddModalOpen(false);
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingDsr || collectAmount <= 0) return;
    onCollectDueCash(collectingDsr.id, collectAmount, collectNote);
    setCollectingDsr(null);
    setCollectAmount(0);
    setCollectNote('বাকি আদায় জমা');
  };

  const filteredDispatches = selectedDsrFilter === 'all'
    ? dispatches
    : dispatches.filter((d) => d.salesmanId === selectedDsrFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold mb-2 border border-teal-400/30">
              <Users className="w-4 h-4 text-teal-300" />
              <span>ডিএসআর ও কাস্টমার বাকির খাতা</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              সেলসম্যান তালিকা ও মোট বকেয়া (Due Ledger)
            </h2>
            <p className="text-teal-200 text-sm mt-1 max-w-2xl">
              প্রতিটি ডিএসআর-এর বর্তমান মোট বাকি, চালান ভিত্তিক লেনদেন এবং আলাদাভাবে বকেয়া টাকা আদায় ও জমা খাতা।
            </p>
          </div>

          <div className="flex gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-400 hover:bg-teal-500 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন ডিএসআর যোগ</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-teal-700/60 flex items-center gap-6">
          <div>
            <span className="text-xs text-teal-300 block mb-0.5">সর্বমোট অবশিষ্ট বকেয়া (Total Due)</span>
            <div className="text-3xl font-black text-amber-300">{formatCurrency(totalOutstandingDue)}</div>
          </div>
          <div className="h-10 w-px bg-teal-700/80"></div>
          <div>
            <span className="text-xs text-teal-300 block mb-0.5">মোট বিক্রয় প্রতিনিধি</span>
            <div className="text-3xl font-black text-white">{salesmen.length} জন</div>
          </div>
        </div>
      </div>

      {/* Salesman Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {salesmen.map((salesman) => {
          const dsrDispatches = dispatches.filter((d) => d.salesmanId === salesman.id);
          const hasDue = salesman.currentDue > 0;

          return (
            <div 
              key={salesman.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{salesman.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{salesman.route || 'রুট নির্ধারিত নেই'}</span>
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                    hasDue ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {hasDue ? 'বাকি আছে' : 'পরিশোধিত'}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      ফোন:
                    </span>
                    <span className="font-medium text-slate-800">{salesman.phone || 'দেওয়া হয়নি'}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200 pt-1.5">
                    <span className="text-slate-600 font-semibold">বর্তমান মোট বাকি:</span>
                    <span className={`text-base font-black ${hasDue ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatCurrency(salesman.currentDue)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                {hasDue && (
                  <button
                    onClick={() => {
                      setCollectingDsr(salesman);
                      setCollectAmount(salesman.currentDue);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>বাকি টাকা জমা নিন</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedDsrFilter(salesman.id)}
                  className="py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>চালানসমূহ ({dsrDispatches.length})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Historical DSR Dispatches Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>ডিএসআর চালান ও লেনদেন রেজিস্টার</span>
            </h3>
            <p className="text-xs text-slate-500">
              সকল ডেলিভারি চালান, বিক্রির মোট মূল্য, নগদ জমা ও অবশিষ্ট বাকি
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">ফিল্টার:</span>
            <select
              value={selectedDsrFilter}
              onChange={(e) => setSelectedDsrFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">সকল ডিএসআর</option>
              {salesmen.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 text-center">চালান নং</th>
                <th className="py-3 px-3">তারিখ</th>
                <th className="py-3 px-3">সেলসম্যানের নাম</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-3 text-right">মোট বিক্রয় মূল্য</th>
                <th className="py-3 px-3 text-right text-emerald-800">টাকা জমা</th>
                <th className="py-3 px-3 text-right text-rose-800">বাকি টাকা</th>
                <th className="py-3 px-3 text-center">স্লিপ প্রিন্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDispatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    কোনো চালান পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredDispatches.map((disp) => {
                  const isSettled = disp.status === 'settled';

                  return (
                    <tr key={disp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 text-center font-bold text-slate-700">
                        {disp.challanNo}
                      </td>

                      <td className="py-3 px-3 text-xs text-slate-600">
                        {formatDateBn(disp.date)}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {disp.salesmanName}
                        <span className="block text-[11px] text-slate-400 font-normal">{disp.salesmanRoute}</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          isSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isSettled ? 'ক্লোজড' : 'সকালে চালু'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        {formatCurrency(disp.totalAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-emerald-700">
                        {formatCurrency(disp.cashCollected)}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-rose-600">
                        {disp.dueAmount > 0 ? formatCurrency(disp.dueAmount) : '৳ ০'}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onOpenPrintSlip(disp)}
                          title="চালান স্লিপ প্রিন্ট করুন"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Collect Due Cash */}
      {collectingDsr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-emerald-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">বাকি টাকা জমা গ্রহণ</h3>
                <p className="text-xs text-emerald-100">{collectingDsr.name}</p>
              </div>
              <button 
                onClick={() => setCollectingDsr(null)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCollectSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-amber-800">মোট বর্তমান বাকি:</span>
                  <span className="font-black text-amber-950 text-sm">{formatCurrency(collectingDsr.currentDue)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">জমা টাকার পরিমাণ (৳) *</label>
                <input
                  type="number"
                  min="1"
                  max={collectingDsr.currentDue}
                  required
                  value={collectAmount || ''}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xl font-black rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">জমার বিবরণ / নোট</label>
                <input
                  type="text"
                  value={collectNote}
                  onChange={(e) => setCollectNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                টাকা জমা নেওয়ার পর অবশিষ্ট বাকি থাকবে:{' '}
                <span className="font-bold text-slate-900">
                  {formatCurrency(Math.max(0, collectingDsr.currentDue - collectAmount))}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCollectingDsr(null)}
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  জমা সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Salesman */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-teal-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">নতুন ডিএসআর যোগ করুন</h3>
                <p className="text-xs text-teal-100">বিক্রয় প্রতিনিধির তথ্য নিবন্ধন</p>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateDsr} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ আল-আমিন"
                  value={newDsrName}
                  onChange={(e) => setNewDsrName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  placeholder="যেমন: 01712-000000"
                  value={newDsrPhone}
                  onChange={(e) => setNewDsrPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">রুট / এরিয়া</label>
                <input
                  type="text"
                  placeholder="যেমন: রুট ৫: কলেজ রোড ও রেলওয়ে বাজার"
                  value={newDsrRoute}
                  onChange={(e) => setNewDsrRoute(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
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
