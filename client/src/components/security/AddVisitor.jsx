import React, { useState, useRef } from 'react';
import { FaCamera, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import moment from 'moment';
import './AddVisitor.css';
import { useAuth } from '../context/AuthContext';
const API_URL=import.meta.env.VITE_API_URL||'https://gate-wise-2.onrender.com';

const AddVisitor = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    reason: '',
    gender: 'Male',
    address: '',
    uniqueId: '',
    fromTime: '',
    toTime: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [generatedPass, setGeneratedPass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate required fields
      const { name, contact, gender, address, uniqueId, fromTime, toTime } = formData;
      if (!name || !contact || !gender || !address || !uniqueId || !fromTime || !toTime) {
        throw new Error('All fields except reason are required');
      }

      // Check if toTime is in future
      const toDate = new Date(toTime);
      if (toDate < new Date()) {
        throw new Error('Cannot issue gate pass for past date/time');
      }

      // Prepare form data for file upload
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      const response = await fetch(`${API_URL}/visitor-api/add-visitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate pass');
      }

      // Add photo URL to the generated pass for display
      if (photo) {
        result.visitor.photoUrl = URL.createObjectURL(photo);
      }
      setGeneratedPass(result.visitor);
    } catch (err) {
      console.error('Error generating pass:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setGeneratedPass(null);
    setFormData({
      name: '',
      contact: '',
      reason: '',
      gender: 'Male',
      address: '',
      uniqueId: '',
      fromTime: '',
      toTime: ''
    });
    setPhoto(null);
    setPhotoPreview(null);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '--';
    return moment(dateTimeString).format('DD MMM YYYY, hh:mm A');
  };

  return (
    <div className="visitor-pass-container">
      <h2>Add Visitor & Generate Pass</h2>
      
      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleSubmit} className="visitor-form">
        <div className="form-content">
          <div className="form-fields">
            {/* Row 1 */}
            <div className="form-row">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Contact *</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="form-row">
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Unique ID *</label>
                <input
                  type="text"
                  name="uniqueId"
                  value={formData.uniqueId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="form-row">
              <div className="form-group">
                <label>From Time *</label>
                <input
                  type="datetime-local"
                  name="fromTime"
                  value={formData.fromTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>To Time *</label>
                <input
                  type="datetime-local"
                  name="toTime"
                  value={formData.toTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="form-row">
              <div className="form-group full-width">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 5 */}
            <div className="form-row">
              <div className="form-group full-width">
                <label>Reason</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="photo-section">
            <div className="photo-upload">
              <div 
                className={`photo-container ${!photoPreview ? 'empty' : ''}`}
                onClick={triggerFileInput}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Visitor" className="photo-preview" />
                ) : (
                  <>
                    <FaCamera className="camera-icon" />
                    <span>Click to upload photo</span>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                capture="camera"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={isLoading}>
            {isLoading ? <FaSpinner className="spinner" /> : 'Generate Pass'}
          </button>
        </div>
      </form>

      {/* Generated Pass Modal */}
      {generatedPass && (
        <div className="pass-modal">
          <div className="modal-content">
            <h3>Visitor Gate Pass</h3>
            <button className="close-btn" onClick={closeModal}>×</button>
            
            <div className="pass-details">
              <div className="detail-row">
                <span>Visitor ID</span>
                <span>:</span>
                <span>{generatedPass.visitorId}</span>
              </div>
              <div className="detail-row">
                <span>Name</span>
                <span>:</span>
                <span>{generatedPass.name}</span>
              </div>
              <div className="detail-row">
                <span>Contact</span>
                <span>:</span>
                <span>{generatedPass.contact}</span>
              </div>
              <div className="detail-row">
                <span>Reason</span>
                <span>:</span>
                <span>{generatedPass.reason || '--'}</span>
              </div>
              <div className="detail-row">
                <span>From Time</span>
                <span>:</span>
                <span>{formatDateTime(generatedPass.fromTime)}</span>
              </div>
              <div className="detail-row">
                <span>To Time</span>
                <span>:</span>
                <span>{formatDateTime(generatedPass.toTime)}</span>
              </div>
              <div className="detail-row">
                <span>Photo</span>
                <span>:</span>
                {generatedPass.photoUrl || generatedPass.photo ? (
                  <img 
                    src={generatedPass.photoUrl || `${API_URL}/uploads/${generatedPass.photo}`} 
                    alt="Visitor" 
                    className="pass-photo"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.parentNode.innerHTML = '<span>No photo available</span>';
                    }}
                  />
                ) : (
                  <span>No photo available</span>
                )}
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

export default AddVisitor;