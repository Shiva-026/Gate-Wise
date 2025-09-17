import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaTimes, FaUser } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ViewVisitors.css';
import { useAuth } from '../context/AuthContext';
const API_URL=import.meta.env.VITE_API_URL||'https://gate-wise-2.onrender.com';

const ViewVisitors = () => {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${API_URL}/visitor-api/view-visitors`, {
          headers: {
            'Content-Type': 'application/json',
            ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to load data: ${response.status}`);
        }

        const data = await response.json();
        
        if (data?.visitors) {
          setVisitors(data.visitors);
          setFilteredVisitors(data.visitors);
          
          if (data.visitors.length === 0) {
            setError('No visitors found');
          }
        } else {
          throw new Error('Invalid data format');
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        setVisitors([]);
        setFilteredVisitors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  useEffect(() => {
    let results = [...visitors];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(visitor => 
        (visitor.name?.toLowerCase().includes(term)) ||
        (visitor.contact?.includes(term)) ||
        (visitor.uniqueId?.includes(term))
      );
    }
    
    // Apply date filter
    if (dateRange.start || dateRange.end) {
      results = results.filter(visitor => {
        const visitDate = visitor.visitDate ? new Date(visitor.visitDate) : null;
        if (!visitDate) return false;
        
        const startMatch = dateRange.start ? 
          visitDate >= new Date(dateRange.start.setHours(0, 0, 0, 0)) : true;
        const endMatch = dateRange.end ? 
          visitDate <= new Date(dateRange.end.setHours(23, 59, 59, 999)) : true;
        
        return startMatch && endMatch;
      });
    }
    
    setFilteredVisitors(results);
  }, [searchTerm, dateRange, visitors]);

  const handlePhotoClick = (photo) => {
    if (photo) {
      const photoUrl = photo.startsWith('http') ? photo : `${API_URL}/uploads/${photo}`;
      setCurrentPhoto(photoUrl);
      setShowPhotoModal(true);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateRange({ start: null, end: null });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading visitor data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaTimes className="error-icon" />
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="view-visitors-container">
      <h1>Visitor Records</h1>
      
      <div className="filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, contact, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="date-filter">
          <DatePicker
            selectsStart
            selected={dateRange.start}
            onChange={(date) => setDateRange({...dateRange, start: date})}
            placeholderText="From date"
            className="date-input"
          />
          <DatePicker
            selectsEnd
            selected={dateRange.end}
            onChange={(date) => setDateRange({...dateRange, end: date})}
            placeholderText="To date"
            className="date-input"
            minDate={dateRange.start}
          />
          
          <button 
            className="clear-filters" 
            onClick={handleClearFilters}
            disabled={!searchTerm && !dateRange.start && !dateRange.end}
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="table-container">
        {filteredVisitors.length > 0 ? (
          <table className="visitors-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th>ID</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map(visitor => (
                <tr key={visitor._id || visitor.visitorId}>
                  <td>
                    <button 
                      className="photo-btn"
                      onClick={() => handlePhotoClick(visitor.photo)}
                    >
                      {visitor.photo ? (
                        <img 
                          src={visitor.photo.startsWith('http') ? visitor.photo : `${API_URL}/uploads/${visitor.photo}`}
                          alt="Visitor"
                          className="visitor-photo"
                        />
                      ) : (
                        <FaUser className="default-photo" />
                      )}
                    </button>
                  </td>
                  <td>{visitor.name || '--'}</td>
                  <td>{visitor.contact || '--'}</td>
                  <td>{visitor.address|| '--'}</td>
                  <td>{visitor.uniqueId || '--'}</td>
                  <td>{visitor.reason || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <p>No visitors found matching your criteria</p>
            <button className="clear-filters" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {showPhotoModal && (
        <div className="photo-modal" onClick={() => setShowPhotoModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowPhotoModal(false)}>×</button>
            {currentPhoto ? (
              <img src={currentPhoto} alt="Visitor" className="modal-photo" />
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

export default ViewVisitors;