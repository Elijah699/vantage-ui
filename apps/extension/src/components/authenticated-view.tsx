import { CreditBadge } from '@vantage-ui/ui';
import { useEffect, useRef, useState } from 'react';

import { usePopupStore } from '../store/popup-store';
import { LowCreditWarning } from './low-credit-warning';

function AuthenticatedView() {
  const creditBalance = usePopupStore((s) => s.creditBalance);
  const userEmail = usePopupStore((s) => s.userEmail);
  const inspectorActive = usePopupStore((s) => s.inspectorActive);
  const setInspectorActive = usePopupStore((s) => s.setInspectorActive);
  const toggleInspector = usePopupStore((s) => s.toggleInspector);
  const logout = usePopupStore((s) => s.logout);
  const [isToggling, setIsToggling] = useState(false);
  const retryCountRef = useRef(0);

  useEffect(() => {
    function handleMessage(msg: { type: string }) {
      if (msg.type === 'INSPECTOR_ACTIVATED') {
        setInspectorActive(true);
        setIsToggling(false);
        retryCountRef.current = 0;
      } else if (msg.type === 'INSPECTOR_DEACTIVATED') {
        setInspectorActive(false);
        setIsToggling(false);
        retryCountRef.current = 0;
      }
    }
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, [setInspectorActive]);

  const sendToggleMessage = async (
    tabId: number,
    retries = 3,
  ): Promise<boolean> => {
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_INSPECTOR' });
      return true;
    } catch {
      if (retries <= 1) return false;
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 200);
      });
      return sendToggleMessage(tabId, retries - 1);
    }
  };

  const handleToggleInspector = async () => {
    setIsToggling(true);
    toggleInspector();
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length > 0 && tabs[0].id) {
        const sent = await sendToggleMessage(tabs[0].id);
        if (!sent) {
          setIsToggling(false);
          // If content script not reachable, revert the optimistic toggle
          toggleInspector();
        }
      }
    } catch (error) {
      setIsToggling(false);
      // eslint-disable-next-line no-console
      console.error('Error sending TOGGLE_INSPECTOR:', error);
    }
  };

  const handleOpenSidePanel = async () => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs.length > 0 && tabs[0].id) {
        await chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error opening side panel:', error);
    }
  };

  return (
    <div
      style={{
        margin: '12px',
        padding: '20px',
        background: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
      }}
    >
      {userEmail && (
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            color: 'rgba(10,10,10,0.6)',
            margin: 0,
            marginBottom: '12px',
          }}
        >
          {userEmail}
        </p>
      )}

      <LowCreditWarning balance={creditBalance} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <CreditBadge balance={creditBalance} size="md" />
      </div>

      {(() => {
        let bgColor = '#053B84';
        if (isToggling) bgColor = '#6B7280';
        else if (inspectorActive) bgColor = '#DC2626';

        let shadow = '0px 2px 4px rgba(5,59,132,0.20)';
        if (inspectorActive) shadow = '0px 2px 4px rgba(220,38,38,0.20)';

        let label = 'Activate Inspector';
        if (isToggling) label = 'Connecting...';
        else if (inspectorActive) label = 'Deactivate Inspector';

        return (
          <button
            type="button"
            onClick={handleToggleInspector}
            disabled={isToggling}
            style={{
              width: '100%',
              padding: '12px 16px',
              backgroundColor: bgColor,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '15px',
              fontWeight: 500,
              cursor: isToggling ? 'default' : 'pointer',
              boxShadow: shadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
              transition: 'background-color 150ms ease-out',
            }}
          >
            {isToggling ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ animation: 'spin 0.8s linear infinite' }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="3"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            )}
            {label}
          </button>
        );
      })()}

      <button
        type="button"
        onClick={handleOpenSidePanel}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: 'transparent',
          color: '#0A0A0A',
          border: '1px solid rgba(10,10,10,0.1)',
          borderRadius: '8px',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '15px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9z" />
          <path d="M12 7v4l3 3" />
        </svg>
        Open Side Panel
      </button>

      <button
        type="button"
        onClick={async () => {
          if (inspectorActive) {
            try {
              const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true,
              });
              if (tabs.length > 0 && tabs[0].id) {
                await chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'TOGGLE_INSPECTOR',
                });
              }
            } catch {
              // tab may not exist, ignore
            }
          }
          logout();
        }}
        style={{
          alignSelf: 'flex-end',
          background: 'none',
          border: 'none',
          padding: '4px 0',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13px',
          color: '#053B84',
          cursor: 'pointer',
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export { AuthenticatedView };
