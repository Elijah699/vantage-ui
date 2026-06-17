import { Avatar, AvatarFallback, CreditBadge } from '@vantage-ui/ui';
import {
  useCallback, useEffect, useRef, useState,
} from 'react';

import { usePopupStore } from '../../store/popup-store';

function VantageUiLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="20" height="20" rx="4" fill="#053B84" />
      <path
        d="M5 14L10 5L15 14"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PanelHeader() {
  const creditBalance = usePopupStore((s) => s.creditBalance);
  const userEmail = usePopupStore((s) => s.userEmail);
  const authState = usePopupStore((s) => s.authState);
  const logout = usePopupStore((s) => s.logout);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = userEmail ? userEmail.charAt(0).toUpperCase() : 'V';

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, handleClickOutside]);

  return (
    <div
      id="panel-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        height: '56px',
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(10,10,10,0.08)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <VantageUiLogo />
        <span
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            color: '#0A0A0A',
          }}
        >
          VantageUI
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          position: 'relative',
        }}
      >
        {authState === 'authenticated' && (
          <CreditBadge balance={creditBalance} size="sm" />
        )}
        <div ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              padding: 0,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderRadius: '50%',
            }}
            aria-label="User menu"
            aria-expanded={menuOpen}
          >
            <Avatar style={{ width: '32px', height: '32px' }}>
              <AvatarFallback
                style={{
                  background: '#053B84',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                background: '#FFFFFF',
                border: '1px solid rgba(10,10,10,0.08)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                minWidth: '160px',
                zIndex: 1000,
                padding: '4px',
              }}
            >
              {userEmail && (
                <div
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: 'rgba(10,10,10,0.5)',
                    borderBottom: '1px solid rgba(10,10,10,0.06)',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userEmail}
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#E53E3E',
                  borderRadius: '6px',
                  transition: 'background 150ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'none';
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { PanelHeader };
