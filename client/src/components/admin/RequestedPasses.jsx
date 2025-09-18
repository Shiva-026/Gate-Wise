import React, { useState, useEffect } from 'react';
import './RequestedPasses.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment-timezone';
import { useAuth } from '../context/AuthContext';
const API_URL=import.meta.env.VITE_API_URL||'https://gate-wise-2.onrender.com';

const RequestedPasses = () => {
  const { token } = useAuth();
  const [passes, setPasses] = useState([]);
  const [selectedPass, setSelectedPass] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date()); // Set today's date as default

  // Fetch passes from API
  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const response = await fetch(`${API_URL}/request-api/all-req-passes`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
        }

        const result = await response.json();
        
        console.log('API Response:', result);
        
        if (result && result.payload && Array.isArray(result.payload)) {
          setPasses(result.payload);
        } else {
          throw new Error(`Unexpected response format: ${JSON.stringify(result, null, 2)}`);
        }
      } catch (err) {
        console.error('Full error:', err);
        setError(`Failed to load passes: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPasses();
  }, []);

  // Handle accept pass
  const handleAccept = async (pass) => {
    try {
      // Ensure all required fields are present
      if (!pass.username || !pass.fromTime || !pass.toTime) {
        throw new Error('Missing required fields for acceptance');
      }

      const response = await fetch(`${API_URL}/gatepass-api/generate-gatepass`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    username: pass.username,
    fromTime: moment(pass.fromTime).tz('Asia/Kolkata').format(),
    toTime: moment(pass.toTime).tz('Asia/Kolkata').format(),
    reason: pass.reason || ''
  })
});


      const result = await response.json();

      if (response.ok) {
        // Update the pass status locally
        setPasses(passes.map(p => 
          p._id === pass._id ? { ...p, status: 'accepted' } : p
        ));
        // Show the accepted pass in modal
        setSelectedPass(result.pass);
      } else {
        throw new Error(result.message || 'Failed to accept request');
      }
    } catch (err) {
      console.error('Error accepting pass:', err);
      alert(err.message);
    }
  };

  // Handle reject pass
  const handleReject = async (pass) => {
    try {
      const response = await fetch(`${API_URL}/request-api/reject-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: pass.username,
          reason: pass.reason || 'No reason provided',
          fromTime: moment(pass.fromTime).tz('Asia/Kolkata').format(),
          toTime: moment(pass.toTime).tz('Asia/Kolkata').format()
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Update the pass status locally
        setPasses(passes.map(p => 
          p._id === pass._id ? { ...p, status: 'rejected' } : p
        ));
      } else {
        throw new Error(result.message || 'Failed to reject request');
      }
    } catch (err) {
      console.error('Error rejecting pass:', err);
      alert(err.message);
    }
  };

  const formatDateOnly = (dateTimeString) => {
    if (!dateTimeString) return '--';
    return moment(dateTimeString).format('DD MMM YYYY'); // e.g., "24 May 2025"
  };

  // Format date time in IST
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '--';
    return moment(dateTimeString).tz('Asia/Kolkata').format('DD MMM YYYY, hh:mm A');
  };

  // Filter passes based on search term and selected date (using requestedOn)
  const filteredPasses = passes.filter(pass => {
    const matchesSearch = 
      pass.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pass.reason && pass.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const requestedOnDate = pass.requestedOn || pass.createdAt;
    const matchesDate = selectedDate
      ? moment(requestedOnDate).tz('Asia/Kolkata').isSame(selectedDate, 'day')
      : true;
    
    return matchesSearch && matchesDate;
  });

  // Close modal
  const closeModal = () => {
    setSelectedPass(null);
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="requested-passes-container">
      <h2>Requested Passes</h2>
      
      {/* Search and Filter Controls */}
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by username or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="date-picker">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            placeholderText="Filter by requested date..."
            isClearable
            dateFormat="MMMM d, yyyy"
          />
        </div>
      </div>
      
      <table className="passes-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Reason</th>
            <th>From Time</th>
            <th>To Time</th>
            <th>Requested On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPasses.length > 0 ? (
            filteredPasses.map((pass) => (
              <tr key={pass._id}>
                <td>{pass.username}</td>
                <td>{pass.reason || '--'}</td>
                <td>{formatDateTime(pass.fromTime)}</td>
                <td>{formatDateTime(pass.toTime)}</td>
               <td>{formatDateOnly(pass.requestedon)}</td>
                <td className="actions">
                  {pass.status === 'accepted' ? (
                    <button 
                      className="view-pass-btn" 
                      onClick={() => setSelectedPass(pass)}
                    >
                      View Pass
                    </button>
                  ) : pass.status === 'rejected' ? (
                    <span className="no-actions">Rejected</span>
                  ) : (
                    <>
                      <button 
                        className="accept-btn" 
                        onClick={() => handleAccept(pass)}
                      >
                        Accept
                      </button>
                      <button 
                        className="reject-btn" 
                        onClick={() => handleReject(pass)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-results">
                No passes found matching your criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pass Modal */}
      {selectedPass && (
        <div className="pass-modal">
          <div className="modal-content">
            <h3>GATE PASS</h3>
            <button className="close-btn" onClick={closeModal}>×</button>
            
            <div className="pass-details">
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

export default RequestedPasses;