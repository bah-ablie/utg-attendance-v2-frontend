import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import utgLogo from '../../assets/utg-logo.png';
import {
  FiHome, FiUsers, FiBook, FiCalendar, FiBarChart2,
  FiLogOut, FiMenu, FiX, FiSun, FiMoon, FiUser,
  FiCheckSquare
} from 'react-icons/fi';

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
 useEffect(() => {
    if (isMobile) setMobileOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  
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

  const links = role === 'admin' ? adminLinks
    : role === 'lecturer' ? lecturerLinks
    : studentLinks;

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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const sidebarWidth = isMobile ? '280px' : collapsed ? '70px' : '260px';

  const SidebarContent = () => (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--sidebar-bg)',
    }}>
      {/* Logo */}
      <div style={{
        padding: (!isMobile && collapsed) ? '1.25rem 0' : '1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: (!isMobile && collapsed) ? 'center' : 'space-between',
        gap: '0.75rem'
      }}>
        {(!collapsed || isMobile) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img src={utgLogo} alt="UTG" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                UTG Attendance
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                Management System
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => isMobile ? setMobileOpen(false) : setCollapsed(!collapsed)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '4px', borderRadius: 'var(--radius-sm)'
          }}
        >
          {isMobile ? <FiX /> : collapsed ? <FiMenu /> : <FiX />}
        </button>
      </div>

      {/* User Profile */}
      <div style={{
        padding: (!isMobile && collapsed) ? '1rem 0' : '1rem 1.25rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          background: roleColors[role],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '1rem', flexShrink: 0
        }}>
          <FiUser />
        </div>
        {(!collapsed || isMobile) && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontSize: '0.8rem', fontWeight: '600',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {user?.fullName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {roleLabels[role]}
            </div>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => handleNavigate(link.path)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: (!isMobile && collapsed) ? '0.875rem 0' : '0.875rem 1.25rem',
                justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.15))'
                  : 'none',
                border: 'none',
                borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent',
                cursor: 'pointer',
                color: isActive ? '#4F46E5' : 'var(--text-secondary)',
                fontSize: '0.9rem',
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
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{link.icon}</span>
              {(!collapsed || isMobile) && <span>{link.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border-color)' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: (!isMobile && collapsed) ? '0.75rem 0' : '0.75rem 1.25rem',
            justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: '0.875rem', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </span>
          {(!collapsed || isMobile) && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: (!isMobile && collapsed) ? '0.75rem 0' : '0.75rem 1.25rem',
            justifyContent: (!isMobile && collapsed) ? 'center' : 'flex-start',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#EF4444', fontSize: '0.875rem', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}><FiLogOut /></span>
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
          backgroundColor: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0.75rem 1rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-primary)', fontSize: '1.4rem',
                display: 'flex', alignItems: 'center'
              }}
            >
              <FiMenu />
            </button>
            <img src={utgLogo} alt="UTG" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              UTG Attendance
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                borderRadius: '50%', width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem'
              }}
            >
              {theme === 'light' ? <FiMoon /> : <FiSun />}
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(239,68,68,0.1)', border: 'none',
                borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem',
                cursor: 'pointer', color: '#EF4444', fontSize: '0.8rem',
                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem'
              }}
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: isMobile ? (mobileOpen ? '0' : '-280px') : 0,
        top: 0,
        height: '100vh',
        width: sidebarWidth,
        borderRight: '1px solid var(--border-color)',
        transition: isMobile ? 'left 0.3s ease' : 'width 0.3s ease',
        zIndex: isMobile ? 400 : 100,
        boxShadow: isMobile && mobileOpen ? '4px 0 20px rgba(0,0,0,0.2)' : '2px 0 10px rgba(0,0,0,0.05)'
      }}>
        <SidebarContent />
      </div>

      {/* Desktop content spacer */}
      {!isMobile && (
        <div style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease' }} />
      )}
    </>
  );
};

export default Sidebar;