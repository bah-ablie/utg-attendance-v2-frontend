import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses/my-courses/student');
      setCourses(response.data);
    } catch (error) {
      toast.error('Error fetching courses');
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
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">Courses you are enrolled in</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses enrolled yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Contact your admin to enroll you in courses
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {courses.map((course) => (
            <div key={course._id} className="card">
              <div style={{
                background: 'linear-gradient(135deg, #10B981, #0EA5E9)',
                margin: '-1.5rem -1.5rem 1.5rem -1.5rem',
                padding: '1.5rem',
                borderRadius: '0.75rem 0.75rem 0 0'
              }}>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {course.courseCode}
                </span>
                <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '600', marginTop: '0.5rem' }}>
                  {course.courseName}
                </h3>
              </div>

              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '0.5rem' }}>📁 {course.department}</p>
                <p style={{ marginBottom: '0.5rem' }}>👨‍🏫 {course.lecturer?.fullName || 'N/A'}</p>
                <p style={{ marginBottom: '0.5rem' }}>📅 {course.semester} Semester • {course.academicYear}</p>
                <p>⭐ {course.credits} Credits</p>
              </div>

              <div style={{
                marginTop: '1rem', padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <FiUsers style={{ color: '#10B981' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {course.students?.length || 0} students enrolled
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;