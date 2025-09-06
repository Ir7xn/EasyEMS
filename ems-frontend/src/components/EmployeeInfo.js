import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const EmployeeInfoPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sample employee data
  const employeeData = {
    id: 'EMP001',
    name: 'Sarah Johnson',
    avatar: '👩‍💻',
    position: 'Senior Software Engineer',
    department: 'Engineering',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Street, San Francisco, CA 94105',
    hireDate: '2021-03-15',
    birthDate: '1990-07-22',
    reportingManager: 'Michael Chen',
    employmentType: 'Full-time',
    salary: '$95,000',
    status: 'Active'
  };

  // Performance data
  const performanceData = [
    { month: 'Jan', rating: 4.2 },
    { month: 'Feb', rating: 4.5 },
    { month: 'Mar', rating: 4.3 },
    { month: 'Apr', rating: 4.7 },
    { month: 'May', rating: 4.4 },
    { month: 'Jun', rating: 4.6 }
  ];

  // Attendance data
  const attendanceData = [
    { month: 'Jan', present: 20, absent: 2, late: 1 },
    { month: 'Feb', present: 19, absent: 1, late: 0 },
    { month: 'Mar', present: 21, absent: 1, late: 2 },
    { month: 'Apr', present: 20, absent: 2, late: 1 },
    { month: 'May', present: 22, absent: 0, late: 1 },
    { month: 'Jun', present: 21, absent: 1, late: 0 }
  ];

  // Skills data
  const skillsData = [
    { skill: 'JavaScript', level: 90, color: '#F7DF1E' },
    { skill: 'React', level: 85, color: '#61DAFB' },
    { skill: 'Python', level: 80, color: '#3776AB' },
    { skill: 'Node.js', level: 75, color: '#339933' },
    { skill: 'SQL', level: 70, color: '#4479A1' }
  ];

  // Leave balance
  const leaveBalance = [
    { type: 'Annual', used: 8, total: 25, color: '#3B82F6' },
    { type: 'Sick', used: 3, total: 10, color: '#EF4444' },
    { type: 'Personal', used: 2, total: 5, color: '#10B981' }
  ];

  const InfoCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}>
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-xl transition-all duration-300 flex flex-col`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <span className="text-white text-xl">👥</span>
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <h2 className="font-bold text-xl text-gray-900">EMS Portal</h2>
              <p className="text-gray-600 text-sm">Employee Profile</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'personal', icon: '👤', label: 'Personal Info' },
            { id: 'performance', icon: '📈', label: 'Performance' },
            { id: 'attendance', icon: '📅', label: 'Attendance' },
            { id: 'skills', icon: '🎯', label: 'Skills' },
            { id: 'documents', icon: '📄', label: 'Documents' },
            { id: 'payroll', icon: '💰', label: 'Payroll' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span className="text-lg">{sidebarOpen ? '◀️' : '▶️'}</span>
        </button>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">← Back to Dashboard</button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{employeeData.avatar}</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employeeData.name}</h1>
              <p className="text-gray-600">{employeeData.position} • {employeeData.department}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Print
          </button>
        </div>
      </div>
    </div>
  );

  const OverviewContent = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Employee Since"
          value="3.4 Years"
          icon="📅"
          color="bg-blue-100"
          subtitle="March 15, 2021"
        />
        <StatCard
          title="Performance Rating"
          value="4.6/5.0"
          icon="⭐"
          color="bg-green-100"
          subtitle="Above Average"
        />
        <StatCard
          title="Attendance Rate"
          value="96%"
          icon="📊"
          color="bg-yellow-100"
          subtitle="This Year"
        />
        <StatCard
          title="Leave Balance"
          value="17 Days"
          icon="🏖️"
          color="bg-purple-100"
          subtitle="Remaining"
        />
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <InfoCard title="Contact Information">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-lg">📧</span>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium text-gray-900">{employeeData.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg">📱</span>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-sm font-medium text-gray-900">{employeeData.phone}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-sm font-medium text-gray-900">{employeeData.address}</p>
              </div>
            </div>
          </div>
        </InfoCard>

        {/* Employment Details */}
        <InfoCard title="Employment Details">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Employee ID</p>
              <p className="text-sm font-medium text-gray-900">{employeeData.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reporting Manager</p>
              <p className="text-sm font-medium text-gray-900">{employeeData.reportingManager}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employment Type</p>
              <p className="text-sm font-medium text-gray-900">{employeeData.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {employeeData.status}
              </span>
            </div>
          </div>
        </InfoCard>

        {/* Leave Balance */}
        <InfoCard title="Leave Balance">
          <div className="space-y-4">
            {leaveBalance.map((leave, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">{leave.type}</span>
                  <span className="text-sm text-gray-600">{leave.total - leave.used}/{leave.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: leave.color,
                      width: `${((leave.total - leave.used) / leave.total) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      {/* Performance & Attendance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Performance Trend">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[3, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </InfoCard>

        <InfoCard title="Monthly Attendance">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill="#10B981" name="Present" />
              <Bar dataKey="absent" fill="#EF4444" name="Absent" />
              <Bar dataKey="late" fill="#F59E0B" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </InfoCard>
      </div>
    </div>
  );

  const PersonalInfoContent = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <InfoCard title="Basic Information">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Full Name</p>
            <p className="text-base font-medium text-gray-900">{employeeData.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="text-base font-medium text-gray-900">{new Date(employeeData.birthDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Age</p>
            <p className="text-base font-medium text-gray-900">{new Date().getFullYear() - new Date(employeeData.birthDate).getFullYear()} years</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hire Date</p>
            <p className="text-base font-medium text-gray-900">{new Date(employeeData.hireDate).toLocaleDateString()}</p>
          </div>
        </div>
      </InfoCard>

      <InfoCard title="Emergency Contact">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Contact Name</p>
            <p className="text-base font-medium text-gray-900">John Johnson</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Relationship</p>
            <p className="text-base font-medium text-gray-900">Spouse</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone Number</p>
            <p className="text-base font-medium text-gray-900">+1 (555) 987-6543</p>
          </div>
        </div>
      </InfoCard>
    </div>
  );

  const SkillsContent = () => (
    <div className="space-y-6">
      <InfoCard title="Technical Skills">
        <div className="space-y-4">
          {skillsData.map((skill, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                <span className="text-sm text-gray-600">{skill.level}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: skill.color,
                    width: `${skill.level}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewContent />;
      case 'personal':
        return <PersonalInfoContent />;
      case 'skills':
        return <SkillsContent />;
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
            <span className="text-6xl mb-4 block">🚧</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600">The {activeTab} section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default EmployeeInfoPage;