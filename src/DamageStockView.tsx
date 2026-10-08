import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRightLeft, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  History, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Archive
} from 'lucide-react';
import { Product, DamageLog } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';

interface DamageStockViewProps {
  products: Product[];
  damageLogs: DamageLog[];
  onDeductDamageToStock: (
    productId: string,
    quantity: number,
    actionType: 'returned_to_sellable' | 'scrapped',
    note: string
  ) => void;
  onAddDirectDamage: (
    productId: string,
    quantity: number,
    note: string
  ) => void;
}

export const DamageStockView: React.FC<DamageStockViewProps> = ({
  products,
  damageLogs,
  onDeductDamageToStock,
  onAddDirectDamage,
}) => {
  // Modal for deducting damage
  const [isDeductModalOpen, setIsDeductModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.find((p) => p.damageStock > 0)?.id || (products[0]?.id || '')
  );
  const [deductQty, setDeductQty] = useState<number>(1);
  const [deductAction, setDeductAction] = useState<'returned_to_sellable' | 'scrapped'>('returned_to_sellable');
  const [deductNote, setDeductNote] = useState<string>('কোম্পানি পরিবর্তন / মেরামত করে মূল বিক্রয়যোগ্য স্টকে যোগ');

  // Modal for new direct damage
  const [isAddDamageModalOpen, setIsAddDamageModalOpen] = useState(false);
  const [addDamageProductId, setAddDamageProductId] = useState<string>(products[0]?.id || '');
  const [addDamageQty, setAddDamageQty] = useState<number>(1);
  const [addDamageNote, setAddDamageNote] = useState<string>('গুদামে নষ্ট/ভেঙ্গে গেছে');

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const addDamageProduct = products.find((p) => p.id === addDamageProductId);

  // Overall calculations
  const totalDamageCount = products.reduce((sum, p) => sum + (p.damageStock || 0), 0);
  const totalDamageValuation = products.reduce((sum, p) => sum + ((p.damageStock || 0) * (p.unitPrice || 0)), 0);

  const damagedProducts = products.filter((p) => p.damageStock > 0);

  const handleDeductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || deductQty <= 0) return;
    if (selectedProduct && deductQty > selectedProduct.damageStock) {
      alert('ড্যামেজ স্টকের চেয়ে বেশি বিয়োগ করা যাবে না!');
      return;
    }

    onDeductDamageToStock(selectedProductId, deductQty, deductAction, deductNote);
    setIsDeductModalOpen(false);
    setDeductQty(1);
    setDeductNote('কোম্পানি পরিবর্তন / মেরামত করে মূল বিক্রয়যোগ্য স্টকে যোগ');
  };

  const handleAddDamageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDamageProductId || addDamageQty <= 0) return;
    if (addDamageProduct && addDamageQty > addDamageProduct.stock) {
      alert('বিক্রয়যোগ্য মূল স্টকের চেয়ে বেশি ড্যামেজ হিসেবে নেওয়া যাবে না!');
      return;
    }

    onAddDirectDamage(addDamageProductId, addDamageQty, addDamageNote);
    setIsAddDamageModalOpen(false);
    setAddDamageQty(1);
    setAddDamageNote('গুদামে নষ্ট/ভেঙ্গে গেছে');
  };

  const openDeductForProduct = (prod: Product) => {
    setSelectedProductId(prod.id);
    setDeductQty(Math.min(prod.damageStock, 1));
    setIsDeductModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 text-xs font-semibold mb-2 border border-rose-400/30">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <span>আলাদা ড্যামেজ স্টক হাব</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ড্যামেজ পণ্য ও মূল বিক্রয়যোগ্য স্টকে ফেরত ব্যবস্থাপনা
            </h2>
            <p className="text-rose-200 text-sm mt-1 max-w-2xl">
              ড্যামেজ পণ্য আলাদা থাকে (বিক্রয়যোগ্য স্টকে নয়)। এখান থেকে ড্যামেজ বিয়োগ করলে তা সরাসরি মূল বিক্রয়যোগ্য স্টকে যোগ হয়ে যাবে।
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                if (damagedProducts.length === 0) {
                  alert('বর্তমানে কোনো ড্যামেজ পণ্য নেই!');
                  return;
                }
                setIsDeductModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ড্যামেজ বিয়োগ করে স্টকে যোগ করুন</span>
            </button>

            <button
              onClick={() => setIsAddDamageModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all backdrop-blur-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-rose-300" />
              <span>নতুন ড্যামেজ এন্ট্রি</span>
            </button>
          </div>
        </div>

        {/* 2 Stats on the banner */}
        <div className="mt-6 pt-5 border-t border-rose-800/60 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-rose-950/40 rounded-xl p-3 border border-rose-700/40">
            <span className="text-xs text-rose-300 block mb-0.5">মোট ড্যামেজ কোয়ান্টিটি</span>
            <div className="text-2xl font-black text-rose-200">{totalDamageCount} পিস/একক</div>
          </div>
          <div className="bg-rose-950/40 rounded-xl p-3 border border-rose-700/40">
            <span className="text-xs text-rose-300 block mb-0.5">মোট ড্যামেজ আর্থিক মূল্য</span>
            <div className="text-2xl font-black text-rose-200">{formatCurrency(totalDamageValuation)}</div>
          </div>
          <div className="bg-rose-950/40 rounded-xl p-3 border border-rose-700/40 col-span-2 sm:col-span-1">
            <span className="text-xs text-rose-300 block mb-0.5">ক্ষতিগ্রস্ত আইটেম সংখ্যা</span>
            <div className="text-2xl font-black text-white">{damagedProducts.length} টি পণ্য</div>
          </div>
        </div>
      </div>

      {/* Damaged Stock Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Archive className="w-5 h-5 text-rose-600" />
              <span>আলাদা ড্যামেজ স্টকে থাকা পণ্যের তালিকা</span>
            </h3>
            <p className="text-xs text-slate-500">
              এই পণ্যগুলো সাধারণ বিক্রয়যোগ্য স্টকে অন্তর্ভুক্ত নয়
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-center w-12">ক্র.</th>
                <th className="py-3 px-4">পণ্যের নাম</th>
                <th className="py-3 px-4 text-right">একক দর</th>
                <th className="py-3 px-4 text-center">মূল বিক্রয়যোগ্য স্টক</th>
                <th className="py-3 px-4 text-center bg-rose-50 text-rose-900 font-bold">
                  আলাদা ড্যামেজ স্টক
                </th>
                <th className="py-3 px-4 text-right bg-rose-50 text-rose-900 font-bold">
                  ড্যামেজ মোট মূল্য
                </th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    কোনো পণ্য নেই।
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => {
                  const dmgVal = product.damageStock * product.unitPrice;
                  const hasDamage = product.damageStock > 0;

                  return (
                    <tr 
                      key={product.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        hasDamage ? 'bg-rose-50/15' : 'opacity-70'
                      }`}
                    >
                      <td className="py-3 px-4 text-center text-xs text-slate-400 font-semibold">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {product.name}
                        <span className="block text-[11px] text-slate-400 font-normal">একক: {product.unit}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(product.unitPrice)}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-emerald-700">
                        {product.stock} {product.unit}
                      </td>

                      <td className="py-3 px-4 text-center bg-rose-50/30">
                        {hasDamage ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            {product.damageStock} {product.unit}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">০</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-extrabold text-rose-700 bg-rose-50/20">
                        {hasDamage ? formatCurrency(dmgVal) : '৳ ০'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {hasDamage ? (
                          <button
                            onClick={() => openDeductForProduct(product)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>বিয়োগ করে স্টকে যোগ</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">ক্ষতিগ্রস্ত নেই</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td colSpan={4} className="py-3.5 px-4 text-left">
                  মোট সর্বমোট ড্যামেজ স্টক
                </td>
                <td className="py-3.5 px-4 text-center text-sm font-black text-rose-700">
                  {totalDamageCount} পিস
                </td>
                <td className="py-3.5 px-4 text-right text-base font-black text-rose-700">
                  {formatCurrency(totalDamageValuation)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Activity History Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h4 className="font-bold text-slate-900 text-base">
              ড্যামেজ পণ্য হ্রাস-বৃদ্ধি ও স্টকে সমন্বয়ের ইতিহাস (History Log)
            </h4>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {damageLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              এখনো কোনো ড্যামেজ সমন্বয় রেকর্ড নেই।
            </div>
          ) : (
            damageLogs.map((log) => {
              const isReturned = log.action === 'returned_to_sellable';
              const isAdded = log.action === 'added_to_damage';

              return (
                <div key={log.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isReturned 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : isAdded 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isReturned ? (
                        <ArrowRightLeft className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 text-sm">{log.productName}</div>
                      <div className="text-xs text-slate-500">
                        {log.note || 'কোনো মন্তব্য নেই'} • তারিখ: {formatDateBn(log.date)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      isReturned 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isReturned ? `+${log.quantity} স্টকে যোগ` : `${log.quantity} ড্যামেজ`}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">
                      {isReturned ? 'মূল বিক্রয় স্টকে পুনরুদ্ধার' : isAdded ? 'ড্যামেজ তালিকাভুক্ত' : 'স্ক্র্যাপ বাতিল'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL: Deduct Damage (And Add Back To Stock) - Core User Request */}
      {isDeductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">ড্যামেজ পণ্য বিয়োগ ও স্টকে যোগ</h3>
                <p className="text-xs text-emerald-100">ড্যামেজ কমিয়ে মূল বিক্রয়যোগ্য স্টকে সংযুক্ত করুন</p>
              </div>
              <button 
                onClick={() => setIsDeductModalOpen(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleDeductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পণ্য নির্বাচন করুন *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setDeductQty(Math.min(p.damageStock, 1));
                  }}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ড্যামেজ আছে: {p.damageStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-500">বর্তমান ড্যামেজ স্টক:</span>
                    <span className="font-bold text-rose-700">{selectedProduct.damageStock} {selectedProduct.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">বর্তমান বিক্রয়যোগ্য স্টক:</span>
                    <span className="font-bold text-emerald-700">{selectedProduct.stock} {selectedProduct.unit}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিয়োগের পরিমাণ ({selectedProduct?.unit || 'পিস'}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.damageStock || 1}
                  required
                  value={deductQty || ''}
                  onChange={(e) => setDeductQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action selection: default is ADD TO MAIN STOCK as requested */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">অ্যাকশন নির্বাচন করুন *</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 cursor-pointer">
                    <input
                      type="radio"
                      name="deductAction"
                      value="returned_to_sellable"
                      checked={deductAction === 'returned_to_sellable'}
                      onChange={() => setDeductAction('returned_to_sellable')}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-sm text-emerald-900">
                        মূল বিক্রয়যোগ্য স্টকে যোগ করুন (স্টক পুনরুদ্ধার)
                      </div>
                      <div className="text-xs text-emerald-700">
                        ড্যামেজ থেকে বিয়োগ হবে এবং মূল স্টকে যোগ হবে (কোম্পানি রিপ্লেস বা মেরামত)।
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="radio"
                      name="deductAction"
                      value="scrapped"
                      checked={deductAction === 'scrapped'}
                      onChange={() => setDeductAction('scrapped')}
                      className="mt-1 text-slate-600 focus:ring-slate-500"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        নষ্ট/বাতিল হিসেবে ফেলে দিন (স্ক্র্যাপ রাইট-অফ)
                      </div>
                      <div className="text-xs text-slate-500">
                        শুধুমাত্র ড্যামেজ স্টক থেকে বিয়োগ হবে, মূল স্টকে যোগ হবে না।
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">মন্তব্য / কারণ</label>
                <input
                  type="text"
                  placeholder="যেমন: কোম্পানি থেকে রিপ্লেসমেন্ট রিসিভ করা হয়েছে"
                  value={deductNote}
                  onChange={(e) => setDeductNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {selectedProduct && deductAction === 'returned_to_sellable' && (
                <div className="p-3 bg-emerald-100/70 rounded-xl border border-emerald-300 text-xs text-emerald-900 font-semibold">
                  ফলাফল: ড্যামেজ হবে {selectedProduct.damageStock - deductQty} {selectedProduct.unit} এবং বিক্রয়যোগ্য স্টক বেড়ে হবে {selectedProduct.stock + deductQty} {selectedProduct.unit}।
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeductModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Direct Damage Entry (From Warehouse) */}
      {isAddDamageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-rose-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">নতুন ড্যামেজ পণ্য নথিভুক্ত করুন</h3>
                <p className="text-xs text-rose-100">বিক্রয়যোগ্য স্টক থেকে আলাদা ড্যামেজে স্থানান্তর</p>
              </div>
              <button 
                onClick={() => setIsAddDamageModalOpen(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddDamageSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পণ্য নির্বাচন করুন *</label>
                <select
                  value={addDamageProductId}
                  onChange={(e) => setAddDamageProductId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (বিক্রয়যোগ্য আছে: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ক্ষতিগ্রস্ত কোয়ান্টিটি ({addDamageProduct?.unit || 'পিস'}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={addDamageProduct?.stock || 1}
                  required
                  value={addDamageQty || ''}
                  onChange={(e) => setAddDamageQty(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্ষতির কারণ / নোট</label>
                <input
                  type="text"
                  placeholder="যেমন: কার্টুন ভিজে প্যাকেট নষ্ট হয়েছে"
                  value={addDamageNote}
                  onChange={(e) => setAddDamageNote(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800">
                এই পণ্যটি বিক্রয়যোগ্য মূল স্টক থেকে বিয়োগ হয়ে আলাদা ড্যামেজ স্টকে জমা থাকবে।
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDamageModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  ড্যামেজে জমা করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
