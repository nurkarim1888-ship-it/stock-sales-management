import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Calendar, 
  DollarSign, 
  Printer, 
  CheckCircle2 
} from 'lucide-react';
import { Salesman, DispatchSession } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';

interface OptionFourDsrSummaryViewProps {
  salesmen: Salesman[];
  dispatches: DispatchSession[];
  onCollectDueCash: (salesmanId: string, amount: number, note: string) => void;
  onOpenPrintSlip: (session: DispatchSession) => void;
}

export const OptionFourDsrSummaryView: React.FC<OptionFourDsrSummaryViewProps> = ({
  salesmen,
  dispatches,
  onCollectDueCash,
  onOpenPrintSlip,
}) => {
  const [selectedSummaryDate, setSelectedSummaryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summaryViewMode, setSummaryViewMode] = useState<'date' | 'all'>('date');
  const [dsrCashDeposits, setDsrCashDeposits] = useState<Record<string, number>>({});
  const [collectionError, setCollectionError] = useState<string | null>(null);

  // Distinct recorded dates across all dispatches
  const allRecordedDates = useMemo(() => {
    const setDates = new Set<string>();
    dispatches.forEach((d) => {
      if (d.date) setDates.add(d.date);
    });
    setDates.add(new Date().toISOString().split('T')[0]);
    return Array.from(setDates).sort().reverse();
  }, [dispatches]);

  // Dispatches for selected date
  const dispatchesForSelectedDate = useMemo(() => {
    return dispatches.filter((d) => d.date === selectedSummaryDate);
  }, [dispatches, selectedSummaryDate]);

  // Daily statistics for selected date
  const selectedDateStats = useMemo(() => {
    let sales = 0;
    let cash = 0;
    let due = 0;
    let returns = 0;
    let damage = 0;

    dispatchesForSelectedDate.forEach((d) => {
      sales += d.totalAmount || 0;
      cash += d.cashCollected || 0;
      due += d.dueAmount || 0;
      d.items?.forEach((i) => {
        returns += i.returnedQty || 0;
        damage += i.damageReturnedQty || 0;
      });
    });

    return { sales, cash, due, returns, damage };
  }, [dispatchesForSelectedDate]);

  const handleCollectDsrDue = (salesmanId: string) => {
    const amount = dsrCashDeposits[salesmanId] || 0;
    if (amount <= 0) {
      setCollectionError('দয়া করে জমার সঠিক পরিমাণ লিখুন!');
      setTimeout(() => setCollectionError(null), 3000);
      return;
    }
    setCollectionError(null);
    onCollectDueCash(salesmanId, amount, 'বাকি আদায় জমা');
    setDsrCashDeposits((prev) => ({ ...prev, [salesmanId]: 0 }));
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6 w-full">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <span>০৪. ডিএসআর সামারি ও তারিখ অনুযায়ী দৈনিক হিসাব</span>
          </h2>
          <p className="text-xs text-slate-500">
            প্রত্যেক দিনের হিসাব সংরক্ষিত রয়েছে — তারিখ নির্বাচন করে যেকোনো দিনের পূর্ণাঙ্গ হিসাব দেখুন
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSummaryViewMode('date')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              summaryViewMode === 'date'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📅 তারিখ অনুযায়ী হিসাব
          </button>
          <button
            type="button"
            onClick={() => setSummaryViewMode('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              summaryViewMode === 'all'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            👥 সার্বিক ডিএসআর বাকি
          </button>
        </div>
      </div>

      {collectionError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl animate-in fade-in">
          ⚠️ {collectionError}
        </div>
      )}

      {/* DATE SELECTOR BAR (AS EXPLICITLY REQUESTED: প্রত্যেক দিনের হিসাব জমা থাকবে যাতে তারিক অনুযায়ী দেখতে পারে) */}
      {summaryViewMode === 'date' && (
        <div className="bg-gradient-to-r from-teal-50 via-slate-50 to-indigo-50 p-4 rounded-2xl border border-teal-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-extrabold text-slate-800">তারিখ নির্বাচন করুন:</span>
              <input
                type="date"
                value={selectedSummaryDate}
                onChange={(e) => setSelectedSummaryDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white rounded-xl border border-teal-300 font-bold focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Quick Date Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedSummaryDate(new Date().toISOString().split('T')[0])}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                  selectedSummaryDate === new Date().toISOString().split('T')[0]
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                আজকের দিন
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 1);
                  setSelectedSummaryDate(d.toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              >
                গতকাল
              </button>
            </div>
          </div>

          {/* Selected Date Summary KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            <div className="bg-white p-2.5 rounded-xl border border-teal-200 text-center shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-bold">মোট বিক্রি</span>
              <strong className="text-xs sm:text-sm text-teal-950 font-black">
                {formatCurrency(selectedDateStats.sales)}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-center shadow-2xs">
              <span className="text-[10px] text-emerald-700 block font-bold">নগদ আদায়</span>
              <strong className="text-xs sm:text-sm text-emerald-700 font-black">
                {formatCurrency(selectedDateStats.cash)}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-rose-200 text-center shadow-2xs">
              <span className="text-[10px] text-rose-700 block font-bold">আজকের বাকি</span>
              <strong className="text-xs sm:text-sm text-rose-700 font-black">
                {formatCurrency(selectedDateStats.due)}
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-indigo-200 text-center shadow-2xs">
              <span className="text-[10px] text-indigo-700 block font-bold">ফেরত পণ্য</span>
              <strong className="text-xs sm:text-sm text-indigo-800 font-black">
                {selectedDateStats.returns} টি
              </strong>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-center shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] text-amber-800 block font-bold">ড্যামেজ পণ্য</span>
              <strong className="text-xs sm:text-sm text-amber-800 font-black">
                {selectedDateStats.damage} টি
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* DSR LIST FOR SELECTED DATE OR OVERALL */}
      <div className="space-y-5">
        <h3 className="text-xs font-bold text-slate-700">
          {summaryViewMode === 'date'
            ? `📅 ${formatDateBn(selectedSummaryDate)} তারিখের ডিএসআর চালান ও লেনদেন:`
            : '👥 সকল ডিএসআর-এর সার্বিক হিসাব ও বাকি বিবরণী:'}
        </h3>

        {summaryViewMode === 'date' && dispatchesForSelectedDate.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <p>এই তারিখে ({formatDateBn(selectedSummaryDate)}) কোনো চালান বা হিসাব পাওয়া যায়নি।</p>
            <p className="text-[11px] text-slate-400">নিচে সংরক্ষিত পূর্বের তারিখের তালিকা থেকে যেকোনো তারিখ নির্বাচন করতে পারেন।</p>
          </div>
        )}

        {/* DSR Cards */}
        {salesmen.map((salesman) => {
          const relevantDispatches = summaryViewMode === 'date'
            ? dispatches.filter((d) => d.salesmanId === salesman.id && d.date === selectedSummaryDate)
            : dispatches.filter((d) => d.salesmanId === salesman.id);

          if (summaryViewMode === 'date' && relevantDispatches.length === 0) {
            return null;
          }

          const latest = relevantDispatches[0];
          const depositVal = dsrCashDeposits[salesman.id] || 0;

          const totalSales = relevantDispatches.reduce((s, d) => s + (d.totalAmount || 0), 0);
          const totalCash = relevantDispatches.reduce((s, d) => s + (d.cashCollected || 0), 0);
          const due = summaryViewMode === 'date'
            ? relevantDispatches.reduce((s, d) => s + (d.dueAmount || 0), 0)
            : (salesman.currentDue || 0);

          return (
            <div
              key={salesman.id}
              className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4"
            >
              {/* DSR Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{salesman.name}</h3>
                  <p className="text-xs text-slate-500">
                    {salesman.route || 'সাধারণ রুট'} • ফোন: {salesman.phone || 'নেই'}
                  </p>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-black ${
                    due > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {due > 0 ? `বাকি: ${formatCurrency(due)}` : 'পরিশোধিত'}
                </span>
              </div>

              {/* Item Breakdown for dispatches */}
              {relevantDispatches.map((disp) => (
                <div
                  key={disp.id}
                  className="bg-white rounded-xl p-3 border border-slate-200 text-xs space-y-2"
                >
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5 font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px]">
                        {disp.challanNo}
                      </span>
                      <span>পণ্য তালিকা:</span>
                    </span>
                    <span className="text-[11px] text-slate-500">{formatDateBn(disp.date)}</span>
                  </div>

                  <div className="space-y-1 divide-y divide-slate-100">
                    {disp.items && disp.items.map((i) => (
                      <div key={i.productId} className="flex justify-between text-slate-700 pt-1">
                        <div>
                          <span className="font-bold">{i.productName}</span>
                          <span className="text-[11px] text-slate-500 ml-1.5">
                            (বিতরণ: {i.issuedQty}, ফেরত: {i.returnedQty || 0}, ড্যামেজ: {i.damageReturnedQty || 0}, বিক্রি: {i.soldQty})
                          </span>
                        </div>
                        <strong className="text-slate-900 shrink-0">{formatCurrency(i.totalAmount)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* ৩টি সামারি বক্স: টোটাল বিক্রয় মূল্য, মোট টাকা জমা, অবশিষ্ট বাকি টাকা (জমা দেওয়ার অপশনের উপরে) */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 block font-bold">টোটাল বিক্রয় মূল্য</span>
                  <strong className="text-xs sm:text-sm text-indigo-950 font-black">
                    {formatCurrency(totalSales)}
                  </strong>
                </div>

                <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-emerald-700 block font-bold">মোট টাকা জমা</span>
                  <strong className="text-xs sm:text-sm text-emerald-700 font-black">
                    {formatCurrency(totalCash)}
                  </strong>
                </div>

                <div className="bg-rose-50 p-2 rounded-lg border border-rose-200 shadow-2xs">
                  <span className="text-[10px] text-rose-700 block font-bold">অবশিষ্ট বাকি টাকা</span>
                  <strong className="text-xs sm:text-sm text-rose-700 font-black">
                    {formatCurrency(due)}
                  </strong>
                </div>
              </div>

              {/* Individual Cash Deposit Field (Directly Under the 3-Box Summary Banner) */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <span className="text-xs font-bold text-slate-700 block">
                  আলাদা টাকা জমা দেওয়ার অপশন ({salesman.name}):
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="জমা টাকা লিখুন (৳)"
                    value={depositVal > 0 ? depositVal : ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDsrCashDeposits((prev) => ({ ...prev, [salesman.id]: val }));
                    }}
                    className="flex-1 px-3 py-2 text-xs font-black rounded-xl border border-teal-400 bg-white focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleCollectDsrDue(salesman.id)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>জমা নিন</span>
                  </button>
                  {latest && (
                    <button
                      type="button"
                      onClick={() => onOpenPrintSlip(latest)}
                      className="p-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer"
                      title="ভাউচার প্রিন্ট"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {depositVal > 0 && (
                  <span className="text-[11px] text-teal-700 font-semibold block">
                    এই টাকা জমা নেওয়ার পর অবশিষ্ট বাকি থাকবে: {formatCurrency(Math.max(0, due - depositVal))}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* HISTORICAL DATES ARCHIVE: সংরক্ষিত সকল তারিখের খাতা তালিকা */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>সংরক্ষিত সকল তারিখের হিসাব তালিকা (তারিখে ক্লিক করে দেখুন):</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {allRecordedDates.map((dStr) => {
            const dayDispatches = dispatches.filter((d) => d.date === dStr);
            const daySales = dayDispatches.reduce((sum, d) => sum + (d.totalAmount || 0), 0);
            const dayCash = dayDispatches.reduce((sum, d) => sum + (d.cashCollected || 0), 0);
            const isCurrent = selectedSummaryDate === dStr && summaryViewMode === 'date';

            return (
              <button
                key={dStr}
                type="button"
                onClick={() => {
                  setSelectedSummaryDate(dStr);
                  setSummaryViewMode('date');
                }}
                className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <strong className="text-xs font-black block text-slate-900">{formatDateBn(dStr)}</strong>
                  <span className="text-[10px] text-slate-500 block">
                    {dayDispatches.length} টি চালান • বিক্রি: {formatCurrency(daySales)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded block">
                    আদায়: {formatCurrency(dayCash)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
