import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './header.css';
import { useAuth } from '../context/AuthContext';
import logoImage from '../../assets/GateWiselogo.png';

function Header({ isStudentPage = false, isSecurityPage = false, isAdminPage = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getLogoLinkPath = () => {
    if (location.pathname.includes('student-profile') || location.pathname.includes('personal-passes') || location.pathname.includes('request-pass')) {
    return '/student-profile';
    }
    else if (isSecurityPage || location.pathname.includes('security-profile')) {
      return '/security-profile';
    }
    else if (isAdminPage || location.pathname.includes('admin-profile')) {
      return '/admin-profile';
    }
    return '/';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-dark px-3 py-2 shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Left: Logo */}
        <div className="d-flex align-items-center">
          <Link to={getLogoLinkPath()} className="navbar-brand p-0">
            <div className="logo-holder d-flex align-items-center justify-content-center">
              <img 
                src={logoImage}
                alt="College Logo" 
                className="logo-img"
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23ffffff'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='16' fill='%23007bff' text-anchor='middle' dominant-baseline='middle'%3ELOGO%3C/text%3E%3C/svg%3E"
                }}
              />
            </div>
          </Link>
        </div>

        {/* Center: Title */}
        <div className="mx-auto text-center">
          <h1 className="mb-0 text-light fs-4 fw-bold">GateWise</h1>
          <p className="mb-0 text-warning-50 fs-6">Smart Entry, Secure Campus</p>
        </div>

        {/* Right: User Info and Logout */}
        <div className="d-flex align-items-center gap-2">
          {user && (
            <>
            <div><svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
  <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
</svg></div>
              <span className="text-light">{user.name || user.username}</span>
              <button 
                className="btn btn-sm btn-danger"
                onClick={handleLogout}
              >
                
                
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-box-arrow-right" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
  <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
</svg>
Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;