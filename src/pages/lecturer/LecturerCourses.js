import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook } from 'react-icons/fi';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const LecturerCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses/my-courses/lecturer');
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
          <p className="page-subtitle">Courses assigned to you</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses assigned yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Contact your admin to assign courses to you
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem'
        }}>
          {courses.map((course) => (
            <div key={course._id} className="card">
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
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
                <h3 style={{
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginTop: '0.5rem'
                }}>
                  {course.courseName}
                </h3>
              </div>

              {/* Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
                  <FiUsers style={{ color: '#4F46E5', fontSize: '1.25rem', marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {course.students?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Students</div>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
                  <FiBook style={{ color: '#10B981', fontSize: '1.25rem', marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {course.credits}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Credits</div>
                </div>
              </div>

              {/* Details */}
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <p style={{ marginBottom: '0.5rem' }}>📁 {course.department}</p>
                <p style={{ marginBottom: '0.5rem' }}>📅 {course.semester} Semester • {course.academicYear}</p>
                {course.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    {course.description}
                  </p>
                )}
              </div>

              {/* Students List */}
              {course.students?.length > 0 && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Enrolled Students
                  </p>
                  <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                    {course.students.map((student) => (
                      <div key={student._id} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.375rem 0', borderBottom: '1px solid var(--border-color)'
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.75rem', flexShrink: 0
                        }}>
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                            {student.fullName}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {student.matriculationNumber}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerCourses;