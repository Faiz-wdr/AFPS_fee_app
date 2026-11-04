import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Toast } from '../components/ui/Toast';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  pageTitle: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  onNavigate,
  pageTitle,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleNotificationClick = () => {
    setToastMessage("All systems operational. No unread critical alerts.");
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-page)' }}>
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Header
          pageTitle={pageTitle}
          onNotificationClick={handleNotificationClick}
        />

        <main
          style={{
            flex: 1,
            padding: '28px',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box'
          }}
        >
          {children}
        </main>
      </div>

      {/* Global notification toast */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
};
