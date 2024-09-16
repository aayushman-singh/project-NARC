import  { useState } from 'react';
import { InstagramLogo, WhatsappLogo, FacebookLogo, TelegramLogo, TwitterLogo } from 'phosphor-react';
import './style.css';

const Services = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? '' : section));
  };

  const handleSubmit = async (platform) => {
    const tagInputElement = document.getElementById(`${platform}Input`);
    const passwordInputElement = document.getElementById(`${platform}Password`); // New password input element

    if (!tagInputElement) {
      console.error(`${platform}Input element not found`);
      alert('Please enter tags');
      return;
    }

    if (!passwordInputElement) {
      console.error(`${platform}Password element not found`);
      alert('Please enter the password');
      return;
    }

    const tagInputValue = tagInputElement.value;
    const tagsArray = tagInputValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const password = passwordInputElement.value; // Get the password

    if (!password || password.trim() === "") {
      alert('Please enter the password');
      return;
    }

    const payload = {
      startUrls: tagsArray,
      password: password.trim(), // Add password to the payload
    };

    let port;
    if (platform === 'instagram') {
      port = 3001;
    } else if (platform === 'facebook') {
      port = 3002;
    } else if (platform === 'x') {
      port = 3003;
    } else {
      console.error('Unsupported platform:', platform);
      alert('Unsupported platform. Please choose Instagram, Facebook, or X.');
      return;
    }

    setIsLoading(true);

    try {
      console.log(`Payload being sent to platform ${platform}:`, payload);
      const response1 = await fetch(`http://localhost:${port}/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response1.ok) {
        throw new Error(`First request failed for ${platform}: ${response1.statusText}`);
      }

      const response2 = await fetch(`http://localhost:${port}/${platform}Posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response2.ok) {
        throw new Error(`Second request failed for ${platform}: ${response2.statusText}`);
      }

      alert('User Submitted Successfully');
      tagInputElement.value = '';
      passwordInputElement.value = ''; // Clear the password input after submission
    } catch (error) {
      console.error(`Error submitting tags for ${platform}:`, error);
      alert('Failed to submit tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Processing your request...</p>
          </div>
        </div>
      )}
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
        
        <button onClick={() => handleSectionClick('x')} className="flex items-center space-x-2">
          <TwitterLogo size={32} color={activeSection === 'x' ? '#1DA1F2' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'x' ? 'text-blue-500' : 'text-gray-400'}`}>X</span>
        </button>

        <button onClick={() => handleSectionClick('telegram')} className="flex items-center space-x-2">
          <TelegramLogo size={32} color={activeSection === 'telegram' ? '#0088cc' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'telegram' ? 'text-blue-400' : 'text-gray-400'}`}>Telegram</span>
        </button>

        <button onClick={() => handleSectionClick('facebook')} className="flex items-center space-x-2">
          <FacebookLogo size={32} color={activeSection === 'facebook' ? '#3b5998' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'facebook' ? 'text-blue-600' : 'text-gray-400'}`}>Facebook</span>
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
              id="instagramInput"
              placeholder="Enter Instagram username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
            />
            <input 
              type="instagramPassword" 
              placeholder="Enter Instagram password" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500" 
            />
            <button 
              onClick={() => handleSubmit('instagram')} 
              className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 disabled:opacity-50"
              disabled={isLoading}
            >
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
              id="whatsappInput"
              placeholder="Enter WhatsApp username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" 
            />
            <button 
              onClick={() => handleSubmit('whatsapp')} 
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        )}

        {/* X Section */}
        {activeSection === 'x' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-500">X (formerly Twitter)</h2>
            <input 
              type="text"
              id="xInput"
              placeholder="Enter X username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <input 
              type="xPassword" 
              placeholder="Enter X password" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
            <button 
              onClick={() => handleSubmit('x')} 
              className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
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
              id="telegramInput"
              placeholder="Enter Telegram username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            <input 
              type="telegramPassword" 
              placeholder="Enter Telegram password" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400" 
            />
            <button 
              onClick={() => handleSubmit('telegram')} 
              className="mt-4 bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        )}

        {/* Facebook Section */}
        {activeSection === 'facebook' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-600">Facebook</h2>
            <input 
              type="text"
              id="facebookInput"
              placeholder="Enter Facebook username" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" 
            />
            <input 
              type="facebookPassword" 
              placeholder="Enter Facebook password" 
              className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" 
            />
            <button 
              onClick={() => handleSubmit('facebook')} 
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;