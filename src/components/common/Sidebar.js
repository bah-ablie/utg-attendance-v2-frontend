import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import utgLogo from '../../assets/utg-logo.png';
import {
  FiHome, FiUsers, FiBook, FiCalendar, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiUser,
  FiCheckSquare, FiSettings
} from 'react-icons/fi';

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const adminLinks = [
    { path: '/admin', icon: <FiHome />, label: 'Overview' },
    { path: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { path: '/admin/courses', icon: <FiBook />, label: 'Courses' },
    { path: '/admin/reports', icon: <FiBarChart2 />, label: 'Reports' },
  ];

  const lecturerLinks = [
    { path: '/lecturer', icon: <FiHome />, label: 'Overview' },
    { path: '/lecturer/courses', icon: <FiBook />, label: 'My Courses' },
    { path: '/lecturer/sessions', icon: <FiCalendar />, label: 'Sessions' },
    { path: '/lecturer/reports', icon: <FiBarChart2 />, label: 'Reports' },
  ];

  const studentLinks = [
    { path: '/student', icon: <FiHome />, label: 'Overview' },
    { path: '/student/courses', icon: <FiBook />, label: 'My Courses' },
    { path: '/student/scan', icon: <FiCheckSquare />, label: 'Scan QR' },
    { path: '/student/attendance', icon: <FiBarChart2 />, label: 'Attendance' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'lecturer' ? lecturerLinks : studentLinks;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const roleColors = {
    admin: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    lecturer: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
    student: 'linear-gradient(135deg, #10B981, #0EA5E9)'
  };

  const roleLabels = {
    admin: 'Administrator',
    lecturer: 'Lecturer',
    student: 'Student'
  };

  return (
    <>
      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: collapsed ? '70px' : '260px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        zIndex: 100,
        boxShadow: '2px 0 10px rgba(0,0,0,0.05)'
      }}>

        {/* Logo Section */}
        <div style={{
          padding: collapsed ? '1.25rem 0' : '1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: '0.75rem'
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={utgLogo}
                alt="UTG"
                style={{ width: '36px', height: '36px', objectFit: 'contain' }}
              />
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  lineHeight: 1.2
                }}>
                  UTG Attendance
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.2
                }}>
                  Management System
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all 0.2s'
            }}
          >
            {collapsed ? <FiMenu /> : <FiX />}
          </button>
        </div>

        {/* User Profile */}
        <div style={{
          padding: collapsed ? '1rem 0' : '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: roleColors[role],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1rem',
            flexShrink: 0
          }}>
            <FiUser />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.fullName}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)'
              }}>
                {roleLabels[role]}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.75rem 0' : '0.75rem 1.25rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.15))'
                    : 'none',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent',
                  cursor: 'pointer',
                  color: isActive ? '#4F46E5' : 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{link.icon}</span>
                {!collapsed && <span>{link.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{
          padding: '0.75rem 0',
          borderTop: '1px solid var(--border-color)'
        }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.75rem 0' : '0.75rem 1.25rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-tertiary)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </span>
            {!collapsed && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: collapsed ? '0.75rem 0' : '0.75rem 1.25rem',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#EF4444',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}><FiLogOut /></span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content spacer */}
      <div style={{ marginLeft: collapsed ? '70px' : '260px', transition: 'margin-left 0.3s ease' }} />
    </>
  );
};

export default Sidebar;