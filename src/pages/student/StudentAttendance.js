import React, { useState, useEffect } from 'react';
import { FiCheckSquare } from 'react-icons/fi';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await API.get('/attendance/my-attendance');
      setAttendance(response.data.attendance);
    } catch (error) {
      toast.error('Error fetching attendance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-spinner" style={{ height: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">Your complete attendance history</p>
        </div>
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(79,70,229,0.1)',
          borderRadius: '9999px',
          color: '#4F46E5',
          fontWeight: '600',
          fontSize: '0.875rem'
        }}>
          Total: {attendance.length} classes
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          {attendance.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No attendance records yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Scan a QR code to mark your first attendance
              </p>
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
                {attendance.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{record.course?.courseName || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {record.course?.courseCode}
                      </div>
                    </td>
                    <td>{new Date(record.session?.date).toLocaleDateString()}</td>
                    <td>{record.session?.startTime || 'N/A'}</td>
                    <td>{record.session?.endTime || 'N/A'}</td>
                    <td>{record.session?.venue || 'N/A'}</td>
                    <td>
                      <span className="badge badge-success">
                        <FiCheckSquare style={{ marginRight: '0.25rem' }} />
                        Present
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

export default StudentAttendance;