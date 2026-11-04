import React, { useState, useEffect } from 'react';
import { useAppStore } from '../context/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../utils/formatters';
import type {
  FeeCategory,
  Concession,
  FeeFrequency,
  Product,
  BusRoute,
  StaffUser,
  ModulePermission,
  PaymentMethod
} from '../types';
import {
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Building,
  GraduationCap,
  Bus,
  ShoppingBag,
  CreditCard,
  Users,
  Database
} from 'lucide-react';

export type SettingsSubSection =
  | 'general'
  | 'fee'
  | 'bus'
  | 'store'
  | 'payment'
  | 'users'
  | 'backup';

export const SettingsPage: React.FC = () => {
  const {
    feeCategories,
    feeStructures,
    concessions,
    busRoutes,
    products,
    generalSettings,
    paymentSettings,
    staffUsers,
    addFeeCategory,
    updateFeeCategory,
    toggleFeeCategoryStatus,
    addFeeStructure,
    deleteFeeStructure,
    addConcession,
    updateConcession,
    toggleConcessionStatus,
    addBusRoute,
    updateBusRoute,
    deleteBusRoute,
    addProduct,
    updateProduct,
    toggleProductStatus,
    updateGeneralSettings,
    updatePaymentSettings,
    addStaffUser,
    updateStaffUser,
    deleteStaffUser,
    toggleStaffUserStatus,
    getFullBackupData,
    importFullBackup,
    resetToDefaults
  } = useAppStore();

  // Determine active subsection from window.location.hash
  const getSubSectionFromHash = (): SettingsSubSection => {
    const hash = window.location.hash;
    if (hash === '#/settings/fee') return 'fee';
    if (hash === '#/settings/bus') return 'bus';
    if (hash === '#/settings/store') return 'store';
    if (hash === '#/settings/payment') return 'payment';
    if (hash === '#/settings/users') return 'users';
    if (hash === '#/settings/backup') return 'backup';
    return 'general';
  };

  const [activeSub, setActiveSub] = useState<SettingsSubSection>(getSubSectionFromHash);

  useEffect(() => {
    const handleHash = () => {
      setActiveSub(getSubSectionFromHash());
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateSub = (sub: SettingsSubSection) => {
    window.location.assign(`#/settings/${sub}`);
  };

  // 1. General Settings Form
  const [generalForm, setGeneralForm] = useState(generalSettings);
  const [generalSavedToast, setGeneralSavedToast] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateGeneralSettings(generalForm);
    setGeneralSavedToast(true);
    setTimeout(() => setGeneralSavedToast(false), 2500);
  };

  // 2. Fee Settings Modals
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<FeeCategory | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    frequency: 'Monthly' as FeeFrequency,
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [isFsModalOpen, setIsFsModalOpen] = useState(false);
  const [fsForm, setFsForm] = useState({
    academicYear: '2026–2027',
    className: 'Class 1',
    categoryId: feeCategories[0]?.id || 'cat-01',
    amount: 1500,
    frequency: 'Monthly' as FeeFrequency,
    dueDate: '10th of every month'
  });

  const [isConcModalOpen, setIsConcModalOpen] = useState(false);
  const [editingConc, setEditingConc] = useState<Concession | null>(null);
  const [concForm, setConcForm] = useState({
    name: '',
    discountType: 'Percentage' as 'Percentage' | 'Fixed',
    discountValue: 20,
    description: '',
    status: 'Active' as 'Active' | 'Inactive'
  });

  // 3. Bus Settings Modal
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);
  const [routeForm, setRouteForm] = useState({
    routeNumber: '',
    routeName: '',
    driverName: '',
    driverPhone: '',
    monthlyFee: 1500,
    termFee: 4500,
    status: 'Active' as 'Active' | 'Inactive'
  });

  // 4. Store Settings Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Stationery' as Product['category'],
    price: 50,
    stock: 100,
    status: 'Active' as 'Active' | 'Inactive'
  });

  // 5. Payment Settings Form
  const [paymentForm, setPaymentForm] = useState(paymentSettings);
  const [paymentSavedToast, setPaymentSavedToast] = useState(false);

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentSettings(paymentForm);
    setPaymentSavedToast(true);
    setTimeout(() => setPaymentSavedToast(false), 2500);
  };

  // 6. User & Role Settings Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    email: string;
    role: StaffUser['role'];
    status: 'Active' | 'Inactive';
    phone: string;
    permissions: ModulePermission[];
  }>({
    name: '',
    email: '',
    role: 'Accounts Officer',
    status: 'Active',
    phone: '',
    permissions: ['schoolFee', 'vouchers', 'finance']
  });

  const allPermissions: { id: ModulePermission; label: string }[] = [
    { id: 'students', label: 'Student Management' },
    { id: 'schoolFee', label: 'School Fee' },
    { id: 'busFee', label: 'Bus Fee' },
    { id: 'storeSales', label: 'Store Sales' },
    { id: 'vouchers', label: 'Voucher & Expense' },
    { id: 'finance', label: 'Finance Management' },
    { id: 'reports', label: 'Reports & Audits' },
    { id: 'settings', label: 'System Settings' }
  ];

  // 7. Backup & Restore
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const handleDownloadBackup = () => {
    const jsonStr = getFullBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afps_demo_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (confirm("Restore demo database from this backup file? Existing data will be overwritten.")) {
        const ok = importFullBackup(content);
        if (ok) {
          setImportStatus({ success: true, msg: "Backup imported and applied successfully." });
        } else {
          setImportStatus({ success: false, msg: "Failed to parse backup. Please verify file format." });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const classesList = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Fee & System Configuration</h1>
        </div>

        <Button
          variant="secondary"
          icon={<RotateCcw size={14} />}
          onClick={() => {
            if (confirm("Reset all demo data back to clean initial state? Any custom created records will be restored to defaults.")) {
              resetToDefaults();
              alert("All records restored to demo baseline.");
            }
          }}
        >
          Reset Demo Data
        </Button>
      </div>

      {/* Sub-options Navigation Bar */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'general', label: '1. General Settings', icon: Building },
          { id: 'fee', label: '2. Fee Settings', icon: GraduationCap },
          { id: 'bus', label: '3. Bus Settings', icon: Bus },
          { id: 'store', label: '4. Store Settings', icon: ShoppingBag },
          { id: 'payment', label: '5. Payment Settings', icon: CreditCard },
          { id: 'users', label: '6. User & Roles', icon: Users },
          { id: 'backup', label: '7. Backup & Data', icon: Database },
        ].map(sub => {
          const Icon = sub.icon;
          const isActive = activeSub === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => navigateSub(sub.id as SettingsSubSection)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#5A54B4' : 'var(--color-text-secondary)',
                backgroundColor: isActive ? 'var(--color-primary-light)' : 'var(--color-white)',
                border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '8px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} />
              <span>{sub.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. GENERAL SETTINGS */}
      {activeSub === 'general' && (
        <Card title="School Profile & General Configuration">
          <form onSubmit={handleSaveGeneral} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '680px' }}>
            {generalSavedToast && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#EDFDF5', color: 'var(--color-success)', border: '1px solid #B7F4D8', borderRadius: '6px', fontSize: '13px' }}>
                <CheckCircle size={16} />
                <span>General school profile updated and persisted.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  School Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={generalForm.schoolName}
                  onChange={e => setGeneralForm({ ...generalForm, schoolName: e.target.value })}
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Brand Monogram / Short Code *
                </label>
                <input
                  type="text"
                  required
                  value={generalForm.logoText}
                  onChange={e => setGeneralForm({ ...generalForm, logoText: e.target.value })}
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                School Campus Address *
              </label>
              <input
                type="text"
                required
                value={generalForm.schoolAddress}
                onChange={e => setGeneralForm({ ...generalForm, schoolAddress: e.target.value })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Official Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={generalForm.phone}
                  onChange={e => setGeneralForm({ ...generalForm, phone: e.target.value })}
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={generalForm.email}
                  onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })}
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Academic Year *
                </label>
                <input
                  type="text"
                  required
                  value={generalForm.academicYear}
                  onChange={e => setGeneralForm({ ...generalForm, academicYear: e.target.value })}
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Financial Year *
                </label>
                <input
                  type="text"
                  required
                  value={generalForm.financialYear}
                  onChange={e => setGeneralForm({ ...generalForm, financialYear: e.target.value })}
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Currency Notation
                </label>
                <input
                  type="text"
                  disabled
                  value={generalForm.currency}
                  style={{ width: '100%', height: '36px', fontSize: '13px', backgroundColor: '#F5F5F7' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Receipt & Voucher Legal Disclaimer / Footer Text
              </label>
              <textarea
                rows={3}
                value={generalForm.receiptFooterText}
                onChange={e => setGeneralForm({ ...generalForm, receiptFooterText: e.target.value })}
                style={{ width: '100%', padding: '10px', fontSize: '13px', lineHeight: 1.4 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <Button variant="primary" type="submit" icon={<CheckCircle size={14} />}>
                Save General Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 2. FEE SETTINGS */}
      {activeSub === 'fee' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Categories */}
          <Card
            title="School Fee Categories"
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => {
                  setEditingCat(null);
                  setCatForm({ name: '', description: '', frequency: 'Monthly', status: 'Active' });
                  setIsCatModalOpen(true);
                }}
              >
                Add Category
              </Button>
            }
          >
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Billing Frequency</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feeCategories.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 600 }}>{cat.name}</td>
                      <td>
                        <Badge variant="purple">{cat.frequency}</Badge>
                      </td>
                      <td style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>{cat.description}</td>
                      <td>
                        <button
                          onClick={() => toggleFeeCategoryStatus(cat.id)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        >
                          <Badge variant={cat.status === 'Active' ? 'success' : 'neutral'}>
                            {cat.status}
                          </Badge>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit2 size={13} />}
                          onClick={() => {
                            setEditingCat(cat);
                            setCatForm({
                              name: cat.name,
                              description: cat.description,
                              frequency: cat.frequency,
                              status: cat.status
                            });
                            setIsCatModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Class Structures */}
          <Card
            title="Class-Wise Fee Structure (AY 2026–2027)"
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => setIsFsModalOpen(true)}
              >
                Add Class Tariff
              </Button>
            }
          >
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Academic Year</th>
                    <th>Class Grade</th>
                    <th>Fee Category</th>
                    <th>Frequency</th>
                    <th style={{ textAlign: 'right' }}>Fee Amount</th>
                    <th>Default Due Date</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructures.map(fs => (
                    <tr key={fs.id}>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{fs.academicYear}</td>
                      <td style={{ fontWeight: 600 }}>{fs.className}</td>
                      <td>{fs.categoryName}</td>
                      <td><Badge variant="purple">{fs.frequency}</Badge></td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(fs.amount)}</td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{fs.dueDate}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${fs.className} ${fs.categoryName} structure?`)) {
                              deleteFeeStructure(fs.id);
                            }
                          }}
                          style={{
                            padding: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-danger)',
                            cursor: 'pointer'
                          }}
                          title="Delete Structure"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Concessions */}
          <Card
            title="Fee Concession & Scholarship Rules"
            action={
              <Button
                variant="primary"
                icon={<Plus size={14} />}
                onClick={() => {
                  setEditingConc(null);
                  setConcForm({ name: '', discountType: 'Percentage', discountValue: 20, description: '', status: 'Active' });
                  setIsConcModalOpen(true);
                }}
              >
                Create Concession
              </Button>
            }
          >
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Concession Name</th>
                    <th>Discount Type</th>
                    <th>Discount Value</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {concessions.map(conc => (
                    <tr key={conc.id}>
                      <td style={{ fontWeight: 600 }}>{conc.name}</td>
                      <td><Badge variant="neutral">{conc.discountType}</Badge></td>
                      <td style={{ fontWeight: 700, color: '#5A54B4' }}>
                        {conc.discountType === 'Percentage' ? `${conc.discountValue}% Waiver` : formatCurrency(conc.discountValue)}
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>
                        {conc.description || '—'}
                      </td>
                      <td>
                        <button
                          onClick={() => toggleConcessionStatus(conc.id)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                        >
                          <Badge variant={conc.status === 'Active' ? 'success' : 'neutral'}>
                            {conc.status}
                          </Badge>
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit2 size={13} />}
                          onClick={() => {
                            setEditingConc(conc);
                            setConcForm({
                              name: conc.name,
                              discountType: conc.discountType,
                              discountValue: conc.discountValue,
                              description: conc.description || '',
                              status: conc.status
                            });
                            setIsConcModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* 3. BUS SETTINGS */}
      {activeSub === 'bus' && (
        <Card
          title="Bus Fleet Routes & Conveyance Tariffs"
          action={
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => {
                setEditingRoute(null);
                setRouteForm({
                  routeNumber: `Route 0${busRoutes.length + 1}`,
                  routeName: '',
                  driverName: '',
                  driverPhone: '',
                  monthlyFee: 1500,
                  termFee: 4500,
                  status: 'Active'
                });
                setIsRouteModalOpen(true);
              }}
            >
              Add Bus Route
            </Button>
          }
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Route ID</th>
                  <th>Route Name & Stops</th>
                  <th>Driver Contact</th>
                  <th>Monthly Tariff</th>
                  <th>Term Tariff</th>
                  <th>Assigned Students</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {busRoutes.map(route => (
                  <tr key={route.id}>
                    <td style={{ fontWeight: 600 }}>{route.routeNumber}</td>
                    <td style={{ fontWeight: 500 }}>{route.routeName}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {route.driverName} ({route.driverPhone})
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(route.monthlyFee)}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {route.termFee ? formatCurrency(route.termFee) : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant="purple">{route.assignedStudents} students</Badge>
                    </td>
                    <td>
                      <Badge variant={route.status === 'Active' ? 'success' : 'neutral'}>
                        {route.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit2 size={13} />}
                          onClick={() => {
                            setEditingRoute(route);
                            setRouteForm({
                              routeNumber: route.routeNumber,
                              routeName: route.routeName,
                              driverName: route.driverName || '',
                              driverPhone: route.driverPhone || '',
                              monthlyFee: route.monthlyFee,
                              termFee: route.termFee || 4500,
                              status: route.status
                            });
                            setIsRouteModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete bus route ${route.routeNumber} (${route.routeName})?`)) {
                              deleteBusRoute(route.id);
                            }
                          }}
                          style={{
                            padding: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-danger)',
                            cursor: 'pointer'
                          }}
                          title="Delete Route"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 4. STORE SETTINGS */}
      {activeSub === 'store' && (
        <Card
          title="School Store Product Inventory & Pricing"
          action={
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => {
                setEditingProduct(null);
                setProductForm({
                  name: '',
                  category: 'Stationery',
                  price: 50,
                  stock: 100,
                  status: 'Active'
                });
                setIsProductModalOpen(true);
              }}
            >
              Add Store Item
            </Button>
          }
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Selling Price</th>
                  <th style={{ textAlign: 'center' }}>Stock In Hand</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td><Badge variant="neutral">{p.category}</Badge></td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: p.stock < 20 ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleProductStatus(p.id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                      >
                        <Badge variant={p.status === 'Active' ? 'success' : 'neutral'}>
                          {p.status}
                        </Badge>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Edit2 size={13} />}
                        onClick={() => {
                          setEditingProduct(p);
                          setProductForm({
                            name: p.name,
                            category: p.category,
                            price: p.price,
                            stock: p.stock,
                            status: p.status
                          });
                          setIsProductModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. PAYMENT SETTINGS */}
      {activeSub === 'payment' && (
        <Card title="Payment Gateways, Bank Accounts & Ledger Baseline">
          <form onSubmit={handleSavePayment} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '680px' }}>
            {paymentSavedToast && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#EDFDF5', color: 'var(--color-success)', border: '1px solid #B7F4D8', borderRadius: '6px', fontSize: '13px' }}>
                <CheckCircle size={16} />
                <span>Payment and bank account settings updated successfully.</span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                Allowed Payment Channels
              </label>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {(['Cash', 'Bank', 'UPI', 'Cheque'] as PaymentMethod[]).map(mode => (
                  <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={paymentForm.allowedPaymentModes.includes(mode)}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...paymentForm.allowedPaymentModes, mode]
                          : paymentForm.allowedPaymentModes.filter(m => m !== mode);
                        setPaymentForm({ ...paymentForm, allowedPaymentModes: next });
                      }}
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Default Selected Payment Mode
              </label>
              <select
                value={paymentForm.defaultPaymentMode}
                onChange={e => setPaymentForm({ ...paymentForm, defaultPaymentMode: e.target.value as PaymentMethod })}
                style={{ height: '36px', fontSize: '13px', minWidth: '200px' }}
              >
                {paymentForm.allowedPaymentModes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                School UPI ID (For Parent Portal Google Pay / UPI Redirection)
              </label>
              <input
                type="text"
                placeholder="e.g. afps.fees@sbi"
                value={paymentForm.upiId || ''}
                onChange={e => setPaymentForm({ ...paymentForm, upiId: e.target.value })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', display: 'block' }}>
                Used in the Parent Portal 'Pay Now' button to generate UPI payment URIs. Clear this field to demo the unconfigured UPI fallback notice.
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '10px' }}>
                School Current Bank Account Details (Demo Ledger)
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.bankAccount.bankName}
                    onChange={e => setPaymentForm({
                      ...paymentForm,
                      bankAccount: { ...paymentForm.bankAccount, bankName: e.target.value }
                    })}
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.bankAccount.accountNumber}
                    onChange={e => setPaymentForm({
                      ...paymentForm,
                      bankAccount: { ...paymentForm.bankAccount, accountNumber: e.target.value }
                    })}
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.bankAccount.ifscCode}
                    onChange={e => setPaymentForm({
                      ...paymentForm,
                      bankAccount: { ...paymentForm.bankAccount, ifscCode: e.target.value }
                    })}
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentForm.bankAccount.branchName}
                    onChange={e => setPaymentForm({
                      ...paymentForm,
                      bankAccount: { ...paymentForm.bankAccount, branchName: e.target.value }
                    })}
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Account Beneficiary / Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={paymentForm.bankAccount.accountHolder}
                  onChange={e => setPaymentForm({
                    ...paymentForm,
                    bankAccount: { ...paymentForm.bankAccount, accountHolder: e.target.value }
                  })}
                  style={{ width: '100%', height: '36px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '10px' }}>
                Opening Ledger Balances Baseline (Rupees)
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Opening Cash in Hand (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={paymentForm.openingCashBalance}
                    onChange={e => setPaymentForm({ ...paymentForm, openingCashBalance: Number(e.target.value) })}
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Opening Bank Balance (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={paymentForm.openingBankBalance}
                    onChange={e => setPaymentForm({ ...paymentForm, openingBankBalance: Number(e.target.value) })}
                    style={{ width: '100%', height: '36px', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <Button variant="primary" type="submit" icon={<CheckCircle size={14} />}>
                Save Payment Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 6. USER & ROLE SETTINGS */}
      {activeSub === 'users' && (
        <Card
          title="Staff Roles & Access Permissions"
          action={
            <Button
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => {
                setEditingStaff(null);
                setStaffForm({
                  name: '',
                  email: '',
                  role: 'Accounts Officer',
                  status: 'Active',
                  phone: '+91 ',
                  permissions: ['schoolFee', 'vouchers', 'finance']
                });
                setIsStaffModalOpen(true);
              }}
            >
              Add Staff User
            </Button>
          }
        >
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Designated Role</th>
                  <th>Contact Details</th>
                  <th>Authorized Modules</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffUsers.map(st => (
                  <tr key={st.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{st.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>{st.email}</div>
                    </td>
                    <td><Badge variant="purple">{st.role}</Badge></td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{st.phone}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '320px' }}>
                        {st.permissions.map(p => (
                          <span key={p} style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#F0F0F5', borderRadius: '4px' }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleStaffUserStatus(st.id)}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                      >
                        <Badge variant={st.status === 'Active' ? 'success' : 'neutral'}>
                          {st.status}
                        </Badge>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Edit2 size={12} />}
                          onClick={() => {
                            setEditingStaff(st);
                            setStaffForm({
                              name: st.name,
                              email: st.email,
                              role: st.role,
                              status: st.status,
                              phone: st.phone,
                              permissions: st.permissions
                            });
                            setIsStaffModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove staff user account ${st.name}?`)) {
                              deleteStaffUser(st.id);
                            }
                          }}
                          style={{
                            padding: '4px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-danger)',
                            cursor: 'pointer'
                          }}
                          title="Delete User"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 7. BACKUP & DATA */}
      {activeSub === 'backup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Card title="Export Application Database">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: 0 }}>
                Generate a complete JSON archive of all active student records, fee payments, bus routes, store sales, vouchers, fund transfers, and system configurations.
              </p>
              <div>
                <Button
                  variant="primary"
                  icon={<Download size={14} />}
                  onClick={handleDownloadBackup}
                >
                  Download Complete JSON Backup
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Import Application Database">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
              {importStatus && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  backgroundColor: importStatus.success ? '#EDFDF5' : '#FDF2F2',
                  color: importStatus.success ? 'var(--color-success)' : 'var(--color-danger)',
                  border: `1px solid ${importStatus.success ? '#B7F4D8' : '#F8B4B4'}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  {importStatus.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  <span>{importStatus.msg}</span>
                </div>
              )}

              <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-text-secondary)', margin: 0 }}>
                Upload a verified AFPS JSON backup file to overwrite current memory and LocalStorage data.
              </p>

              <div>
                <label style={{ display: 'inline-flex' }}>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="backup-file-input"
                  />
                  <Button
                    variant="secondary"
                    icon={<Upload size={14} />}
                    onClick={() => {
                      const input = document.getElementById('backup-file-input');
                      if (input) input.click();
                    }}
                  >
                    Select JSON Backup File
                  </Button>
                </label>
              </div>
            </div>
          </Card>

          <Card title="Danger Zone">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '600px' }}>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--color-danger)', margin: 0 }}>
                Resetting clears browser LocalStorage and reloads the default baseline demo records.
              </p>
              <div>
                <Button
                  variant="danger"
                  icon={<RotateCcw size={14} />}
                  onClick={() => {
                    if (confirm("Are you completely sure you want to reset all demo data to baseline state?")) {
                      resetToDefaults();
                      alert("Demo data successfully reset to baseline.");
                    }
                  }}
                >
                  Confirm Reset All Demo Data
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Fee Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCat ? `Edit Category: ${editingCat.name}` : "Add Fee Category"}
        maxWidth="480px"
      >
        <form onSubmit={e => {
          e.preventDefault();
          if (!catForm.name.trim()) return;
          if (editingCat) {
            updateFeeCategory({ ...editingCat, ...catForm });
          } else {
            addFeeCategory(catForm);
          }
          setIsCatModalOpen(false);
        }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Category Name *
            </label>
            <input
              type="text"
              required
              value={catForm.name}
              onChange={e => setCatForm({ ...catForm, name: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Billing Frequency *
            </label>
            <select
              value={catForm.frequency}
              onChange={e => setCatForm({ ...catForm, frequency: e.target.value as FeeFrequency })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            >
              <option value="Monthly">Monthly</option>
              <option value="Term-wise">Term-wise</option>
              <option value="Annual">Annual</option>
              <option value="One-time">One-time</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Description
            </label>
            <input
              type="text"
              value={catForm.description}
              onChange={e => setCatForm({ ...catForm, description: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setIsCatModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Category</Button>
          </div>
        </form>
      </Modal>

      {/* Fee Structure Modal */}
      <Modal
        isOpen={isFsModalOpen}
        onClose={() => setIsFsModalOpen(false)}
        title="Add Class-Wise Fee Tariff"
        maxWidth="480px"
      >
        <form onSubmit={e => {
          e.preventDefault();
          const cat = feeCategories.find(c => c.id === fsForm.categoryId);
          addFeeStructure({
            ...fsForm,
            categoryName: cat ? cat.name : 'Tuition Fee',
            amount: Number(fsForm.amount)
          });
          setIsFsModalOpen(false);
        }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Class Grade *
            </label>
            <select
              value={fsForm.className}
              onChange={e => setFsForm({ ...fsForm, className: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            >
              {classesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Fee Category *
            </label>
            <select
              value={fsForm.categoryId}
              onChange={e => setFsForm({ ...fsForm, categoryId: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            >
              {feeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Amount (₹) *
            </label>
            <input
              type="number"
              min="0"
              required
              value={fsForm.amount}
              onChange={e => setFsForm({ ...fsForm, amount: Number(e.target.value) })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Default Due Date Rule
            </label>
            <input
              type="text"
              value={fsForm.dueDate}
              onChange={e => setFsForm({ ...fsForm, dueDate: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setIsFsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Structure</Button>
          </div>
        </form>
      </Modal>

      {/* Concession Modal */}
      <Modal
        isOpen={isConcModalOpen}
        onClose={() => setIsConcModalOpen(false)}
        title={editingConc ? `Edit Concession: ${editingConc.name}` : "Create Fee Concession Rule"}
        maxWidth="480px"
      >
        <form onSubmit={e => {
          e.preventDefault();
          if (!concForm.name.trim()) return;
          if (editingConc) {
            updateConcession({
              ...editingConc,
              ...concForm,
              discountValue: Number(concForm.discountValue)
            });
          } else {
            addConcession({
              ...concForm,
              discountValue: Number(concForm.discountValue),
              applicableCategoryIds: ['cat-01'],
              applicableClasses: classesList
            });
          }
          setIsConcModalOpen(false);
        }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Concession Name *
            </label>
            <input
              type="text"
              required
              value={concForm.name}
              onChange={e => setConcForm({ ...concForm, name: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Waiver Type *
              </label>
              <select
                value={concForm.discountType}
                onChange={e => setConcForm({ ...concForm, discountType: e.target.value as 'Percentage' | 'Fixed' })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="Fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Value *
              </label>
              <input
                type="number"
                min="1"
                required
                value={concForm.discountValue}
                onChange={e => setConcForm({ ...concForm, discountValue: Number(e.target.value) })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Description
            </label>
            <input
              type="text"
              value={concForm.description}
              onChange={e => setConcForm({ ...concForm, description: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setIsConcModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Concession</Button>
          </div>
        </form>
      </Modal>

      {/* Bus Route Modal */}
      <Modal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        title={editingRoute ? `Edit Route: ${editingRoute.routeNumber}` : "Add Bus Route"}
        maxWidth="500px"
      >
        <form onSubmit={e => {
          e.preventDefault();
          if (!routeForm.routeNumber || !routeForm.routeName) return;
          if (editingRoute) {
            updateBusRoute({
              ...editingRoute,
              ...routeForm,
              monthlyFee: Number(routeForm.monthlyFee),
              termFee: Number(routeForm.termFee)
            });
          } else {
            addBusRoute({
              ...routeForm,
              monthlyFee: Number(routeForm.monthlyFee),
              termFee: Number(routeForm.termFee)
            });
          }
          setIsRouteModalOpen(false);
        }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Route Identifier *
            </label>
            <input
              type="text"
              required
              value={routeForm.routeNumber}
              onChange={e => setRouteForm({ ...routeForm, routeNumber: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Stops & Route Description *
            </label>
            <input
              type="text"
              required
              value={routeForm.routeName}
              onChange={e => setRouteForm({ ...routeForm, routeName: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Monthly Tariff (₹) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={routeForm.monthlyFee}
                onChange={e => setRouteForm({ ...routeForm, monthlyFee: Number(e.target.value) })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Term Tariff (₹)
              </label>
              <input
                type="number"
                min="0"
                value={routeForm.termFee}
                onChange={e => setRouteForm({ ...routeForm, termFee: Number(e.target.value) })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Driver Name
              </label>
              <input
                type="text"
                value={routeForm.driverName}
                onChange={e => setRouteForm({ ...routeForm, driverName: e.target.value })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Driver Phone
              </label>
              <input
                type="text"
                value={routeForm.driverPhone}
                onChange={e => setRouteForm({ ...routeForm, driverPhone: e.target.value })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setIsRouteModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Route</Button>
          </div>
        </form>
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? `Edit Item: ${editingProduct.name}` : "Add Store Inventory Item"}
        maxWidth="480px"
      >
        <form onSubmit={e => {
          e.preventDefault();
          if (!productForm.name.trim()) return;
          if (editingProduct) {
            updateProduct({
              ...editingProduct,
              ...productForm,
              price: Number(productForm.price),
              stock: Number(productForm.stock)
            });
          } else {
            addProduct({
              ...productForm,
              price: Number(productForm.price),
              stock: Number(productForm.stock)
            });
          }
          setIsProductModalOpen(false);
        }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Item Name *
            </label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={e => setProductForm({ ...productForm, name: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Category *
            </label>
            <select
              value={productForm.category}
              onChange={e => setProductForm({ ...productForm, category: e.target.value as Product['category'] })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            >
              <option value="Stationery">Stationery</option>
              <option value="Books">Books</option>
              <option value="Uniform">Uniform</option>
              <option value="Accessories">Accessories</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Selling Price (₹) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={productForm.price}
                onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Available Stock (Qty) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={productForm.stock}
                onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setIsProductModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Item</Button>
          </div>
        </form>
      </Modal>

      {/* Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title={editingStaff ? `Edit Staff: ${editingStaff.name}` : "Create Staff User"}
        maxWidth="500px"
      >
        <form onSubmit={e => {
          e.preventDefault();
          if (!staffForm.name.trim() || !staffForm.email.trim()) return;
          if (editingStaff) {
            updateStaffUser({ ...editingStaff, ...staffForm });
          } else {
            addStaffUser(staffForm);
          }
          setIsStaffModalOpen(false);
        }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={staffForm.name}
              onChange={e => setStaffForm({ ...staffForm, name: e.target.value })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                value={staffForm.email}
                onChange={e => setStaffForm({ ...staffForm, email: e.target.value })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={staffForm.phone}
                onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })}
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Designated Staff Role *
            </label>
            <select
              value={staffForm.role}
              onChange={e => setStaffForm({ ...staffForm, role: e.target.value as StaffUser['role'] })}
              style={{ width: '100%', height: '36px', fontSize: '13px' }}
            >
              <option value="Admin">Admin</option>
              <option value="Accounts Officer">Accounts Officer</option>
              <option value="Transport In-Charge">Transport In-Charge</option>
              <option value="Store Clerk">Store Clerk</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Module Access Permissions
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px', backgroundColor: '#FAFAFC', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
              {allPermissions.map(p => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={staffForm.permissions.includes(p.id)}
                    onChange={e => {
                      const next = e.target.checked
                        ? [...staffForm.permissions, p.id]
                        : staffForm.permissions.filter(x => x !== p.id);
                      setStaffForm({ ...staffForm, permissions: next });
                    }}
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setIsStaffModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Staff User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
