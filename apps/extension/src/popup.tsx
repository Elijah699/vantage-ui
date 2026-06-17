import '@vantage-ui/ui/src/globals.css';

import { useCallback, useEffect, useState } from 'react';

import { AuthenticatedView } from './components/authenticated-view';
import { PopupHeader } from './components/popup-header';
import { UnauthenticatedView } from './components/unauthenticated-view';
import { usePopupStore } from './store/popup-store';

function PopupContent() {
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

  // Cross-context auth sync: when another extension context (e.g. side panel)
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
        width: '320px',
        minHeight: '480px',
        background: '#F5F5F6',
        fontFamily: 'DM Sans, sans-serif',
        overflow: 'hidden',
      }}
    >
      <PopupHeader />
      {hydrated && authState === 'authenticated' && <AuthenticatedView />}
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
      {hydrationTimedOut && authState !== 'authenticated' && (
        <UnauthenticatedView />
      )}
      {!hydrationTimedOut
        && hydrated
        && authState !== 'authenticated'
        && authState !== 'loading' && <UnauthenticatedView />}
    </div>
  );
}

export default function Popup() {
  return (
    <div style={{ width: '320px', minHeight: '480px' }}>
      <PopupContent />
    </div>
  );
}
