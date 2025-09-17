import React, { useState } from 'react';
import { FaSearch, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import './EditStudent.css';
import { useAuth } from '../context/AuthContext';
const API_URL=import.meta.env.VITE_API_URL||'https://gate-wise-2.onrender.com';

const EditStudent = () => {
  const { token } = useAuth();
  const departments = [
    'Computer Science and Engineering',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'CSE-Data Science',
    'CSE-Cybersecurity',
    'CSE-AI&ML'
  ];

  const [searchRollNo, setSearchRollNo] = useState('');
  const [student, setStudent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    dob: '',
    department: '',
    gender: '',
    contact: '',
    username: '',
    password: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.get(`${API_URL}/student-api/search?rollno=${searchRollNo}`,{ headers: { Authorization: `Bearer ${token}` } });
      if (response.data) {
        setStudent(response.data);
        setFormData({
          dob: response.data.dob.split('T')[0],
          department: response.data.branch, // Mapping branch to department
          gender: response.data.gender,
          contact: response.data.contact,
          username: response.data.username,
          password: ''
        });
      } else {
        setError('Student not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching student');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    if (student) {
      setFormData({
        dob: student.dob.split('T')[0],
        department: student.branch,
        gender: student.gender,
        contact: student.contact,
        username: student.username,
        password: ''
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      const updatePayload = {
        ...formData,
        branch: formData.department // Map department back to branch for API
      };
      const response = await axios.put(`${API_URL}/student-api/update/${formData.username}`, updatePayload,{ headers: { Authorization: `Bearer ${token}` } });
      setStudent({
        ...response.data.student,
        branch: formData.department // Update local state with new department
      });
      setSuccess('Student updated successfully');
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating student');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setLoading(true);
      setError('');
      try {
        await axios.delete(`${API_URL}/student-api/delete/${formData.username}`,{ headers: { Authorization: `Bearer ${token}` } });
        setStudent(null);
        setSearchRollNo('');
        setSuccess('Student deleted successfully');
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting student');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="edit-student-container">
      <h2 className="text-center mb-4">Edit Student Details</h2>
      
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="Enter Roll Number"
              value={searchRollNo}
              onChange={(e) => setSearchRollNo(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : <><FaSearch /> Search</>}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">{success}</div>}

      {student && (
        <div className="student-card">
          <div className="card-header">
            <h3>Student Details</h3>
            <div className="action-buttons">
              {!editMode ? (
                <>
                  <button className="edit-btn" onClick={handleEdit}>
                    <FaEdit /> Edit
                  </button>
                  <button className="delete-btn" onClick={handleDelete} disabled={loading}>
                    <FaTrash /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button className="save-btn" onClick={handleUpdate} disabled={loading}>
                    <FaSave /> Save
                  </button>
                  <button className="cancel-btn" onClick={handleCancel} disabled={loading}>
                    <FaTimes /> Cancel
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="horizontal-form">
            {/* Row 1 */}
            <div className="form-row">
              <div className="form-field">
                <label>Name</label>
                <input type="text" value={student.name} readOnly />
              </div>
              <div className="form-field">
                <label>Roll Number</label>
                <input type="text" value={student.rollno} readOnly />
              </div>
              <div className="form-field">
                <label>Date of Birth</label>
                {editMode ? (
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <input
                    type="text"
                    value={new Date(student.dob).toLocaleDateString('en-GB')}
                    readOnly
                  />
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="form-row">
              <div className="form-field">
                <label>Department</label>
                {editMode ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                ) : (
                  <input type="text" value={student.branch} readOnly />
                )}
              </div>
              <div className="form-field">
                <label>Gender</label>
                {editMode ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input type="text" value={student.gender} readOnly />
                )}
              </div>
              <div className="form-field">
                <label>Contact</label>
                {editMode ? (
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <input type="text" value={student.contact} readOnly />
                )}
              </div>
            </div>

            {/* Row 3 */}
            <div className="form-row">
              <div className="form-field">
                <label>Username</label>
                {editMode ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <input type="text" value={student.username} readOnly />
                )}
              </div>
              <div className="form-field">
                <label>{editMode ? 'Password (leave blank to keep current)' : 'Password'}</label>
                {editMode ? (
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                ) : (
                  <input type="password" value="********" readOnly />
                )}
              </div>
              <div className="form-field"></div> {/* Empty field for alignment */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditStudent;