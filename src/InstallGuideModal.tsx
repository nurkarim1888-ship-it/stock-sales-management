import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Apple, 
  Monitor, 
  X, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  MoreVertical,
  Laptop
} from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNativeInstall?: () => void;
  isInstallable?: boolean;
  onOpenPlayStoreGuide?: () => void;
  onDownloadOfflineApp?: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  onNativeInstall,
  isInstallable,
  onOpenPlayStoreGuide,
  onDownloadOfflineApp,
}) => {
  const [activeDevice, setActiveDevice] = useState<'android' | 'ios' | 'pc'>('android');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">অ্যাপটি ইনস্টল করার সহজ নিয়ম</h3>
              <p className="text-xs text-emerald-100">মোবাইল বা কম্পিউটারে কোনো প্লে-স্টোর ছাড়াই ইনস্টল করুন</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 1-Click Native Install Button (if browser prompt available) */}
        {isInstallable && onNativeInstall && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-emerald-900">সরাসরি ১-ক্লিকে ইনস্টল করুন</p>
              <p className="text-xs text-emerald-700">আপনার ব্রাউজারে ইনস্টল বাটন প্রস্তুত আছে</p>
            </div>
            <button
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" /> ইনস্টল চাপুন
            </button>
          </div>
        )}

        {/* Offline App Download & Safe Usage Section */}
        <div className="p-4 bg-slate-900 text-white border-b border-slate-800 space-y-3">
          <div className="p-3 bg-amber-950/70 border border-amber-600/60 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <span>⚠️</span>
              <span>লিংক কেন অন্য ফোনে কাজ করে না বা এরর আসে?</span>
            </div>
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              ব্রাউজারের ওপরের লিংকটি গুগল এআই স্টুডিওর একটি সুরক্ষিত ডেভেলপমেন্ট প্রিভিউ লিংক। গুগল সিকিউরিটির কারণে এটি অন্য কোনো সাধারণ মোবাইল বা অন্য ব্রাউজারে খুললে 403 এরর বা কোড দেখায়।
            </p>
          </div>

          {/* 1-Click Offline App Download Action */}
          {onDownloadOfflineApp && (
            <div className="bg-gradient-to-r from-emerald-900/90 via-slate-800 to-teal-900/90 p-3.5 rounded-xl border border-emerald-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>উপায় ১: অফলাইন অ্যাপ ফাইল ডাউনলোড (.html)</span>
                </span>
                <p className="text-[11px] text-slate-300 leading-tight">
                  ফাইলটি ফোনে বা পিসিতে নিয়ে Chrome দিয়ে খুললেই ইন্টারনেট ছাড়াই অ্যাপ চলবে!
                </p>
              </div>
              <button
                onClick={() => {
                  onDownloadOfflineApp();
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>অ্যাপ ডাউনলোড করুন</span>
              </button>
            </div>
          )}
        </div>

        {/* Device Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveDevice('android')}
            className={`flex-1 py-3 px-2 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeDevice === 'android'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" /> অ্যান্ড্রয়েড (Android)
          </button>
          <button
            onClick={() => setActiveDevice('ios')}
            className={`flex-1 py-3 px-2 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeDevice === 'ios'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Apple className="w-4 h-4" /> আইফোন (iPhone/iPad)
          </button>
          <button
            onClick={() => setActiveDevice('pc')}
            className={`flex-1 py-3 px-2 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition ${
              activeDevice === 'pc'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" /> কম্পিউটার (PC/Laptop)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {activeDevice === 'android' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-xs">
                <strong>💡 সবথেকে সহজ উপায়:</strong> ওপরে থাকা <strong>"অ্যাপ ডাউনলোড করুন"</strong> বাটনে চাপ দিন। আপনার ফোনে <code>DSR-Stock-App.html</code> ফাইল ডাউনলোড হবে। এরপর নিচের ধাপগুলো অনুসরণ করুন:
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  ১
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Chrome ব্রাউজারে ফাইল বা পেজটি ওপেন করুন</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    ডাউনলোড করা ফাইলটি আপনার ফোনের <strong>Google Chrome</strong> দিয়ে ওপেন করুন। অথবা ক্রোম ব্রাউজারে অ্যাপের পেজে থাকুন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  ২
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">ক্রোমের মেনুতে চাপুন</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Google Chrome-এর ওপরের ডানদিকের <strong>তিনটি ডট (⋮)</strong> মেনু বাটনে চাপ দিন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  ৩
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">"Add to Home screen" বা "Install" চাপুন</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    মেনু থেকে <strong>"Add to Home screen"</strong> (বাংলায়: <strong>"হোম স্ক্রিনে যোগ করুন"</strong>) বা <strong>"Install app"</strong> চাপুন।
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 text-xs">
                ✅ <strong>হয়ে গেল!</strong> এখন আপনার মোবাইল ফোনের ডিসপ্লেতে অন্যান্য অ্যাপের (যেমন bKash, WhatsApp) মতো এই অ্যাপের আইকন তৈরি হয়ে যাবে এবং এক ট্যাপেই ফুল স্ক্রিনে খুলবে।
              </div>
            </div>
          )}

          {activeDevice === 'ios' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  ১
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Safari ব্রাউজারে লিংকটি ওপেন করুন</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Safari ব্রাউজারের নিচে থাকা <strong>Share (📤)</strong> শেয়ার বাটনে চাপুন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  ২
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">"Add to Home Screen" অপশন বেছে নিন</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    একটু নিচে স্ক্রল করে <strong>"Add to Home Screen" (+)</strong> অপশনে চাপুন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  ৩
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">উপরে ডানে "Add" এ চাপুন</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    উপরে ডান কোণায় থাকা <strong>"Add"</strong> বাটনে ক্লিক করলেই আইফোনের হোমস্ক্রিনে অ্যাপ হিসেবে যুক্ত হয়ে যাবে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeDevice === 'pc' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  ১
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Chrome বা Edge ব্রাউজারে ওপেন করুন</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    ব্রাউজারের উপরের অ্যাড্রেস বারের একেবারে ডানপাশে থাকা <strong>ইনস্টল আইকন (⬇️ বা ⊕)</strong> দেখতে পাবেন।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  ২
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">"Install" বাটনে ক্লিক করুন</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    পপ-আপে <strong>"Install"</strong> বাটনে ক্লিক করলেই এটি ফুল-স্ক্রিন উইন্ডোতে আলাদা সফটওয়্যার অ্যাপ হিসেবে চালু হবে এবং ডেস্কটপ শর্টকাট তৈরি হবে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Note */}
          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              ইনস্টল করলে ব্রাউজার ছাড়া ফুল স্ক্রিনে খুব দ্রুত কাজ করবে এবং অফলাইনেও ক্যাশ ডাটা সংরক্ষিত থাকবে।
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          {onOpenPlayStoreGuide && (
            <button
              onClick={() => {
                onClose();
                onOpenPlayStoreGuide();
              }}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1.5 underline decoration-emerald-500 cursor-pointer"
            >
              <span>গুগল প্লে স্টোরে পাবলিশ করার নিয়ম দেখুন &rarr;</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs sm:text-sm rounded-xl transition cursor-pointer ml-auto"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
