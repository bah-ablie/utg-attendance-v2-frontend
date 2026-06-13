import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUsers } from 'react-icons/fi';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourseDept, setFilterCourseDept] = useState('all');
  const [searchEnroll, setSearchEnroll] = useState('');
  const [searchRemove, setSearchRemove] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [formData, setFormData] = useState({
    courseName: '', courseCode: '', department: '',
    description: '', lecturer: '', credits: 3,
    semester: 'First', academicYear: '2025/2026'
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        API.get('/courses'),
        API.get('/users')
      ]);
      setCourses(coursesRes.data);
      setLecturers(usersRes.data.filter(u => u.role === 'lecturer'));
      setStudents(usersRes.data.filter(u => u.role === 'student'));
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await API.put(`/courses/${editingCourse._id}`, formData);
        toast.success('Course updated successfully!');
      } else {
        await API.post('/courses', formData);
        toast.success('Course created successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      department: course.department,
      description: course.description || '',
      lecturer: course.lecturer?._id || '',
      credits: course.credits || 3,
      semester: course.semester || 'First',
      academicYear: course.academicYear || '2025/2026'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await API.delete(`/courses/${id}`);
      toast.success('Course deleted successfully!');
      fetchData();
    } catch (error) {
      toast.error('Error deleting course');
    }
  };

  const handleEnroll = async () => {
  if (!selectedStudent) {
    toast.error('Please select a student!');
    return;
  }
  try {
    await API.put(`/courses/${selectedCourse._id}/enroll`, {
      studentId: selectedStudent
    });
    toast.success('Student enrolled successfully!');
    setShowEnrollModal(false);
    setSelectedStudent('');
    setSearchEnroll('');
    await fetchData();
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

  const resetForm = () => {
    setEditingCourse(null);
    setFormData({
      courseName: '', courseCode: '', department: '',
      description: '', lecturer: '', credits: 3,
      semester: 'First', academicYear: '2025/2026'
    });
  };

  // Get unique departments from courses
  const courseDepartments = [...new Set(courses.map(c => c.department))].sort();

  const filteredCourses = courses.filter(course => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterCourseDept === 'all' || course.department === filterCourseDept;
    return matchesSearch && matchesDept;
  });

  // Enrollment badge style
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

  // Filter available students for enrollment
  const availableStudents = students.filter(s => {
    const notEnrolled = !selectedCourse?.students?.find(
      e => e.student?._id === s._id || e.student === s._id
    );
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchEnroll.toLowerCase()) ||
      (s.matriculationNumber && s.matriculationNumber.toLowerCase().includes(searchEnroll.toLowerCase()));
    return notEnrolled && matchesSearch;
  });

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
          <h1 className="page-title">Courses Management</h1>
          <p className="page-subtitle">Manage all courses and enrollments</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <FiPlus /> Add Course
        </button>
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FiSearch style={{
              position: 'absolute', left: '1rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by course name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          {/* Department Filter */}
          {courseDepartments.length > 0 && (
            <select
              className="form-control"
              value={filterCourseDept}
              onChange={(e) => setFilterCourseDept(e.target.value)}
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="all">All Departments</option>
              {courseDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses found</h3>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course._id} className="card" style={{ padding: '1.5rem' }}>
              {/* Course Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                    {course.courseCode}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {course.courseName}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(course)}>
                    <FiEdit2 />
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(course._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              {/* Course Info */}
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                <p>📁 {course.department}</p>
                <p>👨‍🏫 {course.lecturer?.fullName || 'No lecturer assigned'}</p>
                <p>📅 {course.semester} Semester • {course.academicYear}</p>
                <p>⭐ {course.credits} Credits</p>
              </div>

              {/* Students */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '0.75rem'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    <FiUsers style={{ marginRight: '0.5rem' }} />
                    Students ({course.students?.length || 0})
                  </span>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedStudent('');
                      setSearchEnroll('');
                      setShowEnrollModal(true);
                    }}
                  >
                    <FiPlus /> Enroll
                  </button>
                </div>

                {/* Legend */}
                {course.students?.length > 0 && (
                  <div style={{
                    display: 'flex', gap: '0.75rem',
                    marginBottom: '0.5rem', flexWrap: 'wrap'
                  }}>
                    <span style={enrollBadge('admin')}>🔵 Admin enrolled</span>
                    <span style={enrollBadge('lecturer')}>🟢 Lecturer enrolled</span>
                  </div>
                )}

                {/* Search to remove */}
                {course.students?.length > 0 && (
                  <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                    <FiSearch style={{
                      position: 'absolute', left: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', color: 'var(--text-muted)',
                      fontSize: '0.8rem'
                    }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search to remove..."
                      value={searchRemove[course._id] || ''}
                      onChange={(e) => setSearchRemove(prev => ({
                        ...prev, [course._id]: e.target.value
                      }))}
                      style={{
                        paddingLeft: '2.25rem',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.75rem 0.4rem 2.25rem'
                      }}
                    />
                  </div>
                )}

                {course.students?.length > 0 ? (
                  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {course.students
                      .filter(enrollment => {
                        const studentData = enrollment.student || enrollment;
                        const search = searchRemove[course._id] || '';
                        if (!search) return true;
                        return (
                          studentData?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                          studentData?.matriculationNumber?.toLowerCase().includes(search.toLowerCase())
                        );
                      })
                      .map((enrollment) => {
                        const studentData = enrollment.student || enrollment;
                        const enrolledBy = enrollment.enrolledBy || 'admin';
                        return (
                          <div key={enrollment._id || enrollment} style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', padding: '0.4rem 0',
                            borderBottom: '1px solid var(--border-color)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  {studentData?.fullName || 'Unknown Student'}
                                </span>
                                <span style={enrollBadge(enrolledBy)}>
                                  {enrolledBy === 'admin' ? 'Admin' : 'Lecturer'}
                                </span>
                                {studentData?.matriculationNumber && (
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {studentData.matriculationNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleUnenroll(course._id, studentData?._id || studentData)}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', flexShrink: 0 }}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    {course.students.filter(enrollment => {
                      const studentData = enrollment.student || enrollment;
                      const search = searchRemove[course._id] || '';
                      if (!search) return true;
                      return (
                        studentData?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                        studentData?.matriculationNumber?.toLowerCase().includes(search.toLowerCase())
                      );
                    }).length === 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem' }}>
                        No students match your search
                      </p>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    No students enrolled yet
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Course Name</label>
                  <input
                    type="text" className="form-control"
                    placeholder="e.g. Introduction to Programming"
                    value={formData.courseName}
                    onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text" className="form-control"
                    placeholder="e.g. CS101"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text" className="form-control"
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lecturer</label>
                  <select
                    className="form-control"
                    value={formData.lecturer}
                    onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                    required
                  >
                    <option value="">Select Lecturer</option>
                    {lecturers.map((l) => (
                      <option key={l._id} value={l._id}>{l.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number" className="form-control"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    min="1" max="6"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <select
                    className="form-control"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    <option value="First">First Semester</option>
                    <option value="Second">Second Semester</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Academic Year</label>
                  <input
                    type="text" className="form-control"
                    placeholder="e.g. 2025/2026"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description (Optional)</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter course description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3} style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
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
              <div style={{ position: 'relative' }}>
                <FiSearch style={{
                  position: 'absolute', left: '1rem', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-muted)'
                }} />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or matric number..."
                  value={searchEnroll}
                  onChange={(e) => setSearchEnroll(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            {/* Student List */}
            <div className="form-group">
              <label className="form-label">Select Student</label>
              <div style={{
                maxHeight: '200px', overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}>
                {availableStudents.length === 0 ? (
                  <p style={{
                    padding: '1rem', textAlign: 'center',
                    color: 'var(--text-muted)', fontSize: '0.875rem'
                  }}>
                    No available students found
                  </p>
                ) : (
                  availableStudents.map(s => (
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
                setSearchEnroll('');
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

export default AdminCourses;