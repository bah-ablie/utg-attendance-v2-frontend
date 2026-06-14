import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import API from '../../api/axiosConfig';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    matriculationNumber: '',
    department: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await API.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.role === 'student' && !formData.matriculationNumber) {
      toast.error('Matriculation number is required for students!');
      return;
    }
    setSubmitting(true);
    try {
      if (editingUser) {
        await API.put(`/users/${editingUser._id}`, formData);
        toast.success('User updated successfully!');
      } else {
        await API.post('/auth/register', formData);
        toast.success('User registered successfully!');
      }
      setShowModal(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      matriculationNumber: user.matriculationNumber || '',
      department: user.department || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setShowPassword(false);
    setFormData({
      fullName: '', email: '', password: '',
      role: 'student', matriculationNumber: '', department: ''
    });
  };

  const departments = [...new Set(
    users.filter(u => u.department).map(u => u.department)
  )].sort();

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.matriculationNumber && user.matriculationNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesDepartment = filterDepartment === 'all' || user.department === filterDepartment;
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleRoleFilter = (role) => {
    setFilterRole(role);
    if (role === 'admin') setFilterDepartment('all');
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
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">Manage all system users</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <FiPlus /> Add User
        </button>
      </div>

      {/* Filters */}
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
              placeholder="Search by name, email or matric no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          <select
            className="form-control"
            value={filterRole}
            onChange={(e) => handleRoleFilter(e.target.value)}
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="lecturer">Lecturers</option>
            <option value="admin">Admins</option>
          </select>

          {filterRole !== 'admin' && departments.length > 0 && (
            <select
              className="form-control"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}
        </div>

        {(filterRole !== 'all' || filterDepartment !== 'all' || searchTerm) && (
          <div style={{
            marginTop: '0.75rem',
            display: 'flex', alignItems: 'center',
            gap: '0.5rem', flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Active filters:
            </span>
            {filterRole !== 'all' && (
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: '9999px',
                backgroundColor: 'rgba(79,70,229,0.1)', color: '#4F46E5',
                fontSize: '0.75rem', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer'
              }} onClick={() => handleRoleFilter('all')}>
                {filterRole} <FiX size={10} />
              </span>
            )}
            {filterDepartment !== 'all' && (
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: '9999px',
                backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981',
                fontSize: '0.75rem', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer'
              }} onClick={() => setFilterDepartment('all')}>
                {filterDepartment} <FiX size={10} />
              </span>
            )}
            {searchTerm && (
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: '9999px',
                backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B',
                fontSize: '0.75rem', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer'
              }} onClick={() => setSearchTerm('')}>
                "{searchTerm}" <FiX size={10} />
              </span>
            )}
            <button
              onClick={() => { setFilterRole('all'); setFilterDepartment('all'); setSearchTerm(''); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.75rem', color: 'var(--text-muted)',
                textDecoration: 'underline'
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card">
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '1rem'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            All Users ({filteredUsers.length})
          </h3>
        </div>
        <div className="table-container">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No users found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Matric No.</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: user.role === 'admin'
                            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                            : user.role === 'lecturer'
                            ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                            : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.875rem', flexShrink: 0
                        }}>
                          <FiUser />
                        </div>
                        <div>
                          <div style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                            {user.fullName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${user.role === 'admin' ? 'danger' : user.role === 'lecturer' ? 'warning' : 'primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.department || 'N/A'}</td>
                    <td>
                      {user.matriculationNumber ? (
                        <span style={{
                          fontFamily: 'monospace', fontSize: '0.8rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          padding: '0.2rem 0.5rem', borderRadius: '4px'
                        }}>
                          {user.matriculationNumber}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleEdit(user)}
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(user._id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text" className="form-control"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email" className="form-control"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="off"
                  required
                />
              </div>
              {!editingUser && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      autoComplete="new-password"
                      required
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%',
                        transform: 'translateY(-50%)', background: 'none',
                        border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center'
                      }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Matriculation Number</label>
                  <input
                    type="text" className="form-control"
                    placeholder="Enter matriculation number"
                    value={formData.matriculationNumber}
                    onChange={(e) => setFormData({ ...formData, matriculationNumber: e.target.value })}
                    autoComplete="off"
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text" className="form-control"
                  placeholder="Enter department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline"
                  onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;