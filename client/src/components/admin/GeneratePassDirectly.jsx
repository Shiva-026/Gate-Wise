import React, { useState } from 'react';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import moment from 'moment-timezone';
import './GeneratePassDirectly.css';

const GeneratePassDirectly = () => {
  const [formData, setFormData] = useState({
    username: '',
    reason: '',
    fromTime: '',
    toTime: ''
  });
  const [generatedPass, setGeneratedPass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.username || !formData.fromTime || !formData.toTime) {
        throw new Error('Username, From Time and To Time are required');
      }

      // Convert to IST
      const fromTimeIST = moment(formData.fromTime).tz('Asia/Kolkata').format();
      const toTimeIST = moment(formData.toTime).tz('Asia/Kolkata').format();

      const response = await fetch('http://localhost:3000/gatepass-api/generate-direct-gatepass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          reason: formData.reason,
          fromTime: fromTimeIST,
          toTime: toTimeIST
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate pass');
      }

      setGeneratedPass(result.pass);
      setSuccess('Pass generated successfully!');
      // Don't clear form yet - wait until modal is closed
    } catch (err) {
      console.error('Error generating pass:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setGeneratedPass(null);
    // Clear form after modal is closed
    setFormData({
      username: '',
      reason: '',
      fromTime: '',
      toTime: ''
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '--';
    return moment(dateTimeString).tz('Asia/Kolkata').format('DD MMM YYYY, hh:mm A');
  };

  return (
    <div className="generate-pass-container">
      <h2>Generate Pass Directly</h2>
      
      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      <form onSubmit={handleSubmit} className="horizontal-form">
        <div className="form-row">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Reason</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>From Time</label>
            <input
              type="datetime-local"
              name="fromTime"
              value={formData.fromTime}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>To Time</label>
            <input
              type="datetime-local"
              name="toTime"
              value={formData.toTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? <FaSpinner className="spinner" /> : 'Generate Pass'}
          </button>
        </div>
      </form>

      {/* Pass Modal */}
      {generatedPass && (
        <div className="pass-modal">
          <div className="modal-content">
            <h3>Generated Gate Pass</h3>
            <button className="close-btn" onClick={closeModal}>×</button>
            
            <div className="pass-details">
              <div className="detail-row">
                <span>Pass ID</span>
                <span>:</span>
                <span>{generatedPass.passId || '--'}</span>
              </div>
              <div className="detail-row">
                <span>Username</span>
                <span>:</span>
                <span>{generatedPass.username}</span>
              </div>
              <div className="detail-row">
                <span>Reason</span>
                <span>:</span>
                <span>{generatedPass.reason || '--'}</span>
              </div>
              <div className="detail-row">
                <span>Out Time</span>
                <span>:</span>
                <span>{formatDateTime(generatedPass.outTime)}</span>
              </div>
              <div className="detail-row">
                <span>In Time</span>
                <span>:</span>
                <span>{formatDateTime(generatedPass.inTime)}</span>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <span>:</span>
                <span className={`status-badge ${generatedPass.validated ? 'valid' : 'invalid'}`}>
                  {generatedPass.validated ? (
                    <>
                      <FaCheck /> Valid
                    </>
                  ) : (
                    <>
                      <FaTimes /> Not Valid
                    </>
                  )}
                </span>
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

export default GeneratePassDirectly;