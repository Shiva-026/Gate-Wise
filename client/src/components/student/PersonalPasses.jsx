import React, { useState, useEffect } from 'react';
import { FaSpinner, FaSearch, FaCalendarAlt, FaFileDownload, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './PersonalPasses.css';
import { useOutletContext } from 'react-router-dom';


const PersonalPasses = () => {
  const [passes, setPasses] = useState({
    requestPasses: [],
    gatePasses: []
  });
  const [filteredPasses, setFilteredPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [error, setError] = useState(null);
  const { studentData } = useOutletContext();

  

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const response = await fetch(`http://localhost:3000/student-api/personal-passes/${studentData.rollno}`);
        const data = await response.json();
        
        if (data.message === "Personal passes fetched successfully") {
          setPasses(data.passes);
          setFilteredPasses([...data.passes.requestPasses, ...data.passes.gatePasses]);
        } else {
          setError("Failed to fetch passes");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchPasses();
  }, [studentData.rollno]);

  useEffect(() => {
    let results = [...passes.requestPasses, ...passes.gatePasses];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(pass => 
        pass.username.toLowerCase().includes(term) ||
        (pass.reason && pass.reason.toLowerCase().includes(term)) || 
        (pass.passId && pass.passId.toLowerCase().includes(term))
      );
    }
    
    if (selectedDate) {
      results = results.filter(pass => {
        const passDate = pass.issuedAt ? new Date(pass.issuedAt) : new Date(pass.requestedOn);
        return (
          passDate.getDate() === selectedDate.getDate() &&
          passDate.getMonth() === selectedDate.getMonth() &&
          passDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }
    
    setFilteredPasses(results);
  }, [passes, searchTerm, selectedDate]);

  const renderStatusBadge = (status, validated) => {
    const badgeClasses = {
      pending: 'status-badge pending',
      accepted: 'status-badge accepted',
      rejected: 'status-badge rejected',
      expired: 'status-badge expired',
      Yes: 'status-badge accepted',
      No: 'status-badge rejected'
    };

    const statusText = {
      pending: 'Pending',
      accepted: validated ? 'accepted' : 'Accepted',
      rejected: 'Rejected',
      expired: 'Expired',
      Yes:'Valid',
      No:'InValid'
    };

    return (
      <span className={badgeClasses[status] || 'status-badge'}>
        {statusText[status] || status}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-GB');
  };

  const handleGeneratePass = (pass) => {
    setSelectedPass(pass);
  };

  const closeModal = () => setSelectedPass(null);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDate(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading your passes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <FaTimes className="error-icon" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="personal-passes-container">
      <h2>Your Pass History</h2>
      
      <div className="filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by username, reason or pass ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="date-filter">
          <FaCalendarAlt className="calendar-icon" />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Filter by date"
            className="date-input"
            isClearable
          />
          <button className="clear-filters" onClick={clearFilters}>
            Clear Filters
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
                  <th>Issued/Requested On</th>
                  <th>Status</th>
                  <th>Validated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.map((pass) => (
                  <tr key={pass._id}>
                    <td>
                      {(pass.passId && pass.passId !== '') 
                        ? pass.passId 
                        : (pass.status === 'pending' || pass.status === 'rejected') 
                          ? '--' 
                          : pass._id.slice(-4)
                      }
                    </td>
                    <td>{pass.username}</td>
                    <td>{pass.reason || '--'}</td>
                    <td>{formatDateTime(pass.outTime || pass.fromTime)}</td>
                    <td>{formatDateTime(pass.inTime || pass.toTime)}</td>
                    <td>{formatDateTime(pass.issuedAt || pass.requestedOn)}</td>
                    <td>{renderStatusBadge(pass.status, pass.validated)}</td>
                    <td>{renderStatusBadge(pass.validated ? 'Yes' : 'No')}</td>
                    <td>
                      {pass.status === 'accepted' && pass.validated && (
                        <button 
                          className="generate-btn"
                          onClick={() => handleGeneratePass(pass)}
                        >
                          <FaFileDownload /> Generate
                        </button>
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
          </div>
        )}
      </div>
      
      {selectedPass && (
        <div className="pass-modal">
          <div className="modal-content">
            <h3>GATE PASS</h3>
            <button className="close-btn" onClick={closeModal}>×</button>
            
            <div className="pass-details">
              <div className="detail-row">
                <span>Pass ID</span>
                <span>:</span>
                <span>{selectedPass.passId || selectedPass._id.slice(-4)}</span>
              </div>
              <div className="detail-row">
                <span>Username</span>
                <span>:</span>
                <span>{selectedPass.username}</span>
              </div>
              <div className="detail-row">
                <span>Reason</span>
                <span>:</span>
                <span>{selectedPass.reason || '--'}</span>
              </div>
              <div className="detail-row">
                <span>Out Time</span>
                <span>:</span>
                <span>{formatDateTime(selectedPass.outTime || selectedPass.fromTime)}</span>
              </div>
              <div className="detail-row">
                <span>In Time</span>
                <span>:</span>
                <span>{formatDateTime(selectedPass.inTime || selectedPass.toTime)}</span>
              </div>
              
            </div>
            
            <div className="modal-footer">
              <button className="print-btn" onClick={() => window.print()}>
                Print Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalPasses;