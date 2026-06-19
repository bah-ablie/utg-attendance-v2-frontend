import React, { useState, useEffect } from 'react';
import { FiDownload, FiBarChart2, FiSearch, FiX, FiChevronDown, FiFileText } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const LecturerReports = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');

  useEffect(() => { fetchCourses(); }, []);

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
      const response = await API.get('/courses/my-courses/lecturer');
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
      'Classes Attended': item.attendanceCount,
      'Total Classes': item.totalSessions,
      'Attendance %': `${item.percentage}%`,
      'Status': item.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Report');
    XLSX.writeFile(wb, `${report.course.code}_report.xlsx`);
    toast.success('Excel exported successfully!');
  };

  const exportToPDF = () => {
    if (!report) return;

    const printWindow = window.open('', '_blank');
    const date = new Date().toLocaleDateString();

    const rows = report.report.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px;">
          <div style="font-weight: 600; color: #111827;">${item.student.fullName}</div>
          <div style="font-size: 11px; color: #6b7280;">${item.student.email}</div>
        </td>
        <td style="padding: 10px 12px; font-family: monospace; font-size: 12px;">${item.student.matriculationNumber || 'N/A'}</td>
        <td style="padding: 10px 12px; text-align: center;">${item.attendanceCount}</td>
        <td style="padding: 10px 12px; text-align: center;">${item.totalSessions}</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: ${
          item.percentage >= 75 ? '#10B981' : item.percentage >= 50 ? '#F59E0B' : '#EF4444'
        };">${item.percentage}%</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="
            padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700;
            background-color: ${item.status === 'Good' ? '#d1fae5' : item.status === 'Average' ? '#fef3c7' : '#fee2e2'};
            color: ${item.status === 'Good' ? '#065f46' : item.status === 'Average' ? '#92400e' : '#991b1b'};
          ">${item.status}</span>
        </td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report - ${report.course.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #111827; padding: 40px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px;">
          <h1 style="font-size: 24px; color: #4F46E5; margin-bottom: 4px;">UTG Attendance System</h1>
          <h2 style="font-size: 16px; color: #374151; font-weight: 500;">Attendance Report</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div>
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Course</div>
            <div style="font-weight: 700; font-size: 15px;">${report.course.name}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Course Code</div>
            <div style="font-weight: 700; font-size: 15px;">${report.course.code}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Department</div>
            <div style="font-weight: 600;">${report.course.department}</div>
          </div>
          <div>
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Generated On</div>
            <div style="font-weight: 600;">${date}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: #ede9fe; padding: 14px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #4F46E5;">${report.totalSessions}</div>
            <div style="font-size: 11px; color: #5b21b6; font-weight: 600;">Total Sessions</div>
          </div>
          <div style="background: #d1fae5; padding: 14px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #10B981;">${report.totalStudents}</div>
            <div style="font-size: 11px; color: #065f46; font-weight: 600;">Total Students</div>
          </div>
          <div style="background: #d1fae5; padding: 14px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #10B981;">${report.report.filter(r => r.status === 'Good').length}</div>
            <div style="font-size: 11px; color: #065f46; font-weight: 600;">Good Attendance</div>
          </div>
          <div style="background: #fee2e2; padding: 14px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: 800; color: #EF4444;">${report.report.filter(r => r.status === 'Poor').length}</div>
            <div style="font-size: 11px; color: #991b1b; font-weight: 600;">Poor Attendance</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: #4F46E5; color: white;">
              <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 700;">Student</th>
              <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 700;">Matric No.</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 700;">Attended</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 700;">Total</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 700;">Percentage</th>
              <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 700;">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>

        <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          Generated by UTG Attendance Management System • University of The Gambia • ${date}
        </div>

        <div class="no-print" style="margin-top: 24px; text-align: center;">
          <button onclick="window.print()" style="
            background: #4F46E5; color: white; border: none; padding: 12px 32px;
            border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
            margin-right: 12px;
          ">🖨️ Print / Save as PDF</button>
          <button onclick="window.close()" style="
            background: #f3f4f6; color: #374151; border: none; padding: 12px 32px;
            border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
          ">Close</button>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    toast.success('PDF preview opened!');
  };

  const getStatusColor = (status) => {
    if (status === 'Good') return '#10B981';
    if (status === 'Average') return '#F59E0B';
    return '#EF4444';
  };

  const filteredCourseOptions = courses.filter(course =>
    course.courseName.toLowerCase().includes(courseSearch.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const selectedCourseData = courses.find(c => c._id === selectedCourse);

  if (coursesLoading) return (
    <div className="loading-spinner" style={{ height: '100vh' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance Reports</h1>
          <p className="page-subtitle">View student attendance for your courses</p>
        </div>
        {report && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-outline" onClick={exportToPDF}>
              <FiFileText /> Export PDF
            </button>
            <button className="btn btn-success" onClick={exportToExcel}>
              <FiDownload /> Export Excel
            </button>
          </div>
        )}
      </div>

      {/* Course Selector */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
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

            {showCoursePicker && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                zIndex: 1000, overflow: 'hidden'
              }}>
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
                    <FiX onClick={() => setCourseSearch('')}
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }} />
                  )}
                </div>

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

          <button className="btn btn-primary" onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {report && (
        <>
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

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Attendance Percentage by Student
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.report.map(item => ({
                name: item.student.fullName.split(' ')[0],
                percentage: item.percentage
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px'
                }} formatter={(value) => [`${value}%`, 'Attendance']} />
                <Bar dataKey="percentage" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {report.course.name} — Detailed Report
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
                        <div style={{ fontWeight: '500' }}>{item.student.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.student.email}</div>
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
                              width: `${item.percentage}%`, height: '100%',
                              backgroundColor: getStatusColor(item.status), borderRadius: '3px'
                            }} />
                          </div>
                          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{item.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem', borderRadius: '9999px',
                          fontSize: '0.75rem', fontWeight: '600',
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
              Select a course and click Generate Report
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerReports;