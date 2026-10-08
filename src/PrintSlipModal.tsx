import React from 'react';
import { Printer, X, CheckCircle, Package } from 'lucide-react';
import { DispatchSession } from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';

interface PrintSlipModalProps {
  session: DispatchSession | null;
  businessName?: string;
  onClose: () => void;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({ session, businessName = 'মেসার্স ডিস্ট্রিবিউশন ট্রেডার্স', onClose }) => {
  if (!session) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalIssued = session.items.reduce((s, i) => s + (i.issuedQty || 0), 0);
  const totalReturned = session.items.reduce((s, i) => s + (i.returnedQty || 0), 0);
  const totalDamage = session.items.reduce((s, i) => s + (i.damageReturnedQty || 0), 0);
  const totalSold = session.items.reduce((s, i) => s + (i.soldQty || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">চালান স্লিপ প্রিন্ট প্রিভিউ</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div id="printable-slip" className="p-8 text-slate-900 bg-white">
          {/* Header */}
          <div className="text-center border-b pb-4 mb-4">
            <div className="inline-flex items-center justify-center gap-2 mb-1">
              <Package className="w-6 h-6 text-slate-800" />
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                {businessName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">পাইকারি বিক্রেতা ও পরিবেশক</p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-800 border border-slate-200">
              ডিএসআর দৈনিক ডেলিভারি ও হিসাব ভাউচার
            </div>
          </div>

          {/* Challan & Salesman Info */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <div>
                <span className="text-slate-500">চালান নং:</span>{' '}
                <strong className="text-slate-900">{session.challanNo}</strong>
              </div>
              <div>
                <span className="text-slate-500">তারিখ:</span>{' '}
                <strong className="text-slate-900">{formatDateBn(session.date)}</strong>
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-500">ডিএসআর নাম:</span>{' '}
                <strong className="text-slate-900">{session.salesmanName}</strong>
              </div>
              <div>
                <span className="text-slate-500">রুট / এলাকা:</span>{' '}
                <span className="text-slate-700 font-medium">{session.salesmanRoute || 'সাধারণ'}</span>
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="overflow-x-auto mb-4 border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-2.5 px-2.5 text-center w-8">ক্র.</th>
                  <th className="py-2.5 px-2.5">পণ্যের বিবরণ</th>
                  <th className="py-2.5 px-2.5 text-right">দর (৳)</th>
                  <th className="py-2.5 px-2.5 text-center">সকালে প্রদান</th>
                  <th className="py-2.5 px-2.5 text-center">ফেরত</th>
                  <th className="py-2.5 px-2.5 text-center">বিক্রি</th>
                  <th className="py-2.5 px-2.5 text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {session.items.map((item, idx) => (
                  <tr key={item.productId}>
                    <td className="py-2 px-2.5 text-center font-medium text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-2.5 font-bold">{item.productName}</td>
                    <td className="py-2 px-2.5 text-right">{item.unitPrice}</td>
                    <td className="py-2 px-2.5 text-center font-medium">{item.issuedQty}</td>
                    <td className="py-2 px-2.5 text-center text-slate-600">
                      {item.returnedQty}
                      {item.damageReturnedQty > 0 && ` (+${item.damageReturnedQty} ড্যামেজ)`}
                    </td>
                    <td className="py-2 px-2.5 text-center font-bold text-slate-900">{item.soldQty}</td>
                    <td className="py-2 px-2.5 text-right font-bold">{formatCurrency(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t border-slate-200 text-slate-900">
                <tr>
                  <td colSpan={3} className="py-2.5 px-2.5">সর্বমোট</td>
                  <td className="py-2.5 px-2.5 text-center">{totalIssued}</td>
                  <td className="py-2.5 px-2.5 text-center">{totalReturned + totalDamage}</td>
                  <td className="py-2.5 px-2.5 text-center font-black">{totalSold}</td>
                  <td className="py-2.5 px-2.5 text-right text-sm font-black">{formatCurrency(session.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Totals & Due Summary */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2 text-xs border border-slate-200 rounded-xl p-3 bg-slate-50">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-600">পণ্যের টোটাল মূল্য:</span>
                <span className="text-slate-900 font-bold">{formatCurrency(session.totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-700">
                <span>নগদ জমা / আদায়:</span>
                <span className="font-bold">{formatCurrency(session.cashCollected)}</span>
              </div>
              <div className="flex justify-between font-black text-rose-700 border-t border-slate-200 pt-1.5 text-sm">
                <span>অবশিষ্ট বাকি:</span>
                <span>{formatCurrency(session.dueAmount)}</span>
              </div>
            </div>
          </div>

          {session.notes && (
            <div className="mb-6 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
              <strong>নোট:</strong> {session.notes}
            </div>
          )}

          {/* Signature Block */}
          <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto mb-1"></div>
              <span>সেলসম্যান / DSR স্বাক্ষর</span>
            </div>
            <div>
              <div className="border-t border-slate-400 w-36 mx-auto mb-1"></div>
              <span>স্টক ইনচার্জ / ম্যানেজার স্বাক্ষর</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
