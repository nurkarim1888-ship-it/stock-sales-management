import React, { useState, useMemo } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  PlusCircle, 
  DollarSign, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Printer, 
  RefreshCw, 
  UserCheck, 
  Mail, 
  Smartphone, 
  Check, 
  X, 
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  Phone,
  MapPin
} from 'lucide-react';
import { 
  Product, 
  Salesman, 
  DispatchSession, 
  DispatchItem, 
  DamageLog, 
  AppSettings 
} from '../types';
import { formatCurrency, formatDateBn } from '../utils/formatters';
import { PWAInstallButton } from './PWAInstallButton';
import { OptionThreeEveningView } from './OptionThreeEveningView';
import { OptionFourDsrSummaryView } from './OptionFourDsrSummaryView';

interface OneViewAppProps {
  products: Product[];
  salesmen: Salesman[];
  dispatches: DispatchSession[];
  damageLogs: DamageLog[];
  settings: AppSettings;
  currentUser?: { email?: string | null; displayName?: string | null } | null;
  onGoogleSignIn?: () => void;
  onGoogleSignOut?: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onRestockProduct: (productId: string, addQty: number, unitPrice?: number) => void;
  onDeductDamageToStock: (productId: string, quantity: number, note: string) => void;
  onConfirmMorningDispatch: (
    salesmanId: string,
    date: string,
    itemsToIssue: { productId: string; issuedQty: number }[],
    notes: string
  ) => void;
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
  onAddSalesman: (name: string, phone: string, route: string) => void;
  onCollectDueCash: (salesmanId: string, amount: number, note: string) => void;
  onOpenPrintSlip: (session: DispatchSession) => void;
  onResetData: () => void;
}

export const OneViewApp: React.FC<OneViewAppProps> = ({
  products,
  salesmen,
  dispatches,
  damageLogs,
  settings,
  currentUser,
  onGoogleSignIn,
  onGoogleSignOut,
  onUpdateSettings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRestockProduct,
  onDeductDamageToStock,
  onConfirmMorningDispatch,
  onSettleDispatch,
  onAddSalesman,
  onCollectDueCash,
  onOpenPrintSlip,
  onResetData,
}) => {
  // 4 SEPARATE PAGES AS REQUESTED BY USER
  // 1: ০১.পন্য স্টক ও ড্যামেজ বিয়োগ
  // 2: ০২.সকালে পন্য বিতরন
  // 3: ০৩.দিন শেষে ফেরত ও ড্যামেজ যোগ
  // 4: ০৪.ডিএসআর সামারি ও আলাদা জমা
  const [activePage, setActivePage] = useState<'1' | '2' | '3' | '4'>('1');

  // Business Name Editing
  const [isEditingBusinessName, setIsEditingBusinessName] = useState(false);
  const [businessNameInput, setBusinessNameInput] = useState(settings.businessName || 'মেসার্স ডিস্ট্রিবিউশন ট্রেডার্স');

  // Gmail Sync Modal
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [gmailInput, setGmailInput] = useState(settings.connectedGmail || 'Nurkarim1888@gmail.com');

  // Product Search
  const [searchTerm, setSearchTerm] = useState('');

  // Product Name Edit Modal (Requirement 1)
  const [editingProductNameItem, setEditingProductNameItem] = useState<{ id: string; name: string } | null>(null);

  // Full Product Edit Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Add Product Modal
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('পিস');
  const [newProdPrice, setNewProdPrice] = useState<number>(0);
  const [newProdStock, setNewProdStock] = useState<number>(0);
  const [newProdDamage, setNewProdDamage] = useState<number>(0);

  // Restock Modal
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockPrice, setRestockPrice] = useState<string>('');

  // Damage Deduct Modal (From Product Stock) - "ড্যানেজ বিয়োগ করলে স্টকে যোগ হবেনা"
  const [damageDeductProduct, setDamageDeductProduct] = useState<Product | null>(null);
  const [damageDeductQty, setDamageDeductQty] = useState<number>(1);
  const [damageDeductNote, setDamageDeductNote] = useState<string>('নষ্ট/বাতিল পণ্য বাদ দেওয়া হলো');

  // Page 2: Morning Dispatch State
  const [morningSalesmanId, setMorningSalesmanId] = useState<string>(salesmen[0]?.id || '');
  const [morningDate, setMorningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [morningNotes, setMorningNotes] = useState<string>('');
  const [morningQuantities, setMorningQuantities] = useState<Record<string, number>>({});

  // Add Salesman Modal
  const [isAddDsrModalOpen, setIsAddDsrModalOpen] = useState(false);
  const [newDsrName, setNewDsrName] = useState('');
  const [newDsrPhone, setNewDsrPhone] = useState('');
  const [newDsrRoute, setNewDsrRoute] = useState('');

  // Page 3: Evening Settlement State (Now structured exactly like Page 2 with Return and Damage side-by-side)
  const [eveningSalesmanId, setEveningSalesmanId] = useState<string>(salesmen[0]?.id || '');
  const [eveningDate, setEveningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [eveningNotes, setEveningNotes] = useState<string>('');
  const [eveningCashInput, setEveningCashInput] = useState<number>(0);
  const [eveningItemsState, setEveningItemsState] = useState<Record<string, { issuedQty: number; returnQty: number; damageQty: number }>>({});

  // Check if a morning session exists for selected salesman and date
  const matchedMorningSession = useMemo(() => {
    return (
      dispatches.find(
        (d) => d.salesmanId === eveningSalesmanId && d.date === eveningDate && d.status === 'morning_issued'
      ) ||
      dispatches.find((d) => d.salesmanId === eveningSalesmanId && d.date === eveningDate)
    );
  }, [dispatches, eveningSalesmanId, eveningDate]);

  // Sync evening inputs whenever salesman, date, or morning session updates
  React.useEffect(() => {
    if (matchedMorningSession && matchedMorningSession.items) {
      const initialMap: Record<string, { issuedQty: number; returnQty: number; damageQty: number }> = {};
      products.forEach((p) => {
        const foundItem = matchedMorningSession.items.find((item) => item.productId === p.id);
        if (foundItem) {
          initialMap[p.id] = {
            issuedQty: foundItem.issuedQty || 0,
            returnQty: foundItem.returnedQty || 0,
            damageQty: foundItem.damageReturnedQty || 0,
          };
        } else {
          initialMap[p.id] = { issuedQty: 0, returnQty: 0, damageQty: 0 };
        }
      });
      setEveningItemsState(initialMap);
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
      setEveningItemsState(initialMap);
      setEveningCashInput(0);
      setEveningNotes('');
    }
  }, [eveningSalesmanId, eveningDate, matchedMorningSession, products.length]);

  // Page 4: Date-wise History and Summary State ("প্রত্যেক দিনের হিসাব জমা থাকবে যাতে তারিখ অনুযায়ী দেখতে পারে")
  const [selectedSummaryDate, setSelectedSummaryDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [summaryViewMode, setSummaryViewMode] = useState<'date' | 'all'>('date');

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

  // Page 4: DSR Separate Cash Deposit State
  const [dsrCashDeposits, setDsrCashDeposits] = useState<Record<string, number>>({});

  // Overall Totals
  const { totalStockValue, totalStockItems, totalDamageValue, totalDamageItems } = useMemo(() => {
    let stockVal = 0;
    let stockItems = 0;
    let dmgVal = 0;
    let dmgItems = 0;

    products.forEach((p) => {
      stockVal += (p.stock || 0) * (p.unitPrice || 0);
      stockItems += p.stock || 0;
      dmgVal += (p.damageStock || 0) * (p.unitPrice || 0);
      dmgItems += p.damageStock || 0;
    });

    return {
      totalStockValue: stockVal,
      totalStockItems: stockItems,
      totalDamageValue: dmgVal,
      totalDamageItems: dmgItems,
    };
  }, [products]);

  const totalDsrDue = useMemo(() => {
    return salesmen.reduce((sum, s) => sum + (s.currentDue || 0), 0);
  }, [salesmen]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, searchTerm]);

  const calculatedEveningSalesTotal = useMemo(() => {
    let sum = 0;
    products.forEach((p) => {
      const data = eveningItemsState[p.id] || { issuedQty: 0, returnQty: 0, damageQty: 0 };
      const sold = Math.max(0, (data.issuedQty || 0) - (data.returnQty || 0) - (data.damageQty || 0));
      sum += sold * (p.unitPrice || 0);
    });
    return sum;
  }, [products, eveningItemsState]);

  const latestSettledSession = useMemo(() => {
    return dispatches.find((d) => d.status === 'settled') || dispatches[0] || null;
  }, [dispatches]);

  // Handlers
  const handleSaveBusinessName = () => {
    if (businessNameInput.trim()) {
      onUpdateSettings({ businessName: businessNameInput.trim() });
    }
    setIsEditingBusinessName(false);
  };

  const handleSaveGmailSync = () => {
    onUpdateSettings({
      connectedGmail: gmailInput.trim(),
      cloudSyncEnabled: true,
      syncCode: 'SYNC-' + Math.floor(100000 + Math.random() * 900000),
    });
    setIsSyncModalOpen(false);
  };

  const handleSaveEditedProductName = () => {
    if (!editingProductNameItem || !editingProductNameItem.name.trim()) return;
    const target = products.find((p) => p.id === editingProductNameItem.id);
    if (target) {
      onUpdateProduct({ ...target, name: editingProductNameItem.name.trim() });
    }
    setEditingProductNameItem(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    onAddProduct({
      name: newProdName.trim(),
      unit: newProdUnit || 'পিস',
      unitPrice: Number(newProdPrice) || 0,
      stock: Number(newProdStock) || 0,
      damageStock: Number(newProdDamage) || 0,
    });
    setNewProdName('');
    setNewProdPrice(0);
    setNewProdStock(0);
    setNewProdDamage(0);
    setIsAddProductModalOpen(false);
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    onUpdateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct || restockQty <= 0) return;
    const priceVal = restockPrice !== '' ? Number(restockPrice) : undefined;
    onRestockProduct(restockProduct.id, restockQty, priceVal);
    setRestockProduct(null);
    setRestockQty(10);
    setRestockPrice('');
  };

  // Damage Deduct Submit: "ড্যানেজ বিয়োগ করলে স্টকে যোগ হবেনা"
  const handleDamageDeductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damageDeductProduct || damageDeductQty <= 0) return;
    if (damageDeductQty > damageDeductProduct.damageStock) {
      alert('ড্যামেজ স্টকের চেয়ে বেশি বিয়োগ করা সম্ভব নয়!');
      return;
    }
    onDeductDamageToStock(damageDeductProduct.id, damageDeductQty, damageDeductNote);
    setDamageDeductProduct(null);
    setDamageDeductQty(1);
  };

  // Morning Issue Submit
  const handleMorningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!morningSalesmanId) {
      alert('দয়া করে সেলসম্যান নির্বাচন করুন!');
      return;
    }

    const itemsToIssue = Object.entries(morningQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, issuedQty]) => ({ productId, issuedQty }));

    if (itemsToIssue.length === 0) {
      alert('কমপক্ষে একটি পণ্যের বিতরণ পরিমাণ লিখুন!');
      return;
    }

    for (const item of itemsToIssue) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && item.issuedQty > prod.stock) {
        alert(`"${prod.name}" এর পর্যাপ্ত স্টক নেই! (বর্তমান স্টক: ${prod.stock})`);
        return;
      }
    }

    onConfirmMorningDispatch(morningSalesmanId, morningDate, itemsToIssue, morningNotes);
    setMorningQuantities({});
    setMorningNotes('');
    setActivePage('3'); // Switch to Page 3 (দিন শেষে ফেরত)
  };

  // Evening Settlement Submit: "তিন নম্বর অপসন টা দুই নম্বর অপসন এর মত হবে শুধু পাশে ফেরত এবং ড্যামেজ এড করার ব্যবস্থা থাকবে"
  const handleEveningSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eveningSalesmanId) {
      alert('দয়া করে সেলসম্যান নির্বাচন করুন!');
      return;
    }

    const salesman = salesmen.find((s) => s.id === eveningSalesmanId);
    if (!salesman) return;

    const finalItems: DispatchItem[] = [];
    products.forEach((p) => {
      const itemData = eveningItemsState[p.id] || { issuedQty: 0, returnQty: 0, damageQty: 0 };
      const issued = itemData.issuedQty || 0;
      const returned = itemData.returnQty || 0;
      const damage = itemData.damageQty || 0;

      if (issued > 0 || returned > 0 || damage > 0) {
        const sold = Math.max(0, issued - returned - damage);
        const total = sold * p.unitPrice;
        finalItems.push({
          productId: p.id,
          productName: p.name,
          unit: p.unit,
          unitPrice: p.unitPrice,
          issuedQty: issued,
          returnedQty: returned,
          damageReturnedQty: damage,
          soldQty: sold,
          totalAmount: total,
        });
      }
    });

    if (finalItems.length === 0) {
      alert('দয়া করে অন্তত একটি পণ্যের বিতরণ, ফেরত বা ড্যামেজ সংখ্যা লিখুন!');
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

    // Switch to Page 4 to see DSR Summary and Daily Ledger
    setActivePage('4');
  };

  const handleCollectDsrDue = (salesmanId: string) => {
    const amount = dsrCashDeposits[salesmanId] || 0;
    if (amount <= 0) {
      alert('দয়া করে জমার সঠিক পরিমাণ লিখুন!');
      return;
    }
    onCollectDueCash(salesmanId, amount, 'বাকি আদায় জমা');
    setDsrCashDeposits((prev) => ({ ...prev, [salesmanId]: 0 }));
  };

  const handleCreateDsr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDsrName.trim()) return;
    onAddSalesman(newDsrName.trim(), newDsrPhone.trim(), newDsrRoute.trim());
    setNewDsrName('');
    setNewDsrPhone('');
    setNewDsrRoute('');
    setIsAddDsrModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 max-w-full overflow-hidden">
      {/* ============================================================== */}
      {/* TOP BUSINESS BANNER & QUICK STATS (100% RESPONSIVE)             */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-slate-700/60 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Editable Business Name */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                ডিস্ট্রিবিউশন হাব
              </span>

              {/* Gmail Sync Status */}
              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-colors"
              >
                <Mail className="w-3 h-3" />
                <span>{currentUser?.email ? currentUser.email : (settings.connectedGmail || 'জিমেইল সিঙ্ক')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </button>

              {/* Install App Button */}
              <PWAInstallButton />
            </div>

            {isEditingBusinessName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={businessNameInput}
                  onChange={(e) => setBusinessNameInput(e.target.value)}
                  autoFocus
                  className="text-lg sm:text-2xl font-black bg-slate-800 text-white px-3 py-1 rounded-xl border border-emerald-500 focus:outline-none w-full max-w-xs"
                />
                <button
                  onClick={handleSaveBusinessName}
                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="সংরক্ষণ"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditingBusinessName(false)}
                  className="p-1.5 rounded-lg bg-slate-700 text-slate-300"
                  title="বাতিল"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
                  <span>{settings.businessName || 'মেসার্স ডিস্ট্রিবিউশন ট্রেডার্স'}</span>
                </h1>
                <button
                  onClick={() => {
                    setBusinessNameInput(settings.businessName || 'মেসার্স ডিস্ট্রিবিউশন ট্রেডার্স');
                    setIsEditingBusinessName(true);
                  }}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="ব্যবসায়িক নাম এডিট করুন"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* KPI Summary (Mobile-Friendly Grid) */}
          <div className="grid grid-cols-3 gap-2 w-full sm:w-auto pt-2 sm:pt-0">
            <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-xl p-2.5 text-center sm:text-left">
              <span className="text-[10px] text-emerald-300 block font-medium">বিক্রয়যোগ্য স্টক</span>
              <div className="text-sm sm:text-lg font-black text-emerald-400">
                {formatCurrency(totalStockValue)}
              </div>
            </div>

            <div className="bg-rose-950/50 border border-rose-800/40 rounded-xl p-2.5 text-center sm:text-left">
              <span className="text-[10px] text-rose-300 block font-medium">ড্যামেজ মূল্য</span>
              <div className="text-sm sm:text-lg font-black text-rose-400">
                {formatCurrency(totalDamageValue)}
              </div>
            </div>

            <div className="bg-amber-950/50 border border-amber-800/40 rounded-xl p-2.5 text-center sm:text-left">
              <span className="text-[10px] text-amber-300 block font-medium">মোট DSR বাকি</span>
              <div className="text-sm sm:text-lg font-black text-amber-400">
                {formatCurrency(totalDsrDue)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4 DISTINCT SEPARATE PAGE BUTTONS (AS REQUESTED)                 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => setActivePage('1')}
          className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
            activePage === '1'
              ? 'bg-emerald-600 text-white shadow-md border-emerald-600 font-bold'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 font-semibold'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            activePage === '1' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
          }`}>
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black block leading-tight">০১. স্টক ও ড্যামেজ বিয়োগ</span>
            <span className="text-[10px] opacity-80 block">{products.length} টি পন্য</span>
          </div>
        </button>

        <button
          onClick={() => setActivePage('2')}
          className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
            activePage === '2'
              ? 'bg-amber-600 text-white shadow-md border-amber-600 font-bold'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 font-semibold'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            activePage === '2' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black block leading-tight">০২. সকালে পন্য বিতরন</span>
            <span className="text-[10px] opacity-80 block">স্টক থেকে বিয়োগ</span>
          </div>
        </button>

        <button
          onClick={() => setActivePage('3')}
          className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
            activePage === '3'
              ? 'bg-indigo-600 text-white shadow-md border-indigo-600 font-bold'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 font-semibold'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            activePage === '3' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-800'
          }`}>
            <Moon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black block leading-tight">০৩. দিন শেষে ফেরত ও ড্যামেজ যোগ</span>
            <span className="text-[10px] opacity-80 block">স্টকে ফেরত যোগ</span>
          </div>
        </button>

        <button
          onClick={() => setActivePage('4')}
          className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 ${
            activePage === '4'
              ? 'bg-teal-600 text-white shadow-md border-teal-600 font-bold'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 font-semibold'
          }`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            activePage === '4' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
          }`}>
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black block leading-tight">০৪. ডিএসআর সামারি ও আলাদা জমা</span>
            <span className="text-[10px] opacity-80 block">বাকি ও আদায়</span>
          </div>
        </button>
      </div>

      {/* ============================================================== */}
      {/* PAGE 1: ০১. পন্য স্টক ও ড্যামেজ বিয়োগ (NO HORIZONTAL SCROLL)     */}
      {/* ============================================================== */}
      {activePage === '1' && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>০১. পন্য স্টক ও ড্যামেজ বিয়োগ</span>
              </h2>
              <p className="text-xs text-slate-500">
                একই স্ক্রিনে সব তথ্য দৃশ্যমান (ড্যামেজ বিয়োগ করলে স্টকে যোগ হবে না)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="পণ্য খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => setIsAddProductModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন পণ্য</span>
              </button>
            </div>
          </div>

          {/* RESPONSIVE FULL-VIEW CARD LIST (ZERO HORIZONTAL SCROLL) */}
          <div className="space-y-3">
            {filteredProducts.map((product, idx) => {
              const totalVal = product.stock * product.unitPrice;
              const dmgVal = product.damageStock * product.unitPrice;
              const hasDamage = product.damageStock > 0;

              return (
                <div 
                  key={product.id}
                  className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs transition-all space-y-3 w-full"
                >
                  {/* Top Row: Serial + Product Name + Edit Pencil */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-200/80 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                            {product.name}
                          </h3>
                          <button
                            onClick={() => setEditingProductNameItem({ id: product.id, name: product.name })}
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-slate-200/60"
                            title="পণ্যের নাম এডিট করুন"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[11px] text-slate-400">একক: {product.unit}</span>
                      </div>
                    </div>

                    {/* Quick Product Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setRestockProduct(product);
                          setRestockQty(10);
                          setRestockPrice(product.unitPrice.toString());
                        }}
                        title="স্টক রিফিল"
                        className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingProduct(product)}
                        title="সম্পূর্ণ এডিট"
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${product.name}" মুছে ফেলতে চান?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        title="মুছে ফেলুন"
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Middle Row: Price, Sellable Stock, Total Stock Value (All Visible) */}
                  <div className="grid grid-cols-3 gap-2 bg-white rounded-xl p-2.5 border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">একক দর</span>
                      <strong className="text-xs sm:text-sm text-slate-800 font-bold">{formatCurrency(product.unitPrice)}</strong>
                    </div>

                    <div className="border-x border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">বিক্রয়যোগ্য স্টক</span>
                      <strong className={`text-xs sm:text-sm font-black ${
                        product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {product.stock} {product.unit}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">টোটাল স্টক ভ্যালু</span>
                      <strong className="text-xs sm:text-sm text-emerald-700 font-black">
                        {formatCurrency(totalVal)}
                      </strong>
                    </div>
                  </div>

                  {/* Bottom Row: Damage Stock & Direct Damage Deduct Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">ড্যামেজ স্টক:</span>
                      {hasDamage ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{product.damageStock} {product.unit}</span>
                          <span className="text-[10px] font-normal text-rose-700">({formatCurrency(dmgVal)})</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold">০</span>
                      )}
                    </div>

                    {hasDamage && (
                      <button
                        onClick={() => {
                          setDamageDeductProduct(product);
                          setDamageDeductQty(Math.min(product.damageStock, 1));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>ড্যামেজ বিয়োগ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* PAGE 2: ০২. সকালে পন্য বিতরন (NO HORIZONTAL SCROLL)              */}
      {/* ============================================================== */}
      {activePage === '2' && (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-600" />
                <span>০২. সকালে পন্য বিতরন (স্টক থেকে বিয়োগ)</span>
              </h2>
              <p className="text-xs text-slate-500">
                সেলসম্যানকে মালামাল বুঝিয়ে দিলে সাথে সাথে মূল বিক্রয়যোগ্য স্টক থেকে বিয়োগ হবে
              </p>
            </div>

            <button
              onClick={() => setIsAddDsrModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ডিএসআর</span>
            </button>
          </div>

          <form onSubmit={handleMorningSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">সেলসম্যান (DSR) *</label>
                <select
                  value={morningSalesmanId}
                  onChange={(e) => setMorningSalesmanId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-amber-500"
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
                  value={morningDate}
                  onChange={(e) => setMorningDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">নোট / মন্তব্য</label>
                <input
                  type="text"
                  placeholder="যেমন: রুট ডেলিভারি চালান"
                  value={morningNotes}
                  onChange={(e) => setMorningNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Mobile-Friendly Product Cards for Morning Dispatch */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 block">পণ্য অনুযায়ী বিতরণের পরিমাণ লিখুন:</span>
              {products.map((p) => {
                const qty = morningQuantities[p.id] || 0;
                const itemVal = qty * p.unitPrice;

                return (
                  <div 
                    key={p.id}
                    className={`p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                      qty > 0 ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>দর: {formatCurrency(p.unitPrice)}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700">স্টক: {p.stock} {p.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <input
                          type="number"
                          min="0"
                          max={p.stock}
                          disabled={p.stock <= 0}
                          placeholder="0"
                          value={qty > 0 ? qty : ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setMorningQuantities((prev) => ({
                              ...prev,
                              [p.id]: isNaN(val) || val < 0 ? 0 : val,
                            }));
                          }}
                          className="w-20 text-center py-1 px-1 text-sm font-black rounded-lg border border-amber-400 bg-white focus:ring-2 focus:ring-amber-500"
                        />
                        <span className="block text-[10px] text-slate-500 mt-0.5">
                          {qty > 0 ? formatCurrency(itemVal) : '০'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>মালামাল বুঝিয়ে দিন ও মূল স্টক থেকে বিয়োগ করুন</span>
            </button>
          </form>
        </section>
      )}

      {/* ============================================================== */}
      {/* PAGE 3: ০৩. দিন শেষে ফেরত ও ড্যামেজ যোগ (ALWAYS EDITABLE)       */}
      {/* ============================================================== */}
      {activePage === '3' && (
        <OptionThreeEveningView
          products={products}
          salesmen={salesmen}
          dispatches={dispatches}
          morningQuantities={morningQuantities}
          onSettleDispatch={onSettleDispatch}
          onOpenPrintSlip={onOpenPrintSlip}
          onNavigateToPage4={() => setActivePage('4')}
        />
      )}

      {/* ============================================================== */}
      {/* PAGE 4: ০৪. ডিএসআর সামারি ও তারিখ অনুযায়ী দৈনিক হিসাব         */}
      {/* ============================================================== */}
      {activePage === '4' && (
        <OptionFourDsrSummaryView
          salesmen={salesmen}
          dispatches={dispatches}
          onCollectDueCash={onCollectDueCash}
          onOpenPrintSlip={onOpenPrintSlip}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL: 1. Edit Product Name                                    */}
      {/* ============================================================== */}
      {editingProductNameItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-600" />
              <span>পণ্যের নাম এডিট করুন</span>
            </h3>

            <input
              type="text"
              required
              value={editingProductNameItem.name}
              onChange={(e) => setEditingProductNameItem({ ...editingProductNameItem, name: e.target.value })}
              className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingProductNameItem(null)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSaveEditedProductName}
                className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                আপডেট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: 2. Damage Deduct (DOES NOT ADD TO STOCK AS REQUESTED)   */}
      {/* ============================================================== */}
      {damageDeductProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-rose-600 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">ড্যামেজ পণ্য বিয়োগ</h3>
                <p className="text-[11px] text-rose-100">{damageDeductProduct.name}</p>
              </div>
              <button onClick={() => setDamageDeductProduct(null)} className="text-white text-xl leading-none">
                &times;
              </button>
            </div>

            <form onSubmit={handleDamageDeductSubmit} className="p-4 space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">বর্তমান ড্যামেজ স্টক:</span>
                  <span className="font-bold text-rose-700">{damageDeductProduct.damageStock} {damageDeductProduct.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  বিয়োগ করার পরিমাণ ({damageDeductProduct.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={damageDeductProduct.damageStock}
                  required
                  value={damageDeductQty}
                  onChange={(e) => setDamageDeductQty(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-base font-black rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800">
                ⚠️ নোট: ড্যামেজ বিয়োগ করলে তা স্টকে যোগ হবে না (নষ্ট হিসেবে বাদ হবে)।
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDamageDeductProduct(null)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  ড্যামেজ বিয়োগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Gmail Sync Modal                                        */}
      {/* ============================================================== */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>জিমেইল সিঙ্ক ও মাল্টি-ডিভাইস</span>
              </h3>
              <button onClick={() => setIsSyncModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            {currentUser?.email ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                <div className="font-bold text-emerald-900">কানেক্টেড: {currentUser.email}</div>
                <div className="text-[11px] text-emerald-700 mt-1">সব ডিভাইসে লাইভ সিঙ্ক হচ্ছে।</div>
              </div>
            ) : (
              <div className="space-y-2">
                {onGoogleSignIn && (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <span>গুগল দিয়ে সাইন ইন / জিমেইল কানেক্ট</span>
                  </button>
                )}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">জিমেইল আইডি:</label>
                  <input
                    type="email"
                    value={gmailInput}
                    onChange={(e) => setGmailInput(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveGmailSync}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Add Product                                             */}
      {/* ============================================================== */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">নতুন পণ্য যোগ করুন</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফ্রুটো জুস"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">একক</label>
                  <select
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  >
                    <option value="পিস">পিস</option>
                    <option value="প্যাকেট">প্যাকেট</option>
                    <option value="কার্টুন">কার্টুন</option>
                    <option value="কেজি">কেজি</option>
                    <option value="লিটার">লিটার</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">দর (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={newProdPrice || ''}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">স্টক</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdStock || ''}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ড্যামেজ</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdDamage || ''}
                    onChange={(e) => setNewProdDamage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(false)}
                  className="flex-1 py-1.5 rounded-xl border border-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Full Edit Product                                       */}
      {/* ============================================================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">পণ্য সংশোধন</h3>
            <form onSubmit={handleUpdateProductSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">একক</label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">দর (৳) *</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editingProduct.unitPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1">স্টক</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">ড্যামেজ</label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.damageStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, damageStock: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-1.5 rounded-xl border border-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl bg-slate-900 text-white font-bold"
                >
                  আপডেট
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Restock Product                                         */}
      {/* ============================================================== */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">স্টক রিফিল: {restockProduct.name}</h3>
            <form onSubmit={handleRestockSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">যোগ করার পরিমাণ ({restockProduct.unit}) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-base font-black rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">দর পরিবর্তন (ঐচ্ছিক)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder={restockProduct.unitPrice.toString()}
                  value={restockPrice}
                  onChange={(e) => setRestockPrice(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="flex-1 py-1.5 rounded-xl border border-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Add Salesman (DSR)                                      */}
      {/* ============================================================== */}
      {isAddDsrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">নতুন ডিএসআর যোগ</h3>
            <form onSubmit={handleCreateDsr} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ আল-আমিন"
                  value={newDsrName}
                  onChange={(e) => setNewDsrName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">মোবাইল</label>
                <input
                  type="text"
                  placeholder="01700-000000"
                  value={newDsrPhone}
                  onChange={(e) => setNewDsrPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">রুট / এলাকা</label>
                <input
                  type="text"
                  placeholder="যেমন: রুট ৫ - বাজার রোড"
                  value={newDsrRoute}
                  onChange={(e) => setNewDsrRoute(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDsrModalOpen(false)}
                  className="flex-1 py-1.5 rounded-xl border border-slate-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl bg-amber-600 text-white font-bold"
                >
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
