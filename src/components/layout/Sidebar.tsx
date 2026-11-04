import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  GraduationCap,
  Bus,
  ShoppingBag,
  FileText,
  Wallet,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "",
    items: [
      { id: "dashboard", label: "Dashboard", path: "#/", icon: LayoutDashboard },
    ]
  },
  {
    title: "Collections",
    items: [
      { id: "school-fee", label: "School Fee", path: "#/school-fee", icon: GraduationCap },
      { id: "bus-fee", label: "Bus Fee", path: "#/bus-fee", icon: Bus },
      { id: "store-sales", label: "Store", path: "#/store-sales", icon: ShoppingBag },
    ]
  },
  {
    title: "Accounts",
    items: [
      { id: "voucher", label: "Voucher", path: "#/voucher", icon: FileText },
      { id: "finance", label: "Finance Management", path: "#/finance", icon: Wallet },
    ]
  },
  {
    title: "Management",
    items: [
      { id: "students", label: "Students", path: "#/students", icon: Users },
      { id: "reports", label: "Reports", path: "#/reports", icon: BarChart3 },
    ]
  }
];

const settingsSubOptions = [
  { id: 'settings-general', label: 'General Settings', path: '#/settings/general' },
  { id: 'settings-fee', label: 'Fee Settings', path: '#/settings/fee' },
  { id: 'settings-bus', label: 'Bus Settings', path: '#/settings/bus' },
  { id: 'settings-store', label: 'Store Settings', path: '#/settings/store' },
  { id: 'settings-payment', label: 'Payment Settings', path: '#/settings/payment' },
  { id: 'settings-users', label: 'User & Role Settings', path: '#/settings/users' },
  { id: 'settings-backup', label: 'Backup & Data', path: '#/settings/backup' },
];

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed,
  onToggleCollapse
}) => {
  const isSettingsActive = currentPath.startsWith('#/settings');
  const [userSettingsExpanded, setUserSettingsExpanded] = useState<boolean | null>(null);
  const settingsOpen = userSettingsExpanded !== null ? userSettingsExpanded : isSettingsActive;
  return (
    <aside
      style={{
        width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--color-white)',
        borderRight: '1px solid var(--color-border)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <img
            src="/favicon.svg?v=2"
            alt="AFPS Logo"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              flexShrink: 0,
              display: 'block'
            }}
          />
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)', letterSpacing: '-0.2px' }}>
                AFPS
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1 }}>
                School Management
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              color: 'var(--color-text-secondary)',
              padding: '6px',
              borderRadius: '6px',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Navigation Sections */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: collapsed ? '12px 8px' : '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {navigationSections.map((section, idx) => (
          <div key={section.title || `nav-sec-${idx}`}>
            {!collapsed && section.title && (
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-muted)',
                  padding: '0 8px 6px',
                }}
              >
                {section.title}
              </div>
            )}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path === '#/' && (currentPath === '' || currentPath === '#/' || currentPath === '#'));
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.path)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      gap: '10px',
                      padding: collapsed ? '10px 0' : '9px 12px',
                      borderRadius: 'var(--radius-button)',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                      transition: 'background-color 0.15s ease, color 0.15s ease',
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon size={18} style={{ flexShrink: 0, color: isActive ? 'var(--color-primary)' : '#6B7280' }} />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / Settings, Toggle & Log Out */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '14px 12px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {/* Settings item with dropdown arrow */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={() => {
              if (collapsed) {
                onToggleCollapse();
                setUserSettingsExpanded(true);
              } else {
                setUserSettingsExpanded(!settingsOpen);
              }
            }}
            title={collapsed ? "Settings" : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: '10px',
              padding: collapsed ? '10px 0' : '9px 12px',
              borderRadius: 'var(--radius-button)',
              fontSize: '13px',
              fontWeight: isSettingsActive ? 600 : 400,
              color: isSettingsActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
              backgroundColor: isSettingsActive && !settingsOpen ? 'var(--color-primary-light)' : 'transparent',
              transition: 'background-color 0.15s ease, color 0.15s ease',
              width: '100%',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isSettingsActive || settingsOpen) {
                e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSettingsActive || settingsOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={18} style={{ flexShrink: 0, color: isSettingsActive ? 'var(--color-primary)' : '#6B7280' }} />
              {!collapsed && <span>Settings</span>}
            </div>
            {!collapsed && (
              <span style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
                {settingsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            )}
          </button>

          {/* Settings Sub-options inside sidebar */}
          {!collapsed && settingsOpen && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                paddingLeft: '14px',
                marginTop: '4px',
                marginBottom: '4px',
                borderLeft: '2px solid var(--color-primary-light)',
                marginLeft: '14px'
              }}
            >
              {settingsSubOptions.map(sub => {
                const isSubActive = currentPath === sub.path || (sub.path === '#/settings/general' && currentPath === '#/settings');
                return (
                  <button
                    key={sub.id}
                    onClick={() => onNavigate(sub.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      padding: '6px 10px',
                      borderRadius: '5px',
                      fontSize: '12px',
                      fontWeight: isSubActive ? 600 : 400,
                      color: isSubActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      backgroundColor: isSubActive ? 'var(--color-primary-light)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }
                    }}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {collapsed && (
          <button
            onClick={onToggleCollapse}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 0',
              borderRadius: 'var(--radius-button)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              width: '100%'
            }}
            title="Expand Sidebar"
            aria-label="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}
        <button
          onClick={() => alert("Session management will be active in upcoming phases.")}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '10px',
            padding: collapsed ? '9px 0' : '9px 12px',
            borderRadius: 'var(--radius-button)',
            fontSize: '13px',
            color: 'var(--color-text-secondary)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            width: '100%'
          }}
          title={collapsed ? "Log out" : undefined}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <LogOut size={17} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};
