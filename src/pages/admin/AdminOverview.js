import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiBook } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API from '../../api/axiosConfig';

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    totalSessions: 0,
    totalAttendance: 0
  });
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        API.get('/users'),
        API.get('/courses')
      ]);

      const allUsers = usersRes.data;
      const allCourses = coursesRes.data;

      setUsers(allUsers);
      setCourses(allCourses);

      setStats({
        totalUsers: allUsers.length,
        totalStudents: allUsers.filter(u => u.role === 'student').length,
        totalLecturers: allUsers.filter(u => u.role === 'lecturer').length,
        totalCourses: allCourses.length,
      });
    } catch (error) {
      console.log('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const roleData = [
    { name: 'Students', value: stats.totalStudents, color: '#4F46E5' },
    { name: 'Lecturers', value: stats.totalLecturers, color: '#7C3AED' },
    { name: 'Admins', value: stats.totalUsers - stats.totalStudents - stats.totalLecturers, color: '#10B981' }
  ];

  const departmentData = courses.reduce((acc, course) => {
    const dept = course.department || 'Unknown';
    const existing = acc.find(d => d.name === dept);
    if (existing) existing.courses++;
    else acc.push({ name: dept, courses: 1 });
    return acc;
  }, []);

 const statCards = [
  { title: 'Total Users', value: stats.totalUsers, icon: <FiUsers />, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)', path: '/admin/users' },
  { title: 'Students', value: stats.totalStudents, icon: <FiUsers />, color: '#10B981', bg: 'rgba(16,185,129,0.1)', path: '/admin/users' },
  { title: 'Lecturers', value: stats.totalLecturers, icon: <FiUsers />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', path: '/admin/users' },
  { title: 'Courses', value: stats.totalCourses, icon: <FiBook />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', path: '/admin/courses' },
  ];

  if (loading) return (
    <div className="loading-spinner" style={{ height: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome to UTG Attendance Management System</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card" onClick={() => navigate(card.path)} style={{ cursor: 'pointer' }}>
            <div className="stat-card-icon" style={{ backgroundColor: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card-info">
              <h3>{card.value}</h3>
              <p>{card.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* User Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            User Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {roleData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Courses by Department */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Courses by Department
          </h3>
          {departmentData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📚</div>
              <h3>No courses yet</h3>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="courses" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Users */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Recent Users
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 5).map((user) => (
                <tr key={user._id}>
                  <td style={{ fontWeight: '500' }}>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'lecturer' ? 'warning' : 'primary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.department || 'N/A'}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;