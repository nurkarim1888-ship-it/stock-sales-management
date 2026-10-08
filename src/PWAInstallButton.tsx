import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { InstallGuideModal } from './InstallGuideModal';
import { PlayStoreGuideModal } from './PlayStoreGuideModal';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [showPlayStoreGuide, setShowPlayStoreGuide] = useState(false);

  // If already running inside installed standalone app:
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-lg">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
        <span>ইনস্টল করা আছে</span>
      </div>
    );
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
        title="ফোনে বা কম্পিউটারে অ্যাপটি ইনস্টল করুন"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>অ্যাপ ইনস্টল করুন</span>
      </button>

      <InstallGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        onNativeInstall={install}
        isInstallable={isInstallable}
        onOpenPlayStoreGuide={() => setShowPlayStoreGuide(true)}
      />

      <PlayStoreGuideModal
        isOpen={showPlayStoreGuide}
        onClose={() => setShowPlayStoreGuide(false)}
      />
    </>
  );
};
