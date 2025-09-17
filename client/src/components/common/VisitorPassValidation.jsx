import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSearch, FaCalendarAlt, FaCheck, FaTimes, FaUser } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Validation.css';
import { useAuth } from '../context/AuthContext';
const API_URL=import.meta.env.VITE_API_URL||'https://gate-wise-2.onrender.com';

const VisitorPassValidation = () => {
const { user } = useAuth();

  const [allVisitors, setAllVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date()
  });
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

 const handlePhotoClick = (photo) => {
    setCurrentPhoto(photo); // photo is already a full URL or null from the API
    setShowPhotoModal(true);
};

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setCurrentPhoto(null);
  };

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/valid-admin/validate-visitor-passes`, {
          headers: {
            'Content-Type': 'application/json',
            ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
          }
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const data = await response.json();
        if (!data.payload) throw new Error('No visitor data received');
        
        setAllVisitors(data.payload);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to fetch visitor passes');
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  useEffect(() => {
    let results = [...allVisitors];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(visitor => 
        (visitor.visitorId?.toLowerCase().includes(term)) ||
        (visitor.name?.toLowerCase().includes(term)) ||
        (visitor.reason?.toLowerCase().includes(term))
      );
    }
    
    if (!showAll) {
      results = results.filter(visitor => {
        if (!visitor.fromTime) return false;
        
        const visitDate = new Date(visitor.fromTime);
        const startOfDay = new Date(dateRange.start);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dateRange.end || dateRange.start);
        endOfDay.setHours(23, 59, 59, 999);
        
        return visitDate >= startOfDay && visitDate <= endOfDay;
      });
    }
    
    setFilteredVisitors(results);
  }, [allVisitors, searchTerm, dateRange, showAll]);

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
        <p>Loading visitor passes...</p>
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
      <h2>Visitor Pass Validation</h2>
      
      <div className="filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search visitors..."
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
        {filteredVisitors.length > 0 ? (
          <div className="table-wrapper">
            <table className="passes-table">
              <thead>
                <tr>
                  <th>Visitor ID</th>
                  <th>Name</th>
                  <th>Reason</th>
                  <th>Entry Time</th>
                  <th>Exit Time</th>
                  <th>Validated</th>
                  <th>Photo</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.map((visitor) => (
                  <tr key={visitor._id}>
                    <td>{visitor.visitorId}</td>
                    <td>{visitor.name}</td>
                    <td>{visitor.reason}</td>
                    <td>{formatDateTime(visitor.fromTime)}</td>
                    <td>{formatDateTime(visitor.toTime)}</td>
                    <td>
                      {visitor.validated ? (
                        <span className="status-badge accepted">
                          <FaCheck /> Valid
                        </span>
                      ) : (
                        <span className="status-badge rejected">
                          <FaTimes /> Not Valid
                        </span>
                      )}
                    </td>
                    <td>
    <button 
        className="photo-btn"
        onClick={() => handlePhotoClick(visitor.photo)}
    >
        {visitor.photo ? (
            <img 
                src={visitor.photo}
                alt="Visitor" 
                className="photo-thumbnail"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '';
                    e.target.className = 'default-photo';
                }}
            />
        ) : (
            <FaUser className="default-photo" />
        )}
    </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-results">
            <p>No visitors found matching your criteria</p>
            <button className="clear-filters" onClick={clearFilters}>
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="photo-modal" onClick={closePhotoModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closePhotoModal}>×</button>
            {currentPhoto ? (
              <img 
                src={currentPhoto} 
                alt="Visitor" 
                className="modal-photo"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '';
                  setCurrentPhoto(null);
                }}
              />
            ) : (
              <div className="no-photo">
                <FaUser className="no-photo-icon" />
                <p>No photo available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorPassValidation;