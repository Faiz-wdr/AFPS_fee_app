import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Check, User, ShieldCheck, Smartphone, ExternalLink } from 'lucide-react';

interface HeaderProps {
  pageTitle?: string;
  onSearch?: (query: string) => void;
  onNotificationClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNotificationClick
}) => {
  const [academicYear, setAcademicYear] = useState('2026–2027');
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  const yearRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const academicYears = ['2026–2027', '2025–2026', '2024–2025'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '320px',
            width: '100%'
          }}
        >
          <Search
            size={16}
            color="#9E9E9E"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search students, vouchers, fees..."
            onChange={(e) => onSearch?.(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: '36px',
              paddingRight: '12px',
              height: '36px',
              backgroundColor: 'var(--color-bg-page)',
              border: '1px solid var(--color-border)',
              borderRadius: '20px',
              fontSize: '13px',
              color: 'var(--color-text-primary)'
            }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Mobile Parent Portal Demo Switcher */}
        <button
          onClick={() => { window.location.assign('#/parent'); }}
          style={{
            height: '34px',
            padding: '0 10px',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid rgba(90, 84, 180, 0.25)',
            borderRadius: 'var(--radius-button)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Open Mobile-First Parent Portal"
        >
          <Smartphone size={14} />
          <span>Parent Portal</span>
          <ExternalLink size={11} style={{ opacity: 0.7 }} />
        </button>

        {/* Academic Year Selector */}
        <div style={{ position: 'relative' }} ref={yearRef}>
          <button
            onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
            style={{
              height: '34px',
              padding: '0 12px',
              backgroundColor: 'var(--color-bg-page)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-button)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Year:</span>
            <span>{academicYear}</span>
            <ChevronDown size={14} color="#777777" />
          </button>

          {yearDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-dropdown)',
                width: '140px',
                padding: '4px',
                zIndex: 100
              }}
            >
              {academicYears.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setAcademicYear(year);
                    setYearDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    borderRadius: '5px',
                    border: 'none',
                    background: year === academicYear ? 'var(--color-primary-light)' : 'transparent',
                    color: year === academicYear ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <span>{year}</span>
                  {year === academicYear && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Control */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setHasUnreadNotification(false);
              onNotificationClick();
            }}
            aria-label="Notifications"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-white)'}
          >
            <Bell size={17} />
            {hasUnreadNotification && (
              <span
                style={{
                  position: 'absolute',
                  top: '7px',
                  right: '8px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)'
                }}
              />
            )}
          </button>
        </div>

        {/* Vertical divider */}
        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--color-border)' }} />

        {/* Admin Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 8px 4px 4px',
              borderRadius: '24px',
              border: '1px solid transparent',
              background: 'transparent',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-page)'}
            onMouseLeave={(e) => {
              if (!profileDropdownOpen) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#E8E7F8',
                color: 'var(--color-primary)',
                fontWeight: 600,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              AD
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                School Admin
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                admin@afps.edu.in
              </span>
            </div>
            <ChevronDown size={14} color="#777777" />
          </button>

          {profileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                boxShadow: 'var(--shadow-dropdown)',
                width: '210px',
                padding: '6px',
                zIndex: 100
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>AFPS Principal / Admin</p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>Super Administrator</p>
              </div>
              <div style={{ padding: '4px 0' }}>
                <button
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User size={15} color="#777777" />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '8px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-text-primary)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ShieldCheck size={15} color="#777777" />
                  <span>System Permissions</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
