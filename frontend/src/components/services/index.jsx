import React, { useState } from 'react';
import { InstagramLogo, WhatsappLogo, TwitterLogo, TelegramLogo } from 'phosphor-react'; // Icons for logos
import './style.css'; // Import your CSS file or additional styles

const Services = () => {
  const [activeSection, setActiveSection] = useState('');

  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? '' : section)); // Toggle the section on click
  };

  const handleSubmit = (service) => {
    // Submit logic for each platform (Instagram, WhatsApp, etc.)
    alert(`${service} username submitted`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Social Media Investigation Tool</h1>
      
      {/* Section Headers */}
      <div className="flex justify-center space-x-8 mb-8">
        <button onClick={() => handleSectionClick('instagram')} className="flex items-center space-x-2">
          <InstagramLogo size={32} color={activeSection === 'instagram' ? '#E1306C' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'instagram' ? 'text-pink-500' : 'text-gray-400'}`}>Instagram</span>
        </button>
        
        <button onClick={() => handleSectionClick('whatsapp')} className="flex items-center space-x-2">
          <WhatsappLogo size={32} color={activeSection === 'whatsapp' ? '#25D366' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'whatsapp' ? 'text-green-500' : 'text-gray-400'}`}>WhatsApp</span>
        </button>
        
        <button onClick={() => handleSectionClick('twitter')} className="flex items-center space-x-2">
          <TwitterLogo size={32} color={activeSection === 'twitter' ? '#1DA1F2' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'twitter' ? 'text-blue-500' : 'text-gray-400'}`}>Twitter</span>
        </button>
        
        <button onClick={() => handleSectionClick('telegram')} className="flex items-center space-x-2">
          <TelegramLogo size={32} color={activeSection === 'telegram' ? '#0088cc' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'telegram' ? 'text-blue-400' : 'text-gray-400'}`}>Telegram</span>
        </button>
      </div>

      {/* Section Content */}
      <div className="space-y-8">
        {/* Instagram Section */}
        {activeSection === 'instagram' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-pink-500">Instagram</h2>
            <input 
              type="text" 
              placeholder="Enter Instagram username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
            />
            <button 
              onClick={() => handleSubmit('Instagram')} 
              className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600">
              Submit
            </button>
          </div>
        )}

        {/* WhatsApp Section */}
        {activeSection === 'whatsapp' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-green-500">WhatsApp</h2>
            <input 
              type="text" 
              placeholder="Enter WhatsApp username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
            <button 
              onClick={() => handleSubmit('WhatsApp')} 
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">
              Submit
            </button>
          </div>
        )}

        {/* Twitter Section */}
        {activeSection === 'twitter' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-500">Twitter</h2>
            <input 
              type="text" 
              placeholder="Enter Twitter username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <button 
              onClick={() => handleSubmit('Twitter')} 
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600">
              Submit
            </button>
          </div>
        )}

        {/* Telegram Section */}
        {activeSection === 'telegram' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-400">Telegram</h2>
            <input 
              type="text" 
              placeholder="Enter Telegram username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            <button 
              onClick={() => handleSubmit('Telegram')} 
              className="mt-4 bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500">
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
