import React, { useState, useMemo } from 'react';
import { useAppStore } from '../context/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Student, FeeStatus } from '../types';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Bus,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const {
    students,
    busRoutes,
    feePayments,
    addStudent,
    updateStudent,
    deleteStudent
  } = useAppStore();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    admissionNumber: '',
    name: '',
    dateOfBirth: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    className: 'Class 1',
    division: 'A',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
    monthlyFee: 1500,
    busRoute: '' as string,
    status: 'Active' as 'Active' | 'Inactive'
  });

  // Unique classes and divisions for dropdown
  const classesList = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
  const divisionsList = ['A', 'B'];

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.admissionNumber.toLowerCase().includes(query) ||
        student.parentName.toLowerCase().includes(query) ||
        student.parentPhone.includes(query);

      const matchesClass = classFilter === 'All' || student.className === classFilter;
      const matchesDivision = divisionFilter === 'All' || student.division === divisionFilter;
      const matchesStatus = statusFilter === 'All' || student.feeStatus === statusFilter;

      return matchesSearch && matchesClass && matchesDivision && matchesStatus;
    });
  }, [students, searchQuery, classFilter, divisionFilter, statusFilter]);

  // Pagination
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const handleOpenAdd = () => {
    const nextSeq = students.length + 1;
    const pad = nextSeq < 10 ? `00${nextSeq}` : nextSeq < 100 ? `0${nextSeq}` : `${nextSeq}`;
    setEditingStudent(null);
    setFormData({
      admissionNumber: `AFPS${pad}`,
      name: '',
      dateOfBirth: '2016-01-01',
      gender: 'Male',
      className: 'Class 5',
      division: 'A',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      address: '',
      monthlyFee: 1500,
      busRoute: '',
      status: 'Active'
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      admissionNumber: student.admissionNumber,
      name: student.name,
      dateOfBirth: student.dateOfBirth || '',
      gender: student.gender || 'Male',
      className: student.className,
      division: student.division,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || '',
      address: student.address || '',
      monthlyFee: student.monthlyFee,
      busRoute: student.busRoute || '',
      status: student.status || 'Active'
    });
    setIsAddEditModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.admissionNumber.trim() || !formData.parentPhone.trim()) {
      alert("Please fill in Student Name, Admission Number, and Parent Phone.");
      return;
    }

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...formData,
        busRoute: formData.busRoute || null,
        monthlyFee: Number(formData.monthlyFee)
      });
    } else {
      addStudent({
        admissionNumber: formData.admissionNumber,
        name: formData.name,
        className: formData.className,
        division: formData.division,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        parentEmail: formData.parentEmail,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        monthlyFee: Number(formData.monthlyFee),
        busRoute: formData.busRoute || null,
        feeStatus: 'Pending',
        status: formData.status
      });
    }
    setIsAddEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmStudent) {
      deleteStudent(deleteConfirmStudent.id);
      setDeleteConfirmStudent(null);
    }
  };

  const getStatusBadge = (status: FeeStatus) => {
    switch (status) {
      case 'Paid':
        return <Badge variant="success">Paid</Badge>;
      case 'Partial':
        return <Badge variant="warning">Partial</Badge>;
      case 'Pending':
        return <Badge variant="danger">Pending</Badge>;
    }
  };

  // Student payments for profile view
  const studentPayments = useMemo(() => {
    if (!viewingStudent) return [];
    return feePayments.filter(p => p.studentId === viewingStudent.id || p.admissionNumber === viewingStudent.admissionNumber);
  }, [viewingStudent, feePayments]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Student Management</h1>
        </div>
        <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
          Add New Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="16px">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} color="#777777" style={{ position: 'absolute', left: '12px', top: '11px', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search by student name, admission no, parent..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
          </div>

          {/* Class Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Class:</span>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Classes</option>
              {classesList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Division Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Div:</span>
            <select
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All</option>
              {divisionsList.map(d => <option key={d} value={d}>Div {d}</option>)}
            </select>
          </div>

          {/* Fee Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Student List Table */}
      <Card padding="0">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Adm No</th>
                <th>Student Name</th>
                <th style={{ width: '80px' }}>Class</th>
                <th style={{ width: '50px' }}>Div</th>
                <th>Parent Name</th>
                <th style={{ width: '120px' }}>Parent Phone</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Monthly Fee</th>
                <th style={{ width: '110px' }}>Bus Route</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Fee Status</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-secondary)' }}>
                    No students match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                      {student.admissionNumber}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {student.name}
                      </div>
                    </td>
                    <td>{student.className}</td>
                    <td>{student.division}</td>
                    <td>{student.parentName}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {student.parentPhone}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      {formatCurrency(student.monthlyFee)}
                    </td>
                    <td>
                      {student.busRoute ? (() => {
                        const r = busRoutes.find(route => route.routeNumber === student.busRoute || route.routeName === student.busRoute);
                        return (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#5A54B4' }}>
                            <Bus size={12} />
                            {r ? r.routeName : student.busRoute}
                          </span>
                        );
                      })() : (
                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getStatusBadge(student.feeStatus)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => setViewingStudent(student)}
                          style={{
                            padding: '5px',
                            borderRadius: '5px',
                            color: 'var(--color-text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="View Profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          style={{
                            padding: '5px',
                            borderRadius: '5px',
                            color: 'var(--color-text-secondary)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="Edit Student"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmStudent(student)}
                          style={{
                            padding: '5px',
                            borderRadius: '5px',
                            color: 'var(--color-danger)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          title="Delete Student"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          itemName="students"
        />
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : "Add New Student"}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveStudent}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Admission Number *
              </label>
              <input
                type="text"
                required
                value={formData.admissionNumber}
                onChange={e => setFormData({ ...formData, admissionNumber: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Student Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammed Ayaan"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Class
              </label>
              <select
                value={formData.className}
                onChange={e => setFormData({ ...formData, className: e.target.value })}
                style={{ width: '100%' }}
              >
                {classesList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Division
              </label>
              <select
                value={formData.division}
                onChange={e => setFormData({ ...formData, division: e.target.value })}
                style={{ width: '100%' }}
              >
                {divisionsList.map(d => <option key={d} value={d}>Division {d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                style={{ width: '100%' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Monthly Tuition Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                required
                value={formData.monthlyFee}
                onChange={e => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Parent / Guardian Name *
              </label>
              <input
                type="text"
                required
                placeholder="Parent full name"
                value={formData.parentName}
                onChange={e => setFormData({ ...formData, parentName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Parent Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={formData.parentPhone}
                onChange={e => setFormData({ ...formData, parentPhone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Parent Email
              </label>
              <input
                type="email"
                placeholder="parent@email.com"
                value={formData.parentEmail}
                onChange={e => setFormData({ ...formData, parentEmail: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                Bus Route Assignment
              </label>
              <select
                value={formData.busRoute}
                onChange={e => setFormData({ ...formData, busRoute: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="">No Bus Assigned (Private / Walk)</option>
                {busRoutes.map(route => (
                  <option key={route.id} value={route.routeName}>
                    {route.routeName} (₹{route.monthlyFee}/mo)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
              Residential Address
            </label>
            <input
              type="text"
              placeholder="House name, street, area, city, pincode"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" type="button" onClick={() => setIsAddEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingStudent ? "Save Changes" : "Create Student"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Student Profile Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title={`Student Profile: ${viewingStudent.name}`}
          subtitle={`Admission No: ${viewingStudent.admissionNumber} • ${viewingStudent.className} - Div ${viewingStudent.division}`}
          maxWidth="640px"
          footer={
            <Button variant="secondary" onClick={() => setViewingStudent(null)}>
              Close Profile
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Student & Parent Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#FAFAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Student Information
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={13} color="#777777" />
                    <span>Gender: <strong>{viewingStudent.gender || 'Not specified'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="#777777" />
                    <span>DOB: <strong>{viewingStudent.dateOfBirth ? formatDate(viewingStudent.dateOfBirth) : 'N/A'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} color="#777777" />
                    <span style={{ lineHeight: 1.3 }}>{viewingStudent.address || 'Address not recorded'}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#FAFAFC', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Parent / Guardian Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                  <div>Name: <strong>{viewingStudent.parentName}</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="#777777" />
                    <span>{viewingStudent.parentPhone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="#777777" />
                    <span>{viewingStudent.parentEmail || 'No email provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* School Fee Summary */}
              <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>School Tuition Fee</span>
                  {getStatusBadge(viewingStudent.feeStatus)}
                </div>
                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Monthly Rate:</span>
                    <span>{formatCurrency(viewingStudent.monthlyFee)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Total Applicable:</span>
                    <span>{formatCurrency(viewingStudent.schoolFeeTotal || viewingStudent.monthlyFee * 10)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Total Paid:</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                      {formatCurrency(viewingStudent.schoolFeePaid || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: '4px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Balance Due:</span>
                    <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                      {formatCurrency(Math.max(0, (viewingStudent.schoolFeeTotal || viewingStudent.monthlyFee * 10) - (viewingStudent.schoolFeePaid || 0)))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bus Fee Summary */}
              {(() => {
                const studentRoute = busRoutes.find(r => r.routeNumber === viewingStudent.busRoute || r.routeName === viewingStudent.busRoute);
                const displayRoute = studentRoute ? studentRoute.routeName : (viewingStudent.busRoute || '');
                return (
                  <div style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>Bus Conveyance</span>
                      <Badge variant={viewingStudent.busRoute ? 'purple' : 'neutral'}>
                        {displayRoute || 'No Bus'}
                      </Badge>
                    </div>
                    <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Assigned Route:</span>
                        <span>{displayRoute || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Total Applicable:</span>
                        <span>{formatCurrency(viewingStudent.busFeeTotal || 0)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Total Paid:</span>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          {formatCurrency(viewingStudent.busFeePaid || 0)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: '4px' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Bus Due:</span>
                        <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                          {formatCurrency(Math.max(0, (viewingStudent.busFeeTotal || 0) - (viewingStudent.busFeePaid || 0)))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Payment History Table */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={15} color="#5A54B4" />
                <span>Recorded Fee Payments ({studentPayments.length})</span>
              </div>
              {studentPayments.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', backgroundColor: '#FAFAFC', borderRadius: '6px', fontSize: '12px', color: '#777777' }}>
                  No fee payment records found for this student.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#FAFAFC', borderBottom: '1px solid var(--color-border)' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Receipt #</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Mode</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentPayments.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F0F0F5' }}>
                        <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontWeight: 600 }}>{p.receiptNumber}</td>
                        <td style={{ padding: '6px 8px' }}>{formatDate(p.date)}</td>
                        <td style={{ padding: '6px 8px' }}>{p.method}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>
                          {formatCurrency(p.amount)}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <Badge variant="success">Completed</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmStudent && (
        <Modal
          isOpen={!!deleteConfirmStudent}
          onClose={() => setDeleteConfirmStudent(null)}
          title="Confirm Student Deletion"
          maxWidth="460px"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteConfirmStudent(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                style={{ backgroundColor: 'var(--color-danger)' }}
                onClick={handleDeleteConfirm}
              >
                Delete Student
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                Are you sure you want to delete {deleteConfirmStudent.name}?
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Admission Number: {deleteConfirmStudent.admissionNumber} ({deleteConfirmStudent.className}-{deleteConfirmStudent.division}). Historical payments will remain preserved in audit logs.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
