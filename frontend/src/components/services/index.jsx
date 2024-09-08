import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './style.css'; // Import your CSS file

const Services = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(''); // Tracks active section for navigation


  const handleTagSubmit = async () => {
    const tagInputElement = document.getElementById('tagInput');
    const tagInputValue = tagInputElement.value;
  
    // Split the input by commas and trim whitespace
    const tagsArray = tagInputValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  
    try {
      const response = await fetch('http://localhost:3000/scraper', { // Adjust URL to match your backend endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tags: tagsArray }), // Send the tags as an array
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      alert('Confirmed');
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
