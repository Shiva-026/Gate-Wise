import React, { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './securityprofile.css';

const SecurityProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated )) {
      navigate('/security-login', { replace: true });
      return;
    }

    const handleBackButton = (e) => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/security-profile')) {
        window.history.pushState(null, '', currentPath);
        navigate(currentPath, { replace: true });
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!isAuthenticated ) {
    return null;
  }

   return (
    <div className="app-container">
      <div className="nav-bar">
        <div className="nav-container">
          {/* Direct navigation options */}
          <div className="nav-option1" onClick={() => navigate('add-visitor')}>
            Add & Generate Visitor Pass
          </div>
          <div className="nav-option" onClick={() => navigate('view-visitors')}>
            View All Visitors
          </div>
          <div className="nav-option" onClick={() => navigate('student-validation')}>
            Validate Student Pass
          </div>
          <div className="nav-option" onClick={() => navigate('visitor-validation')}>
            Validate Visitor Pass
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <Outlet context={{ securityData: user }} />
      </div>
    </div>
  );
};

export default SecurityProfile;