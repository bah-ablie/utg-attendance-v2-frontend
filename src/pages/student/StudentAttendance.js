import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiFilter } from 'react-icons/fi';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');

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

  // Get unique courses from attendance records
  const courses = [...new Map(
    attendance
      .filter(r => r.course)
      .map(r => [r.course._id, { id: r.course._id, name: r.course.courseName, code: r.course.courseCode }])
  ).values()];

  // Filter attendance by selected course
  const filtered = selectedCourse === 'all'
    ? attendance
    : attendance.filter(r => r.course?._id === selectedCourse);

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
          {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Course Filter */}
      {courses.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            <FiFilter />
            Filter by course:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedCourse('all')}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '600',
                backgroundColor: selectedCourse === 'all'
                  ? '#4F46E5' : 'var(--bg-tertiary)',
                color: selectedCourse === 'all'
                  ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              All Courses
            </button>
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  backgroundColor: selectedCourse === course.id
                    ? '#4F46E5' : 'var(--bg-tertiary)',
                  color: selectedCourse === course.id
                    ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s'
                }}
              >
                {course.code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No attendance records yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {selectedCourse === 'all'
                  ? 'Scan a QR code to mark your first attendance'
                  : 'No attendance records for this course yet'}
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
                {filtered.map((record) => (
                  <tr key={record._id}>
                    <td>
                      <div style={{ fontWeight: '500' }}>
                        {record.course?.courseName || 'N/A'}
                      </div>
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