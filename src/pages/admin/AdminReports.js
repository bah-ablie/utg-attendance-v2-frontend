import React, { useState, useEffect } from 'react';
import { FiDownload, FiBarChart2, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const AdminReports = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Course picker state
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [filterDept, setFilterDept] = useState('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.course-picker-container')) {
        setShowCoursePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await API.get('/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Error fetching courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchReport = async () => {
    if (!selectedCourse) {
      toast.error('Please select a course!');
      return;
    }
    setLoading(true);
    try {
      const response = await API.get(`/attendance/report/${selectedCourse}`);
      setReport(response.data);
    } catch (error) {
      toast.error('Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!report) return;

    const data = report.report.map((item) => ({
      'Full Name': item.student.fullName,
      'Email': item.student.email,
      'Matriculation Number': item.student.matriculationNumber || 'N/A',
      'Department': item.student.department || 'N/A',
      'Classes Attended': item.attendanceCount,
      'Total Classes': item.totalSessions,
      'Attendance %': `${item.percentage}%`,
      'Status': item.status
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    XLSX.writeFile(wb, `${report.course.code}_attendance_report.xlsx`);
    toast.success('Report exported successfully!');
  };

  const getStatusColor = (status) => {
    if (status === 'Good') return '#10B981';
    if (status === 'Average') return '#F59E0B';
    return '#EF4444';
  };

  const chartData = report?.report.map((item) => ({
    name: item.student.fullName.split(' ')[0],
    percentage: item.percentage,
    attended: item.attendanceCount,
    total: item.totalSessions
  })) || [];

  // Unique departments from courses
  const departments = [...new Set(courses.map(c => c.department))].sort();

  // Filter courses for the picker
  const filteredCourseOptions = courses.filter(course => {
    const matchesSearch =
      course.courseName.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesDept = filterDept === 'all' || course.department === filterDept;
    return matchesSearch && matchesDept;
  });

  const selectedCourseData = courses.find(c => c._id === selectedCourse);

  if (coursesLoading) return (
    <div className="loading-spinner" style={{ height: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Reports</h1>
          <p className="page-subtitle">View and export attendance reports</p>
        </div>
        {report && (
          <button className="btn btn-success" onClick={exportToExcel}>
            <FiDownload /> Export Excel
          </button>
        )}
      </div>

      {/* Course Selector */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Select Course
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>

          {/* Searchable Course Picker */}
          <div className="course-picker-container" style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
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
                color: selectedCourseData ? 'var(--text-primary)' : 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {selectedCourseData
                  ? `${selectedCourseData.courseName} (${selectedCourseData.courseCode})`
                  : 'Choose a course...'}
              </span>
              <FiChevronDown style={{
                color: 'var(--text-muted)', flexShrink: 0,
                transform: showCoursePicker ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s ease'
              }} />
            </div>

            {/* Dropdown */}
            {showCoursePicker && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 1000, overflow: 'hidden'
              }}>
                {/* Search */}
                <div style={{
                  padding: '0.5rem', borderBottom: '1px solid var(--border-color)',
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
                      border: 'none', outline: 'none', background: 'transparent',
                      fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%'
                    }}
                  />
                  {courseSearch && (
                    <FiX onClick={() => setCourseSearch('')} style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }} />
                  )}
                </div>

                {/* Department Filter */}
                {departments.length > 0 && (
                  <div style={{
                    padding: '0.5rem', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
                    backgroundColor: 'var(--bg-tertiary)'
                  }}>
                    <button
                      onClick={() => setFilterDept('all')}
                      style={{
                        padding: '0.25rem 0.7rem', borderRadius: '9999px', border: 'none',
                        cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600',
                        backgroundColor: filterDept === 'all' ? '#4F46E5' : 'var(--bg-secondary)',
                        color: filterDept === 'all' ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      All
                    </button>
                    {departments.map(dept => (
                      <button
                        key={dept}
                        onClick={() => setFilterDept(dept)}
                        style={{
                          padding: '0.25rem 0.7rem', borderRadius: '9999px', border: 'none',
                          cursor: 'pointer', fontSize: '0.7rem', fontWeight: '600',
                          backgroundColor: filterDept === dept ? '#4F46E5' : 'var(--bg-secondary)',
                          color: filterDept === dept ? 'white' : 'var(--text-secondary)'
                        }}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}

                {/* Options */}
                <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {filteredCourseOptions.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      No courses found
                    </div>
                  ) : (
                    filteredCourseOptions.map(course => (
                      <div
                        key={course._id}
                        onClick={() => {
                          setSelectedCourse(course._id);
                          setShowCoursePicker(false);
                          setCourseSearch('');
                        }}
                        style={{
                          padding: '0.625rem 1rem', cursor: 'pointer', fontSize: '0.875rem',
                          backgroundColor: selectedCourse === course._id ? 'rgba(79,70,229,0.1)' : 'transparent',
                          borderLeft: selectedCourse === course._id ? '3px solid #4F46E5' : '3px solid transparent',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                          {course.courseName} ({course.courseCode})
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {course.department}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report */}
      {report && (
        <>
          {/* Summary Cards */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ backgroundColor: 'rgba(79,70,229,0.1)', color: '#4F46E5' }}>
                <FiBarChart2 />
              </div>
              <div className="stat-card-info">
                <h3>{report.totalSessions}</h3>
                <p>Total Sessions</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                <FiBarChart2 />
              </div>
              <div className="stat-card-info">
                <h3>{report.totalStudents}</h3>
                <p>Enrolled Students</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B' }}>
                <FiBarChart2 />
              </div>
              <div className="stat-card-info">
                <h3>{report.report.filter(r => r.status === 'Good').length}</h3>
                <p>Good Attendance</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                <FiBarChart2 />
              </div>
              <div className="stat-card-info">
                <h3>{report.report.filter(r => r.status === 'Poor').length}</h3>
                <p>Poor Attendance</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Attendance Percentage by Student
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, 'Attendance']}
                />
                <Bar dataKey="percentage" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Report Table */}
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {report.course.name} ({report.course.code}) — Detailed Report
            </h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Matric No.</th>
                    <th>Attended</th>
                    <th>Total</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.report.map((item) => (
                    <tr key={item.student.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: '500' }}>{item.student.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.student.email}</div>
                        </div>
                      </td>
                      <td>{item.student.matriculationNumber || 'N/A'}</td>
                      <td>{item.attendanceCount}</td>
                      <td>{item.totalSessions}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            flex: 1, height: '6px', backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '3px', overflow: 'hidden', minWidth: '60px'
                          }}>
                            <div style={{
                              width: `${item.percentage}%`,
                              height: '100%',
                              backgroundColor: getStatusColor(item.status),
                              borderRadius: '3px'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                            {item.percentage}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: `${getStatusColor(item.status)}20`,
                          color: getStatusColor(item.status)
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
        </>
      )}

      {!report && !loading && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No report generated yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Select a course and click "Generate Report" to view attendance data
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;