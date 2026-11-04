import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { ReceiptModal } from '../components/common/ReceiptModal';
import type { PrintableReceiptData } from '../components/common/ReceiptModal';
import { SuccessScreen } from '../components/common/SuccessScreen';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { BusRoute, Student, PaymentMethod } from '../types';
import {
  Bus,
  Search,
  Plus,
  Edit2,
  Trash2,
  Printer,
  CheckCircle,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const BusFeeManagement: React.FC = () => {
  const {
    students,
    busRoutes,
    busPayments,
    addBusRoute,
    updateBusRoute,
    deleteBusRoute,
    assignStudentBusRoute,
    recordBusFeePayment
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'collection' | 'routes' | 'assignments' | 'history'>('collection');

  // Printable receipt state
  const [printableReceipt, setPrintableReceipt] = useState<PrintableReceiptData | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<PrintableReceiptData | null>(null);

  // Collection State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [payAmount, setPayAmount] = useState<number>(1500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');

  // Route Form State
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<BusRoute | null>(null);
  const [routeFormData, setRouteFormData] = useState({
    routeNumber: '',
    routeName: '',
    driverName: '',
    driverPhone: '',
    monthlyFee: 1500,
    termFee: 4500,
    status: 'Active' as 'Active' | 'Inactive'
  });
  const [deleteConfirmRoute, setDeleteConfirmRoute] = useState<BusRoute | null>(null);

  // Student Assignment State
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [selectedStudentForAssignment, setSelectedStudentForAssignment] = useState<Student | null>(null);
  const [newAssignedRoute, setNewAssignedRoute] = useState<string>('');

  // History Filter
  const [historySearch, setHistorySearch] = useState('');
  const [historyRouteFilter, setHistoryRouteFilter] = useState('All');

  // Pagination States (20 items per page)
  const [collectionPage, setCollectionPage] = useState(1);
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  // Overview metrics
  const overview = useMemo(() => {
    const assignedStudents = students.filter(s => s.busRoute).length;
    let totalBusFeeApplicable = 0;
    let totalCollected = 0;

    students.forEach(s => {
      if (s.busRoute) {
        totalBusFeeApplicable += (s.busFeeTotal || 6000);
        totalCollected += (s.busFeePaid || 0);
      }
    });

    const totalPending = Math.max(0, totalBusFeeApplicable - totalCollected);

    return {
      assignedStudents,
      totalBusFeeApplicable,
      totalCollected,
      totalPending
    };
  }, [students]);

  // Route Save
  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeFormData.routeNumber || !routeFormData.routeName) return;

    if (editingRoute) {
      updateBusRoute({
        ...editingRoute,
        ...routeFormData,
        monthlyFee: Number(routeFormData.monthlyFee),
        termFee: Number(routeFormData.termFee)
      });
    } else {
      addBusRoute({
        routeNumber: routeFormData.routeNumber,
        routeName: routeFormData.routeName,
        driverName: routeFormData.driverName,
        driverPhone: routeFormData.driverPhone,
        monthlyFee: Number(routeFormData.monthlyFee),
        termFee: Number(routeFormData.termFee),
        status: routeFormData.status
      });
    }
    setIsRouteModalOpen(false);
  };

  const handleOpenAddRoute = () => {
    const nextRouteNum = `Route 0${busRoutes.length + 1}`;
    setEditingRoute(null);
    setRouteFormData({
      routeNumber: nextRouteNum,
      routeName: '',
      driverName: '',
      driverPhone: '',
      monthlyFee: 1500,
      termFee: 4500,
      status: 'Active'
    });
    setIsRouteModalOpen(true);
  };

  const handleOpenEditRoute = (route: BusRoute) => {
    setEditingRoute(route);
    setRouteFormData({
      routeNumber: route.routeNumber,
      routeName: route.routeName,
      driverName: route.driverName || '',
      driverPhone: route.driverPhone || '',
      monthlyFee: route.monthlyFee,
      termFee: route.termFee || route.monthlyFee * 3,
      status: route.status
    });
    setIsRouteModalOpen(true);
  };

  const handleConfirmDeleteRoute = () => {
    if (deleteConfirmRoute) {
      deleteBusRoute(deleteConfirmRoute.id);
      setDeleteConfirmRoute(null);
    }
  };

  // Bus payment execution
  const handleRecordBusPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || payAmount <= 0) return;

    const payment = recordBusFeePayment({
      studentId: selectedStudent.id,
      amount: payAmount,
      method: paymentMethod,
      referenceNo,
      remarks: remarks || `Conveyance for ${selectedStudent.busRoute}`
    });

    const receiptData: PrintableReceiptData = {
      type: 'bus',
      receiptNumber: payment.receiptNumber,
      date: payment.date,
      title: 'School Bus Conveyance Fee Receipt',
      payeeOrStudent: `${payment.studentName} (Adm: ${payment.admissionNumber})`,
      subInfo: `Route: ${payment.routeName} • Class: ${payment.className}-${payment.division}`,
      paymentMethod: payment.method,
      referenceNo: payment.referenceNo,
      items: [
        { label: `Bus Conveyance Fee (${payment.routeName})`, amount: payment.amount }
      ],
      totalAmount: payment.amount,
      remarks: payment.remarks
    };

    setSuccessReceipt(receiptData);
    setSelectedStudent(null);
    setReferenceNo('');
    setRemarks('');
  };

  // Filtered bus collection students
  const filteredBusCollectionStudents = useMemo(() => {
    const q = collectionSearch.toLowerCase();
    return students.filter(s => {
      if (!s.busRoute) return false;
      if (!collectionSearch) return true;
      const targetRoute = busRoutes.find(r => r.routeNumber === s.busRoute || r.routeName === s.busRoute);
      return (
        s.name.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.busRoute.toLowerCase().includes(q) ||
        (targetRoute && targetRoute.routeName.toLowerCase().includes(q))
      );
    });
  }, [students, collectionSearch, busRoutes]);

  // Filtered assignment students
  const filteredAssignmentStudents = useMemo(() => {
    const q = assignmentSearch.toLowerCase();
    return students.filter(s => {
      if (!assignmentSearch) return true;
      const targetRoute = busRoutes.find(r => r.routeNumber === s.busRoute || r.routeName === s.busRoute);
      return (
        s.name.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        (s.busRoute && s.busRoute.toLowerCase().includes(q)) ||
        (targetRoute && targetRoute.routeName.toLowerCase().includes(q))
      );
    });
  }, [students, assignmentSearch, busRoutes]);

  // Filtered History
  const filteredBusHistory = useMemo(() => {
    return busPayments.filter(p => {
      const q = historySearch.toLowerCase();
      const pRoute = busRoutes.find(r => r.id === p.routeId || r.routeNumber === p.routeName || r.routeName === p.routeName);
      const matchesSearch = !historySearch ||
        p.studentName.toLowerCase().includes(q) ||
        p.admissionNumber.toLowerCase().includes(q) ||
        p.receiptNumber.toLowerCase().includes(q) ||
        p.routeName.toLowerCase().includes(q) ||
        (pRoute && pRoute.routeName.toLowerCase().includes(q));
      const matchesRoute = historyRouteFilter === 'All' ||
        p.routeName === historyRouteFilter ||
        (pRoute && pRoute.routeNumber === historyRouteFilter) ||
        (pRoute && pRoute.routeName === historyRouteFilter);
      return matchesSearch && matchesRoute;
    });
  }, [busPayments, historySearch, historyRouteFilter, busRoutes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Bus Fee Management</h1>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'inline-flex', padding: '3px', backgroundColor: '#EAEAF0', borderRadius: '8px' }}>
          {[
            { id: 'collection', label: 'Bus Fee Collection' },
            { id: 'routes', label: 'Route Management' },
            { id: 'assignments', label: 'Student Assignments' },
            { id: 'history', label: 'Payment History' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'collection' | 'routes' | 'assignments' | 'history')}
              style={{
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#5A54B4' : 'var(--color-text-secondary)',
                backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Assigned Bus Students</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {overview.assignedStudents} Students
          </div>
        </div>

        <div className="card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Bus Fee Applicable</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '4px' }}>
            {formatCurrency(overview.totalBusFeeApplicable)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-success)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Collected</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-success)', marginTop: '4px' }}>
            {formatCurrency(overview.totalCollected)}
          </div>
        </div>

        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--color-danger)' }}>
          <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Total Outstanding</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>
            {formatCurrency(overview.totalPending)}
          </div>
        </div>
      </div>

      {/* TAB 1: BUS FEE COLLECTION */}
      {activeTab === 'collection' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedStudent ? '1fr 1fr' : '1fr', gap: '16px' }}>
          {/* Student Selector */}
          <Card title="Select Student with Bus Conveyance">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} color="#777777" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Filter student..."
                  value={collectionSearch}
                  onChange={e => setCollectionSearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px' }}
                />
              </div>

              <div className="table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Adm No</th>
                      <th>Student Name</th>
                      <th>Route</th>
                      <th style={{ textAlign: 'right' }}>Paid</th>
                      <th style={{ textAlign: 'right' }}>Due</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBusCollectionStudents
                      .slice((collectionPage - 1) * 20, collectionPage * 20)
                      .map(student => {
                        const targetRoute = busRoutes.find(r => r.routeNumber === student.busRoute || r.routeName === student.busRoute);
                        const feeDue = Math.max(0, (student.busFeeTotal || 6000) - (student.busFeePaid || 0));
                        const isSelected = selectedStudent?.id === student.id;
                        return (
                          <tr key={student.id} style={{ backgroundColor: isSelected ? 'var(--color-primary-light)' : undefined }}>
                            <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.admissionNumber}</td>
                            <td style={{ fontWeight: 600 }}>{student.name}</td>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#5A54B4', fontSize: '12px' }}>
                                <Bus size={12} />
                                {targetRoute ? targetRoute.routeName : student.busRoute}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--color-success)', fontWeight: 600 }}>
                              {formatCurrency(student.busFeePaid || 0)}
                            </td>
                            <td style={{ textAlign: 'right', color: feeDue > 0 ? 'var(--color-danger)' : 'var(--color-text-secondary)', fontWeight: 600 }}>
                              {formatCurrency(feeDue)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <Button
                                variant={isSelected ? "primary" : "secondary"}
                                style={{ height: '28px', padding: '0 10px', fontSize: '11px' }}
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setPayAmount(targetRoute ? targetRoute.monthlyFee : 1500);
                                }}
                              >
                                {isSelected ? "Selected" : "Select"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={collectionPage}
                totalItems={filteredBusCollectionStudents.length}
                pageSize={20}
                onPageChange={setCollectionPage}
                itemName="students"
              />
            </div>
          </Card>

          {/* Payment Form */}
          {selectedStudent && (
            <Card
              title={`Record Bus Payment for ${selectedStudent.name}`}
              subtitle={`Assigned: ${busRoutes.find(r => r.routeNumber === selectedStudent.busRoute || r.routeName === selectedStudent.busRoute)?.routeName || selectedStudent.busRoute} • Adm: ${selectedStudent.admissionNumber}`}
            >
              <form onSubmit={handleRecordBusPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px', backgroundColor: '#FAFAFC', borderRadius: '6px', border: '1px solid var(--color-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Class:</span> <strong>{selectedStudent.className}-{selectedStudent.division}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Parent:</span> <strong>{selectedStudent.parentName}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Total Bus Fee:</span> <strong>{formatCurrency(selectedStudent.busFeeTotal || 6000)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Remaining Due:</span>
                    <strong style={{ color: 'var(--color-danger)', marginLeft: '4px' }}>
                      {formatCurrency(Math.max(0, (selectedStudent.busFeeTotal || 6000) - (selectedStudent.busFeePaid || 0)))}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Payment Amount (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="50"
                      value={payAmount}
                      onChange={e => setPayAmount(Number(e.target.value))}
                      style={{ width: '100%', fontSize: '15px', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Payment Date
                    </label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={e => setPaymentDate(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                      style={{ width: '100%' }}
                    >
                      <option value="Cash">Cash Counter</option>
                      <option value="Bank">Bank Transfer</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      Reference / UTR No (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR / UPI Ref"
                      value={referenceNo}
                      onChange={e => setReferenceNo(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Remarks
                  </label>
                  <input
                    type="text"
                    placeholder="Conveyance period or route notes"
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <Button variant="secondary" type="button" onClick={() => setSelectedStudent(null)}>
                    Cancel
                  </Button>
                  <Button variant="primary" icon={<CheckCircle size={15} />} type="submit">
                    Collect Bus Fee & Issue Receipt
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: ROUTE MANAGEMENT */}
      {activeTab === 'routes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="primary" icon={<Plus size={15} />} onClick={handleOpenAddRoute}>
              Add New Route
            </Button>
          </div>

          <Card padding="0">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Route ID</th>
                    <th>Route Name</th>
                    <th>Driver Contact</th>
                    <th style={{ textAlign: 'right' }}>Monthly Fee</th>
                    <th style={{ textAlign: 'right' }}>Term Fee</th>
                    <th style={{ textAlign: 'center' }}>Assigned Students</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {busRoutes.map(route => (
                    <tr key={route.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {route.routeNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{route.routeName}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {route.driverName ? `${route.driverName} (${route.driverPhone})` : 'Unassigned'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(route.monthlyFee)}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                        {formatCurrency(route.termFee || route.monthlyFee * 3)}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#F0EFFB', color: '#5A54B4' }}>
                          {route.assignedStudents}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Badge variant={route.status === 'Active' ? 'success' : 'neutral'}>
                          {route.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleOpenEditRoute(route)}
                            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                            title="Edit Route"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmRoute(route)}
                            style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)' }}
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
        </div>
      )}

      {/* TAB 3: STUDENT ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <Card title="Student Bus Route Assignments">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ position: 'relative', maxWidth: '380px' }}>
              <Search size={14} color="#777777" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              <input
                type="text"
                placeholder="Search student to assign bus..."
                value={assignmentSearch}
                onChange={e => setAssignmentSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px' }}
              />
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Adm No</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Current Bus Route</th>
                    <th>Monthly Rate</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignmentStudents
                    .slice((assignmentPage - 1) * 20, assignmentPage * 20)
                    .map(student => {
                      const targetRoute = busRoutes.find(r => r.routeNumber === student.busRoute || r.routeName === student.busRoute);
                      return (
                        <tr key={student.id}>
                          <td style={{ fontFamily: 'monospace' }}>{student.admissionNumber}</td>
                          <td style={{ fontWeight: 600 }}>{student.name}</td>
                          <td>{student.className}-{student.division}</td>
                          <td>
                            {student.busRoute ? (
                              <Badge variant="purple">
                                <Bus size={12} style={{ marginRight: '4px' }} />
                                {targetRoute ? targetRoute.routeName : student.busRoute}
                              </Badge>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No Bus</span>
                            )}
                          </td>
                          <td>
                            {targetRoute ? formatCurrency(targetRoute.monthlyFee) : '₹0'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Button
                              variant="secondary"
                              icon={<UserCheck size={13} />}
                              style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                              onClick={() => {
                                setSelectedStudentForAssignment(student);
                                setNewAssignedRoute(student.busRoute || '');
                              }}
                            >
                              Change
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={assignmentPage}
              totalItems={filteredAssignmentStudents.length}
              pageSize={20}
              onPageChange={setAssignmentPage}
              itemName="students"
            />
          </div>
        </Card>
      )}

      {/* TAB 4: BUS PAYMENT HISTORY */}
      {activeTab === 'history' && (
        <Card padding="0">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <h2 className="section-heading" style={{ margin: 0 }}>Bus Conveyance Payment History</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} color="#777777" style={{ position: 'absolute', left: '10px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search receipt, student..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '12px' }}
                />
              </div>
              <select
                value={historyRouteFilter}
                onChange={e => setHistoryRouteFilter(e.target.value)}
                style={{ height: '34px', fontSize: '12px' }}
              >
                <option value="All">All Routes</option>
                {busRoutes.map(r => (
                  <option key={r.id} value={r.routeName}>{r.routeName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt No</th>
                  <th>Date</th>
                  <th>Student Name</th>
                  <th>Adm No</th>
                  <th>Route</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount Paid</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Print / View</th>
                </tr>
              </thead>
              <tbody>
                {filteredBusHistory
                  .slice((historyPage - 1) * 20, historyPage * 20)
                  .map(payment => (
                  <tr key={payment.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {payment.receiptNumber}
                    </td>
                    <td>{formatDate(payment.date)}</td>
                    <td style={{ fontWeight: 600 }}>{payment.studentName}</td>
                    <td style={{ fontFamily: 'monospace' }}>{payment.admissionNumber}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#5A54B4', fontSize: '12px' }}>
                        <Bus size={12} />
                        {(() => {
                          const r = busRoutes.find(route => route.id === payment.routeId || route.routeNumber === payment.routeName || route.routeName === payment.routeName);
                          return r ? r.routeName : payment.routeName;
                        })()}
                      </span>
                    </td>
                    <td>{payment.method}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Badge variant="success">Completed</Badge>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Button
                        variant="secondary"
                        icon={<Printer size={13} />}
                        style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                        onClick={() => {
                          setPrintableReceipt({
                            type: 'bus',
                            receiptNumber: payment.receiptNumber,
                            date: payment.date,
                            title: 'Bus Conveyance Fee Receipt',
                            payeeOrStudent: `${payment.studentName} (Adm: ${payment.admissionNumber})`,
                            subInfo: `Route: ${payment.routeName} • Class: ${payment.className}-${payment.division}`,
                            paymentMethod: payment.method,
                            referenceNo: payment.referenceNo,
                            items: [
                              { label: `Bus Conveyance Fee (${payment.routeName})`, amount: payment.amount }
                            ],
                            totalAmount: payment.amount,
                            remarks: payment.remarks
                          });
                        }}
                      >
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={historyPage}
            totalItems={filteredBusHistory.length}
            pageSize={20}
            onPageChange={setHistoryPage}
            itemName="receipts"
          />
        </Card>
      )}

      {/* Add / Edit Route Modal */}
      <Modal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        title={editingRoute ? `Edit Route: ${editingRoute.routeNumber}` : "Add Bus Route"}
        maxWidth="500px"
      >
        <form onSubmit={handleSaveRoute} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Route Identifier *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Route 07"
              value={routeFormData.routeNumber}
              onChange={e => setRouteFormData({ ...routeFormData, routeNumber: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
              Route Name & Key Waypoints *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kakkanad - Infopark - Edappally"
              value={routeFormData.routeName}
              onChange={e => setRouteFormData({ ...routeFormData, routeName: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Driver Name
              </label>
              <input
                type="text"
                placeholder="Driver full name"
                value={routeFormData.driverName}
                onChange={e => setRouteFormData({ ...routeFormData, driverName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Driver Phone
              </label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={routeFormData.driverPhone}
                onChange={e => setRouteFormData({ ...routeFormData, driverPhone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Monthly Tariff (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="50"
                value={routeFormData.monthlyFee}
                onChange={e => setRouteFormData({ ...routeFormData, monthlyFee: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Term Tariff (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={routeFormData.termFee}
                onChange={e => setRouteFormData({ ...routeFormData, termFee: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsRouteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingRoute ? "Save Route Changes" : "Create Route"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Bus Assignment Modal */}
      {selectedStudentForAssignment && (
        <Modal
          isOpen={!!selectedStudentForAssignment}
          onClose={() => setSelectedStudentForAssignment(null)}
          title={`Assign Bus Route: ${selectedStudentForAssignment.name}`}
          subtitle={`Admission No: ${selectedStudentForAssignment.admissionNumber}`}
          maxWidth="460px"
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedStudentForAssignment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  assignStudentBusRoute(selectedStudentForAssignment.id, newAssignedRoute || null);
                  setSelectedStudentForAssignment(null);
                }}
              >
                Save Route Assignment
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600 }}>Select Route for Student</label>
            <select
              value={newAssignedRoute}
              onChange={e => setNewAssignedRoute(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">No Bus Conveyance (Self / Walk)</option>
              {busRoutes.map(r => (
                <option key={r.id} value={r.routeName}>
                  {r.routeName} (₹{r.monthlyFee}/month)
                </option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
              * Updating a route assigns future conveyance charges to this student. Historical payment receipts remain immutable.
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Route Confirmation */}
      {deleteConfirmRoute && (
        <Modal
          isOpen={!!deleteConfirmRoute}
          onClose={() => setDeleteConfirmRoute(null)}
          title="Confirm Route Deletion"
          maxWidth="440px"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteConfirmRoute(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: 'var(--color-danger)' }}
                onClick={handleConfirmDeleteRoute}
              >
                Delete Route
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Delete {deleteConfirmRoute.routeNumber}?
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Students assigned to {deleteConfirmRoute.routeName} will have their bus conveyance unassigned. Past financial records will not be altered.
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Animated Success Screen Modal */}
      {successReceipt && (
        <Modal
          isOpen={!!successReceipt}
          onClose={() => setSuccessReceipt(null)}
          title="Payment Recorded"
          subtitle={`Receipt #${successReceipt.receiptNumber}`}
          maxWidth="480px"
        >
          {(() => {
            const match = successReceipt.payeeOrStudent.match(/^(.*?)(?:\s*\((?:Adm:\s*)?([^)]+)\))?$/);
            const studentName = match ? match[1]?.trim() : successReceipt.payeeOrStudent;
            const admNo = match ? match[2]?.trim() : '';
            const cleanSubInfo = (successReceipt.subInfo || '')
              .replace(/^Class:\s*/i, '')
              .replace(/Months:\s*/gi, '')
              .trim();

            return (
              <SuccessScreen
                title="Bus Fee Successfully Recorded!"
                amount={successReceipt.totalAmount}
                amountLabel="Total Credited"
                details={[
                  {
                    value: (
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary, #1A1A2E)' }}>
                          {studentName}
                        </span>
                        {admNo && (
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-muted, #8E8EA0)' }}>
                            {admNo}
                          </span>
                        )}
                      </div>
                    )
                  },
                  {
                    value: (
                      <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-secondary, #4A4A68)', lineHeight: 1.4 }}>
                        {cleanSubInfo}
                      </div>
                    )
                  },
                  {
                    value: (
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary, #666677)' }}>
                        {successReceipt.paymentMethod}
                      </div>
                    )
                  }
                ]}
                secondaryAction={{
                  label: 'Collect Another',
                  onClick: () => setSuccessReceipt(null)
                }}
                primaryAction={{
                  label: 'Print / View Receipt',
                  icon: <Printer size={15} />,
                  onClick: () => setPrintableReceipt(successReceipt)
                }}
              />
            );
          })()}
        </Modal>
      )}

      {/* Global Printable Receipt Modal */}
      <ReceiptModal
        isOpen={!!printableReceipt}
        onClose={() => setPrintableReceipt(null)}
        data={printableReceipt}
      />
    </div>
  );
};
