import React, { useState, useEffect } from 'react';
import { FiBook, FiCalendar, FiUsers, FiCheckSquare } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api/axiosConfig';

const LecturerOverview = () => {
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, sessionsRes] = await Promise.all([
        API.get('/courses/my-courses/lecturer'),
        API.get('/sessions/my-sessions')
      ]);
      setCourses(coursesRes.data);
      setSessions(sessionsRes.data);
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = courses.reduce((acc, course) => acc + (course.students?.length || 0), 0);
  const activeSessions = sessions.filter(s => s.isActive).length;

  const statCards = [
    { title: 'My Courses', value: courses.length, icon: <FiBook />, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)' },
    { title: 'Total Students', value: totalStudents, icon: <FiUsers />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { title: 'Total Sessions', value: sessions.length, icon: <FiCalendar />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { title: 'Active Sessions', value: activeSessions, icon: <FiCheckSquare />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  ];

  const sessionChartData = courses.map(course => ({
    name: course.courseCode,
    sessions: sessions.filter(s => s.course?._id === course._id || s.course === course._id).length,
    students: course.students?.length || 0
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
          <h1 className="page-title">Lecturer Overview</h1>
          <p className="page-subtitle">Your teaching dashboard</p>
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

      {/* Chart */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Sessions & Students per Course
        </h3>
        {sessionChartData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No data yet</h3>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sessionChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }} />
              <Bar dataKey="sessions" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Sessions" />
              <Bar dataKey="students" fill="#10B981" radius={[4, 4, 0, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Recent Sessions
        </h3>
        <div className="table-container">
          {sessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No sessions yet</h3>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Venue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.slice(0, 5).map((session) => (
                  <tr key={session._id}>
                    <td style={{ fontWeight: '500' }}>{session.course?.courseName || 'N/A'}</td>
                    <td>{new Date(session.date).toLocaleDateString()}</td>
                    <td>{session.startTime}</td>
                    <td>{session.endTime}</td>
                    <td>{session.venue || 'N/A'}</td>
                    <td>
                      <span className={`badge ${session.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {session.isActive ? 'Active' : 'Closed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerOverview;