import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiX, FiRefreshCw, FiLock, FiFilter, FiTrash2, FiSearch, FiChevronDown } from 'react-icons/fi';
import { QRCodeCanvas } from 'qrcode.react';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const LecturerSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeQR, setActiveQR] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const [formData, setFormData] = useState({
    course: '', startTime: '', endTime: '', venue: '', notes: ''
  });

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.course-picker-container')) {
        setShowCoursePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setActiveQR(null);
      setTimeLeft(null);
      toast.error('QR code has expired!');
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft]);

  const fetchData = async () => {
    try {
      const [coursesRes, sessionsRes] = await Promise.all([
        API.get('/courses/my-courses/lecturer'),
        API.get('/sessions/my-sessions')
      ]);
      setCourses(coursesRes.data);
      setSessions(sessionsRes.data);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await API.post('/sessions', formData);
      const { session } = response.data;
      setActiveQR({
        sessionToken: session.sessionToken,
        courseId: session.course,
        qrCode: session.qrCode,
        courseName: courses.find(c => c._id === session.course)?.courseName || 'Unknown'
      });
      setTimeLeft(300);
      setShowModal(false);
      setFormData({ course: '', startTime: '', endTime: '', venue: '', notes: '' });
      setCourseSearch('');
      toast.success('Session created! QR code is active for 5 minutes!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating session');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerateQR = async (sessionId) => {
    try {
      const response = await API.put(`/sessions/${sessionId}/regenerate-qr`);
      const { session } = response.data;
      setActiveQR(prev => ({
        ...prev,
        sessionToken: session.sessionToken,
        qrCode: session.qrCode
      }));
      setTimeLeft(300);
      toast.success('QR code regenerated!');
    } catch (error) {
      toast.error('Error regenerating QR code');
    }
  };

  const handleCloseSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to close this session?')) return;
    try {
      await API.put(`/sessions/${sessionId}/close`);
      toast.success('Session closed successfully!');
      setActiveQR(null);
      setTimeLeft(null);
      fetchData();
    } catch (error) {
      toast.error('Error closing session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session? This cannot be undone.')) return;
    try {
      await API.delete(`/sessions/${sessionId}`);
      toast.success('Session deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 120) return '#10B981';
    if (timeLeft > 60) return '#F59E0B';
    return '#EF4444';
  };

  const filteredSessions = selectedCourse === 'all'
    ? sessions
    : sessions.filter(s => s.course?._id === selectedCourse);

  const filteredCourseOptions = courses.filter(course =>
    course.courseName.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const selectedCourseData = courses.find(c => c._id === formData.course);

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
          <h1 className="page-title">Sessions</h1>
          <p className="page-subtitle">Create and manage class sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New Session
        </button>
      </div>

      {/* Active QR Code */}
      {activeQR && (
        <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: '9999px',
            backgroundColor: `${getTimerColor()}20`,
            color: getTimerColor(),
            fontWeight: '700', fontSize: '1.25rem',
            marginBottom: '1rem'
          }}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Active QR Code — {activeQR.courseName}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Show this QR code to your students to mark attendance
          </p>
          <div style={{
            display: 'inline-block', padding: '1.5rem',
            backgroundColor: 'white', borderRadius: '1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem'
          }}>
            <QRCodeCanvas
              value={JSON.stringify({
                sessionToken: activeQR.sessionToken,
                courseId: activeQR.courseId
              })}
              size={250} level="H"
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-warning"
              onClick={() => {
                const session = sessions.find(s => s.sessionToken === activeQR.sessionToken);
                if (session) handleRegenerateQR(session._id);
              }}
            >
              <FiRefreshCw /> Regenerate QR
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                const session = sessions.find(s => s.sessionToken === activeQR.sessionToken);
                if (session) handleCloseSession(session._id);
              }}
            >
              <FiLock /> Close Session
            </button>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="card">
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            All Sessions ({filteredSessions.length})
          </h3>

          {courses.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '500'
              }}>
                <FiFilter /> Filter:
              </div>
              <button
                onClick={() => setSelectedCourse('all')}
                style={{
                  padding: '0.3rem 0.875rem', borderRadius: '9999px',
                  border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600',
                  backgroundColor: selectedCourse === 'all' ? '#4F46E5' : 'var(--bg-tertiary)',
                  color: selectedCourse === 'all' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                All
              </button>
              {courses.map(course => (
                <button
                  key={course._id}
                  onClick={() => setSelectedCourse(course._id)}
                  style={{
                    padding: '0.3rem 0.875rem', borderRadius: '9999px',
                    border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600',
                    backgroundColor: selectedCourse === course._id ? '#4F46E5' : 'var(--bg-tertiary)',
                    color: selectedCourse === course._id ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.2s'
                  }}
                >
                  {course.courseCode}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="table-container">
          {filteredSessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No sessions yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {selectedCourse === 'all'
                  ? 'Create your first session to get started'
                  : 'No sessions for this course yet'}
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
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
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {session.isActive && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCloseSession(session._id)}
                          >
                            <FiLock /> Close
                          </button>
                        )}
                        {!session.isActive && (
                          <button
                            className="btn btn-sm"
                            onClick={() => handleDeleteSession(session._id)}
                            style={{
                              backgroundColor: 'rgba(239,68,68,0.1)',
                              color: '#EF4444',
                              border: '1px solid rgba(239,68,68,0.3)'
                            }}
                          >
                            <FiTrash2 /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Session Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Session</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateSession}>

              {/* Searchable Course Picker */}
              <div className="form-group">
                <label className="form-label">Course</label>
                <div className="course-picker-container" style={{ position: 'relative' }}>
                  <div
                    onClick={() => setShowCoursePicker(!showCoursePicker)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.625rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${showCoursePicker ? 'var(--primary)' : 'var(--border-color)'}`,
                      backgroundColor: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      boxShadow: showCoursePicker ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                      minHeight: '42px'
                    }}
                  >
                    <span style={{
                      fontSize: '0.875rem',
                      color: selectedCourseData ? 'var(--text-primary)' : 'var(--text-muted)'
                    }}>
                      {selectedCourseData
                        ? `${selectedCourseData.courseName} (${selectedCourseData.courseCode})`
                        : 'Select a course...'}
                    </span>
                    <FiChevronDown style={{
                      color: 'var(--text-muted)', flexShrink: 0,
                      transform: showCoursePicker ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s ease'
                    }} />
                  </div>

                  {showCoursePicker && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                      backgroundColor: 'var(--card-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      zIndex: 1000, overflow: 'hidden'
                    }}>
                      {/* Search */}
                      <div style={{
                        padding: '0.5rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: 'var(--bg-tertiary)'
                      }}>
                        <FiSearch style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search by name or code..."
                          value={courseSearch}
                          onChange={(e) => setCourseSearch(e.target.value)}
                          style={{
                            border: 'none', outline: 'none',
                            background: 'transparent',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)', width: '100%'
                          }}
                        />
                        {courseSearch && (
                          <FiX
                            onClick={() => setCourseSearch('')}
                            style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
                          />
                        )}
                      </div>

                      {/* Options */}
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {filteredCourseOptions.length === 0 ? (
                          <div style={{
                            padding: '1rem', textAlign: 'center',
                            color: 'var(--text-muted)', fontSize: '0.875rem'
                          }}>
                            No courses found
                          </div>
                        ) : (
                          filteredCourseOptions.map(course => (
                            <div
                              key={course._id}
                              onClick={() => {
                                setFormData({ ...formData, course: course._id });
                                setShowCoursePicker(false);
                                setCourseSearch('');
                              }}
                              style={{
                                padding: '0.625rem 1rem', cursor: 'pointer',
                                fontSize: '0.875rem',
                                backgroundColor: formData.course === course._id
                                  ? 'rgba(79,70,229,0.1)' : 'transparent',
                                borderLeft: formData.course === course._id
                                  ? '3px solid #4F46E5' : '3px solid transparent',
                                transition: 'all 0.1s ease'
                              }}
                            >
                              <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                {course.courseName}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {course.courseCode} • {course.department}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {/* Hidden input for form validation */}
                <input
                  type="text"
                  value={formData.course}
                  required
                  onChange={() => {}}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time" className="form-control"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time" className="form-control"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Venue (Optional)</label>
                <input
                  type="text" className="form-control"
                  placeholder="e.g. Computer Lab 1"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea
                  className="form-control"
                  placeholder="Any notes for this session"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3} style={{ resize: 'vertical' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline"
                  onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerSessions;