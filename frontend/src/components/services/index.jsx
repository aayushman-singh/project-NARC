import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css'; // Import your CSS file

const Services = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(''); // Tracks active section for navigation

  const handleTagSubmit = async () => {
    const tagInputElement = document.getElementById('tagInput');
    const tagInputValue = tagInputElement.value;
  
    const tagsArray = tagInputValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  
    try {
      const response = await fetch('http://localhost:3000/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: tagsArray }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      alert('Tags Submitted Successfully');
      tagInputElement.value = ''; // Clear the text field
    } catch (error) {
      console.error('Error submitting tags:', error);
      alert('Failed to submit tags. Please try again.');
    }
  };
  
  return (
    <div className="services-container">
      {/* Left Navigation Bar */}
      <div className="left-nav">
        <button className="back-btn" onClick={() => navigate('/')}>← Home</button>
        <button className={`nav-btn ${activeSection === 'tags' ? 'active' : ''}`} onClick={() => setActiveSection('tags')}>Tags</button>
        <button className={`nav-btn ${activeSection === 'report' ? 'active' : ''}`} onClick={() => setActiveSection('report')}>Report</button>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {activeSection === 'tags' && (
          <div className="tags-section">
            <h2 className="section-title">Submit Tags</h2>
            <input type="text" id="tagInput" placeholder="Enter comma-separated tags..." />
            <button onClick={handleTagSubmit} className="submit-btn">Submit</button>
          </div>
        )}

        {activeSection === 'report' && (
          <div className="report-section">
            <h2 className="section-title">Report Section</h2>
            <p>Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
