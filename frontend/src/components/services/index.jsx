import React, { useState, useEffect } from 'react';
import { InstagramLogo, WhatsappLogo, FacebookLogo, TelegramLogo, TwitterLogo, FileCsv, FilePdf, CloudArrowUp, Coins } from 'phosphor-react';
import followersData from '../data/followers_log';
import followingData from '../data/following_log';
import './style.css';

import instagramData from '/script/Instagram.json';

const Services = () => {
  const [activeSection, setActiveSection] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(1);

  const toggleFollowers = () => setShowFollowers(!showFollowers);
  const toggleFollowing = () => setShowFollowing(!showFollowing);
  const handleSectionClick = (section) => {
    setActiveSection((prev) => (prev === section ? '' : section));
  };

  const handleSubmit = async (platform) => {
    const tagInputElement = document.getElementById(`${platform}Input`);
    const passwordInputElement = document.getElementById(`${platform}Password`);
    const pinElement = document.getElementById(`${platform}Pin`)

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
  
    const baseUrl = 'http://localhost'; 
    const tagInputValue = tagInputElement.value;
    const tagsArray = tagInputValue.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const password = passwordInputElement.value;
    const pin = pinElement.value;

    if (!password || password.trim() === "") {
      alert('Please enter the password');
      return;
    }
    const facebookPayload = {
      startUrls: tagsArray,
      password: password.trim(), 
      pin: pin.trim()
    };

    const payload = {
      startUrls: tagsArray,
      password: password.trim(), 
    };
  
    let apiEndpoint;
    if (platform === 'instagram') {
      apiEndpoint = `${baseUrl}:3001/${platform}`; 
    } else if (platform === 'facebook') {
      apiEndpoint = `${baseUrl}:3002/${platform}`;
    } else if (platform === 'x') {
      apiEndpoint = `${baseUrl}:3003/${platform}`; 
    } else {
      console.error('Unsupported platform:', platform);
      alert('Unsupported platform. Please choose Instagram, Facebook, or X.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      let response;
      console.log(`Payload being sent to platform ${platform}:`, payload);
      if (platform =='facebook') {
          response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facebookPayload),
      });
      } else {
          response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      }
     

     
      alert('Account Scraped Successfully');

      if (!response.ok) {
        throw new Error(`Request failed for ${platform}: ${response.statusText}`);
      }
  
      tagInputElement.value = '';
      passwordInputElement.value = '';
    } catch (error) {
      console.error(`Error submitting tags for ${platform}:`, error);
      alert('Failed to submit tags. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowDetails = () => {
    const username = document.getElementById('instagramInput').value;
    const user = instagramData.Instagram.instagram.find(u => u.username === username);
    if (user) {
      setUserData(user);
      setShowDetails(true);
    } else {
      alert('User not found');
    }
  };

  const DetailSection = ({ title, content }) => (
    <div className="bg-gray-700 p-4 rounded-md mt-4">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      {content}
    </div>
  );

  const renderDropdown = () => (
    <select
      value={selectedNumber}
      onChange={(e) => setSelectedNumber(parseInt(e.target.value))}
      className="mt-4 bg-gray-800 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-pink-500 transition ease-in-out duration-200"
    >
      {[...Array(10).keys()].map(i => (
      <option key={i + 1} value={i + 1}>{i + 1}</option>
      ))}
    </select>
  );

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

      <div className="flex justify-center space-x-8 mb-8">
        <button onClick={() => handleSectionClick('instagram')} className="flex items-center space-x-2">
          <InstagramLogo size={32} color={activeSection === 'instagram' ? '#E1306C' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'instagram' ? 'text-pink-500' : 'text-gray-400'}`}>Instagram</span>
        </button>

        <button onClick={() => handleSectionClick('facebook')} className="flex items-center space-x-2">
          <FacebookLogo size={32} color={activeSection === 'facebook' ? '#3b5998' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'facebook' ? 'text-blue-600' : 'text-gray-400'}`}>Facebook</span>
        </button>

        <button onClick={() => handleSectionClick('x')} className="flex items-center space-x-2">
          <TwitterLogo size={32} color={activeSection === 'x' ? '#1DA1F2' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'x' ? 'text-blue-500' : 'text-gray-400'}`}>X</span>
        </button>

        <button onClick={() => handleSectionClick('telegram')} className="flex items-center space-x-2">
          <TelegramLogo size={32} color={activeSection === 'telegram' ? '#0088cc' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'telegram' ? 'text-blue-400' : 'text-gray-400'}`}>Telegram</span>
        </button>

        <button onClick={() => handleSectionClick('whatsapp')} className="flex items-center space-x-2">
          <WhatsappLogo size={32} color={activeSection === 'whatsapp' ? '#25D366' : '#ccc'} />
          <span className={`text-lg ${activeSection === 'whatsapp' ? 'text-green-500' : 'text-gray-400'}`}>WhatsApp</span>
        </button>
      </div>

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
            type="password"
            id="instagramPassword"
            placeholder="Enter Instagram password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          Max posts: 
          {renderDropdown()}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit('instagram')}
              className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={handleShowDetails}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>

          {showDetails && userData && (
            <div className="mt-8">
              <DetailSection
                title="Profile"
                content={
                  <div>
                    <p>Username: {userData.username}</p>
                    <p>Full Name: {userData.full_name}</p>
                    <p>Followers: {userData.followers}</p>
                    <p>Following: {userData.following}</p>
                    <p>Bio: {userData.biography}</p>
                    <p>Verified: {userData.verified ? 'Yes' : 'No'}</p>
                    <p>Business Account: {userData.business_account ? 'Yes' : 'No'}</p>
                  </div>
                }
              />
              <DetailSection
                title="Posts"
                content={
                  <div>
                    {userData.posts.map((post, index) => (
                      <div key={index} className="mb-4 border border-gray-300 p-4 rounded-lg">
                        <p>Post ID: {post.post_id}</p>
                        <img
                          src={post.post_image}
                          alt={`Post ${index + 1}`}
                          className="w-full max-w-2xl my-2"
                        />
                        <p className="text-gray-100 text-md mt-2">Caption: {post.caption}</p>
                        <p>Likes: {post.likes}</p>
                        <p>Comments: {post.comments}</p>
                      </div>
                    ))}
                  </div>
                }
              />
              {userData.timeline_screenshots && userData.timeline_screenshots.length > 0 && (
                <DetailSection
                  title="Timeline Screenshots"
                  content={
                    <div>
                      {userData.timeline_screenshots.map((screenshot, index) => (
                        <div key={index}>
                          <p>Timeline ID: {screenshot.timeline_id}</p>
                          {screenshot.screenshot_file && (
                            <img
                              src={`/images/timeline/${screenshot.screenshot_file}`}
                              alt={`Timeline ${index + 1}`}
                              className="w-full max-w-2xl my-2"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  }
                />
              )}
              <div className="flex mt-12 space-x-2">
                <button className="flex items-center space-x-2 bg-green-200 text-green-700 px-4 py-2 rounded-md hover:bg-green-300 transition-colors">
                  <FileCsv size={24} weight="bold" />
                  <span className="text-md font-semibold">Export to CSV</span>
                </button>
                <button className="flex items-center space-x-2 bg-red-200 text-red-700 px-4 py-2 rounded-md hover:bg-red-300 transition-colors">
                  <FilePdf size={24} weight="bold" />
                  <span className="text-md font-semibold">Export to PDF</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-200 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-300 transition-colors">
                  <CloudArrowUp size={24} weight="bold" />
                  <span className="text-md font-semibold">Export to Drive</span>
                </button>
                <button className="flex items-center space-x-2 bg-yellow-200 text-yellow-700 px-4 py-2 rounded-md hover:bg-yellow-300 transition-colors">
                  <Coins size={24} weight="bold" />
                  <span className="text-md font-semibold">Export to Blockchain</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === 'whatsapp' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-green-500">WhatsApp</h2>
          <input
            type="text"
            id="whatsappInput"
            placeholder="Enter WhatsApp username"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-yellow-400 mt-4 mb-2 italic">Note: A QR code will be provided for authentication.</p>
          <button
            onClick={() => handleSubmit('whatsapp')}
            className="mt-4 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
            disabled={isLoading}
          >
            Submit
          </button>
        </div>
      )}

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
            type="password" id="xPassword"
            placeholder="Enter X password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          Max posts:
          {renderDropdown()}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit('x')}
              className=" bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={handleShowDetails}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
        </div>
      )}

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
            type="password" id="telegramPassword"
            placeholder="Enter Telegram password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          Max posts:
          {renderDropdown()}
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit('telegram')}
              className=" bg-blue-400 text-white px-6 py-2 rounded-md hover:bg-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={handleShowDetails}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
        </div>
      )}

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
            type="password" id="facebookPassword"
            placeholder="Enter Facebook password"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <input
            type="pin" id="facebookPin"
            placeholder="Enter Facebook pin"
            className="w-full p-3 mt-4 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          Max posts:
          {renderDropdown()}
          <p className="text-yellow-400 mt-4 mb-2 italic">Warning: A CAPTCHA may be required for verification.</p>
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleSubmit('facebook')}
              className=" bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              Submit
            </button>
            <button
              onClick={handleShowDetails}
              className=" bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Show Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;  