import React, { useState, useRef, useEffect } from 'react';
import './home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
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
    <div className="container-fluid mt-3">
      <div className="row">
        <div className="col-12 col-md-2">
          <div className="menu-container" ref={dropdownRef}>
            <div className="dropdown">
              <button
                className="btn btn-success dropdown-toggle w-100"
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                Logins
              </button>

              {showDropdown && (
                <ul className="list-group mt-1">
                  <li
                    className="list-group-item list-item-style"
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
      </div>
    </div>
  );
}

export default Home;