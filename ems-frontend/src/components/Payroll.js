import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Download, X, Calculator } from 'lucide-react';

const PayrollTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: '', payrollId: '', employeeId: '', employeeName: '', department: '',
    payPeriodStart: '', payPeriodEnd: '', baseSalary: '', overtime: '',
    bonus: '', taxWithholding: '', healthInsurance: '', retirement401k: '',
    grossPay: '', totalDeductions: '', netPay: '', status: 'Draft', payDate: ''
  });

  const [payrollRecords, setPayrollRecords] = useState([]);
  const API_BASE_URL = 'http://localhost:8080/api/payroll';
  const statuses = ['All Status', 'Draft', 'Calculated', 'Approved', 'Processed', 'Paid'];

  useEffect(() => {
    fetchPayrollRecords();
  }, []);

  const fetchPayrollRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch payroll records');
      const data = await response.json();
      setPayrollRecords(data.map(record => ({ ...record, id: record._id || record.id })));
    } catch (err) {
      setError('Error loading payroll: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (['baseSalary', 'overtime', 'bonus', 'taxWithholding', 'healthInsurance', 'retirement401k'].includes(name)) {
        const gross = parseFloat(updated.baseSalary || 0) + parseFloat(updated.overtime || 0) + parseFloat(updated.bonus || 0);
        const deductions = parseFloat(updated.taxWithholding || 0) + parseFloat(updated.healthInsurance || 0) + parseFloat(updated.retirement401k || 0);
        updated.grossPay = gross.toFixed(2);
        updated.totalDeductions = deductions.toFixed(2);
        updated.netPay = (gross - deductions).toFixed(2);
      }
      return updated;
    });
  };

  const generatePayrollId = () => {
    const maxId = payrollRecords.reduce((max, record) => {
      const num = parseInt(record.payrollId?.replace('PR', '') || '0');
      return num > max ? num : max;
    }, 0);
    return `PR${String(maxId + 1).padStart(4, '0')}`;
  };

  const handleSubmit = async () => {
    if (!formData.employeeId || !formData.employeeName || !formData.baseSalary) {
      alert('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const payrollData = {
        payrollId: formData.payrollId || generatePayrollId(),
        employeeId: formData.employeeId,
        employeeName: formData.employeeName,
        department: formData.department,
        payPeriodStart: formData.payPeriodStart ? formData.payPeriodStart.toString() : null,
        payPeriodEnd: formData.payPeriodEnd ? formData.payPeriodEnd.toString() : null,
        baseSalary: parseFloat(formData.baseSalary || 0),
        overtime: parseFloat(formData.overtime || 0),
        bonus: parseFloat(formData.bonus || 0),
        taxWithholding: parseFloat(formData.taxWithholding || 0),
        healthInsurance: parseFloat(formData.healthInsurance || 0),
        retirement401k: parseFloat(formData.retirement401k || 0),
        grossPay: parseFloat(formData.grossPay || 0),
        totalDeductions: parseFloat(formData.totalDeductions || 0),
        netPay: parseFloat(formData.netPay || 0),
        status: formData.status,
        payDate: formData.payDate ? formData.payDate.toString() : null
      };


      const url = modalType === 'edit' ? `${API_BASE_URL}/${formData.id}` : API_BASE_URL;
      const method = modalType === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payrollData)
      });

      if (!response.ok) throw new Error(`Failed to ${modalType} payroll record`);
      
      await fetchPayrollRecords();
      resetForm();
      alert(`Payroll record ${modalType === 'edit' ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      setError(`Error ${modalType === 'edit' ? 'updating' : 'adding'} payroll: ` + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      await fetchPayrollRecords();
      alert('Payroll record deleted!');
    } catch (err) {
      setError('Error deleting: ' + err.message);
    }
  };

  const openModal = (type, record = null) => {
    setModalType(type);
    setSelectedRecord(record);
    if (type === 'add') {
      resetForm();
    } else if (record) {
      setFormData({
        id: record.id,
        payrollId: record.payrollId,
        employeeId: record.employeeId,
        employeeName: record.employeeName,
        department: record.department || '',
        payPeriodStart: record.payPeriodStart ? new Date(record.payPeriodStart).toISOString().split('T')[0] : '',
        payPeriodEnd: record.payPeriodEnd ? new Date(record.payPeriodEnd).toISOString().split('T')[0] : '',
        baseSalary: record.baseSalary?.toString() || '',
        overtime: record.overtime?.toString() || '',
        bonus: record.bonus?.toString() || '',
        taxWithholding: record.taxWithholding?.toString() || '',
        healthInsurance: record.healthInsurance?.toString() || '',
        retirement401k: record.retirement401k?.toString() || '',
        grossPay: record.grossPay?.toString() || '',
        totalDeductions: record.totalDeductions?.toString() || '',
        netPay: record.netPay?.toString() || '',
        status: record.status,
        payDate: record.payDate ? new Date(record.payDate).toISOString().split('T')[0] : ''
      });
    }
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      id: '', payrollId: '', employeeId: '', employeeName: '', department: '',
      payPeriodStart: '', payPeriodEnd: '', baseSalary: '', overtime: '',
      bonus: '', taxWithholding: '', healthInsurance: '', retirement401k: '',
      grossPay: '', totalDeductions: '', netPay: '', status: 'Draft', payDate: ''
    });
    setShowModal(false);
    setSelectedRecord(null);
  };

  const handleExport = () => {
    const csvContent = [
      ['Payroll ID', 'Employee ID', 'Employee Name', 'Department', 'Period Start', 'Period End', 'Base Salary', 'Overtime', 'Bonus', 'Tax Withholding', 'Health Insurance', '401k', 'Gross Pay', 'Total Deductions', 'Net Pay', 'Status', 'Pay Date'],
      ...payrollRecords.map(r => [
        r.payrollId, r.employeeId, r.employeeName, r.department || '', r.payPeriodStart, r.payPeriodEnd,
        r.baseSalary, r.overtime || 0, r.bonus || 0, r.taxWithholding || 0, r.healthInsurance || 0,
        r.retirement401k || 0, r.grossPay, r.totalDeductions, r.netPay, r.status, r.payDate || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'payroll-records.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRecords = payrollRecords.filter(record => {
    const matchesSearch = record.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.payrollId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || filterStatus === 'All Status' || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Calculated': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-yellow-100 text-yellow-800',
      'Processed': 'bg-green-100 text-green-800',
      'Paid': 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading && (
          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-3 rounded-lg mb-6">
            Loading...
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Payroll Management
              </h1>
              <p className="text-gray-600 mt-1">Manage employee payroll records</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => openModal('add')}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Plus size={20} />
                Add Payroll
              </button>
              <button 
                onClick={handleExport}
                disabled={loading || payrollRecords.length === 0}
                className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Download size={20} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search payroll records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white min-w-36"
              >
                {statuses.map(status => (
                  <option key={status} value={status === 'All Status' ? '' : status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {modalType === 'add' ? 'Add' : modalType === 'edit' ? 'Edit' : 'View'} Payroll Record
                  </h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {modalType === 'view' && selectedRecord ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Employee Info</h3>
                      <div className="space-y-2">
                        <div><strong>Payroll ID:</strong> {selectedRecord.payrollId}</div>
                        <div><strong>Employee ID:</strong> {selectedRecord.employeeId}</div>
                        <div><strong>Name:</strong> {selectedRecord.employeeName}</div>
                        <div><strong>Department:</strong> {selectedRecord.department || 'N/A'}</div>
                        <div><strong>Period:</strong> {formatDate(selectedRecord.payPeriodStart)} - {formatDate(selectedRecord.payPeriodEnd)}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span>Base Salary:</span><span>{formatCurrency(selectedRecord.baseSalary)}</span></div>
                        <div className="flex justify-between"><span>Overtime:</span><span>{formatCurrency(selectedRecord.overtime)}</span></div>
                        <div className="flex justify-between"><span>Bonus:</span><span>{formatCurrency(selectedRecord.bonus)}</span></div>
                        <div className="flex justify-between font-semibold border-t pt-2"><span>Gross Pay:</span><span>{formatCurrency(selectedRecord.grossPay)}</span></div>
                        <div className="flex justify-between"><span>Tax Withholding:</span><span>-{formatCurrency(selectedRecord.taxWithholding)}</span></div>
                        <div className="flex justify-between"><span>Health Insurance:</span><span>-{formatCurrency(selectedRecord.healthInsurance)}</span></div>
                        <div className="flex justify-between"><span>401(k):</span><span>-{formatCurrency(selectedRecord.retirement401k)}</span></div>
                        <div className="flex justify-between font-semibold border-t pt-2"><span>Total Deductions:</span><span>-{formatCurrency(selectedRecord.totalDeductions)}</span></div>
                        <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                          <span>Net Pay:</span><span>{formatCurrency(selectedRecord.netPay)}</span>
                        </div>
                        <div className="mt-4">Status: {getStatusBadge(selectedRecord.status)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID *</label>
                      <input
                        type="text"
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="EMP001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Employee Name *</label>
                      <input
                        type="text"
                        name="employeeName"
                        value={formData.employeeName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Engineering"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Calculated">Calculated</option>
                        <option value="Approved">Approved</option>
                        <option value="Processed">Processed</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Period Start</label>
                      <input
                        type="date"
                        name="payPeriodStart"
                        value={formData.payPeriodStart}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Period End</label>
                      <input
                        type="date"
                        name="payPeriodEnd"
                        value={formData.payPeriodEnd}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Base Salary *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="baseSalary"
                        value={formData.baseSalary}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Overtime</label>
                      <input
                        type="number"
                        step="0.01"
                        name="overtime"
                        value={formData.overtime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bonus</label>
                      <input
                        type="number"
                        step="0.01"
                        name="bonus"
                        value={formData.bonus}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Withholding</label>
                      <input
                        type="number"
                        step="0.01"
                        name="taxWithholding"
                        value={formData.taxWithholding}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Health Insurance</label>
                      <input
                        type="number"
                        step="0.01"
                        name="healthInsurance"
                        value={formData.healthInsurance}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">401(k) Contribution</label>
                      <input
                        type="number"
                        step="0.01"
                        name="retirement401k"
                        value={formData.retirement401k}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Gross Pay</label>
                        <input
                          type="number"
                          value={formData.grossPay}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-200 rounded bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Total Deductions</label>
                        <input
                          type="number"
                          value={formData.totalDeductions}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-200 rounded bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Net Pay</label>
                        <input
                          type="number"
                          value={formData.netPay}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-200 rounded bg-green-50 text-green-700 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    {modalType === 'view' ? 'Close' : 'Cancel'}
                  </button>
                  {modalType !== 'view' && (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : modalType === 'edit' ? 'Update' : 'Add'} Payroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payroll Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Payroll Records ({filteredRecords.length} records)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Payroll ID', 'Employee', 'Department', 'Pay Period', 'Gross Pay', 'Deductions', 'Net Pay', 'Status', 'Actions'].map(th => (
                    <th key={th} className="text-left p-4 font-semibold text-gray-700">{th}</th>
                  ))}
                </tr>
              </thead>
                <tbody>
                  {filteredRecords.map((record, i) => (
                    <tr
                      key={record.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="p-4">{record.payrollId}</td>
                      <td className="p-4">{record.employeeName}</td>
                      <td className="p-4">{record.department}</td>
                      <td className="p-4">
                        {formatDate(record.payPeriodStart)} - {formatDate(record.payPeriodEnd)}
                      </td>
                      <td className="p-4">{formatCurrency(record.grossPay)}</td>
                      <td className="p-4">{formatCurrency(record.totalDeductions)}</td>
                      <td className="p-4">{formatCurrency(record.netPay)}</td>
                      <td className="p-4">{getStatusBadge(record.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal('view', record)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openModal('edit', record)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Payroll"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Payroll"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

            </table>
          </div>
          {filteredRecords.length === 0 && (
            <div className="p-12 text-center text-gray-600">No payroll records found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollTab;