import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Download,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if already installed in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-slate-900 p-6 shadow-2xl ring-1 ring-amber-500/20 overflow-hidden text-white">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-red-600/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          id="btn-close-pwa-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with App Logo */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 opacity-75 blur transition group-hover:opacity-100" />
            <img
              src="/app-logo.jpg"
              alt="Logo NTB Bangkit Bersama"
              className="relative h-20 w-20 rounded-2xl object-cover shadow-xl border border-amber-400/40"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-red-950/80 text-red-300 border border-red-700/60 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Aplikasi Web Terintegrasi</span>
            </span>
            <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
              Tambah ke Layar Utama HP / Laptop
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-xs mx-auto">
              Sistem Informasi Keuangan BAKESBANGPOLDAGRI Provinsi NTB
            </p>
          </div>
        </div>

        {/* Status or Install Actions */}
        <div className="mt-6 space-y-4">
          {isInstalled ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-center text-emerald-200">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-sm font-bold text-white">Aplikasi Sudah Terpasang!</h3>
              <p className="text-xs text-emerald-300/80 mt-1">
                Anda sudah dapat membuka aplikasi ini langsung dari ikon di Layar Utama HP atau Laptop Anda.
              </p>
            </div>
          ) : (
            <>
              {/* Native Prompt Button for Android/Chrome/Edge if available */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-900/40 hover:brightness-110 active:scale-95 transition"
                  id="btn-install-pwa-direct"
                >
                  <Download className="h-5 w-5 text-amber-200" />
                  <span>Pasang Aplikasi Sekarang (1-Klik)</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              )}

              {/* Instructions Tab: Android vs iOS */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    {isIOS ? <Smartphone className="h-4 w-4 text-amber-400" /> : <Monitor className="h-4 w-4 text-cyan-400" />}
                    <span>Panduan Cara Pemasangan</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">PWA Native</span>
                </div>

                {isIOS ? (
                  /* Instructions for iPhone / iPad (Safari) */
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold text-amber-400 text-xs">
                        1
                      </span>
                      <p>
                        Buka aplikasi di browser <strong className="text-white">Safari</strong> iPhone/iPad Anda.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold text-amber-400 text-xs">
                        2
                      </span>
                      <p className="flex items-center gap-1">
                        Tekan tombol <strong className="text-amber-300 inline-flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-amber-500/30"><Share className="h-3.5 w-3.5" /> Bagikan (Share)</strong> di bagian bawah layar.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold text-amber-400 text-xs">
                        3
                      </span>
                      <p className="flex items-center gap-1">
                        Pilih menu <strong className="text-emerald-300 inline-flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-emerald-500/30"><PlusSquare className="h-3.5 w-3.5" /> Tambah ke Utama (Add to Home Screen)</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Instructions for Android / Chrome / Desktop */
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold text-cyan-400 text-xs">
                        <Smartphone className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <strong className="text-white">Di HP Android (Chrome/Edge):</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Klik titik tiga <strong className="text-amber-300">(⋮)</strong> di sudut kanan atas browser &rarr; pilih <strong className="text-emerald-300">"Instal Aplikasi"</strong> atau <strong className="text-emerald-300">"Tambah ke Layar Utama"</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-800 font-bold text-cyan-400 text-xs">
                        <Monitor className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <strong className="text-white">Di Laptop / PC Desktop (Chrome/Edge):</strong>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Klik ikon instalasi <Download className="inline h-3 w-3 text-cyan-400" /> di bilah alamat browser (Address Bar) sudut kanan atas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer Tagline Badge */}
          <div className="pt-2 text-center border-t border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60">
              BANGKIT BERSAMA! NTB MAKMUR MENDUNIA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
