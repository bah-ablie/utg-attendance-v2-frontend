import React, { useState, useEffect } from 'react';
import { FiBook, FiCheckSquare, FiTrendingUp, FiAward } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const StudentOverview = () => {
  const { user } = useAuth();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await API.get('/attendance/my-report');
      setReport(response.data.report);
    } catch (error) {
      console.log('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalClasses = report.reduce((acc, r) => acc + r.totalSessions, 0);
  const attendedClasses = report.reduce((acc, r) => acc + r.attendanceCount, 0);
  const overallPercentage = totalClasses > 0
    ? ((attendedClasses / totalClasses) * 100).toFixed(1)
    : 0;

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return '#10B981';
    if (percentage >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const statCards = [
    { title: 'Enrolled Courses', value: report.length, icon: <FiBook />, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)' },
    { title: 'Classes Attended', value: attendedClasses, icon: <FiCheckSquare />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { title: 'Total Classes', value: totalClasses, icon: <FiTrendingUp />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { title: 'Overall Attendance', value: `${overallPercentage}%`, icon: <FiAward />, color: getStatusColor(overallPercentage), bg: `${getStatusColor(overallPercentage)}20` },
  ];

  const chartData = report.map(r => ({
    name: r.course.code,
    percentage: r.percentage,
    attended: r.attendanceCount,
    total: r.totalSessions
  }));

  if (loading) return (
    <div className="loading-spinner" style={{ height: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.fullName}! 👋</h1>
          <p className="page-subtitle">Here's your attendance overview</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
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
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Attendance by Course
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value}%`, 'Attendance']}
              />
              <Bar dataKey="percentage" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Course Attendance Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {report.map((item) => (
          <div key={item.course.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                  {item.course.code}
                </span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {item.course.name}
                </h3>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: `${getStatusColor(item.percentage)}20`,
                color: getStatusColor(item.percentage)
              }}>
                {item.status}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {item.attendanceCount}/{item.totalSessions} classes
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: getStatusColor(item.percentage) }}>
                  {item.percentage}%
                </span>
              </div>
              <div style={{
                height: '8px', backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '4px', overflow: 'hidden'
              }}>
                <div style={{
                  width: `${item.percentage}%`,
                  height: '100%',
                  backgroundColor: getStatusColor(item.percentage),
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {item.percentage >= 75
                ? '✅ Good attendance! Keep it up!'
                : item.percentage >= 50
                ? '⚠️ Attendance needs improvement'
                : '❌ Poor attendance! Take action!'}
            </p>
          </div>
        ))}
      </div>

      {report.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses enrolled yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Contact your admin to enroll you in courses
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOverview;