import '@vantage-ui/ui/src/globals.css';

import { Toaster } from '@vantage-ui/ui';
import { useCallback, useEffect, useState } from 'react';

import { LowCreditWarning } from './components/low-credit-warning';
import { OnboardingOverlay } from './components/onboarding/OnboardingOverlay';
import { AuthGate } from './components/panel/auth-gate';
import { PanelContent } from './components/panel/panel-content';
import { PanelHeader } from './components/panel/panel-header';
import { PanelNav } from './components/panel/panel-nav';
import { useCreditsStore } from './store/creditsSlice';
import { useOnboardingStore } from './store/onboardingSlice';
import { usePopupStore } from './store/popup-store';
import { useUIStore } from './store/ui-slice';

/**
 * SidePanelShell renders the authenticated layout:
 * header + tab nav + scrollable content outlet.
 * The `animate-fade-in` class triggers the CSS animation defined in globals.css.
 */
function SidePanelShell() {
  const balance = useCreditsStore((s) => s.balance);
  const activeTab = useUIStore((s) => s.activeTab);
  const hasCompletedOnboarding = useOnboardingStore(
    (s) => s.hasCompletedOnboarding,
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          animation: 'fadeIn 120ms ease-out forwards',
        }}
      >
        <PanelHeader />
        {activeTab !== 'credits' && (
          <LowCreditWarning balance={balance} variant="compact" />
        )}
        <PanelNav />
        <PanelContent />
      </div>
      {!hasCompletedOnboarding && <OnboardingOverlay />}
    </>
  );
}

/**
 * SidePanelInner reads auth state and conditionally renders either the
 * full authenticated shell or the unauthenticated AuthGate.
 * Waits for persist hydration to avoid flashing the wrong content.
 * Listens for chrome.storage.onChanged to sync auth across contexts.
 */
function SidePanelInner() {
  const [hydrated, setHydrated] = useState(usePopupStore.persist.hasHydrated());
  const [hydrationTimedOut, setHydrationTimedOut] = useState(false);
  const authState = usePopupStore((s) => s.authState);
  const restoreSession = usePopupStore((s) => s.restoreSession);

  const rehydrate = useCallback(() => {
    usePopupStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    const unsub = usePopupStore.persist.onFinishHydration(() => setHydrated(true));
    return () => unsub();
  }, []);

  // Session restore on mount
  useEffect(() => {
    if (hydrated) {
      restoreSession();
    }
  }, [hydrated, restoreSession]);

  // Hydration timeout fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hydrated) {
        setHydrationTimedOut(true);
        setHydrated(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [hydrated]);

  // Cross-context auth sync: when another extension context (e.g. popup)
  // modifies auth state in chrome.storage.local, re-hydrate immediately.
  useEffect(() => {
    function handleStorageChange(
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) {
      if (areaName === 'local' && changes['vantageui-auth']) {
        rehydrate();
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [rehydrate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#F5F5F6',
        overflow: 'hidden',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      {hydrated && authState === 'authenticated' && <SidePanelShell />}
      {hydrated && authState === 'loading' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight: 0,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: 'spin 0.8s linear infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="rgba(10,10,10,0.1)"
              strokeWidth="3"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="#053B84"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      {hydrationTimedOut && authState !== 'authenticated' && <AuthGate />}
      {!hydrationTimedOut
        && hydrated
        && authState !== 'authenticated'
        && authState !== 'loading' && <AuthGate />}
      {/* Global toast notifications */}
      <Toaster />
    </div>
  );
}

/**
 * SidePanel — root entry point for the Chrome Side Panel.
 *
 * @returns {JSX.Element} The fully composed side panel.
 */
export default function SidePanel() {
  return <SidePanelInner />;
}
