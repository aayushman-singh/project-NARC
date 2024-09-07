import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css'; // Import your CSS file

const Services = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(''); // Tracks active section for navigation

  const handleTagSubmit = () => {
    // Handle form submission
    alert('Confirmed');
    document.getElementById('tagInput').value = ''; // Clear the text field
  };

  return (
    <div className="services-container">
      {/* Left Navigation Bar */}
      <div className="left-nav">
        <button className="back-btn" onClick={() => navigate('/')}>Back to Home</button>
        <button className="nav-btn" onClick={() => setActiveSection('tags')}>Tags</button>
        <button className="nav-btn" onClick={() => setActiveSection('report')}>Report</button>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {activeSection === 'tags' && (
          <div className="tags-section">
            <input type="text" id="tagInput" placeholder="Enter tag here" />
            <button onClick={handleTagSubmit}>Submit</button>
          </div>
        )}

        {activeSection === 'report' && (
          <div className="report-section">
            <p>Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
