import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import './AddStudent.css'; // Regular CSS import
const API_URL=import.meta.env.API_URL||'https://gate-wise-2.onrender.com';

const AddStudent = () => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitSuccessful } 
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        dob: new Date(data.dob).toISOString()
      };
      await axios.post(`${API_URL}/student-api/student`, formattedData);
      reset();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClear = () => reset();

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', required: true },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { name: 'department', label: 'Department', type: 'select',options:['Computer Science and Engineering','Information Technology','Electronics and Communication Engineering','Electrical and Electronics Engineering','Mechanical Engineering','CSE-Data Science','CSE-Cybersecurity','CSE-AI&ML'], required: true },
    { name: 'rollno', label: 'Roll Number', type: 'text', required: true },
    { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
    { name: 'contact', label: 'Contact', type: 'tel', required: true },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'password', label: 'Password', type: 'password', required: true }
  ];

  return (
    <div className="student-form-container">
      <h1 className="student-form-title">Student Registration</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="student-form">
        <div className="student-fields-grid">
          {fields.map((field) => (
            <div key={field.name} className="student-field-group">
              <label className="student-field-label">
                {field.label} {field.required && <span className="required-asterisk">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  {...register(field.name, { required: field.required })}
                  className="student-input"
                >
                  <option value="">Select...</option>
                  {field.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  {...register(field.name, { required: field.required })}
                  className="student-input"
                />
              )}
              
              {errors[field.name] && (
                <p className="student-error-message">This field is required</p>
              )}
            </div>
          ))}
        </div>

        <div className="student-button-group">
          <button
            type="button"
            onClick={handleClear}
            className="student-button student-clear-button"
          >
            Clear Form
          </button>
          <button
            type="submit"
            className="student-button student-submit-button"
          >
            Submit
          </button>
        </div>

        {isSubmitSuccessful && (
          <div className="student-success-message">
            Student added successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default AddStudent;