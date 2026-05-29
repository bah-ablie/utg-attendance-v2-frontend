import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import utgLogo from '../assets/utg-logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;
      login(user, token);
      toast.success(`Welcome back, ${user.fullName}!`);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'lecturer') navigate('/lecturer');
      else if (user.role === 'student') navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-primary)',
    padding: '1rem',
    position: 'relative'
  };

  const themeButtonStyle = {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-full)',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    fontSize: '1.1rem',
    boxShadow: 'var(--card-shadow)'
  };

  const cardStyle = {
    background: 'var(--card-bg)',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    width: '100%',
    maxWidth: '440px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    padding: '2.5rem 2rem',
    textAlign: 'center'
  };

  const logoStyle = {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    marginBottom: '1rem',
  };

  const titleStyle = {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0'
  };

  const subtitleStyle = {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.875rem',
    margin: 0
  };

  const formContainerStyle = {
    padding: '2rem'
  };

  const signInTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '1.5rem',
    textAlign: 'center'
  };

  const inputWrapperStyle = {
    position: 'relative'
  };

  const leftIconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '1rem',
    pointerEvents: 'none'
  };

  const passwordToggleStyle = {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0'
  };

  const submitBtnStyle = {
    width: '100%',
    justifyContent: 'center',
    marginTop: '0.5rem'
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  };

  const spinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  };

  return (
    <div style={containerStyle}>
      {/* Theme Toggle */}
      <button onClick={toggleTheme} style={themeButtonStyle}>
        {theme === 'light' ? <FiMoon /> : <FiSun />}
      </button>

      {/* Login Card */}
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <img src={utgLogo} alt="UTG Logo" style={logoStyle} />
          <h1 style={titleStyle}>UTG Attendance System</h1>
          <p style={subtitleStyle}>University of The Gambia</p>
        </div>

        {/* Form */}
        <div style={formContainerStyle}>
          <h2 style={signInTitleStyle}>Sign in to your account</h2>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={inputWrapperStyle}>
                <FiMail style={leftIconStyle} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={inputWrapperStyle}>
                <FiLock style={leftIconStyle} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={passwordToggleStyle}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={submitBtnStyle}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={spinnerStyle} />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={footerStyle}>
            © 2026 University of The Gambia. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;