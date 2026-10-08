import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  RotateCcw, 
  DollarSign, 
  Receipt, 
  CheckCircle, 
  Printer, 
  Clock, 
  Calendar,
  Layers,
  Sparkles,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { Product, Salesman, DispatchSession, DispatchItem } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';

interface EveningSettlementViewProps {
  products: Product[];
  salesmen: Salesman[];
  dispatches: DispatchSession[];
  selectedDispatchId?: string;
  onSettleDispatch: (
    dispatchId: string,
    updatedItems: DispatchItem[],
    cashCollected: number,
    notes: string
  ) => void;
  onOpenPrintSlip: (session: DispatchSession) => void;
  onNavigateToMorning: () => void;
}

export const EveningSettlementView: React.FC<EveningSettlementViewProps> = ({
  products,
  salesmen,
  dispatches,
  selectedDispatchId,
  onSettleDispatch,
  onOpenPrintSlip,
  onNavigateToMorning,
}) => {
  // Find initial session to settle
  const [currentSessionId, setCurrentSessionId] = useState<string>(
    selectedDispatchId || 
    (dispatches.find((d) => d.status === 'morning_issued')?.id || '')
  );

  // When props change
  useEffect(() => {
    if (selectedDispatchId) {
      setCurrentSessionId(selectedDispatchId);
    } else if (!currentSessionId) {
      const active = dispatches.find((d) => d.status === 'morning_issued');
      if (active) setCurrentSessionId(active.id);
      else if (dispatches.length > 0) setCurrentSessionId(dispatches[0].id);
    }
  }, [selectedDispatchId, dispatches]);

  const activeSession = dispatches.find((d) => d.id === currentSessionId);
  const isSettled = activeSession?.status === 'settled';

  // Local state for settlement adjustments
  // Map of productId -> { returnedQty: number, damageQty: number }
  const [returnMap, setReturnMap] = useState<Record<string, { returnedQty: number; damageQty: number }>>({});
  const [cashDeposited, setCashDeposited] = useState<number>(0);
  const [settleNotes, setSettleNotes] = useState<string>('');

  // Sync state whenever activeSession changes
  useEffect(() => {
    if (activeSession) {
      const initialMap: Record<string, { returnedQty: number; damageQty: number }> = {};
      activeSession.items.forEach((item) => {
        initialMap[item.productId] = {
          returnedQty: item.returnedQty || 0,
          damageQty: item.damageReturnedQty || 0,
        };
      });
      setReturnMap(initialMap);
      setCashDeposited(activeSession.cashCollected || 0);
      setSettleNotes(activeSession.notes || '');
    }
  }, [activeSession?.id]);

  const handleReturnQtyChange = (productId: string, val: string, maxIssued: number) => {
    const num = parseInt(val, 10);
    const validNum = isNaN(num) || num < 0 ? 0 : Math.min(num, maxIssued);
    setReturnMap((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { returnedQty: 0, damageQty: 0 }),
        returnedQty: validNum,
      },
    }));
  };

  const handleDamageQtyChange = (productId: string, val: string, maxIssued: number) => {
    const num = parseInt(val, 10);
    const validNum = isNaN(num) || num < 0 ? 0 : Math.min(num, maxIssued);
    setReturnMap((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || { returnedQty: 0, damageQty: 0 }),
        damageQty: validNum,
      },
    }));
  };

  // Helper: return all unsold (everything returned, 0 sold)
  const handleReturnAll = () => {
    if (!activeSession) return;
    const newMap: Record<string, { returnedQty: number; damageQty: number }> = {};
    activeSession.items.forEach((item) => {
      newMap[item.productId] = {
        returnedQty: item.issuedQty,
        damageQty: 0,
      };
    });
    setReturnMap(newMap);
  };

  // Helper: all sold (0 returned)
  const handleAllSold = () => {
    if (!activeSession) return;
    const newMap: Record<string, { returnedQty: number; damageQty: number }> = {};
    activeSession.items.forEach((item) => {
      newMap[item.productId] = {
        returnedQty: 0,
        damageQty: 0,
      };
    });
    setReturnMap(newMap);
  };

  // Calculations for current session
  const processedItems: DispatchItem[] = (activeSession?.items || []).map((item) => {
    const returns = returnMap[item.productId] || { returnedQty: 0, damageQty: 0 };
    const returnedQty = isSettled ? item.returnedQty : returns.returnedQty;
    const damageReturnedQty = isSettled ? item.damageReturnedQty : returns.damageQty;
    
    // sold = issued - return - damage
    const soldQty = Math.max(0, item.issuedQty - returnedQty - damageReturnedQty);
    const totalAmount = soldQty * item.unitPrice;

    return {
      ...item,
      returnedQty,
      damageReturnedQty,
      soldQty,
      totalAmount,
    };
  });

  const grandTotalAmount = processedItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalReturnedUnits = processedItems.reduce((sum, item) => sum + item.returnedQty, 0);
  const totalDamageReturnedUnits = processedItems.reduce((sum, item) => sum + item.damageReturnedQty, 0);
  const totalSoldUnits = processedItems.reduce((sum, item) => sum + item.soldQty, 0);

  // টোটাল মূল্য থেকে টাকা জমা দিলে বাকিটা বাকি থাকবে
  const currentCashInput = isSettled ? activeSession.cashCollected : cashDeposited;
  const remainingDue = Math.max(0, grandTotalAmount - currentCashInput);

  // Salesman details
  const currentSalesman = salesmen.find((s) => s.id === activeSession?.salesmanId);
  const previousDue = currentSalesman?.currentDue || 0;
  const totalNetDue = remainingDue + (isSettled ? 0 : previousDue);

  const handleFinalizeSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    onSettleDispatch(
      activeSession.id,
      processedItems,
      cashDeposited,
      settleNotes
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-2 border border-indigo-400/30">
              <Moon className="w-4 h-4 text-indigo-300" />
              <span>দিনশেষের সমাপ্তি ও সামারি</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              দিনশেষে ফেরত পণ্য স্বয়ংক্রিয় যোগ ও ডিএসআর সামারি
            </h2>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              অবিক্রীত ফেরত দেওয়া পণ্য স্বয়ংক্রিয়ভাবে মূল বিক্রয়যোগ্য স্টকে ফেরত যোগ হয় এবং আদায়কৃত টাকা বাদে বাকি হিসাব সংরক্ষিত হয়।
            </p>
          </div>

          {activeSession && (
            <button
              onClick={() => onOpenPrintSlip(activeSession)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all backdrop-blur-xs self-start md:self-auto"
            >
              <Printer className="w-4 h-4 text-indigo-300" />
              <span>ডিএসআর স্লিপ প্রিন্ট করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Selector / Tab Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">চালান নির্বাচন করুন:</span>
          </div>
          {dispatches.filter((d) => d.status === 'morning_issued').length === 0 && (
            <div className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
              বর্তমানে কোনো সক্রিয় সকালের চালান বাকি নেই।{' '}
              <button onClick={onNavigateToMorning} className="font-bold underline hover:text-amber-800">
                নতুন বিতরণ করুন
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {dispatches.length === 0 ? (
            <div className="text-sm text-slate-400 py-2">কোনো চালান নেই। সকালে পণ্য বুঝিয়ে দিন।</div>
          ) : (
            dispatches.map((disp) => {
              const isSelected = disp.id === currentSessionId;
              const isDispSettled = disp.status === 'settled';

              return (
                <button
                  key={disp.id}
                  onClick={() => setCurrentSessionId(disp.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-left border transition-all whitespace-nowrap min-w-[200px] ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{disp.salesmanName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isDispSettled ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isDispSettled ? 'হিসাব সম্পন্ন' : 'সক্রিয়'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                    <span>{disp.challanNo}</span>
                    <span>{formatDateBn(disp.date)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {activeSession ? (
        <form onSubmit={handleFinalizeSettlement} className="space-y-6">
          {/* Active Challan Header Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{activeSession.salesmanName}</h3>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                  {activeSession.challanNo}
                </span>
                {isSettled ? (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    দিনশেষের হিসাব ক্লোজড
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    ফেরত ও জমার হিসাব অপেক্ষমান
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                রুট: {activeSession.salesmanRoute || 'সাধারণ'} | তারিখ: {formatDateBn(activeSession.date)}
              </p>
            </div>

            {!isSettled && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAllSold}
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100"
                >
                  সব বিক্রি হয়েছে (০ ফেরত)
                </button>
                <button
                  type="button"
                  onClick={handleReturnAll}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200"
                >
                  সব অবিক্রীত ফেরত
                </button>
              </div>
            )}
          </div>

          {/* DSR Table Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  <span>ডিএসআর পণ্যভিত্তিক বিক্রয় ও ফেরত সামারি</span>
                </h4>
                <p className="text-xs text-slate-500">
                  প্রত্যেক পণ্যের একক দর, বিক্রয় পরিমাণ ও মোট টাকার আলাদা হিসাব
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">ক্র.</th>
                    <th className="py-3 px-3">পণ্যের নাম</th>
                    <th className="py-3 px-3 text-right">একক মূল্য (দর)</th>
                    <th className="py-3 px-3 text-center">সকালে প্রদান (Issue)</th>
                    <th className="py-3 px-3 text-center w-32 bg-indigo-50/70 text-indigo-900">
                      অবিক্রীত ফেরত
                    </th>
                    <th className="py-3 px-3 text-center w-28 bg-rose-50/50 text-rose-900">
                      ড্যামেজ ফেরত
                    </th>
                    <th className="py-3 px-3 text-center bg-emerald-50/50 text-emerald-900 font-bold">
                      প্রকৃত বিক্রি
                    </th>
                    <th className="py-3 px-4 text-right bg-indigo-50/40 text-indigo-950 font-bold">
                      মোট বিক্রয় মূল্য
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedItems.map((item, idx) => {
                    const isExceeded = (item.returnedQty + item.damageReturnedQty) > item.issuedQty;

                    return (
                      <tr key={item.productId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center text-xs text-slate-400 font-semibold">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {item.productName}
                          <span className="block text-[11px] text-slate-400 font-normal">একক: {item.unit}</span>
                        </td>

                        {/* Separate Unit Price for each product as requested */}
                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {formatCurrency(item.unitPrice)}
                        </td>

                        {/* Morning Issued */}
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs font-bold">
                            {item.issuedQty} {item.unit}
                          </span>
                        </td>

                        {/* Unsold Return Input */}
                        <td className="py-2.5 px-3 bg-indigo-50/30 text-center">
                          {isSettled ? (
                            <span className="font-bold text-indigo-900 text-xs">
                              {item.returnedQty} {item.unit}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max={item.issuedQty}
                              value={item.returnedQty !== undefined && item.returnedQty !== 0 ? item.returnedQty : (item.returnedQty === 0 ? '0' : '')}
                              onChange={(e) => handleReturnQtyChange(item.productId, e.target.value, item.issuedQty)}
                              className="w-20 text-center py-1 px-2 text-sm font-bold rounded-lg border border-indigo-300 bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          )}
                        </td>

                        {/* Damage Return Input */}
                        <td className="py-2.5 px-3 bg-rose-50/20 text-center">
                          {isSettled ? (
                            <span className="font-bold text-rose-800 text-xs">
                              {item.damageReturnedQty > 0 ? `${item.damageReturnedQty} ${item.unit}` : '০'}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              max={item.issuedQty - item.returnedQty}
                              placeholder="0"
                              value={item.damageReturnedQty || ''}
                              onChange={(e) => handleDamageQtyChange(item.productId, e.target.value, item.issuedQty - item.returnedQty)}
                              className="w-16 text-center py-1 px-2 text-xs font-semibold rounded-lg border border-rose-300 bg-white text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
                            />
                          )}
                        </td>

                        {/* Actual Sold Qty */}
                        <td className="py-3 px-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                          {item.soldQty} {item.unit}
                        </td>

                        {/* Product-wise Total Amount as requested */}
                        <td className="py-3 px-4 text-right font-extrabold text-indigo-950 bg-indigo-50/20 text-base">
                          {formatCurrency(item.totalAmount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={3} className="py-3.5 px-3">
                      মোট সর্বমোট
                    </td>
                    <td className="py-3.5 px-3 text-center text-xs text-slate-700">
                      {processedItems.reduce((s, i) => s + i.issuedQty, 0)} পিস
                    </td>
                    <td className="py-3.5 px-3 text-center text-xs text-indigo-700 font-extrabold">
                      {totalReturnedUnits} পিস (স্টকে যোগ)
                    </td>
                    <td className="py-3.5 px-3 text-center text-xs text-rose-700">
                      {totalDamageReturnedUnits} পিস (ড্যামেজে যোগ)
                    </td>
                    <td className="py-3.5 px-3 text-center text-xs text-emerald-800 font-extrabold">
                      {totalSoldUnits} পিস বিক্রি
                    </td>
                    <td className="py-3.5 px-4 text-right text-lg text-indigo-950 font-black">
                      {formatCurrency(grandTotalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* DSR Settlement & Due Accounting Card - The Core User Requirement */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-slate-900 text-lg">
                টাকা জমা ও বাকি হিসাব (Payment & Due Settlement)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Grand Total Value */}
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                    আজকের পণ্যের টোটাল মূল্য
                  </span>
                  <div className="text-3xl font-extrabold text-indigo-950">
                    {formatCurrency(grandTotalAmount)}
                  </div>
                </div>
                <p className="text-[11px] text-indigo-600 mt-2">
                  সকল বিক্রি হওয়া পণ্যের সর্বমোট আদায়যোগ্য মূল্য
                </p>
              </div>

              {/* Cash Deposited by DSR */}
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    টাকা জমা / আদায় (Cash Deposited) *
                  </label>
                  {isSettled ? (
                    <div className="text-3xl font-extrabold text-emerald-800">
                      {formatCurrency(activeSession.cashCollected)}
                    </div>
                  ) : (
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="0"
                        value={cashDeposited || ''}
                        onChange={(e) => setCashDeposited(Number(e.target.value))}
                        className="w-full pl-8 pr-3 py-2 text-2xl font-black rounded-xl border border-emerald-400 bg-white text-emerald-950 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
                {!isSettled && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setCashDeposited(grandTotalAmount)}
                      className="text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition-colors"
                    >
                      পুরো টাকা পরিশোধ (৳ {grandTotalAmount})
                    </button>
                  </div>
                )}
              </div>

              {/* Remaining Due / Balance */}
              <div className={`rounded-2xl p-4 border flex flex-col justify-between ${
                remainingDue > 0 
                  ? 'bg-rose-50 border-rose-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                    remainingDue > 0 ? 'text-rose-800' : 'text-slate-600'
                  }`}>
                    আজকের বাকি (Remaining Due)
                  </span>
                  <div className={`text-3xl font-black ${
                    remainingDue > 0 ? 'text-rose-600' : 'text-slate-700'
                  }`}>
                    {formatCurrency(remainingDue)}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                  <div className="flex justify-between">
                    <span>পূর্বের বাকি:</span>
                    <span className="font-bold">{formatCurrency(previousDue)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-0.5">
                    <span className="font-bold text-slate-800">মোট বর্তমান বাকি:</span>
                    <span className="font-extrabold text-rose-700">{formatCurrency(totalNetDue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Settlement Action */}
            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex-1">
                {!isSettled ? (
                  <input
                    type="text"
                    placeholder="হিসাবের নোট (যেমন: বাকি টাকা আগামী পরশু পরিশোধ করবে)"
                    value={settleNotes}
                    onChange={(e) => setSettleNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  activeSession.notes && (
                    <p className="text-xs text-slate-600 italic">নোট: {activeSession.notes}</p>
                  )
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenPrintSlip(activeSession)}
                  className="px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  <span>চালান স্লিপ</span>
                </button>

                {!isSettled && (
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5 text-indigo-200" />
                    <span>দিনশেষের হিসাব সম্পন্ন করুন ও স্টকে ফেরত যোগ করুন</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Moon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">কোনো চালান নেই</h3>
          <p className="text-xs text-slate-500 mt-1">প্রথমে সকালের সেকশন থেকে ডিএসআরকে পণ্য বিতরণ করুন।</p>
          <button
            onClick={onNavigateToMorning}
            className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            সকালে পণ্য বুঝিয়ে দিন
          </button>
        </div>
      )}
    </div>
  );
};
