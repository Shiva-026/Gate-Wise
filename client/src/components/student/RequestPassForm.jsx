import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './RequestPassForm.css';
import { useAuth } from '../context/AuthContext';
const API_URL=import.meta.env.VITE_API_URL||'https://gate-wise-2.onrender.com';

const RequestPassForm = () => {
  const { user } = useAuth();
  const { studentData } = useOutletContext();
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    if (studentData) {
      setValue('username', studentData.rollno || '');
    }
  }, [studentData, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    const requestData = {
      username: data.username,
      reason: data.reason,
      fromTime: fromDate?.toISOString(),
      toTime: toDate?.toISOString()
    };

    try {
      const response = await fetch(`${API_URL}/request-api/request-pass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok && result.message) {
        setSuccessMsg('✅ Pass request submitted successfully');
        reset({
          username: data.username // Keep the username
        });
        setFromDate(null);
        setToDate(null);
      } else {
        setErrorMsg(result.message || 'Failed to submit request');
      }
    } catch (error) {
      setErrorMsg('Error connecting to server');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 3000);
    }
  };

  return (
    <div className="student-app-container">
      <div className="request-pass-container">
        <div className="form-header">
          <p className='text-info display-6'>Request Pass</p>
        </div>

        {successMsg && (
          <div className="success-message">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="error-message">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="pass-form">
          <div className="form-row">
            <div className="form-group username-group">
              <label>Username</label>
              <input 
                {...register("username", { required: "Username is required" })}
                readOnly
              />
              {errors.username && <span className="error">{errors.username.message}</span>}
            </div>

            <div className="form-group reason-group">
              <label>Reason</label>
              <textarea 
                {...register("reason", { 
                  required: "Reason is required",
                  minLength: {
                    value: 10,
                    message: "Reason should be at least 10 characters"
                  }
                })} 
                rows={3} 
                placeholder="Enter detailed reason for your pass request"
              />
              {errors.reason && <span className="error">{errors.reason.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From Date & Time</label>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                placeholderText="Select start date and time"
                className="date-time-input"
                required
              />
            </div>

            <div className="form-group">
              <label>To Date & Time</label>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={fromDate || new Date()}
                placeholderText="Select end date and time"
                className="date-time-input"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Submitting...
                </>
              ) : (
                'Request Pass'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestPassForm;