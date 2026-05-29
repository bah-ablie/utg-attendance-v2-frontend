import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiX, FiRefreshCw, FiLock } from 'react-icons/fi';
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
  const timerRef = useRef(null);
  const [formData, setFormData] = useState({
    course: '',
    startTime: '',
    endTime: '',
    venue: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
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
      toast.success('Session created! QR code is active for 5 minutes!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating session');
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
              size={250}
              level="H"
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
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          All Sessions ({sessions.length})
        </h3>
        <div className="table-container">
          {sessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No sessions yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Create your first session to get started
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
                {sessions.map((session) => (
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
                      {session.isActive && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCloseSession(session._id)}
                        >
                          <FiLock /> Close
                        </button>
                      )}
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
              <div className="form-group">
                <label className="form-label">Course</label>
                <select
                  className="form-control"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.courseName} ({course.courseCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Venue (Optional)</label>
                <input
                  type="text"
                  className="form-control"
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
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Session
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