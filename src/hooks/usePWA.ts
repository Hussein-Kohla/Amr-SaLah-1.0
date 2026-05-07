import { useState, useEffect } from 'react';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

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
        ? 'على أجهزة آيفون: اضغط على زر "مشاركة" (Share) ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen)' 
        : 'On iOS: Tap "Share" and then "Add to Home Screen"'
      );
    } else if (isAndroid) {
      alert(isRTL
        ? 'على أجهزة أندرويد: اضغط على القائمة (3 نقاط) ثم اختر "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"'
        : 'On Android: Tap the menu (3 dots) and select "Install app" or "Add to Home screen"'
      );
    } else if (isStandalone) {
      alert(isRTL ? 'التطبيق مثبت بالفعل' : 'App already installed');
    } else {
      alert(isRTL ? 'متصفحك لا يدعم التثبيت المباشر، يمكنك الإضافة يدوياً من إعدادات المتصفح' : 'Your browser does not support direct installation. You can add it manually from browser settings.');
    }
  };

  return { deferredPrompt, isIOS, isAndroid, isStandalone, installPWA };
}
