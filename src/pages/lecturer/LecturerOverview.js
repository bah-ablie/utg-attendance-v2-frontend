import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBook, FiCalendar, FiUsers, FiCheckSquare, FiAlertTriangle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api/axiosConfig';

const LecturerOverview = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [atRiskData, setAtRiskData] = useState([]);
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

      // Only check at-risk if there are closed sessions
      const closedSessions = sessionsRes.data.filter(s => !s.isActive);

      if (closedSessions.length === 0) {
        setAtRiskData([]);
        return;
      }

      // Fetch attendance reports for each course to find at-risk students
      const reports = await Promise.all(
        coursesRes.data.map(course =>
          API.get(`/attendance/report/${course._id}`)
            .then(res => ({ course, report: res.data }))
            .catch(() => null)
        )
      );

      // Collect at-risk students (below 75%) — only if course has closed sessions
      const atRisk = [];
      reports.forEach(item => {
        if (!item) return;

        // Check if this course has any closed sessions
        const courseHasClosedSessions = closedSessions.some(
          s => s.course?._id === item.course._id || s.course === item.course._id
        );
        if (!courseHasClosedSessions) return;

        item.report.report.forEach(student => {
          // Only flag if there are actual sessions and attendance is below 75%
          if (student.totalSessions > 0 && student.percentage < 75) {
            atRisk.push({
              studentName: student.student.fullName,
              matricNumber: student.student.matriculationNumber,
              courseName: item.course.courseName,
              courseCode: item.course.courseCode,
              percentage: student.percentage,
              status: student.status
            });
          }
        });
      });

      // Sort by percentage ascending (worst first)
      atRisk.sort((a, b) => a.percentage - b.percentage);
      setAtRiskData(atRisk);

    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalStudents = courses.reduce((acc, course) => acc + (course.students?.length || 0), 0);
  const activeSessions = sessions.filter(s => s.isActive).length;

  const statCards = [
    { title: 'My Courses', value: courses.length, icon: <FiBook />, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)', path: '/lecturer/courses' },
    { title: 'Total Students', value: totalStudents, icon: <FiUsers />, color: '#10B981', bg: 'rgba(16,185,129,0.1)', path: '/lecturer/courses' },
    { title: 'Total Sessions', value: sessions.length, icon: <FiCalendar />, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', path: '/lecturer/sessions' },
    { title: 'Active Sessions', value: activeSessions, icon: <FiCheckSquare />, color: '#EF4444', bg: 'rgba(239,68,68,0.1)', path: '/lecturer/sessions' },
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

      {/* At-Risk Alert Banner */}
      {atRiskData.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <FiAlertTriangle style={{ color: '#EF4444', fontSize: '1.25rem', flexShrink: 0 }} />
            <p style={{ fontWeight: '700', color: '#EF4444' }}>
              ⚠️ {atRiskData.length} student{atRiskData.length > 1 ? 's' : ''} at risk across your courses!
            </p>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            The following students have attendance below 75% and may be at risk:
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  {['Student', 'Matric No.', 'Course', 'Attendance', 'Status'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '0.5rem 0.75rem',
                      color: 'var(--text-muted)', fontWeight: '600',
                      borderBottom: '1px solid rgba(239,68,68,0.2)'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {atRiskData.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {item.studentName}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {item.matricNumber || 'N/A'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {item.courseCode} — {item.courseName}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '60px', height: '6px',
                          backgroundColor: 'var(--bg-tertiary)',
                          borderRadius: '3px', overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${item.percentage}%`, height: '100%',
                            backgroundColor: item.percentage < 50 ? '#EF4444' : '#F59E0B',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span style={{
                          fontWeight: '700',
                          color: item.percentage < 50 ? '#EF4444' : '#F59E0B'
                        }}>
                          {item.percentage}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        backgroundColor: item.percentage < 50 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                        color: item.percentage < 50 ? '#EF4444' : '#F59E0B'
                      }}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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