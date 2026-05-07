import { useState, useEffect } from 'react';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Check if already in standalone mode
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      false
    );

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const installPWA = async (isRTL: boolean) => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      alert(isRTL 
        ? 'على أجهزة آيفون: اضغط على زر "مشاركة" ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)' 
        : 'On iOS: Tap "Share" and then "Add to Home Screen"'
      );
    } else if (isStandalone) {
      alert(isRTL ? 'التطبيق مثبت بالفعل' : 'App already installed');
    } else {
      alert(isRTL ? 'متصفحك لا يدعم التثبيت المباشر' : 'Your browser does not support direct installation');
    }
  };

  return { deferredPrompt, isIOS, isStandalone, installPWA };
}
