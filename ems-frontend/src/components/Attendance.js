import React, { useState, useEffect } from 'react';
import { Search, Calendar, Edit2, Clock, Users, TrendingUp, AlertCircle, CheckCircle, X } from 'lucide-react';

const AttendanceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Sample attendance data - will be replaced with real data later
  const generateSampleAttendance = (employeeId, employeeName, department) => {
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const records = [];

    for (let day = 1; day <= Math.min(daysInMonth, currentDate.getDate()); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        const random = Math.random();
        let status = 'Present';
        let checkIn = '09:00';
        let checkOut = '18:00';
        let workHours = 8;

        if (random < 0.05) {
          status = 'Absent';
          checkIn = '--';
          checkOut = '--';
          workHours = 0;
        } else if (random < 0.1) {
          status = 'Late';
          checkIn = '09:30';
          workHours = 7.5;
        } else if (random < 0.15) {
          status = 'Half Day';
          checkOut = '13:00';
          workHours = 4;
        }

        records.push({
          id: `att_${employeeId}_${day}`,
          employeeId,
          employeeName,
          department,
          date: date.toISOString().split('T')[0],
          checkIn,
          checkOut,
          workHours,
          status,
          notes: random < 0.1 ? 'Medical appointment' : ''
        });
      }
    }
    return records;
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      
      const employeesWithAttendance = data.map(emp => {
        const attendance = generateSampleAttendance(emp.employeeId, emp.name, emp.department);
        const presentDays = attendance.filter(record => ['Present', 'Late', 'Half Day'].includes(record.status)).length;
        const totalDays = attendance.length;
        const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

        return {
          ...emp,
          id: emp._id || emp.id,
          attendance,
          attendanceRate,
          presentDays,
          totalDays
        };
      });
      
      setEmployees(employeesWithAttendance);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      'Present': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Absent': 'bg-red-100 text-red-800 border-red-200',
      'Late': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Half Day': 'bg-orange-100 text-orange-800 border-orange-200',
      'On Leave': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAttendanceIcon = (rate) => {
    if (rate >= 95) return <CheckCircle className="text-emerald-500" size={20} />;
    if (rate >= 85) return <TrendingUp className="text-blue-500" size={20} />;
    return <AlertCircle className="text-red-500" size={20} />;
  };

  const handleEditRecord = (employee, record) => {
    setSelectedRecord({ ...record, employee });
    setEditFormData({
      status: record.status,
      checkIn: record.checkIn === '--' ? '' : record.checkIn,
      checkOut: record.checkOut === '--' ? '' : record.checkOut,
      notes: record.notes
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // Update the record in the employee's attendance array
    const updatedEmployees = employees.map(emp => {
      if (emp.id === selectedRecord.employee.id) {
        const updatedAttendance = emp.attendance.map(record => {
          if (record.id === selectedRecord.id) {
            const checkIn = editFormData.checkIn || '--';
            const checkOut = editFormData.checkOut || '--';
            let workHours = 0;
            
            if (checkIn !== '--' && checkOut !== '--') {
              const checkInTime = new Date(`2000-01-01T${checkIn}`);
              const checkOutTime = new Date(`2000-01-01T${checkOut}`);
              workHours = Math.max(0, (checkOutTime - checkInTime) / (1000 * 60 * 60));
            }

            return {
              ...record,
              status: editFormData.status,
              checkIn,
              checkOut,
              workHours: workHours.toFixed(1),
              notes: editFormData.notes
            };
          }
          return record;
        });

        // Recalculate attendance rate
        const presentDays = updatedAttendance.filter(record => 
          ['Present', 'Late', 'Half Day'].includes(record.status)
        ).length;
        const attendanceRate = ((presentDays / updatedAttendance.length) * 100).toFixed(1);

        return {
          ...emp,
          attendance: updatedAttendance,
          attendanceRate,
          presentDays
        };
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    setShowEditModal(false);
    setSelectedRecord(null);
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMonthRecords = employees.flatMap(emp => 
    emp.attendance?.filter(record => record.date.startsWith(filterMonth)) || []
  );

  const monthlyStats = {
    totalRecords: currentMonthRecords.length,
    presentCount: currentMonthRecords.filter(r => r.status === 'Present').length,
    absentCount: currentMonthRecords.filter(r => r.status === 'Absent').length,
    lateCount: currentMonthRecords.filter(r => r.status === 'Late').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Attendance Overview
              </h1>
              <p className="text-slate-600 mt-2">Monitor and manage employee attendance records</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Records', value: monthlyStats.totalRecords, icon: Users, color: 'blue' },
            { label: 'Present', value: monthlyStats.presentCount, icon: CheckCircle, color: 'emerald' },
            { label: 'Absent', value: monthlyStats.absentCount, icon: AlertCircle, color: 'red' },
            { label: 'Late Arrivals', value: monthlyStats.lateCount, icon: Clock, color: 'yellow' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-${color}-100`}>
                  <Icon className={`text-${color}-600`} size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Employee Attendance Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => {
            const monthlyRecords = employee.attendance?.filter(record => 
              record.date.startsWith(filterMonth)
            ) || [];
            
            const recentRecords = monthlyRecords.slice(-5);

            return (
              <div key={employee.id} className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {employee.name?.charAt(0) || 'E'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{employee.name}</h3>
                      <p className="text-slate-500 text-sm">{employee.employeeId} • {employee.department}</p>
                    </div>
                    <div className="text-right">
                      {getAttendanceIcon(employee.attendanceRate)}
                      <p className="text-sm font-bold text-slate-700 mt-1">{employee.attendanceRate}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-800">Recent Attendance</h4>
                    <span className="text-sm text-slate-500">{employee.presentDays}/{employee.totalDays} days</span>
                  </div>

                  <div className="space-y-3">
                    {recentRecords.length > 0 ? recentRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-700">
                              {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span>{record.checkIn} - {record.checkOut}</span>
                            <span>{record.workHours}h</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditRecord(employee, record)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit Record"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )) : (
                      <p className="text-slate-500 text-sm italic">No records for selected month</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Edit Attendance</h2>
                    <p className="text-slate-600 mt-1">
                      {selectedRecord.employee.name} • {new Date(selectedRecord.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowEditModal(false)} 
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Half Day">Half Day</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Check In</label>
                    <input
                      type="time"
                      value={editFormData.checkIn}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, checkIn: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={editFormData.status === 'Absent'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Check Out</label>
                    <input
                      type="time"
                      value={editFormData.checkOut}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, checkOut: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      disabled={editFormData.status === 'Absent'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                    <input
                      type="text"
                      placeholder="Reason for adjustment..."
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-amber-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-amber-800">Admin Override</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Changes will be logged for audit purposes. Only make adjustments for valid reasons like medical appointments or system errors.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200/50">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading attendance data...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEmployees.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200/50 text-center">
            <Users className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Employees Found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or check if employees are properly loaded.</p>
          </div>
        )}
      </div>
    </div>
  );


};

export default AttendanceManagement;