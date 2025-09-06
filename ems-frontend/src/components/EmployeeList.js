import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Eye, Download, MoreVertical, X } from 'lucide-react';

const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    employeeId: '',
    name: '',
    email: '',
    department: '',
    position: '',
    status: 'Active',
    salary: '',
    joinDate: '',
    phone: '',
    manager: ''
  });

  // Employee data from API
  const [employees, setEmployees] = useState([]);

  // API Base URL - adjust this to match your Spring Boot server
  const API_BASE_URL = 'http://localhost:8080/api/employees';

  const departments = ['Engineering', 'Marketing', 'Finance', 'HR', 'Sales'];
  const departmentOptions = ['All Departments', ...departments];
  const statuses = ['All Status', 'Active', 'Inactive', 'On Leave'];
  const managers = ['Sarah Johnson', 'Michael Brown', 'Lisa Wang', 'David Lee', 'Robert Kim'];

  // Fetch all employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

    const fetchEmployees = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();

        // ✅ Always use MongoDB _id as id
        const mapped = data.map(emp => ({
          ...emp,
          id: emp._id || emp.id,
        }));
        setEmployees(mapped);
      } catch (err) {
        setError('Error loading employees: ' + err.message);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateEmployeeId = () => {
    const maxId = employees.reduce((max, emp) => {
      const num = parseInt(emp.employeeId?.replace('EMP', '') || '0');
      return num > max ? num : max;
    }, 0);
    return `EMP${String(maxId + 1).padStart(3, '0')}`;
  };

  const handleAddEmployee = async () => {
    if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.salary || !formData.joinDate) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const employeeData = {
        employeeId: formData.employeeId || generateEmployeeId(),
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        status: formData.status,
        salary: parseFloat(formData.salary.replace(/[$,]/g, '')),
        joinDate: new Date(formData.joinDate),
        phone: formData.phone,   // ✅ include phone
        manager: formData.manager
      };


      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employeeData)
      });

      if (!response.ok) {
        throw new Error('Failed to add employee');
      }

      await fetchEmployees();
      resetForm();
      alert('Employee added successfully!');
    } catch (err) {
      setError('Error adding employee: ' + err.message);
      console.error('Error adding employee:', err);
    } finally {
      setLoading(false);
    }
  };

const handleEditEmployee = async () => {
  if (!formData.name || !formData.email || !formData.department || !formData.position || !formData.salary || !formData.joinDate) {
    alert('Please fill in all required fields');
    return;
  }

  setLoading(true);
  setError('');

  try {
      const employeeData = {
        employeeId: formData.employeeId,
        name: formData.name,
        email: formData.email,
        department: formData.department,
        position: formData.position,
        status: formData.status,
        salary: parseFloat(formData.salary.replace(/[$,]/g, '')),
        joinDate: new Date(formData.joinDate),
        phone: formData.phone,   // ✅ include phone
        manager: formData.manager
      };


    console.log("🔄 Updating employee with MongoDB _id:", formData.id);

    const response = await fetch(`${API_BASE_URL}/${formData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    });

    if (!response.ok) throw new Error('Failed to update employee');

    await fetchEmployees();
    resetForm();
    setShowEditModal(false);
    alert('Employee updated successfully!');
  } catch (err) {
    setError('Error updating employee: ' + err.message);
    console.error('Error updating employee:', err);
  } finally {
    setLoading(false);
  }
};


const handleDeleteEmployee = async (id) => {
  if (!window.confirm('Are you sure you want to delete this employee?')) return;

  try {
    console.log("🗑️ Deleting employee with MongoDB _id:", id);
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete employee');
    await fetchEmployees();
    alert('Employee deleted successfully!');
  } catch (err) {
    setError('Error deleting employee: ' + err.message);
    console.error('Error deleting employee:', err);
  }
};



  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

    const handleEditClick = (employee) => {
      setFormData({
        id: employee.id,   // ✅ This is Mongo _id
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        status: employee.status,
        salary: employee.salary.toString(),
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : '',
        phone: employee.phone || '',
        manager: employee.manager || ''
      });
      setShowEditModal(true);
    };



  const handleExport = () => {
    const csvContent = [
      ['Employee ID', 'Name', 'Email', 'Department', 'Position', 'Status', 'Salary', 'Join Date', 'Phone', 'Manager'],
      ...employees.map(emp => [
        emp.employeeId, emp.name, emp.email, emp.department, emp.position, 
        emp.status, emp.salary, emp.joinDate, emp.phone || '', emp.manager || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      employeeId: '',
      name: '',
      email: '',
      department: '',
      position: '',
      status: 'Active',
      salary: '',
      joinDate: '',
      phone: '',
      manager: ''
    });
    setShowAddForm(false);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !filterDept || filterDept === 'All Departments' || employee.department === filterDept;
    const matchesStatus = !filterStatus || filterStatus === 'All Status' || employee.status === filterStatus;
    
    return matchesSearch && matchesDept && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'Inactive': 'bg-red-100 text-red-800 border-red-200',
      'On Leave': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
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
                Employee Management
              </h1>
              <p className="text-gray-600 mt-1">Manage and view all employee information</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowAddForm(true)}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <Plus size={20} />
                Add Employee
              </button>
              <button 
                onClick={handleExport}
                disabled={loading || employees.length === 0}
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
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white min-w-48"
              >
                {departmentOptions.map(dept => (
                  <option key={dept} value={dept === 'All Departments' ? '' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
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

        {/* Add Employee Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Add New Employee
                  </h2>
                  <button 
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      placeholder={`Auto-generated (e.g., ${generateEmployeeId()})`}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generation</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="employee@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Job title/position"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salary *
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Join Date *
                    </label>
                    <input
                      type="date"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Manager
                    </label>
                    <select
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    >
                      <option value="">Select Manager</option>
                      {managers.map(manager => (
                        <option key={manager} value={manager}>{manager}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={loading}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddEmployee}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Employee'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Employee Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Edit Employee
                  </h2>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position *
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salary *
                    </label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Join Date *
                    </label>
                    <input
                      type="date"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Manager
                    </label>
                    <select
                      name="manager"
                      value={formData.manager}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                    >
                      <option value="">Select Manager</option>
                      {managers.map(manager => (
                        <option key={manager} value={manager}>{manager}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={loading}
                    className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                                        type="button"
                    onClick={handleEditEmployee}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Employee'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Employee Modal */}
          {showViewModal && selectedEmployee && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Employee Details</h2>
                  <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 p-2">
                    <X size={24} />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <p><strong>ID:</strong> {selectedEmployee.employeeId}</p>
                  <p><strong>Name:</strong> {selectedEmployee.name}</p>
                  <p><strong>Email:</strong> {selectedEmployee.email}</p>
                  <p><strong>Department:</strong> {selectedEmployee.department}</p>
                  <p><strong>Position:</strong> {selectedEmployee.position}</p>
                  <p><strong>Status:</strong> {selectedEmployee.status}</p>
                  <p><strong>Salary:</strong> {selectedEmployee.salary}</p>
                  <p><strong>Join Date:</strong> {formatDate(selectedEmployee.joinDate)}</p>
                  <p><strong>Phone:</strong> {selectedEmployee.phone || '-'}</p>
                  <p><strong>Manager:</strong> {selectedEmployee.manager || '-'}</p>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}


        {/* Employee Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Employee List ({filteredEmployees.length} employees)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Employee ID', 'Name', 'Email', 'Department', 'Position', 'Status', 'Salary', 'Join Date', 'Phone', 'Manager', 'Actions'].map(th => (
                    <th key={th} className="text-left p-4 font-semibold text-gray-700">{th}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, i) => (
                  <tr key={emp.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="p-4 font-mono text-sm text-blue-600 font-semibold">{emp.employeeId}</td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">{emp.name.charAt(0)}</div>
                      <span className="font-medium text-gray-900">{emp.name}</span>
                    </td>
                    <td className="p-4 text-gray-600">{emp.email}</td>
                    <td className="p-4"><span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{emp.department}</span></td>
                    <td className="p-4 text-gray-700">{emp.position}</td>
                    <td className="p-4">{getStatusBadge(emp.status)}</td>
                    <td className="p-4 text-gray-700 font-medium">{emp.salary}</td>
                    <td className="p-4 text-gray-600">{formatDate(emp.joinDate)}</td>
                    <td className="p-4 text-gray-700">{emp.phone || '-'}</td>
                    <td className="p-4 text-gray-700">{emp.manager || '-'}</td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button onClick={() => handleViewEmployee(emp)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={16} /></button>
                      <button onClick={() => handleEditClick(emp)} className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteEmployee(emp.id)}className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEmployees.length === 0 && <div className="p-12 text-center text-gray-600">No employees found</div>}
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;
