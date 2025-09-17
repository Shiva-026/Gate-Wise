import React, { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminProfile.css';


const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout , token} = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated ) {
      navigate('/admin-login', { replace: true });
      return;
    }

    const handleBackButton = (e) => {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin-profile')) {
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

  if (!isAuthenticated) {
    return null;
  }

   return (
    <div className="app-container">
      <div className="nav-bar">
        <div className="nav-container">
          {/* Direct navigation options */}
          <div className="nav-option" onClick={() => navigate('add-student')}>
            Add Student
          </div>
          <div className="nav-option" onClick={() => navigate('view-students')}>
            View All students
          </div>
          <div className="nav-option" onClick={() => navigate('edit-students')}>
            Edit Students
          </div>
          <div className="nav-option" onClick={() => navigate('Requested-passes')}>
            Requested Passes
          </div>
          <div className="nav-option" onClick={() => navigate('Generate-pass')}>
           Generate-pass
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
        <Outlet context={{ adminData:user,token }} />
      </div>
    </div>
  );
};

export default AdminProfile;