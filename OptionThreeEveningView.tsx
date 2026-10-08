import React, { useState, useMemo, useEffect } from 'react';
import { 
  Moon, 
  CheckCircle2, 
  Printer, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { Product, Salesman, DispatchSession, DispatchItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface OptionThreeEveningViewProps {
  products: Product[];
  salesmen: Salesman[];
  dispatches: DispatchSession[];
  morningQuantities: Record<string, number>;
  onSettleDispatch: (
    dispatchId: string | null,
    updatedItems: DispatchItem[],
    cashCollected: number,
    notes: string,
    extraInfo?: {
      salesmanId: string;
      date: string;
    }
  ) => void;
  onOpenPrintSlip: (session: DispatchSession) => void;
  onNavigateToPage4: () => void;
}

export const OptionThreeEveningView: React.FC<OptionThreeEveningViewProps> = ({
  products,
  salesmen,
  dispatches,
  morningQuantities,
  onSettleDispatch,
  onOpenPrintSlip,
  onNavigateToPage4,
}) => {
  const [eveningSalesmanId, setEveningSalesmanId] = useState<string>(salesmen[0]?.id || '');
  const [eveningDate, setEveningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [eveningNotes, setEveningNotes] = useState<string>('');
  const [eveningCashInput, setEveningCashInput] = useState<number>(0);

  // Side-by-side inputs for each product: issuedQty, returnQty, damageQty
  const [itemsState, setItemsState] = useState<
    Record<string, { issuedQty: number; returnQty: number; damageQty: number }>
  >({});

  // Check if a morning dispatch exists for this salesman on this date
  const matchedMorningSession = useMemo(() => {
    return (
      dispatches.find(
        (d) => d.salesmanId === eveningSalesmanId && d.date === eveningDate && d.status === 'morning_issued'
      ) ||
      dispatches.find((d) => d.salesmanId === eveningSalesmanId && d.date === eveningDate)
    );
  }, [dispatches, eveningSalesmanId, eveningDate]);

  // Sync inputs whenever salesman or date changes
  useEffect(() => {
    if (matchedMorningSession && matchedMorningSession.items) {
      const initialMap: Record<string, { issuedQty: number; returnQty: number; damageQty: number }> = {};
      products.forEach((p) => {
        const found = matchedMorningSession.items.find((item) => item.productId === p.id);
        if (found) {
          initialMap[p.id] = {
            issuedQty: found.issuedQty || 0,
            returnQty: found.returnedQty || 0,
            damageQty: found.damageReturnedQty || 0,
          };
        } else {
          initialMap[p.id] = { issuedQty: 0, returnQty: 0, damageQty: 0 };
        }
      });
      setItemsState(initialMap);
      setEveningCashInput(matchedMorningSession.cashCollected || 0);
      setEveningNotes(matchedMorningSession.notes || '');
    } else {
      const initialMap: Record<string, { issuedQty: number; returnQty: number; damageQty: number }> = {};
      products.forEach((p) => {
        initialMap[p.id] = {
          issuedQty: morningQuantities[p.id] || 0,
          returnQty: 0,
          damageQty: 0,
        };
      });
      setItemsState(initialMap);
      setEveningCashInput(0);
      setEveningNotes('');
    }
  }, [eveningSalesmanId, eveningDate, matchedMorningSession, products]);

  // Live total sold calculation
  const calculatedTotalSales = useMemo(() => {
    let total = 0;
    products.forEach((p) => {
      const itemData = itemsState[p.id] || { issuedQty: 0, returnQty: 0, damageQty: 0 };
      const sold = Math.max(0, (itemData.issuedQty || 0) - (itemData.returnQty || 0) - (itemData.damageQty || 0));
      total += sold * (p.unitPrice || 0);
    });
    return total;
  }, [products, itemsState]);

  const latestSettledSession = useMemo(() => {
    return dispatches.find((d) => d.status === 'settled') || dispatches[0] || null;
  }, [dispatches]);

  const currentSalesman = salesmen.find((s) => s.id === eveningSalesmanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eveningSalesmanId) {
      alert('দয়া করে সেলসম্যান নির্বাচন করুন!');
      return;
    }

    const finalItems: DispatchItem[] = [];
    products.forEach((p) => {
      const itemData = itemsState[p.id] || { issuedQty: 0, returnQty: 0, damageQty: 0 };
      const issued = itemData.issuedQty || 0;
      const returned = itemData.returnQty || 0;
      const damage = itemData.damageQty || 0;

      if (issued > 0 || returned > 0 || damage > 0) {
        const sold = Math.max(0, issued - returned - damage);
        const itemTotal = sold * p.unitPrice;
        finalItems.push({
          productId: p.id,
          productName: p.name,
          unit: p.unit,
          unitPrice: p.unitPrice,
          issuedQty: issued,
          returnedQty: returned,
          damageReturnedQty: damage,
          soldQty: sold,
          totalAmount: itemTotal,
        });
      }
    });

    if (finalItems.length === 0) {
      alert('দয়া করে অন্তত একটি পণ্যের বিতরণ, ফেরত বা ড্যামেজ সংখ্যা লিখুন!');
      return;
    }

    onSettleDispatch(
      matchedMorningSession ? matchedMorningSession.id : null,
      finalItems,
      Number(eveningCashInput) || 0,
      eveningNotes,
      {
        salesmanId: eveningSalesmanId,
        date: eveningDate,
      }
    );

    onNavigateToPage4();
  };

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-5 w-full">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-600" />
            <span>০৩. দিন শেষে ফেরত ও ড্যামেজ যোগ (স্টকে ফেরত যোগ)</span>
          </h2>
          <p className="text-xs text-slate-500">
            সকালে বিতরণ করা পণ্য থেকে অবিক্রীত ফেরত ও ড্যামেজ লিখুন — ফেরত মূল স্টকে এবং ড্যামেজ আলাদা ড্যামেজ স্টকে যোগ হবে
          </p>
        </div>

        {latestSettledSession && (
          <button
            type="button"
            onClick={() => onOpenPrintSlip(latestSettledSession)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 self-start sm:self-auto shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-indigo-600" />
            <span>চালান স্লিপ প্রিন্ট</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top Selector Grid: Exactly matching Page 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">সেলসম্যান (DSR) *</label>
            <select
              value={eveningSalesmanId}
              onChange={(e) => setEveningSalesmanId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-indigo-500"
            >
              {salesmen.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.route})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">তারিখ *</label>
            <input
              type="date"
              required
              value={eveningDate}
              onChange={(e) => setEveningDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">নোট / চালান বিবরণ</label>
            <input
              type="text"
              placeholder="দিনশেষে ফেরত ও হিসাব সমন্বয়"
              value={eveningNotes}
              onChange={(e) => setEveningNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Status Indicator */}
        {matchedMorningSession ? (
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                সকালের চালানের সাথে যুক্ত: <strong>{matchedMorningSession.challanNo}</strong> ({matchedMorningSession.salesmanName}) — বিতরণ সংখ্যা স্বয়ংক্রিয়ভাবে লোড হয়েছে।
              </span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold shrink-0">
              সকালের চালান সংযুক্ত
            </span>
          </div>
        ) : (
          <div className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>সকালে বিতরণ ও দিনশেষে ফেরত সরাসরি একসাথেই এন্ট্রি করতে পারেন।</span>
          </div>
        )}

        {/* Product Cards: Same Structure as Page 2 with Side-by-Side RETURN & DAMAGE Inputs */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>পণ্য অনুযায়ী বিতরণ, ফেরত ও ড্যামেজ লিখুন:</span>
            <span className="text-[11px] text-indigo-600 font-semibold hidden sm:inline">
              স্বয়ংক্রিয় হিসাব: বিক্রি = বিতরণ - ফেরত - ড্যামেজ
            </span>
          </div>

          {products.map((p) => {
            const data = itemsState[p.id] || { issuedQty: 0, returnQty: 0, damageQty: 0 };
            const issued = data.issuedQty || 0;
            const ret = data.returnQty || 0;
            const dmg = data.damageQty || 0;
            const sold = Math.max(0, issued - ret - dmg);
            const itemVal = sold * p.unitPrice;

            const hasActivity = issued > 0 || ret > 0 || dmg > 0;

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                  hasActivity
                    ? 'bg-indigo-50/40 border-indigo-300 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                {/* Product Info Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">{p.name}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                      <span>একক দর: <strong className="text-slate-700">{formatCurrency(p.unitPrice)}</strong></span>
                      <span>•</span>
                      <span className="text-emerald-700 font-bold">মূল বিক্রয়যোগ্য স্টক: {p.stock} {p.unit}</span>
                      {p.damageStock > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-700 font-bold">ড্যামেজ স্টক: {p.damageStock} {p.unit}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block font-medium">প্রকৃত বিক্রি ও মূল্য</span>
                    <span className="text-xs sm:text-sm font-black text-indigo-950">
                      {sold} {p.unit} = {formatCurrency(itemVal)}
                    </span>
                  </div>
                </div>

                {/* 3 Inputs Side-by-Side: 1. সকালে বিতরণ  2. দিনশেষে ফেরত  3. ড্যামেজ */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                  {/* Input 1: বিতরণ সংখ্যা */}
                  <div className="bg-white p-2 rounded-xl border border-amber-300 text-center">
                    <label className="text-[10px] font-bold text-amber-900 block mb-1">
                      সকালে বিতরণ:
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={issued > 0 ? issued : ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const safeVal = isNaN(val) || val < 0 ? 0 : val;
                        setItemsState((prev) => ({
                          ...prev,
                          [p.id]: {
                            ...(prev[p.id] || { issuedQty: 0, returnQty: 0, damageQty: 0 }),
                            issuedQty: safeVal,
                          },
                        }));
                      }}
                      className="w-full text-center py-1 text-sm font-black rounded-lg border border-amber-400 bg-amber-50/20 text-amber-950 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Input 2: অবিক্রীত ফেরত (মূল স্টকে যোগ হবে) */}
                  <div className="bg-white p-2 rounded-xl border border-indigo-300 text-center">
                    <label className="text-[10px] font-bold text-indigo-900 block mb-1">
                      ফেরত (স্টকে যোগ):
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={ret > 0 ? ret : ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const safeVal = isNaN(val) || val < 0 ? 0 : val;
                        setItemsState((prev) => ({
                          ...prev,
                          [p.id]: {
                            ...(prev[p.id] || { issuedQty: 0, returnQty: 0, damageQty: 0 }),
                            returnQty: safeVal,
                          },
                        }));
                      }}
                      className="w-full text-center py-1 text-sm font-black rounded-lg border border-indigo-400 bg-indigo-50/20 text-indigo-950 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Input 3: ড্যামেজ পণ্য (আলাদা ড্যামেজ স্টকে যোগ হবে) */}
                  <div className="bg-white p-2 rounded-xl border border-rose-300 text-center">
                    <label className="text-[10px] font-bold text-rose-900 block mb-1">
                      ড্যামেজ (ড্যামেজে যোগ):
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={dmg > 0 ? dmg : ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const safeVal = isNaN(val) || val < 0 ? 0 : val;
                        setItemsState((prev) => ({
                          ...prev,
                          [p.id]: {
                            ...(prev[p.id] || { issuedQty: 0, returnQty: 0, damageQty: 0 }),
                            damageQty: safeVal,
                          },
                        }));
                      }}
                      className="w-full text-center py-1 text-sm font-black rounded-lg border border-rose-400 bg-rose-50/20 text-rose-950 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total Calculation & Settlement Action */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-slate-100 rounded-2xl border border-indigo-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">আজকের সর্বমোট বিক্রয় মূল্য</span>
              <strong className="text-base sm:text-xl text-indigo-950 font-black">
                {formatCurrency(calculatedTotalSales)}
              </strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                টাকা জমা / আদায় (৳) *
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={eveningCashInput > 0 ? eveningCashInput : ''}
                onChange={(e) => setEveningCashInput(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-base font-black rounded-xl border border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <span className="text-[11px] text-rose-600 block font-bold">আজকের বাকি টাকা</span>
              <strong className="text-base sm:text-xl text-rose-700 font-black">
                {formatCurrency(Math.max(0, calculatedTotalSales - (eveningCashInput || 0)))}
              </strong>
              {currentSalesman?.currentDue ? (
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  (পূর্বের বাকি সহ মোট: {formatCurrency((currentSalesman.currentDue || 0) + Math.max(0, calculatedTotalSales - (eveningCashInput || 0)))})
                </span>
              ) : null}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-98"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>হিসাব চূড়ান্ত করুন ও ফেরত/ড্যামেজ স্টকে যোগ করুন</span>
          </button>
        </div>
      </form>
    </section>
  );
};
