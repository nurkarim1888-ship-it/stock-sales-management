import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  ExternalLink, 
  Package, 
  ShieldCheck, 
  Download, 
  Copy, 
  Layers,
  Sparkles,
  HelpCircle,
  FileCode
} from 'lucide-react';

interface PlayStoreGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreGuideModal: React.FC<PlayStoreGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyManifestUrl = () => {
    const manifestUrl = `${window.location.origin}/manifest.webmanifest`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(manifestUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-inner">
              <Smartphone className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black">গুগল প্লে স্টোরে পাবলিশ করার নিয়ম</h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                  Play Store Ready
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                আপনার এই অ্যাপটি গুগল প্লে স্টোরে APK / AAB ফাইল হিসেবে আপলোড করার পূর্ণাঙ্গ গাইড
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Readiness Status Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>আপনার অ্যাপে প্লে স্টোরের সব শর্ত শতভাগ প্রস্তুত আছে!</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              অ্যাপটি <strong>Google PWA (TWA - Trusted Web Activity)</strong> স্ট্যান্ডার্ড মেনে তৈরি করা হয়েছে। এতে প্লে স্টোরের জন্য প্রয়োজনীয় 512x512 আইকন, 192x192 আইকন, মাস্কেবল আইকন, অফলাইন সার্ভিস ওয়ার্কার এবং <code>manifest.webmanifest</code> সংযুক্ত রয়েছে।
            </p>
          </div>

          {/* Explanation for 403 / PWABuilder Private Link Issue */}
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-900 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>PWABuilder-এ কেন "Missing Name" বা গুগলে "403" এরর আসে?</span>
            </div>
            <p className="text-amber-950 text-xs leading-relaxed">
              AI Studio-এর প্রিভিউ লিঙ্কটি গুগলের অভ্যন্তরীণ একটি <strong>সুরক্ষিত ব্যক্তিগত সার্ভার</strong>। বাইরের যেকোনো ব্রাউজার বা PWABuilder এটিতে প্রবেশ করতে গেলে গুগল নিরাপত্তাজনিত কারণে <strong>403 (No Access)</strong> দেখিয়ে আটকে দেয়।
            </p>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5 font-medium">
              <p><strong>✅ সমাধান ১ (এখনই ফোনে ব্যবহার):</strong> কোনো PWABuilder ছাড়াই ক্রোম ব্রাউজারের ৩-ডট (⋮) চেপে <strong>"Add to Home screen"</strong> চাপুন। এটি সাথে সাথে মোবাইলে ইনস্টল হয়ে যাবে!</p>
              <p><strong>✅ সমাধান ২ (প্লে স্টোরের জন্য):</strong> AI Studio থেকে কোডটি ডাউনলোড করে সম্পূর্ণ ফ্রিতে Vercel বা Netlify-তে লাইভ করে সেই লিংকটি PWABuilder-এ দিলে ১ ক্লিকে <code>.aab</code> ডাউনলোড হয়ে যাবে।</p>
            </div>
          </div>

          {/* Step by Step Timeline */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>প্লে স্টোরে পাবলিশ করার ৪টি সহজ ধাপ:</span>
            </h4>

            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                ১
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900">গুগল অনুমোদিত PWABuilder-এ যান</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  মাইক্রোসফট ও গুগলের অফিসিয়াল টুল <strong>PWABuilder (www.pwabuilder.com)</strong>-এ গিয়ে আপনার অ্যাপের ইউআরএল ইনপুট দিলে এটি স্বয়ংক্রিয়ভাবে প্লে স্টোরের জন্য <strong>Android App Bundle (.aab)</strong> ও <strong>.apk</strong> ফাইল তৈরি করে দেবে।
                </p>
                <div className="pt-1 flex items-center gap-2">
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition"
                  >
                    <span>PWABuilder খুলুন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={handleCopyManifestUrl}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? '✓ কপি হয়েছে' : 'Manifest লিংক কপি'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                ২
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Android Package (.aab) ডাউনলোড করুন</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  PWABuilder-এ <strong>"Package for Stores"</strong> থেকে <strong>"Android"</strong> সিলেক্ট করে <strong>"Generate Package"</strong> চাপুন। এটি আপনাকে একটি জিপ ফাইল দেবে যার ভেতর প্রস্তুতকৃত <code>.aab</code> ফাইল এবং ডিজিটাল সাইনিং কি থাকবে।
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                ৩
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Google Play Console অ্যাকাউন্ট</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  গুগল প্লে স্টোরে যেকোনো অ্যাপ পাবলিশ করার জন্য একটি <strong>Google Play Console Developer Account</strong> প্রয়োজন (গুগলের অফিসিয়াল ওয়ান-টাইম ফি ২৫ ডলার)। গুগল একাউন্ট দিয়ে <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline">play.google.com/console</a> এ গিয়ে সাইন-আপ করতে হয়।
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                ৪
              </div>
              <div className="space-y-1">
                <div className="font-bold text-slate-900">প্লে কনসোলে .aab আপলোড ও লাইভ করুন</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  প্লে কনসোলে গিয়ে <strong>"Create App"</strong> চাপুন, অ্যাপের নাম <strong>"স্টক ও ডিএসআর সেলস"</strong> লিখুন, এবং স্টেপ ২ থেকে পাওয়া <code>.aab</code> ফাইলটি আপলোড করে পাবলিশ বাটনে চাপুন। গুগল রিভিউ সম্পন্ন হলে এটি প্লে স্টোরে সবার জন্য উন্মুক্ত হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Instant Alternative Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>প্লে স্টোর ছাড়াও এখনই ইনস্টল করার সুবিধা:</span>
            </div>
            <p className="text-amber-800 text-xs leading-relaxed">
              প্লে স্টোরে দিতে কয়েকদিন সময় লাগে। কিন্তু আপনি এখনই কোনো টাকা ও প্লে স্টোর ছাড়াই আপনার মোবাইল ও কম্পিউটারের ব্রাউজারে ৩-ডট (⋮) চেপে <strong>"Add to Home screen"</strong> বা <strong>"Install app"</strong> দিয়ে সাথে সাথে আসল অ্যাপের মতো ব্যবহার করতে পারবেন।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            দরকার হলে উপরের PWABuilder বাটনে ক্লিক করে .aab ফাইল সংগ্রহ করুন
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            বুঝেছি, বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
