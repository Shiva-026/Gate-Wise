import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSearch, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Validation.css';
import { useAuth } from '../context/AuthContext';
const API_URL=import.meta.env.API_URL||'https://gate-wise-2.onrender.com';

const StudentPassValidation = () => {
  const [allPasses, setAllPasses] = useState([]);
  const [filteredPasses, setFilteredPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date()
  });
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('${API_URL}/valid-admin/validate-student-passes', {
          headers: {
            'Content-Type': 'application/json',
            ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
          }
        });
        
        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        if (!data.passes) throw new Error('No passes data received');
        
        setAllPasses(data.passes);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch passes');
      } finally {
        setLoading(false);
      }
    };

    fetchPasses();
  }, [user]);

  useEffect(() => {
    let results = [...allPasses];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(pass => 
        (pass.passId?.toLowerCase().includes(term)) ||
        (pass.username?.toLowerCase().includes(term)) ||
        (pass.reason?.toLowerCase().includes(term))
      );
    }
    
    if (!showAll) {
      results = results.filter(pass => {
        if (!pass.outTime) return false;
        
        const passDate = new Date(pass.outTime);
        const startOfDay = new Date(dateRange.start);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dateRange.end || dateRange.start);
        endOfDay.setHours(23, 59, 59, 999);
        
        return passDate >= startOfDay && passDate <= endOfDay;
      });
    }
    
    setFilteredPasses(results);
  }, [allPasses, searchTerm, dateRange, showAll]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({
      start: new Date(),
      end: new Date()
    });
    setShowAll(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading passes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaTimes className="error-icon" />
        <p>{error}</p>
        <button className="clear-filters" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="personal-passes-container">
      <h2>Student Pass Validation</h2>
      
      <div className="filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search passes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="date-filter">
          <FaCalendarAlt className="calendar-icon" />
          <DatePicker
            selectsRange
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={(update) => {
              setDateRange({
                start: update[0],
                end: update[1] || update[0]
              });
            }}
            dateFormat="dd/MM/yyyy"
            className="date-input"
            disabled={showAll}
            placeholderText="Select date range"
          />
          <label className="toggle-all">
            <input
              type="checkbox"
              checked={showAll}
              onChange={() => setShowAll(!showAll)}
            />
            Show All Dates
          </label>
          <button className="clear-filters" onClick={clearFilters}>
            Reset Filters
          </button>
        </div>
      </div>
      
      <div className="table-container">
        {filteredPasses.length > 0 ? (
          <div className="table-wrapper">
            <table className="passes-table">
              <thead>
                <tr>
                  <th>Pass ID</th>
                  <th>Username</th>
                  <th>Reason</th>
                  <th>Out Time</th>
                  <th>In Time</th>
                  <th>Validated</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.map((pass) => (
                  <tr key={pass.passId || pass._id}>
                    <td>{pass.passId || '--'}</td>
                    <td>{pass.username}</td>
                    <td>{pass.reason}</td>
                    <td>{formatDateTime(pass.outTime)}</td>
                    <td>{formatDateTime(pass.inTime)}</td>
                    <td>
                      {pass.validated ? (
                        <span className="status-badge accepted">
                          <FaCheck /> Valid
                        </span>
                      ) : (
                        <span className="status-badge rejected">
                          <FaTimes /> Not Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-results">
            <p>No passes found matching your criteria</p>
            <button className="clear-filters" onClick={clearFilters}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPassValidation;