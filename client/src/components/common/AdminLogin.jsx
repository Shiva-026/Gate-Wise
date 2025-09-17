import React, { useState, useRef, useEffect } from 'react';
import './StudentLogin.css';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL=import.meta.env.VITE_API_URL||'https://gate-wise-2.onrender.com';

function AdminLogin() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
const [forgotPasswordData, setForgotPasswordData] = useState({
  username: '',
  oldPassword: '',
  newPassword: ''
});

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    setLoginError('');
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/admin-api/admin`, {
        username: data.username,
        password: data.password
      });

      if (response.data.message === 'login successful') {
        await login(response.data.token, response.data.payload,'admin');
        navigate('/admin-profile', {
          state: {
            adminData: response.data.payload
          }
        });
      } else {
        setLoginError(response.data.message || 'Login failed');
      }
    } catch (error) {
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    reset();
    setLoginError('');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="admin-login-container">
      <div className="row">
        {/* Left Dropdown Menu */}
        <div className="col-md-2 pt-3">
          <div className="menu-container" ref={dropdownRef}>
            <div className="dropdown">
              <button
                className="btn btn-primary dropdown-toggle w-100"
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Logins
              </button>

              {showDropdown && (
                <ul className="list-group mt-1">
                  <li
                    className="list-group-item list-item-style active"
                    onClick={() => {
                      navigate('/admin-login');
                      setShowDropdown(false);
                    }}
                  >
                    Admin Login
                  </li>
                  <li
                    className="list-group-item list-item-style"
                    onClick={() => {
                      navigate('/security-login');
                      setShowDropdown(false);
                    }}
                  >
                    Security Login
                  </li>
                  <li
                    className="list-group-item list-item-style"
                    onClick={() => {
                      navigate('/student-login');
                      setShowDropdown(false);
                    }}
                  >
                    Student Login
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="col-md-8 offset-md-1">
          <div className="login-form-container">
            <div className="card p-4 p-md-5">
              <h4 className="text-center mb-4">Admin Login</h4>
              {loginError && (
                <div className="alert alert-danger mb-3">{loginError}</div>
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Admin ID</label>
                  <input
                    type="text"
                    id="username"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    {...register('username', { required: 'Admin ID is required' })}
                  />
                  {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                </div>

                {/* Inside your login form, replace the button container with this: */}
<div className="d-flex justify-content-between align-items-center">
  <div>
    <button 
      type="submit" 
      className="btn btn-primary"
      disabled={isLoading}
    >
      {isLoading ? 'Logging in...' : 'Login'}
    </button>
    <button type="button" className="btn btn-secondary ms-2" onClick={clearForm}>
      Cancel
    </button>
  </div>
  <a 
    href="#"
    className="forgot-password-link"
    onClick={(e) => {
      e.preventDefault();
      setShowForgotPassword(true);
    }}
  >
    Forgot Password?
  </a>
</div>
              </form>
            </div>
          </div>
        </div>
        
{/* Forgot Password Modal */}
{showForgotPassword && (
  <div className="modal-backdrop">
    <div className="modal-content">
      <h5>Reset Password</h5>
      <form onSubmit={async (e) => {
        e.preventDefault();
        try {
          await axios.post(`${API_URL}/admin-api/forgot-password`, forgotPasswordData);
          alert("Password updated successfully!");
          setShowForgotPassword(false);
        } catch (error) {
          alert(error.response?.data?.message || "Failed to update password");
        }
      }}>
        <input
          type="text"
          placeholder="Admin ID"
          value={forgotPasswordData.username}
          onChange={(e) => setForgotPasswordData({...forgotPasswordData, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Old Password"
          value={forgotPasswordData.oldPassword}
          onChange={(e) => setForgotPasswordData({...forgotPasswordData, oldPassword: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={forgotPasswordData.newPassword}
          onChange={(e) => setForgotPasswordData({...forgotPasswordData, newPassword: e.target.value})}
          required
        />
        <div className="modal-actions">
          <button type="button" onClick={() => setShowForgotPassword(false)}>
            Cancel
          </button>
          <button type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      </div>
    </div>
  );
}

export default AdminLogin;