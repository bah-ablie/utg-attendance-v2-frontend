import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminCourses from './AdminCourses';
import AdminReports from './AdminReports';

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar role="admin" />
      <div style={{ flex: 1, overflow: 'auto', paddingTop: window.innerWidth <= 768 ? '60px' : '0' }}>
        <Routes>
          <Route path="/" element={<AdminOverview />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/courses" element={<AdminCourses />} />
          <Route path="/reports" element={<AdminReports />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;