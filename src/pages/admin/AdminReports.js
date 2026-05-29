import React, { useState, useEffect } from 'react';
import { FiDownload, FiBarChart2 } from 'react-icons/fi';
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

  useEffect(() => {
    fetchCourses();
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
          <select
            className="form-control"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          >
            <option value="">Choose a course...</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseName} ({course.courseCode})
              </option>
            ))}
          </select>
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