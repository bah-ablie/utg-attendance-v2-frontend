import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import LecturerOverview from './LecturerOverview';
import LecturerCourses from './LecturerCourses';
import LecturerSessions from './LecturerSessions';
import LecturerReports from './LecturerReports';

const LecturerDashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar role="lecturer" />
      <div style={{ flex: 1, overflow: 'auto', paddingTop: window.innerWidth <= 768 ? '60px' : '0' }}>
        <Routes>
          <Route path="/" element={<LecturerOverview />} />
          <Route path="/courses" element={<LecturerCourses />} />
          <Route path="/sessions" element={<LecturerSessions />} />
          <Route path="/reports" element={<LecturerReports />} />
        </Routes>
      </div>
    </div>
  );
};

export default LecturerDashboard;