import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import EmployeeList from './EmployeeList';
import PayrollTab from './Payroll';
import AttendanceTab from './Attendance';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState([]);
  const [recentEmployees, setRecentEmployees] = useState([]);

  // Sample data for non-DB elements
  const sampleStats = {
    activeProjects: 24,
    onLeaveToday: 7,
    newHiresThisMonth: 7 // Will be calculated from real data
  };

  const EMPLOYEES_API_URL = 'http://localhost:8080/api/employees';


  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await fetch(EMPLOYEES_API_URL);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      
      setEmployees(data);
      calculateDepartmentDistribution(data);
      calculateRecentEmployees(data);
      calculateNewHires(data);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDepartmentDistribution = (employeeData) => {
    const deptCounts = {};
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
    
    employeeData.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const deptData = Object.entries(deptCounts).map(([name, employees], index) => ({
      name,
      employees,
      color: colors[index % colors.length]
    }));

    setDepartmentData(deptData);
  };

  const calculateRecentEmployees = (employeeData) => {
    // Sort by creation date (assuming newer employees have higher IDs or dates)
    const sorted = [...employeeData]
      .sort((a, b) => {
        // If there's a createdAt field, use it; otherwise use ID
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return (b._id || b.id || '').localeCompare(a._id || a.id || '');
      })
      .slice(0, 5)
      .map(emp => ({
        id: emp._id || emp.id,
        name: emp.name,
        position: emp.position || emp.designation || 'Not Specified',
        department: emp.department || 'Unassigned',
        status: emp.status || 'Active',
        employeeId: emp.employeeId,
        avatar: getAvatarForEmployee(emp.name)
      }));

    setRecentEmployees(sorted);
  };

  const calculateNewHires = (employeeData) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newHires = employeeData.filter(emp => {
      if (emp.createdAt) {
        const createdDate = new Date(emp.createdAt);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }
      return false;
    }).length;

    sampleStats.newHiresThisMonth = newHires;
  };

  const getAvatarForEmployee = (name) => {
    const avatars = ['👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨'];
    const index = (name || '').length % avatars.length;
    return avatars[index];
  };

  useEffect(() => {
    fetchEmployees();
    // Refresh data every 30 seconds for real-time feel
    const interval = setInterval(fetchEmployees,30000 );
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, trend, color, isLoading = false }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mt-1"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          )}
          {trend && !isLoading && (
            <p className={`text-sm mt-2 font-medium ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.positive ? '↗️' : '↘️'} {trend.value}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-xl ${color} shadow-sm`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-xl transition-all duration-300 flex flex-col border-r border-gray-200`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg">
            <span className="text-white text-xl font-bold">E</span>
          </div>
          {sidebarOpen && (
            <div className="ml-4">
              <h2 className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">EMS Portal</h2>
              <p className="text-gray-600 text-sm">Admin Dashboard</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'employees', icon: '👥', label: 'Employees' },
            { id: 'attendance', icon: '📅', label: 'Attendance' },
            { id: 'payroll', icon: '💰', label: 'Payroll' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105' 
                  : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </button>
          ))}

          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 mt-8"
          >
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
        >
          <span className="text-lg">{sidebarOpen ? '◀️' : '▶️'}</span>
        </button>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your team overview.</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="font-semibold text-gray-900">Admin User</span>
          </div>
        </div>
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={loading ? '...' : employees.length}
          icon="👥"
          trend={employees.length > 0 ? { positive: true, value: `${sampleStats.newHiresThisMonth} new this month` } : null}
          color="bg-blue-100"
          isLoading={loading}
        />
        <StatCard
          title="Active Projects"
          value={sampleStats.activeProjects}
          icon="📋"
          trend={{ positive: true, value: "+3 this week" }}
          color="bg-emerald-100"
        />
        <StatCard
          title="On Leave Today"
          value={sampleStats.onLeaveToday}
          icon="🏖️"
          trend={{ positive: false, value: "2 more than yesterday" }}
          color="bg-yellow-100"
        />
        <StatCard
          title="New Hires"
          value={loading ? '...' : sampleStats.newHiresThisMonth}
          icon="🆕"
          trend={{ positive: true, value: "This month" }}
          color="bg-purple-100"
          isLoading={loading}
        />
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Department Distribution</h3>
            {loading && <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-gray-500">Loading department data...</div>
            </div>
          ) : departmentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="employees"

                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} employees`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {departmentData.map((dept, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></div>
                    <span className="text-sm text-gray-700 font-medium">{dept.name}</span>
                    <span className="text-sm text-gray-500">({dept.employees})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No department data available
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Add Employee', icon: '👤', color: 'from-blue-500 to-blue-600', action: () => setActiveTab('employees') },
              { label: 'Manage Payroll', icon: '💰', color: 'from-purple-500 to-purple-600', action: () => setActiveTab('payroll') },
              { label: 'Check Attendance', icon: '📅', color: 'from-orange-500 to-orange-600', action: () => setActiveTab('attendance') }
            ].map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="text-sm font-semibold">{action.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Employees Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Recently Added Employees</h3>
            <button 
              onClick={() => setActiveTab('employees')}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
            >
              View All Employees
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : recentEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-4">{employee.avatar}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.employeeId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        employee.status === 'Active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {employee.status}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Employees Yet</h4>
            <p className="text-gray-500">Start by adding your first employee to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <OverviewContent />}
          {activeTab === 'employees' && <EmployeeList />}
          {activeTab === 'payroll' && <PayrollTab />}
          {activeTab === 'attendance' && <AttendanceTab />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;