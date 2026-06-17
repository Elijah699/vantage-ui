import { Info, RotateCcw } from 'lucide-react';
import { useCallback } from 'react';

import { useOnboardingStore } from '../../../store/onboardingSlice';
import { usePopupStore } from '../../../store/popup-store';

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid rgba(10,10,10,0.08)',
  borderRadius: '8px',
  padding: '12px',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '11px',
  fontWeight: 600,
  color: 'rgba(10,10,10,0.4)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const buttonBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 20px',
  background: '#FFFFFF',
  border: '1px solid rgba(10,10,10,0.08)',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px',
  fontWeight: 500,
  color: 'rgba(10,10,10,0.6)',
  transition: 'background 150ms',
};

function SettingsTab() {
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);
  const userEmail = usePopupStore((s) => s.userEmail);
  const authState = usePopupStore((s) => s.authState);
  const logout = usePopupStore((s) => s.logout);

  const handleResetOnboarding = useCallback(() => {
    resetOnboarding();
  }, [resetOnboarding]);

  const handleSignOut = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Account Section */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Account</span>
        <div style={cardStyle}>
          <div
            style={{
              fontSize: '13px',
              color: '#0A0A0A',
              fontFamily: 'DM Sans, sans-serif',
              marginBottom: '8px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userEmail || 'Not signed in'}
          </div>
          {authState === 'authenticated' && (
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                ...buttonBase,
                color: '#E53E3E',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFF5F5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Onboarding Section */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Onboarding</span>
        <div style={cardStyle}>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: 'rgba(10,10,10,0.6)',
              fontFamily: 'DM Sans, sans-serif',
              lineHeight: '1.4',
            }}
          >
            Reset the onboarding walkthrough to see the introductory tooltips
            again.
          </p>
          <button
            type="button"
            onClick={handleResetOnboarding}
            style={{
              ...buttonBase,
              marginTop: '10px',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#F5F5F6';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
            }}
          >
            <RotateCcw size={14} />
            Reset Onboarding
          </button>
        </div>
      </div>

      {/* About Section */}
      <div style={sectionStyle}>
        <span style={labelStyle}>About</span>
        <div style={cardStyle}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: 'rgba(10,10,10,0.6)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <Info size={14} />
            VantageUI v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}

export { SettingsTab };
