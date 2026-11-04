import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../layouts/AdminLayout';
import { Dashboard } from '../pages/Dashboard';
import { StudentManagement } from '../pages/StudentManagement';
import { SchoolFeeManagement } from '../pages/SchoolFeeManagement';
import { BusFeeManagement } from '../pages/BusFeeManagement';
import { StoreSalesManagement } from '../pages/StoreSalesManagement';
import { VoucherManagement } from '../pages/VoucherManagement';
import { FinanceManagement } from '../pages/FinanceManagement';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { PlaceholderPage } from '../pages/PlaceholderPage';

import { ParentPortal } from '../pages/ParentPortal';

interface RouteConfig {
  path: string;
  title: string;
  category: string;
  moduleName: string;
}

const routes: Record<string, RouteConfig> = {
  '#/': { path: '#/', title: 'Dashboard', category: 'Overview', moduleName: 'Dashboard' },
  '#/school-fee': { path: '#/school-fee', title: 'School Fee Collection', category: 'Collections', moduleName: 'School Fee Collection' },
  '#/bus-fee': { path: '#/bus-fee', title: 'Bus Fee Management', category: 'Collections', moduleName: 'Bus Fee Collection' },
  '#/store-sales': { path: '#/store-sales', title: 'Sales & Store Cash', category: 'Collections', moduleName: 'Store Sales' },
  '#/voucher': { path: '#/voucher', title: 'Voucher Management', category: 'Accounts', moduleName: 'Voucher & Disbursement' },
  '#/finance': { path: '#/finance', title: 'Finance Management', category: 'Accounts', moduleName: 'Finance Ledger' },
  '#/students': { path: '#/students', title: 'Student Management', category: 'Management', moduleName: 'Student Records' },
  '#/reports': { path: '#/reports', title: 'Reports & Audits', category: 'Management', moduleName: 'Reports & Analytics' },
  '#/settings': { path: '#/settings', title: 'Fee & System Settings', category: 'Settings', moduleName: 'Fee & System Configuration' },
  '#/settings/general': { path: '#/settings/general', title: 'General Settings', category: 'Settings', moduleName: 'General Settings' },
  '#/settings/fee': { path: '#/settings/fee', title: 'Fee Settings', category: 'Settings', moduleName: 'Fee Settings' },
  '#/settings/bus': { path: '#/settings/bus', title: 'Bus Settings', category: 'Settings', moduleName: 'Bus Settings' },
  '#/settings/store': { path: '#/settings/store', title: 'Store Settings', category: 'Settings', moduleName: 'Store Settings' },
  '#/settings/payment': { path: '#/settings/payment', title: 'Payment Settings', category: 'Settings', moduleName: 'Payment Settings' },
  '#/settings/users': { path: '#/settings/users', title: 'User & Role Settings', category: 'Settings', moduleName: 'User & Role Settings' },
  '#/settings/backup': { path: '#/settings/backup', title: 'Backup & Data', category: 'Settings', moduleName: 'Backup & Data' },
  '#/parent': { path: '#/parent', title: 'Parent Portal', category: 'Portal', moduleName: 'Parent Fee Portal' },
};

export const AppRoutes: React.FC = () => {
  const getNormalizedHash = () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/parent')) {
      return '#/parent';
    }
    if (hash && hash.startsWith('#/settings')) {
      return routes[hash] ? hash : '#/settings/general';
    }
    return hash && hash !== '#' && routes[hash] ? hash : '#/';
  };

  const [currentHash, setCurrentHash] = useState<string>(getNormalizedHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(getNormalizedHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = path;
  };

  // If in Parent Portal, render standalone without AdminLayout
  if (currentHash.startsWith('#/parent')) {
    return <ParentPortal />;
  }

  const activeRoute = routes[currentHash] || routes['#/'];

  const renderCurrentPage = () => {
    if (currentHash.startsWith('#/settings')) {
      return <SettingsPage />;
    }

    switch (currentHash) {
      case '#/':
        return <Dashboard />;
      case '#/students':
        return <StudentManagement />;
      case '#/school-fee':
        return <SchoolFeeManagement />;
      case '#/bus-fee':
        return <BusFeeManagement />;
      case '#/store-sales':
        return <StoreSalesManagement />;
      case '#/voucher':
        return <VoucherManagement />;
      case '#/finance':
        return <FinanceManagement />;
      case '#/reports':
        return <ReportsPage />;
      default:
        return (
          <PlaceholderPage
            moduleName={activeRoute.moduleName}
            category={activeRoute.category}
            onBackToDashboard={() => navigateTo('#/')}
          />
        );
    }
  };

  return (
    <AdminLayout
      currentPath={currentHash}
      onNavigate={navigateTo}
      pageTitle={activeRoute.title}
    >
      {renderCurrentPage()}
    </AdminLayout>
  );
};
