import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Product, 
  Salesman, 
  DispatchSession, 
  DispatchItem, 
  DamageLog,
  AppSettings 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_SALESMEN, 
  INITIAL_DISPATCHES, 
  INITIAL_DAMAGE_LOGS 
} from './data/initialData';
import { OneViewApp } from './components/OneViewApp';
import { PrintSlipModal } from './components/PrintSlipModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { InstallGuideModal } from './components/InstallGuideModal';
import { PlayStoreGuideModal } from './components/PlayStoreGuideModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { downloadOfflineAppHtml } from './utils/exportOfflineApp';
import { Package, RotateCcw, Building2, Mail, Cloud, CloudOff, Share2, Smartphone, Download, HelpCircle } from 'lucide-react';
import { formatCurrency } from './utils/formatters';
import { auth, testFirestoreConnection } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  loginWithGoogle, 
  logoutUser, 
  syncStateToFirestore, 
  subscribeToUserData 
} from './utils/cloudSync';

const STORAGE_KEYS = {
  PRODUCTS: 'dsr_inventory_products_v3',
  SALESMEN: 'dsr_inventory_salesmen_v3',
  DISPATCHES: 'dsr_inventory_dispatches_v3',
  DAMAGE_LOGS: 'dsr_inventory_damage_logs_v3',
  SETTINGS: 'dsr_inventory_settings_v3',
};

const INITIAL_SETTINGS: AppSettings = {
  businessName: 'মেসার্স ডিস্ট্রিবিউশন ট্রেডার্স',
  businessAddress: 'বাজার রোড, সদর ঘাট',
  businessPhone: '01712-345678',
  connectedGmail: 'Nurkarim1888@gmail.com',
  cloudSyncEnabled: true,
  syncCode: 'SYNC-882190',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isSyncingFromRemote = useRef(false);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [salesmen, setSalesmen] = useState<Salesman[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALESMEN);
      return saved ? JSON.parse(saved) : INITIAL_SALESMEN;
    } catch {
      return INITIAL_SALESMEN;
    }
  });

  const [dispatches, setDispatches] = useState<DispatchSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISPATCHES);
      return saved ? JSON.parse(saved) : INITIAL_DISPATCHES;
    } catch {
      return INITIAL_DISPATCHES;
    }
  });

  const [damageLogs, setDamageLogs] = useState<DamageLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DAMAGE_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_DAMAGE_LOGS;
    } catch {
      return INITIAL_DAMAGE_LOGS;
    }
  });

  const [printModalSession, setPrintModalSession] = useState<DispatchSession | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isPlayStoreModalOpen, setIsPlayStoreModalOpen] = useState(false);

  // Monitor Auth State
  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user?.email) {
        setSettings((prev) => ({ ...prev, connectedGmail: user.email || prev.connectedGmail }));
      }
    });
    return () => unsub();
  }, []);

  // Real-time Cloud Sync Subscription across devices
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToUserData(currentUser.uid, {
      onSettings: (newSettings) => {
        isSyncingFromRemote.current = true;
        setSettings(newSettings);
        setTimeout(() => { isSyncingFromRemote.current = false; }, 300);
      },
      onProducts: (newProds) => {
        isSyncingFromRemote.current = true;
        setProducts(newProds);
        setTimeout(() => { isSyncingFromRemote.current = false; }, 300);
      },
      onSalesmen: (newSalesmen) => {
        isSyncingFromRemote.current = true;
        setSalesmen(newSalesmen);
        setTimeout(() => { isSyncingFromRemote.current = false; }, 300);
      },
      onDispatches: (newDispatches) => {
        isSyncingFromRemote.current = true;
        setDispatches(newDispatches);
        setTimeout(() => { isSyncingFromRemote.current = false; }, 300);
      },
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Push local updates to Cloud when signed in
  useEffect(() => {
    if (currentUser && !isSyncingFromRemote.current) {
      syncStateToFirestore(currentUser.uid, {
        products,
        salesmen,
        dispatches,
        damageLogs,
        settings,
      });
    }
  }, [currentUser, products, salesmen, dispatches, damageLogs, settings]);

  // Auto save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALESMEN, JSON.stringify(salesmen));
  }, [salesmen]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISPATCHES, JSON.stringify(dispatches));
  }, [dispatches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAMAGE_LOGS, JSON.stringify(damageLogs));
  }, [damageLogs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await loginWithGoogle();
      if (user) {
        showToast(`জিমেইল (${user.email}) সফলভাবে কানেক্ট করা হয়েছে!`);
      }
    } catch (err) {
      showToast('গুগল লগইন সম্পন্ন করা যায়নি।');
    }
  };

  const handleGoogleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      showToast('জিমেইল থেকে লগআউট করা হয়েছে।');
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('ব্যবসায়িক তথ্য সফলভাবে আপডেট হয়েছে!');
  };

  // Product Actions
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const product: Product = {
      ...newProd,
      id: 'prod-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [product, ...prev]);
    showToast(`"${product.name}" যোগ করা হয়েছে!`);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`"${updated.name}" এর তথ্য আপডেট হয়েছে!`);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('পণ্য তালিকা থেকে বাদ দেওয়া হয়েছে।');
  };

  const handleRestockProduct = (productId: string, addQty: number, newUnitPrice?: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            stock: p.stock + addQty,
            unitPrice: newUnitPrice !== undefined ? newUnitPrice : p.unitPrice,
          };
        }
        return p;
      })
    );
    showToast(`স্টকে ${addQty} পিস যোগ করা হয়েছে!`);
  };

  // 2. Damage Deduct from Product Stock: "ড্যামেজ বিয়োগ করলে স্টকে যোগ হবেনা"
  const handleDeductDamageToStock = (productId: string, quantity: number, note: string) => {
    let prodName = '';
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          prodName = p.name;
          const newDamageStock = Math.max(0, p.damageStock - quantity);
          // ড্যামেজ বিয়োগ করলে মূল স্টকে যোগ হবে না!
          return {
            ...p,
            damageStock: newDamageStock,
          };
        }
        return p;
      })
    );

    const log: DamageLog = {
      id: 'dmg-' + Date.now(),
      productId,
      productName: prodName || 'পণ্য',
      quantity,
      action: 'scrapped',
      note,
      date: new Date().toISOString().split('T')[0],
    };
    setDamageLogs((prev) => [log, ...prev]);
    showToast(`${quantity} টি ড্যামেজ পণ্য বিয়োগ করা হয়েছে! (স্টকে যোগ হয়নি)`);
  };

  // Salesman Actions
  const handleAddSalesman = (name: string, phone: string, route: string) => {
    const newSalesman: Salesman = {
      id: 'dsr-' + Date.now(),
      name,
      phone,
      route,
      currentDue: 0,
    };
    setSalesmen((prev) => [...prev, newSalesman]);
    showToast(`সেলসম্যান "${name}" যোগ করা হয়েছে!`);
  };

  const handleCollectDueCash = (salesmanId: string, amount: number, note: string) => {
    setSalesmen((prev) =>
      prev.map((s) => {
        if (s.id === salesmanId) {
          const newDue = Math.max(0, (s.currentDue || 0) - amount);
          return {
            ...s,
            currentDue: newDue,
          };
        }
        return s;
      })
    );
    showToast(`৳ ${amount} জমা গ্রহণ করা হয়েছে!`);
  };

  // Morning Issue: "সেলসম্যানকে পণ্য বুঝিয়ে দিলে স্টক থেকে বিয়োগ হয়"
  const handleConfirmMorningDispatch = (
    salesmanId: string,
    date: string,
    itemsToIssue: { productId: string; issuedQty: number }[],
    notes: string
  ) => {
    const salesman = salesmen.find((s) => s.id === salesmanId);
    if (!salesman) return;

    const dispatchItems: DispatchItem[] = [];

    setProducts((prevProducts) => {
      const copy = [...prevProducts];
      itemsToIssue.forEach(({ productId, issuedQty }) => {
        const idx = copy.findIndex((p) => p.id === productId);
        if (idx !== -1) {
          const p = copy[idx];
          copy[idx] = {
            ...p,
            stock: Math.max(0, p.stock - issuedQty),
          };
          dispatchItems.push({
            productId: p.id,
            productName: p.name,
            unit: p.unit,
            unitPrice: p.unitPrice,
            issuedQty,
            returnedQty: 0,
            damageReturnedQty: 0,
            soldQty: 0,
            totalAmount: 0,
          });
        }
      });
      return copy;
    });

    const newSession: DispatchSession = {
      id: 'disp-' + Date.now(),
      challanNo: `CH-${1000 + dispatches.length + 1}`,
      salesmanId: salesman.id,
      salesmanName: salesman.name,
      salesmanRoute: salesman.route,
      date,
      status: 'morning_issued',
      items: dispatchItems,
      totalAmount: 0,
      cashCollected: 0,
      dueAmount: 0,
      notes,
      createdAt: new Date().toISOString(),
    };

    setDispatches((prev) => [newSession, ...prev]);
    showToast(`চালান নিশ্চিত! পণ্য মূল স্টক থেকে বিয়োগ হয়েছে।`);
  };

  // Evening Settlement: "অবিক্রীত ফেরত পণ্য স্বয়ংক্রিয়ভাবে মূল স্টকে যোগ হয় এবং ড্যামেজ যোগ দিন শেষে ফেরত ওখানে হবে"
  const handleSettleDispatch = (
    dispatchId: string | null,
    updatedItems: DispatchItem[],
    cashCollected: number,
    notes: string,
    extraInfo?: {
      salesmanId: string;
      date: string;
    }
  ) => {
    let targetSalesmanId = extraInfo?.salesmanId || '';
    const existingSession = dispatchId ? dispatches.find((d) => d.id === dispatchId) : null;
    if (existingSession) {
      targetSalesmanId = existingSession.salesmanId;
    }

    const salesman = salesmen.find((s) => s.id === targetSalesmanId);
    if (!salesman) return;

    const grandTotal = updatedItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const dueAmount = Math.max(0, grandTotal - cashCollected);

    // Auto add unsold return to sellable stock, and add damage return to damage stock!
    setProducts((prevProducts) => {
      const copy = [...prevProducts];
      updatedItems.forEach((item) => {
        const idx = copy.findIndex((p) => p.id === item.productId);
        if (idx !== -1) {
          const p = copy[idx];
          if (existingSession) {
            copy[idx] = {
              ...p,
              stock: p.stock + (item.returnedQty || 0),
              damageStock: p.damageStock + (item.damageReturnedQty || 0),
            };
          } else {
            const netDeductFromStock = Math.max(0, item.issuedQty - (item.returnedQty || 0));
            copy[idx] = {
              ...p,
              stock: Math.max(0, p.stock - netDeductFromStock),
              damageStock: p.damageStock + (item.damageReturnedQty || 0),
            };
          }
        }
      });
      return copy;
    });

    // Update salesman due
    setSalesmen((prevSalesmen) =>
      prevSalesmen.map((s) => {
        if (s.id === targetSalesmanId) {
          return {
            ...s,
            currentDue: (s.currentDue || 0) + dueAmount,
          };
        }
        return s;
      })
    );

    const settledSession: DispatchSession = existingSession
      ? {
          ...existingSession,
          status: 'settled',
          items: updatedItems,
          totalAmount: grandTotal,
          cashCollected,
          dueAmount,
          notes: notes || existingSession.notes,
          settledAt: new Date().toISOString(),
        }
      : {
          id: 'disp-' + Date.now(),
          challanNo: `CH-${1000 + dispatches.length + 1}`,
          salesmanId: salesman.id,
          salesmanName: salesman.name,
          salesmanRoute: salesman.route,
          date: extraInfo?.date || new Date().toISOString().split('T')[0],
          status: 'settled',
          items: updatedItems,
          totalAmount: grandTotal,
          cashCollected,
          dueAmount,
          notes,
          createdAt: new Date().toISOString(),
          settledAt: new Date().toISOString(),
        };

    setDispatches((prev) => {
      if (existingSession) {
        return prev.map((d) => (d.id === existingSession.id ? settledSession : d));
      } else {
        return [settledSession, ...prev];
      }
    });

    showToast('দিনশেষের হিসাব সম্পন্ন! অবিক্রীত ফেরত পণ্য স্টকে ও ড্যামেজ ড্যামেজ স্টকে যোগ হয়েছে।');
    setPrintModalSession(settledSession);
  };

  const handleResetData = () => {
    if (confirm('আপনি কি প্রাথমিক ডেমো ডাটা রিসেট করতে চান? বর্তমান এন্ট্রি মুছে প্রাথমিক ডাটা লোড হবে।')) {
      localStorage.clear();
      setSettings(INITIAL_SETTINGS);
      setProducts(INITIAL_PRODUCTS);
      setSalesmen(INITIAL_SALESMEN);
      setDispatches(INITIAL_DISPATCHES);
      setDamageLogs(INITIAL_DAMAGE_LOGS);
      showToast('ডাটা সফলভাবে রিসেট করা হয়েছে!');
    }
  };

  const handleDownloadOfflineApp = () => {
    downloadOfflineAppHtml(products, salesmen, dispatches, damageLogs, settings);
    showToast('সম্পূর্ণ অফলাইন অ্যাপ ফাইল (.html) ডাউনলোড সম্পন্ন হয়েছে!');
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Offline Status */}
      <OfflineIndicator />

      {/* Dynamic App Install & Device Guidance Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-800/40 text-emerald-200 text-xs py-2 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-white flex items-center gap-1.5 text-xs">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>মোবাইল বা কম্পিউটারে অ্যাপ ব্যবহারের উপায়:</span>
            </span>
            <span className="text-slate-300 text-[11px] hidden md:inline">
              এই প্রিভিউ স্ক্রিনেই ব্যবহার করতে পারেন অথবা অফলাইন ফাইল ডাউনলোড করে ইন্টারনেট ছাড়া চালাতে পারেন
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadOfflineApp}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="ইন্টারনেট ছাড়া চালানোর জন্য সিঙ্গেল ফাইল অ্যাপ ডাউনলোড করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>📥 অফলাইন অ্যাপ ডাউনলোড (.html)</span>
            </button>
            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs rounded-lg border border-slate-700 shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>ইনস্টল করার সহজ নিয়ম</span>
            </button>
            <button
              onClick={() => setIsPlayStoreModalOpen(true)}
              className="px-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>প্লে স্টোর পাবলিশ গাইড</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Global Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-wide">
                  {settings.businessName || 'স্টক ও ডিএসআর সেলস'}
                </span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  ওয়ান ভিউ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                একই পেজে সম্পূর্ণ স্টক, বিতরণ, ফেরত ও ডিএসআর বাকি হিসাব
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />

            <button
              onClick={handleResetData}
              title="ডাটা রিসেট"
              className="text-xs text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ডাটা রিসেট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single Page View - No Tabs / One View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <OneViewApp
          products={products}
          salesmen={salesmen}
          dispatches={dispatches}
          damageLogs={damageLogs}
          settings={settings}
          currentUser={currentUser}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          onUpdateSettings={handleUpdateSettings}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onRestockProduct={handleRestockProduct}
          onDeductDamageToStock={handleDeductDamageToStock}
          onConfirmMorningDispatch={handleConfirmMorningDispatch}
          onSettleDispatch={handleSettleDispatch}
          onAddSalesman={handleAddSalesman}
          onCollectDueCash={handleCollectDueCash}
          onOpenPrintSlip={(session) => setPrintModalSession(session)}
          onResetData={handleResetData}
        />
      </main>

      {/* Printable Slip Modal */}
      <PrintSlipModal
        session={printModalSession}
        businessName={settings.businessName}
        onClose={() => setPrintModalSession(null)}
      />

      {/* Install Guide Modal */}
      <InstallGuideModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onOpenPlayStoreGuide={() => setIsPlayStoreModalOpen(true)}
        onDownloadOfflineApp={handleDownloadOfflineApp}
      />

      {/* Google Play Store Publish Guide Modal */}
      <PlayStoreGuideModal
        isOpen={isPlayStoreModalOpen}
        onClose={() => setIsPlayStoreModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 text-center print:hidden">
        <p>{settings.businessName} • ওয়ান ভিউ স্টক ও ডিএসআর সেলস ম্যানেজমেন্ট</p>
      </footer>
    </div>
  );
}
