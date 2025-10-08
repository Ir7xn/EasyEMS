import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EMSAuthPage from './components/EMSAuthPage';
import EMSDashboard from './components/EMSDashboard';
import EmployeeList from './components/EmployeeList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EMSAuthPage />} />
        <Route path="/admin-dashboard" element={<EMSDashboard />} />
        <Route path="/employee-list" element={<EmployeeList />} />
      </Routes>
    </Router>
  );
}

export default App;
