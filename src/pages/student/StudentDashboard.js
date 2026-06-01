import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import StudentOverview from './StudentOverview';
import StudentCourses from './StudentCourses';
import StudentScan from './StudentScan';
import StudentAttendance from './StudentAttendance';

const StudentDashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar role="student" />
      <div style={{ flex: 1, overflow: 'auto', paddingTop: window.innerWidth <= 768 ? '60px' : '0' }}>
        <Routes>
          <Route path="/" element={<StudentOverview />} />
          <Route path="/courses" element={<StudentCourses />} />
          <Route path="/scan" element={<StudentScan />} />
          <Route path="/attendance" element={<StudentAttendance />} />
        </Routes>
      </div>
    </div>
  );
};

export default StudentDashboard;