import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import './viewStudents.css';
const API_URL=import.meta.env.API_URL||'https://gate-wise-2.onrender.com';

const ViewStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`${API_URL}/student-api/all-students`);
        const data = await response.json();
        
         if (data.message && Array.isArray(data.payload)) {
           setStudents(data.payload);
          setFilteredStudents(data.payload);
        } else {
          throw new Error('Invalid data format: Expected array in payload');
        }
      } catch (err) {
        setError(err.message);
        setStudents([]);
        setFilteredStudents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    let results = [...students];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(student => 
        (student.name && student.name.toLowerCase().includes(term)) ||
        (student.rollno && student.rollno.toLowerCase().includes(term)) ||
        (student.contact && student.contact.toLowerCase().includes(term))
      );
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      results = results.filter(student => 
        student.department && student.department.toLowerCase() === departmentFilter.toLowerCase()
      );
    }
    
    setFilteredStudents(results);
  }, [searchTerm, departmentFilter, students]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('all');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading student data...</p>
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

  // Extract unique departments for filter dropdown
  const departments = ['all', ...new Set(students.map(student => student.department).filter(Boolean))];

  return (
    <div className="view-students-container">
      <h1>Student Records</h1>
      
      <div className="filter-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, roll no or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="department-filter">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
          
          <button 
            className="clear-filters" 
            onClick={handleClearFilters}
            disabled={searchTerm === '' && departmentFilter === 'all'}
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <div className="table-container">
        {filteredStudents.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Department</th>
                <th>Roll No</th>
                <th>Gender</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student._id || student.rollno}>
                  <td>{student.name || '--'}</td>
                  <td>
  {student.dob ? new Date(student.dob).toLocaleDateString('en-GB', {day: 'numeric',month: 'numeric',year: 'numeric'}) : '--'}</td>
                  <td>{student.department || '--'}</td>
                  <td>{student.rollno || '--'}</td>
                  <td>{student.gender || '--'}</td>
                  <td>{student.contact || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <p>No students found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewStudents;