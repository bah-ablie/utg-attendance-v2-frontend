import React, { useState, useEffect } from 'react';
import { FiUsers, FiBook, FiPlus, FiX } from 'react-icons/fi';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const LecturerCourses = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  useEffect(() => { fetchData(); }, []);

const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        API.get('/courses/my-courses/lecturer'),
        API.get('/users/students')
      ]);
      setCourses(coursesRes.data);
      setStudents(usersRes.data);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedStudent) {
      toast.error('Please select a student!');
      return;
    }
    try {
      await API.put(`/courses/${selectedCourse._id}/lecturer-enroll`, {
        studentId: selectedStudent
      });
      toast.success('Student enrolled successfully!');
      setShowEnrollModal(false);
      setSelectedStudent('');
      setSearchStudent('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error enrolling student');
    }
  };

  const handleUnenroll = async (courseId, studentId) => {
    if (!window.confirm('Are you sure you want to unenroll this student?')) return;
    try {
      await API.put(`/courses/${courseId}/unenroll`, { studentId });
      toast.success('Student unenrolled successfully!');
      fetchData();
    } catch (error) {
      toast.error('Error unenrolling student');
    }
  };

  // Enrollment badge
  const enrollBadge = (enrolledBy) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.15rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.65rem',
    fontWeight: '700',
    marginLeft: '0.4rem',
    backgroundColor: enrolledBy === 'admin'
      ? 'rgba(79,70,229,0.12)' : 'rgba(16,185,129,0.12)',
    color: enrolledBy === 'admin' ? '#4F46E5' : '#10B981'
  });

  // Filter students not yet enrolled + match search
  const availableStudents = (course) => students.filter(s => {
    const alreadyEnrolled = course.students?.some(
      e => e.student?._id === s._id || e.student === s._id
    );
    const matchesSearch = s.fullName.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.matriculationNumber && s.matriculationNumber.toLowerCase().includes(searchStudent.toLowerCase()));
    return !alreadyEnrolled && matchesSearch;
  });

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
                  color: 'white', padding: '0.25rem 0.75rem',
                  borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600'
                }}>
                  {course.courseCode}
                </span>
                <h3 style={{
                  color: 'white', fontSize: '1.1rem',
                  fontWeight: '600', marginTop: '0.5rem'
                }}>
                  {course.courseName}
                </h3>
              </div>

              {/* Info */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '1rem', marginBottom: '1rem'
              }}>
                <div style={{
                  textAlign: 'center', padding: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem'
                }}>
                  <FiUsers style={{ color: '#4F46E5', fontSize: '1.25rem', marginBottom: '0.25rem' }} />
                  <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {course.students?.length || 0}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Students</div>
                </div>
                <div style={{
                  textAlign: 'center', padding: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem'
                }}>
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
              <div style={{
                marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '0.5rem'
                }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    Enrolled Students ({course.students?.length || 0})
                  </p>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => { setSelectedCourse(course); setShowEnrollModal(true); }}
                  >
                    <FiPlus /> Enroll
                  </button>
                </div>

                {/* Legend */}
                {course.students?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={enrollBadge('admin')}>🔵 Admin</span>
                    <span style={enrollBadge('lecturer')}>🟢 You</span>
                  </div>
                )}

                {course.students?.length > 0 ? (
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {course.students.map((enrollment) => {
                     const studentData = enrollment.student || enrollment;
                     const enrolledBy = enrollment.enrolledBy || 'admin';
                     return (
                      <div key={enrollment._id || enrollment} style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.5rem', padding: '0.375rem 0',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <div style={{
                           width: '28px', height: '28px', borderRadius: '50%',
                           background: enrolledBy === 'admin'
                             ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                             : 'linear-gradient(135deg, #10B981, #059669)',
                           display: 'flex', alignItems: 'center', justifyContent: 'center',
                           color: 'white', fontSize: '0.75rem', flexShrink: 0
                         }}>
                           {studentData?.fullName?.charAt(0) || '?'}
                         </div>
                         <div>
                           <div style={{
                             fontSize: '0.8rem', fontWeight: '500',
                             color: 'var(--text-primary)',
                             display: 'flex', alignItems: 'center', gap: '0.25rem'
                           }}>
                             {studentData?.fullName || 'Unknown Student'}
                             <span style={enrollBadge(enrolledBy)}>
                              {enrolledBy === 'admin' ? 'Admin' : 'You'}
                             </span>
                           </div>
                           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                             {studentData?.matriculationNumber || ''}
                           </div>
                         </div>
                       </div>
                       {enrolledBy === 'lecturer' && (
                         <button
                           className="btn btn-danger btn-sm"
                           onClick={() => handleUnenroll(course._id, studentData?._id || studentData)}
                           style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', flexShrink: 0 }}
                         >
                           Remove
                         </button>
                       )}
                     </div>
                   );
                 })}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No students enrolled yet
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enroll Modal */}
      {showEnrollModal && (
        <div className="modal-overlay" onClick={() => setShowEnrollModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Enroll Student</h3>
              <button className="modal-close" onClick={() => setShowEnrollModal(false)}>
                <FiX />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>
              Enrolling in: <strong>{selectedCourse?.courseName}</strong>
            </p>

            {/* Search */}
            <div className="form-group">
              <label className="form-label">Search Student</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or matric number..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>

            {/* Student List */}
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <div style={{
                maxHeight: '200px', overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}>
                {availableStudents(selectedCourse).length === 0 ? (
                  <p style={{
                    padding: '1rem', textAlign: 'center',
                    color: 'var(--text-muted)', fontSize: '0.875rem'
                  }}>
                    No available students found
                  </p>
                ) : (
                  availableStudents(selectedCourse).map(s => (
                    <div
                      key={s._id}
                      onClick={() => setSelectedStudent(s._id)}
                      style={{
                        padding: '0.625rem 1rem', cursor: 'pointer',
                        backgroundColor: selectedStudent === s._id
                          ? 'rgba(79,70,229,0.1)' : 'transparent',
                        borderLeft: selectedStudent === s._id
                          ? '3px solid #4F46E5' : '3px solid transparent',
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                        {s.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {s.matriculationNumber || 'No matric number'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => {
                setShowEnrollModal(false);
                setSelectedStudent('');
                setSearchStudent('');
              }}>
                Cancel
              </button>
              <button className="btn btn-success" onClick={handleEnroll}>
                Enroll Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerCourses;