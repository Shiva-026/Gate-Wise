import React, { useEffect } from 'react';
import { useNavigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './studentProfile.css';

const StudentProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/student-login', { replace: true });
      return;
    }

    // If URL doesn't have username but we're authenticated, redirect to include it
    if (isAuthenticated && user?.username && !username) {
      navigate(`/student-profile/${user.username}`, { replace: true });
      return;
    }

    // Prevent back button navigation to login
    const handleBackButton = (e) => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/student-profile')) {
        window.history.pushState(null, '', currentPath);
        navigate(currentPath, { replace: true });
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isAuthenticated, loading, navigate, user, username]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Redirecting will happen in useEffect
  }

  return (
    <div className="app-container">
      <div className="nav-bar">
        <div className="nav-container">
          <div className="nav-option" onClick={() => navigate('request-pass')}>
            Request Pass
          </div>
          <div className="nav-option" onClick={() => navigate('personal-passes')}>
            Personal Pass Details
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <Outlet context={{ studentData: user }} />
      </div>
    </div>
  );
};

export default StudentProfile;