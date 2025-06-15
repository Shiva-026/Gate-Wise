import React, { useState, useRef, useEffect } from 'react';
import './studentLogin.css';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function AdminLogin() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useAuth();

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
      const response = await axios.post('http://localhost:3000/admin-api/admin', {
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

                <div className="d-flex justify-content-between">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={clearForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;